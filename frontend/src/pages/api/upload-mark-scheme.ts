import { NextApiRequest, NextApiResponse } from "next";
import db from "@/lib/db";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { marks, exam_metadata } = req.body;
  if (!marks || !Array.isArray(marks)) {
    return res.status(400).json({ error: "Invalid or missing marks[]" });
  }

  // 补充结构化字段
  exam_metadata.board = "Edexcel";
  exam_metadata.qualification = "A Level";
  exam_metadata.subject = "Mathematics";
  exam_metadata.paper_code = "9MA0/01"; // 修正 OCR 误识别的 "QMA0O1 01"
  exam_metadata.paper_name = "Pure Mathematics Paper 1";
  exam_metadata.exam_session = "2018";

  try {
    const paper_name = exam_metadata.paper_name;
    const paper_code = exam_metadata.paper_code;
    const exam_session = exam_metadata.exam_session;

    // 新增严格校验
    if (!paper_code || !paper_name) {
      console.error("❌ Missing paper_code or paper_name");
      throw new Error("Missing paper_code or paper_name");
    }

    // 精确匹配试卷，paper_code 和 paper_name 都必须精确匹配
    const debugPaperSql = interpolateSQL(
      `SELECT id FROM exam_papers
       WHERE paper_code = ? AND paper_name = ?
       LIMIT 1`,
      [paper_code, paper_name]
    );
    console.log("🧠 Full exam_paper SQL:", debugPaperSql);

    const [examRows]: any[] = await db.query(
      `SELECT id FROM exam_papers
       WHERE paper_code = ? AND paper_name = ?
       LIMIT 1`,
      [paper_code, paper_name]
    );
    if (examRows.length === 0) throw new Error("Exam paper not found");
    const exam_paper_id = examRows[0].id;
    console.log("✅ Matched exam paper:", { exam_paper_id, paper_name, paper_code });

    let count = 0;

    await db.query("START TRANSACTION");

    // 2. 遍历 marks，查找对应 question_bank.id 并插入
    for (const mark of marks) {
      const { question_number, label, level, mark_code, mark_content, ao_code, explanation } = mark;
      if (!question_number || !label || !mark_code) continue;

      const parsedLabel = extractLabel(label, level);

      console.log("🔍 Matching question_bank with:", { exam_paper_id, question_number, label: parsedLabel.label, parent_label: parsedLabel.parent_label, level });

      const debugSql = interpolateSQL(
        `SELECT id FROM question_bank WHERE exam_paper_id = ? AND question_number = ? AND label = ? AND parent_label <=> ? AND level = ?`,
        [exam_paper_id, question_number, parsedLabel.label, parsedLabel.parent_label, level]
      );
      console.log("🧠 Full SQL:", debugSql);

      const qrows: any[] = await db.query(
        `SELECT id FROM question_bank
         WHERE exam_paper_id = ? AND question_number = ? AND label = ? AND parent_label <=> ? AND level = ?
         LIMIT 1`,
        [exam_paper_id, question_number, parsedLabel.label, parsedLabel.parent_label, level]
      );
      if (qrows.length === 0) {
        console.warn(`❌ No match: Q${question_number} ${label} ${level}`);
        continue;
      }

      const question_bank_id = qrows[0].id;
      const mark_type = getMarkType(mark_code);

      const [existsRows]: any[] = await db.query(
        `SELECT id FROM mark_scheme
         WHERE exam_paper_id = ? AND question_bank_id = ? AND mark_code = ?`,
        [exam_paper_id, question_bank_id, mark_code]
      );
      if (existsRows.length > 0) {
        console.warn(`⚠️ Skipping duplicate mark: qid=${question_bank_id}, mark_code=${mark_code}`);
        continue;
      }

      const insertSql = interpolateSQL(
        `INSERT INTO mark_scheme (exam_paper_id, question_bank_id, question_number, label, parent_label, level, mark_code, mark_type, mark_content, ao_code, explanation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          exam_paper_id,
          question_bank_id,
          question_number,
          parsedLabel.label,
          parsedLabel.parent_label,
          level,
          mark_code,
          mark_type,
          mark_content,
          ao_code,
          explanation
        ]
      );
      console.log("🧠 Full INSERT SQL:", insertSql);

      await db.query(
        `INSERT INTO mark_scheme (exam_paper_id, question_bank_id, question_number, label, parent_label, level, mark_code, mark_type, mark_content, ao_code, explanation, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
        [
          exam_paper_id,
          question_bank_id,
          question_number,
          parsedLabel.label,
          parsedLabel.parent_label,
          level,
          mark_code,
          mark_type,
          mark_content,
          ao_code,
          explanation
        ]
      );

      count++;
    }

    await db.query("COMMIT");

    res.status(200).json({ success: true, inserted: count, exam_paper_id });
  } catch (err: any) {
    await db.query("ROLLBACK");
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
}

function getMarkType(code: string) {
  if (code.startsWith("dM")) return "dM";
  if (code.startsWith("M")) return "M";
  if (code.startsWith("A")) return "A";
  if (code.startsWith("B")) return "B";
  return null;
}

function extractLabel(fullLabel: string, level: string) {
  const matches = fullLabel.match(/\([a-zA-Z0-9]+\)/g) || [];
  if (level === "subsub" && matches.length === 2) {
    return { label: matches[1], parent_label: matches[0] };
  }
  return { label: matches[0], parent_label: null };
}

function interpolateSQL(query: string, params: any[]) {
  let i = 0;
  return query.replace(/\?/g, () => {
    const p = params[i++];
    if (p === null) return 'NULL';
    if (typeof p === 'string') return `'${p.replace(/'/g, "''")}'`;
    return p;
  });
}