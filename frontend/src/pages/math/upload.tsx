import { useState } from "react";

export default function UploadAndParseQP() {
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [msFile, setMsFile] = useState<File | null>(null);
  const [msResult, setMsResult] = useState<any>(null);
  const [msLoading, setMsLoading] = useState(false);
  const [msError, setMsError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      const res = await fetch("/api/upload-parse-qp", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (res.ok) {
        try {
          const data = JSON.parse(text);
          setResult(data);
        } catch {
          setError("Failed to parse JSON response.");
        }
      } else {
        setError(text || "Failed to parse PDF.");
      }
    } catch (e) {
      setError("Unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const handleMsFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setMsFile(e.target.files[0]);
    }
  };

  const handleUploadMs = async () => {
    if (!msFile) return;
    setMsLoading(true);
    setMsError("");
    setMsResult(null);

    const formData = new FormData();
    formData.append("pdf", msFile);

    try {
      const res = await fetch("/api/upload-parse-ms", {
        method: "POST",
        body: formData,
      });

      const text = await res.text();
      if (res.ok) {
        try {
          const data = JSON.parse(text);
          setMsResult(data);
        } catch {
          setMsError("Failed to parse JSON response.");
        }
      } else {
        setMsError(text || "Failed to parse PDF.");
      }
    } catch (e) {
      setMsError("Unexpected error occurred.");
    } finally {
      setMsLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Upload Edexcel Math Question Paper</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        className="mb-4"
      />
      <br />
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
      >
        {loading ? "Parsing..." : "Upload & Parse"}
      </button>

      {error && (
        <div className="text-red-600 mt-4">
          ❌ {error}
        </div>
      )}

      {result?.questions && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Parsed Questions Preview</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto text-sm bg-gray-50 p-4 rounded">
            {result.questions.map((q: any, index: number) => (
              <div key={index} className="border-b pb-2">
                <div className="font-semibold">
                  Question {q.question_number}
                  {q.sub_question ? `(${q.sub_question})` : ""} — {q.marks} mark{q.marks > 1 ? "s" : ""}
                </div>
                <pre className="text-gray-700 mt-1 whitespace-pre-wrap">{q.question_text}</pre>
              </div>
            ))}
          </div>
        </div>
      )}

      <h1 className="text-2xl font-bold mt-10 mb-4">Upload Edexcel Math Mark Scheme</h1>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleMsFileChange}
        className="mb-4"
      />
      <br />
      <button
        onClick={handleUploadMs}
        disabled={!msFile || msLoading}
        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
      >
        {msLoading ? "Parsing..." : "Upload & Parse"}
      </button>

      {msError && (
        <div className="text-red-600 mt-4">
          ❌ {msError}
        </div>
      )}

      {msResult?.questions && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Parsed Mark Scheme Preview</h2>
          <div className="space-y-4 max-h-[500px] overflow-y-auto text-sm bg-gray-50 p-4 rounded">
            {msResult.questions.map((q: any, index: number) => (
              <div key={index} className="border-b pb-2">
                <div className="font-semibold">
                  Question {q.question_number}
                  {q.sub_question ? `(${q.sub_question})` : ""} — {q.marks} mark{q.marks > 1 ? "s" : ""}
                </div>
                <pre className="text-gray-700 mt-1 whitespace-pre-wrap">{q.mark_scheme_text}</pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}