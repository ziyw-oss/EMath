import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function renderMath(text?: string): JSX.Element[] {
  if (!text) return [];
  const regex = /\\\[(.+?)\\\]|\\\((.+?)\\\)|\$\$(.+?)\$\$/g;
  const result: JSX.Element[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index!;
    const matchEnd = regex.lastIndex;

    if (matchStart > lastIndex) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex, matchStart)}</span>);
    }

    const latex = (match[1] || match[2] || match[3] || "").trim();
    const isBlock = !!match[1] || !!match[3];
    const key = `${matchStart}-${isBlock ? "block" : "inline"}`;

    result.push(
      isBlock ? <BlockMath key={key} math={latex} /> : <InlineMath key={key} math={latex} />
    );

    lastIndex = matchEnd;
  }

  if (lastIndex < text.length) {
    result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return result;
}

export default function ExamDoingPage() {
  const router = useRouter();
  const { examId } = router.query;
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<{ [id: number]: string }>({});
  const [examInfo, setExamInfo] = useState<{ year?: string; type?: string; question_time?: number }>({});
  const [remainingTime, setRemainingTime] = useState<number | null>(null);

  useEffect(() => {
    if (!examId) return;

    fetch(`/api/doing?examId=${examId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        if (data.length > 0 && data[0].exam_year && data[0].exam_type && data[0].question_time !== undefined) {
          setExamInfo({
            year: data[0].exam_year,
            type: data[0].exam_type,
            question_time: data[0].question_time,
          });
          setRemainingTime(data[0].question_time);
        }
        const levelOrder = { main: 0, sub: 1, subsub: 2 };
        const sorted = data.sort((a: any, b: any) => {
          const qa = [parseInt(a.question_number), a.parent_label || '', a.label || '', levelOrder[a.level as "main" | "sub" | "subsub"]];
          const qb = [parseInt(b.question_number), b.parent_label || '', b.label || '', levelOrder[b.level as "main" | "sub" | "subsub"]];
          return qa.toString().localeCompare(qb.toString(), undefined, { numeric: true });
        });
        setQuestions(sorted);
      })
      .catch((err) => {
        console.error("Fetch failed:", err);
      });
  }, [examId]);

  useEffect(() => {
    if (remainingTime === null) return;
    if (remainingTime <= 0) return;
    const timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime]);

  if (!examId) return <div className="p-4">Missing exam ID</div>;
  if (!questions.length) return <div className="p-4">Loading questions...</div>;

  const grouped = questions.reduce((acc: Record<string, any[]>, q) => {
    if (!acc[q.question_number]) acc[q.question_number] = [];
    acc[q.question_number].push(q);
    return acc;
  }, {});
  const groupedEntries = Object.entries(grouped).sort(
    ([a], [b]) => parseInt(a) - parseInt(b)
  );
  const [currentNumber, qlist] = groupedEntries[currentPage] || [];

  function formatQuestionLabel(
    number: string,
    label: string,
    level: string,
    parent?: string
  ) {
    if (level === "main") return `${number}.`;
    if (level === "sub") return `${label}`;
    if (level === "subsub") return `${label}`;
    return label || number;
  }

  const sortedList = [...qlist].sort((a, b) => {
    const levelOrder = { main: 0, sub: 1, subsub: 2 };
    const qa = [a.parent_label || "", a.label || "", levelOrder[a.level as "main" | "sub" | "subsub"]];
    const qb = [b.parent_label || "", b.label || "", levelOrder[b.level as "main" | "sub" | "subsub"]];
    return qa.toString().localeCompare(qb.toString(), undefined, { numeric: true });
  });

  const currentQ = sortedList.find(q => q.level === "main") || sortedList[0];

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <>
      <Head>
        <script
          id="MathJax-script"
          async
          src="https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js"
        ></script>
      </Head>
      <div className="flex flex-col min-h-screen bg-gray-100">
        {/* 顶部信息栏 */}
        <div className="bg-white shadow-md border-b border-gray-300 px-6 py-3 flex justify-between items-center text-gray-700 font-semibold text-sm select-none">
          <div className="flex gap-6">
            <div>考试年份: {examInfo.year || "-"}</div>
            <div>考试类型: {examInfo.type || "-"}</div>
            <div>题号: {currentNumber || "-"}</div>
          </div>
          <div className="font-mono text-red-600">
            剩余时间: {remainingTime !== null ? formatTime(remainingTime) : "--:--"}
          </div>
        </div>

        {/* 题目区域 */}
        <div className="flex-grow flex justify-center items-start pt-8 px-4">
          <div className="bg-white shadow-lg rounded-md max-w-4xl w-full p-8 border border-gray-300">
            {sortedList
              .filter((q) => q.level === "main")
              .map((q) => (
                <div key={q.id} className="mb-8">
                  <div className="font-semibold text-xl mb-3 flex items-start gap-3">
                    <span>{formatQuestionLabel(q.question_number, q.label, q.level, q.parent_label)}</span>
                    <div className="whitespace-pre-wrap leading-relaxed text-gray-900">{renderMath(q.question_text)}</div>
                  </div>
                  {q.marks !== null && (
                    <textarea
                      className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                      placeholder="请输入答案..."
                      value={answers[q.id] || ""}
                      onChange={(e) =>
                        setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                      }
                    />
                  )}
                </div>
              ))}

            {/* 子题 + 子子题 */}
            {sortedList
              .filter((q) => q.level === "sub")
              .map((q) => {
                const children = sortedList.filter(
                  (c) => c.level === "subsub" && c.parent_label === q.label
                );
                return (
                  <div key={q.id} className="mb-8 ml-8 border-l-4 border-blue-200 pl-6">
                    <div className="font-semibold text-lg mb-3 flex items-start gap-3">
                      <span>{formatQuestionLabel(q.question_number, q.label, q.level, q.parent_label)}</span>
                      <div className="whitespace-pre-wrap leading-relaxed text-gray-900">{renderMath(q.question_text)}</div>
                    </div>
                    {q.marks !== null && (
                      <textarea
                        className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                        placeholder="请输入答案..."
                        value={answers[q.id] || ""}
                        onChange={(e) =>
                          setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                        }
                      />
                    )}
                    {children.map((c) => (
                      <div key={c.id} className="ml-8 mt-6 border-l-4 border-blue-100 pl-6">
                        <div className="font-semibold text-base mb-2">
                          {formatQuestionLabel(
                            c.question_number,
                            c.label,
                            c.level,
                            c.parent_label
                          )}
                        </div>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-900">
                          {renderMath(c.question_text)}
                        </div>
                        {c.marks !== null && (
                          <textarea
                            className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                            placeholder="请输入答案..."
                            value={answers[c.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }))
                            }
                          />
                        )}
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        </div>

        {/* 固定底部导航 */}
        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md p-4 z-50">
          <div className="max-w-4xl mx-auto flex justify-between">
            <button
              className="px-5 py-2 bg-gray-300 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-400 transition"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
              disabled={currentPage === 0}
            >
              ⬅️ 上一题
            </button>
            <button
              className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold hover:bg-blue-700 transition"
              onClick={() =>
                setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1))
              }
              disabled={currentPage === groupedEntries.length - 1}
            >
              下一题 ➡️
            </button>
          </div>
        </div>
      </div>
    </>
  );
}