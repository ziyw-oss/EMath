import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import "katex/dist/katex.min.css";
import { BlockMath, InlineMath } from "react-katex";

interface Mark {
  question_number: string;
  label: string;
  mark_code: string;
  mark_content: string;
  explanation: string;
  parent_label?: string;
}

export default function ImportMarkSchemePage() {
  const [marks, setMarks] = useState<Mark[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const examPaperId = searchParams.get("exam_paper_id");

  useEffect(() => {
    if (searchParams.get("toast") === "success") {
      alert("✅ Upload successful: mark scheme saved.");
    }
  }, []);

  useEffect(() => {
    async function fetchMarks() {
      const res = await fetch(`/api/get-mark-scheme?exam_paper_id=${examPaperId}`);
      const data = await res.json();
      setMarks(data.marks || []);
      setLoading(false);
    }
    if (examPaperId) fetchMarks();
  }, [examPaperId]);

  if (loading) return <div className="p-6">Loading...</div>;

  const sortedMarks = [...marks].sort((a, b) => {
    const aNum = parseInt(a.question_number);
    const bNum = parseInt(b.question_number);
    if (aNum !== bNum) return aNum - bNum;
    return (a.label || "").localeCompare(b.label || "");
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold mb-4">📋 Mark Scheme for Exam Paper {examPaperId}</h1>
      {sortedMarks.map((m, i) => (
        <Card key={i} className="mb-2">
          <CardContent>
            <div className="font-semibold">
              Q{m.question_number} {m.parent_label ? `${m.parent_label}${m.label}` : m.label} - {m.mark_code}
            </div>
            <BlockMath math={m.mark_content} />
            <div className="text-xs text-gray-500 whitespace-pre-wrap mt-1">
              {m.explanation.split(/(\$\$.*?\$\$|\$.*?\$)/g).map((part, j) =>
                part.startsWith("$$") || part.startsWith("$") ? (
                  <InlineMath key={j} math={part.replace(/^\$+|\$+$/g, "")} />
                ) : (
                  <span key={j}>{part}</span>
                )
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}