import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function ImportMarkScheme() {
  const [jsonText, setJsonText] = useState("");
  const [parsed, setParsed] = useState<any | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const router = useRouter();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    setJsonText(text);
    try {
      const data = JSON.parse(text);
      setParsed(data);
    } catch (err) {
      alert("Invalid JSON file");
    }
  };

  const handleUpload = async () => {
    if (!parsed) return;
    const res = await fetch("/api/upload-mark-scheme", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(parsed)
    });
    const data = await res.json();
    if (res.ok) {
      alert(`✅ Upload successful: inserted ${data.inserted}`);
      const examPaperId = parsed.exam_metadata.exam_paper_id || data.exam_paper_id;
      router.push(`/math/view-mark-scheme?exam_paper_id=${examPaperId}&toast=success`);
    } else {
      setResult(`❌ Upload failed: ${data.error}`);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📥 Import Mark Scheme JSON</h1>
      <input type="file" accept="application/json" onChange={handleFileChange} className="mb-4" />
      {parsed && (
        <Card className="mb-4">
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm max-h-[300px] overflow-auto">
              {JSON.stringify(parsed.marks, null, 2)}
            </pre>
            <Button onClick={handleUpload} className="mt-4">Save to Database</Button>
          </CardContent>
        </Card>
      )}
      {result && <div className="mt-2 text-sm text-green-600">{result}</div>}
    </div>
  );
}