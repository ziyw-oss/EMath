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
  const [uploadedFiles, setUploadedFiles] = useState<{ [id: number]: string[] }>({});
  const [examInfo, setExamInfo] = useState<{ year?: string; type?: string; question_time?: number | null }>({});
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  // 评分反馈
  const [scoreFeedback, setScoreFeedback] = useState<Record<number, { score: number; reason: string }>>({});
  // 新增：判分反馈显示状态和内容
  const [showFeedback, setShowFeedback] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<{ score: number; reason: string; matched?: string[] } | null>(null);

  type AnswerItem = {
    text: string;
    images: string[];
    questionText: string;
    meta: {
      exam_paper_id: any;
      level: string;
      question_number: string;
      parent_label: string | null;
      label: string;
    };
  };

  useEffect(() => {
    if (!examId) return;

    fetch(`/api/doing?examId=${examId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data: any[]) => {
        console.log("📥 全部 fetch 返回数据：", data);
        console.log("🧪 fetched data[0]:", data[0]);
        if (data.length > 0) {
          const { exam_year, exam_type, question_time } = data[0];
          console.log("✅ setting examInfo:", { year: exam_year, type: exam_type, question_time });
          setExamInfo({
            year: exam_year,
            type: exam_type,
            question_time: question_time ?? null,
          });
          if (question_time !== undefined) {
            setRemainingTime(question_time);
          }
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
        <div className="bg-white shadow-md border-b border-gray-300 py-3 flex justify-center items-center text-gray-700 font-semibold text-sm select-none">
          <div className="flex gap-10">
            <span className="whitespace-nowrap">  考试年份：{examInfo.year || "-"}</span>
            <span className="whitespace-nowrap">   考试类型：{examInfo.type || "-"}</span>
            <span className="whitespace-nowrap">   题号：{currentNumber || "-"}</span>
          </div>
        </div>

        {/* 题目区域 */}
        <div className="flex-grow flex justify-center items-start pt-12 px-4">
          <div className="bg-white shadow-lg rounded-md max-w-4xl w-full p-8 border border-gray-300">
            {showFeedback && currentFeedback ? (
              <div className="p-4 bg-green-50 rounded border border-green-300 mb-4">
                <p><strong>得分：</strong>{currentFeedback.score}</p>
                <p><strong>判分理由：</strong>{currentFeedback.reason}</p>
                {currentFeedback.matched && currentFeedback.matched.length > 0 && (
                  <p><strong>命中评分点：</strong>{currentFeedback.matched.join(", ")}</p>
                )}
                <button
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    setShowFeedback(false);
                    setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                    setCurrentFeedback(null);
                  }}
                >
                  继续下一题
                </button>
              </div>
            ) : (
              <>
                {sortedList
                  .filter((q) => q.level === "main")
                  .map((q) => (
                    <div key={q.id} className="mb-8">
                      <div className="font-semibold text-xl mb-3 flex items-start gap-3">
                        <span>{formatQuestionLabel(q.question_number, q.label, q.level, q.parent_label)}</span>
                        <div className="whitespace-pre-wrap leading-relaxed text-gray-900">
                          {renderMath(q.question_text)}
                          {q.image_path && (
                            <img
                              src={q.image_path.startsWith("/") ? q.image_path : "/" + q.image_path}
                              alt="题干图"
                              className="max-w-full max-h-[300px] my-4 mx-auto"
                            />
                          )}
                          {q.marks !== null && (
                            <span className="ml-2 text-gray-500 text-sm">（{q.marks} 分）</span>
                          )}
                        </div>
                      </div>
                      {q.marks !== null && (
                        <>
                          <textarea
                            className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[120px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                            placeholder="请输入答案..."
                            value={answers[q.id] || ""}
                            onChange={(e) =>
                              setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                            }
                          />
                          {/* 评分反馈 */}
                          {scoreFeedback[q.id] && (
                            <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                              <p className="font-semibold">✅ 得分：{scoreFeedback[q.id].score}</p>
                              <p className="text-sm">{scoreFeedback[q.id].reason}</p>
                            </div>
                          )}
                          <div className="mt-2">
                            <input
                              type="file"
                              accept="image/*"
                              multiple
                              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (files) {
                                  const uploadedUrls: string[] = [];

                                  for (const file of Array.from(files)) {
                                    const formData = new FormData();
                                    formData.append("file", file);
                                    const res = await fetch("/api/upload-image", {
                                      method: "POST",
                                      body: formData,
                                    });
                                    const data = await res.json();
                                    const url = data.files?.[0]?.url;
                                    if (url) uploadedUrls.push(url);
                                  }

                                  setUploadedFiles((prev) => ({ ...prev, [q.id]: uploadedUrls }));
                                }
                              }}
                            />
                          </div>
                        </>
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
                          <div>
                            {renderMath(q.question_text)}
                            {q.image_path && (
                              <img
                                src={q.image_path.startsWith("/") ? q.image_path : "/" + q.image_path}
                                alt="题干图"
                                className="max-w-full max-h-[300px] my-4 mx-auto"
                              />
                            )}
                            {q.marks !== null && (
                              <span className="ml-2 text-gray-500 text-sm">（{q.marks} 分）</span>
                            )}
                          </div>
                        </div>
                        {q.marks !== null && (
                          <>
                            <textarea
                              className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                              placeholder="请输入答案..."
                              value={answers[q.id] || ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                            />
                            {/* 评分反馈 */}
                            {scoreFeedback[q.id] && (
                              <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                                <p className="font-semibold">✅ 得分：{scoreFeedback[q.id].score}</p>
                                <p className="text-sm">{scoreFeedback[q.id].reason}</p>
                              </div>
                            )}
                            <div className="mt-2">
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (files) {
                                    const uploadedUrls: string[] = [];

                                    for (const file of Array.from(files)) {
                                      const formData = new FormData();
                                      formData.append("file", file);
                                      const res = await fetch("/api/upload-image", {
                                        method: "POST",
                                        body: formData,
                                      });
                                      const data = await res.json();
                                      const url = data.files?.[0]?.url;
                                      if (url) uploadedUrls.push(url);
                                    }

                                    setUploadedFiles((prev) => ({ ...prev, [q.id]: uploadedUrls }));
                                  }
                                }}
                              />
                            </div>
                          </>
                        )}
                        {children.map((c) => (
                          <div key={c.id} className="ml-8 mt-6 border-l-4 border-blue-100 pl-6">
                            <div className="font-semibold text-base mb-2 flex items-start gap-2">
                              <span>{formatQuestionLabel(
                                c.question_number,
                                c.label,
                                c.level,
                                c.parent_label
                              )}</span>
                              <div className="whitespace-pre-wrap leading-relaxed text-gray-900">
                                {renderMath(c.question_text)}
                                {c.image_path && (
                                  <img
                                    src={c.image_path.startsWith("/") ? c.image_path : "/" + c.image_path}
                                    alt="题干图"
                                    className="max-w-full max-h-[300px] my-4 mx-auto"
                                  />
                                )}
                                {c.marks !== null && (
                                  <span className="ml-2 text-gray-500 text-sm">（{c.marks} 分）</span>
                                )}
                              </div>
                            </div>
                            {c.marks !== null && (
                              <>
                                <textarea
                                  className="w-full border border-gray-300 rounded-lg mt-3 p-4 min-h-[100px] resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400"
                                  placeholder="请输入答案..."
                                  value={answers[c.id] || ""}
                                  onChange={(e) =>
                                    setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }))
                                  }
                                />
                                {/* 评分反馈 */}
                                {scoreFeedback[c.id] && (
                                  <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                                    <p className="font-semibold">✅ 得分：{scoreFeedback[c.id].score}</p>
                                    <p className="text-sm">{scoreFeedback[c.id].reason}</p>
                                  </div>
                                )}
                                <div className="mt-2">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                    onChange={async (e) => {
                                      const files = e.target.files;
                                      if (files) {
                                        const uploadedUrls: string[] = [];

                                        for (const file of Array.from(files)) {
                                          const formData = new FormData();
                                          formData.append("file", file);
                                          const res = await fetch("/api/upload-image", {
                                            method: "POST",
                                            body: formData,
                                          });
                                          const data = await res.json();
                                          const url = data.files?.[0]?.url;
                                          if (url) uploadedUrls.push(url);
                                        }

                                        setUploadedFiles((prev) => ({ ...prev, [c.id]: uploadedUrls }));
                                      }
                                    }}
                                  />
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    );
                  })}
              </>
            )}
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
              onClick={async () => {
                // 构造当前页答案 payload
                const currentGroup = groupedEntries[currentPage]?.[1] || [];
                type AnswerPayload = Record<
                  string,
                  {
                    text: string;
                    images: string[];
                    questionText: string;
                    meta: {
                      exam_paper_id: any;
                      level: string;
                      question_number: string;
                      parent_label: string | null;
                      label: string;
                      questionImagePath: string | null;
                    };
                  }
                >;

                const answerPayload: AnswerPayload = currentGroup.reduce((acc: AnswerPayload, q: any) => {
                  if (q.marks !== null) {
                    acc[q.id] = {
                      text: answers[q.id] || "",
                      images: uploadedFiles[q.id] || [],
                      questionText: q.question_text,
                      meta: {
                        exam_paper_id: examId,
                        level: q.level,
                        question_number: q.question_number,
                        parent_label: q.parent_label,
                        label: q.label,
                        questionImagePath: q.image_path || null,
                      },
                    };
                  }
                  return acc;
                }, {});

                // 打印所有题目的题干图片路径
                Object.entries(answerPayload).forEach(([qid, ans]) => {
                  console.log(`题目ID ${qid} 传给 API 的题干图片路径:`, ans.meta.questionImagePath);
                });

                if (Object.keys(answerPayload).length === 0) {
                  // 直接跳下一题
                  setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                  return;
                }

                const token = localStorage.getItem("token");
                if (!token) {
                  console.error("未登录，无 token");
                  return;
                }

                try {
                  const res = await fetch("/api/save-and-score", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ sessionId: examId, answers: answerPayload }),
                  });
                  const data = await res.json();
                  if (data.feedback) {
                    setScoreFeedback((prev) => ({ ...prev, ...data.feedback }));
                    // 取当前题的反馈，显示
                    const currentQId = currentGroup[0]?.id;
                    if (currentQId && data.feedback[currentQId]) {
                      setCurrentFeedback(data.feedback[currentQId]);
                      setShowFeedback(true);
                    } else {
                      // 没有反馈则直接下一题
                      setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                    }
                  }
                } catch (err) {
                  console.error("❌ 保存或判分失败:", err);
                }
              }}
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