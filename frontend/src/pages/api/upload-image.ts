import { NextApiRequest, NextApiResponse } from "next";
import formidable from "formidable";
import fs from "fs";
import path from "path";

// 关闭默认 body parser
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") return res.status(405).end();

  //在根目录frontend下面生成上传学生答案图片目录public/uploads/doing
  const uploadDir = path.join(process.cwd(), "public", "uploads", "doing");
  fs.mkdirSync(uploadDir, { recursive: true });

  const form = formidable({
    uploadDir,
    keepExtensions: true,
    maxFileSize: 5 * 1024 * 1024, // 5MB
    filename: (_name, _ext, part) => {
      const timestamp = Date.now();
      const safeName = part.originalFilename?.replace(/\s+/g, "_") || "upload";
      return `${timestamp}_${safeName}`;
    },
  });

  return form.parse(req, (err, fields, files) => {
    if (err) {
      console.error("Upload error:", err);
      return res.status(500).json({ error: "File upload failed" });
    }

    const uploadedFiles = files.file;
    const fileArray = Array.isArray(uploadedFiles) ? uploadedFiles : [uploadedFiles];
    const validFiles = fileArray.filter((f): f is formidable.File => !!f && !!f.filepath);
    validFiles.forEach((f) => {
      console.log("📁 formidable 里面 f.filepath的值:", f.filepath);
    });

    const responseJson = {
      files: validFiles.map((f) => ({
        url: `/uploads/doing/${path.basename(f.filepath)}`,
        name: f.originalFilename,
        type: f.mimetype || "image/png",
      })),
    };
    console.log("🟢 返回给前端的 JSON 内容:", responseJson);
    return res.status(200).json(responseJson);
  });
}