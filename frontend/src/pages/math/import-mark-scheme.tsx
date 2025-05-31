import { useState } from "react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Accordion, AccordionItem } from "@/components/ui/accordion"; // 确保你有这个组件库

export default function ImportMarkScheme() {
  const [jsonText, setJsonText] = useState("");
  interface Mark {
    question_number: number;
    label?: string;
    mark_code?: string;
    mark_content?: string;
    explanation?: string;
    ao_code?: string;
  }

  interface ParsedData {
    marks: Mark[];
    exam_metadata: {
      exam_paper_id?: string;
    };
  }

  const [parsed, setParsed] = useState<ParsedData | null>(null);
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
            {(() => {
              const grouped = parsed.marks.reduce((acc: Record<string, any[]>, mark: any) => {
                const key = `Q${mark.question_number}`;
                if (!acc[key]) acc[key] = [];
                acc[key].push(mark);
                return acc;
              }, {});

              return (
                <Accordion type="multiple" className="w-full mt-2">
                  {Object.entries(grouped).map(([question, marks]) => (
                    <AccordionItem key={question} value={question}>
                      <div className="font-medium text-base">{question}</div>
                      {(() => {
                        const groupedByLabel = (marks as Mark[]).reduce((acc: Record<string, any[]>, mark: any) => {
                          const labelKey = mark.label || "—";
                          if (!acc[labelKey]) acc[labelKey] = [];
                          acc[labelKey].push(mark);
                          return acc;
                        }, {});

                        return Object.entries(groupedByLabel).map(([label, labelMarks], j) => (
                          <div key={j} className="mb-3">
                            <div className="text-sm font-bold text-blue-700 mb-1">Part {label}</div>
                            {(() => {
                              const markGroups = labelMarks.reduce((acc: Record<string, any[]>, mark: any) => {
                                const groupKey = mark.mark_code?.match(/^[A-Za-z]+/)?.[0] || "Other";
                                if (!acc[groupKey]) acc[groupKey] = [];
                                acc[groupKey].push(mark);
                                return acc;
                              }, {});

                              return Object.entries(markGroups).map(([group, groupMarks], m) => (
                                <div key={m} className="ml-2 mb-2">
                                  <div className="text-xs font-medium text-gray-500 mb-1">[{group}] Marks</div>
                                  {groupMarks.map((m, n) => (
                                    <div key={n} className="border rounded-md p-2 mb-1 bg-white">
                                      <div className="text-sm font-semibold">{m.mark_code}</div>
                                      <div className="text-xs whitespace-pre-wrap text-gray-800">{m.mark_content}</div>
                                      <div className="text-xs mt-1 text-gray-600 whitespace-pre-wrap">{m.explanation}</div>
                                      {m.ao_code && (
                                        <div className="text-xs mt-1 text-gray-500 whitespace-pre-wrap">AO: {m.ao_code}</div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              ));
                            })()}
                          </div>
                        ));
                      })()}
                    </AccordionItem>
                  ))}
                </Accordion>
              );
            })()}
            <Button onClick={handleUpload} className="mt-4">Save to Database</Button>
          </CardContent>
        </Card>
      )}
      {result && <div className="mt-2 text-sm text-green-600">{result}</div>}
    </div>
  );
}