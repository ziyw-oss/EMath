import type { NextApiRequest, NextApiResponse } from 'next'
import formidable, { File } from 'formidable'
import { spawn } from 'child_process'
import fs from 'fs'
import path from 'path'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const uploadDir = path.join(process.cwd(), '..', '..', 'pastpapers', 'tmp')
  fs.mkdirSync(uploadDir, { recursive: true })

  const form = formidable({ multiples: false, uploadDir, keepExtensions: true })

  form.parse(req, async (err, fields, files: { pdf?: File | File[] }) => {
    console.log("📥 Incoming upload request...");
    if (err || !files.pdf) {
      console.error("❌ Formidable error:", err);
      console.error("📂 Received files:", files);
      return res.status(400).json({ error: 'Failed to upload file' });
    }

    const uploadedFilePath = Array.isArray(files.pdf) ? files.pdf[0].filepath : files.pdf.filepath;
    const outputPath = path.join(process.cwd(), '..', '..', 'pastpapers', 'json', 'output_qp.json');
    const scriptPath = path.join(process.cwd(), '..', 'backend', 'scripts', 'parse_qp.py');

    console.log("🚀 Running script:");
    console.log("   scriptPath:", scriptPath);
    console.log("   uploadedFilePath:", uploadedFilePath);
    console.log("   outputPath:", outputPath);

    const py = spawn('python3', [scriptPath, uploadedFilePath, outputPath]);

    py.stdout.on('data', (data) => console.log("🐍 stdout:", data.toString()));
    py.stderr.on('data', (data) => console.error("🐍 stderr:", data.toString()));

    py.on('error', (err) => {
      console.error("❌ Failed to start Python process:", err);
      return res.status(500).json({ error: 'Failed to run script' });
    });

    py.on('close', (code) => {
      console.log(`📦 Python script exited with code ${code}`);
      if (code !== 0) {
        return res.status(500).json({ error: `Script exited with code ${code}` });
      }

      fs.readFile(outputPath, 'utf-8', (err, data) => {
        if (err) {
          console.error("❌ Failed to read JSON output:", err);
          return res.status(500).json({ error: 'Failed to read output file' });
        }

        try {
          const parsed = JSON.parse(data);

          // 新结构检查
          if (parsed.exam_metadata && Array.isArray(parsed.questions)) {
            console.log("📘 Exam metadata:", parsed.exam_metadata);
            console.log(`✅ Parsed ${parsed.questions.length} questions`);

            parsed.questions.forEach((q, i) => {
              if (q.latex_blocks) console.log(`📐 Q${i + 1} has latex_blocks`);
              if (q.parent_label) console.log(`🔗 Q${i + 1} parent_label: ${q.parent_label}`);
            });

            return res.status(200).json(parsed);
          }

          return res.status(500).json({ error: 'Unexpected JSON structure' });
        } catch (e) {
          console.error("❌ Failed to parse JSON:", e);
          console.error("💾 Raw output content:\n", data);
          return res.status(500).json({ error: 'Invalid JSON output' });
        }
      });
    });
  })
}