import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function ExamSetupPage() {
  const router = useRouter();
  const [examPapers, setExamPapers] = useState<any[]>([]);
  const [selectedExamId, setSelectedExamId] = useState("0");

  useEffect(() => {
    fetch("/api/papers")
      .then((res) => res.json())
      .then((data) => {
        setExamPapers(data);
        if (data.length > 0) setSelectedExamId(data[0].id);
      });
  }, []);

  async function startExam() {
    const res = await fetch("/api/start-exam", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ examId: selectedExamId }),
    });

    const data = await res.json();
    if (data.sessionId) {
      router.push(`/math/doing?sessionId=${data.sessionId}`);
    }
  }

  return (
    <div className="min-h-screen bg-muted px-4 py-8">
      <Card className="max-w-xl mx-auto p-6">
        <CardContent>
          <h1 className="text-xl font-bold mb-4">📝 Exam Setup</h1>
          <div className="space-y-4 text-sm">

            <div className="mt-6">
              <label className="font-medium">Select Exam Paper:</label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="mt-1 w-full border rounded p-2"
              >
                {examPapers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.paper_name} ({p.paper_code})
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={startExam} className="mt-6 w-full">
              ✅ Start Exam
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
