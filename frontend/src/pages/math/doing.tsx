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
  const { sessionId } = router.query;
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(0);
  const [answers, setAnswers] = useState<{ [id: number]: string }>({});
  const [uploadedFiles, setUploadedFiles] = useState<{ [id: number]: string[] }>({});
  // 追踪当前激活的题目ID（聚焦的textarea）
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);
  // 全局粘贴图片上传
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      if (!activeQuestionId) return;
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image")) {
          const file = item.getAsFile();
          if (!file) return;
          const formData = new FormData();
          formData.append("file", file);
          const res = await fetch("/api/upload-image", {
            method: "POST",
            body: formData,
          });
          const data = await res.json();
          const url = data.files?.[0]?.url;
          if (url) {
            setUploadedFiles((prev) => ({
              ...prev,
              [activeQuestionId]: [...(prev[activeQuestionId] || []), url],
            }));
          }
          break;
        }
      }
    };
    window.addEventListener("paste", handlePaste as any);
    return () => window.removeEventListener("paste", handlePaste as any);
  }, [activeQuestionId]);
  const [examInfo, setExamInfo] = useState<{ year?: string; type?: string; question_time?: number | null }>({});
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  // 评分反馈
  const [scoreFeedback, setScoreFeedback] = useState<
    Record<number, { score: number; reason: string; matched?: string[] }>
  >({});
  // 新增：判分反馈显示状态和内容
  const [showFeedback, setShowFeedback] = useState(false);
  // currentFeedback 现在是所有题目反馈的对象
  const [currentFeedback, setCurrentFeedback] = useState<
    Record<number, { score: number; reason: string; matched?: string[] }> | null
  >(null);
  // 新增：判分中状态
  const [isScoring, setIsScoring] = useState(false);
  // 新增：提交状态和最终得分
  const [submitted, setSubmitted] = useState(false);
  const [finalScoreSummary, setFinalScoreSummary] = useState<{ total: number; full: number } | null>(null);

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
    if (!sessionId) return;

    fetch(`/api/doing?sessionId=${sessionId}`)
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
  }, [sessionId]);

  useEffect(() => {
    if (remainingTime === null) return;
    if (remainingTime <= 0) return;
    const timer = setTimeout(() => setRemainingTime(remainingTime - 1), 1000);
    return () => clearTimeout(timer);
  }, [remainingTime]);

  if (!sessionId) return <div className="p-4">Missing session ID</div>;
  if (!questions.length) return <div className="p-4">Loading questions...</div>;

  // 提取试卷ID
  const examPaperId = questions[0]?.exam_paper_id;

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
        {/* Top info bar */}
        <div className="bg-white shadow-md border-b border-gray-300 py-3 flex justify-center items-center text-gray-700 font-semibold text-sm select-none">
          <div className="flex gap-10">
            <span className="whitespace-nowrap">Year: {examInfo.year || "-"}</span>
            <span className="whitespace-nowrap">Type: {examInfo.type || "-"}</span>
            <span className="whitespace-nowrap">Question: {currentNumber || "-"}</span>
          </div>
        </div>

        {/* 题目区域 */}
        <div className="flex-grow flex justify-center items-start pt-12 px-4">
          <div className="bg-white shadow-lg rounded-md max-w-4xl w-full p-8 border border-gray-300">
            {showFeedback && currentFeedback && (
              <div className="space-y-6">
                {Object.entries(currentFeedback).map(([qid, fb]) => {
                  const q = questions.find(q => q.id === Number(qid));
                  const label = (() => {
                    if (!q) return qid;
                    if (q.level === "main") return q.question_number;
                    if (q.level === "subsub") return `${q.question_number} ${q.parent_label}.${q.label}`;
                    if (q.level === "sub") return `${q.question_number} ${q.label}`;
                    return q.question_number;
                  })();

                  return (
                    <div key={qid} className="border rounded-lg bg-white shadow p-4">
                      <p className="text-gray-600 text-sm mb-1">
                        <strong>Question:</strong> {label}
                      </p>
                      <p className="text-gray-700 whitespace-pre-line mb-2">
                        <strong>Score:</strong> {fb.score}
                      </p>
                      <p className="text-gray-700 whitespace-pre-line">
                        <strong>Reason:</strong> {fb.reason}
                      </p>
                      {fb.matched && fb.matched.length > 0 && (
                        <p className="text-gray-700 mt-1">
                          <strong>Matched Points:</strong> {fb.matched.join(", ")}
                        </p>
                      )}
                    </div>
                  );
                })}
                <div className="flex justify-center pt-2">
                  {submitted && currentPage === groupedEntries.length - 1 ? (
                    <div className="flex flex-col items-center space-y-3">
                      <button
                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        onClick={() => {
                          setCurrentFeedback(scoreFeedback);
                        }}
                      >
                        View Full Score Details
                      </button>
                      <button
                        className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                        onClick={() => router.push("/math/dashboard")}
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  ) : (
                    <button
                      className="mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                      onClick={() => {
                        setShowFeedback(false);
                        setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                        setCurrentFeedback(null);
                      }}
                    >
                      Next
                    </button>
                  )}
                </div>
              </div>
            )}
            {!showFeedback && (
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
                              placeholder="Enter your answer..."
                              value={answers[q.id] || ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              onFocus={() => setActiveQuestionId(q.id)}
                            />
                          {/* 评分反馈 */}
                          {scoreFeedback[q.id] && (
                            <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                              <p className="font-semibold">✅ 得分：{scoreFeedback[q.id].score}</p>
                              <p className="text-sm">{scoreFeedback[q.id].reason}</p>
                            </div>
                          )}
                          {/* 上传图片文件 */}
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
                                  setUploadedFiles((prev) => ({
                                    ...prev,
                                    [q.id]: [...(prev[q.id] || []), ...uploadedUrls],
                                  }));
                                }
                              }}
                            />
                          </div>
                          {/* 显示已上传图片缩略图 */}
                          {uploadedFiles[q.id]?.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {uploadedFiles[q.id].map((url, idx) => (
                                <img
                                  key={idx}
                                  src={url}
                                  alt={`Answer ${idx + 1}`}
                                  className="w-24 h-auto border border-gray-300 rounded"
                                />
                              ))}
                            </div>
                          )}
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
                              placeholder="Enter your answer..."
                              value={answers[q.id] || ""}
                              onChange={(e) =>
                                setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))
                              }
                              onFocus={() => setActiveQuestionId(q.id)}
                            />
                            {/* 评分反馈 */}
                            {scoreFeedback[q.id] && (
                              <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                                <p className="font-semibold">✅ 得分：{scoreFeedback[q.id].score}</p>
                                <p className="text-sm">{scoreFeedback[q.id].reason}</p>
                              </div>
                            )}
                            {/* 上传图片文件 */}
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
                                    setUploadedFiles((prev) => ({
                                      ...prev,
                                      [q.id]: [...(prev[q.id] || []), ...uploadedUrls],
                                    }));
                                  }
                                }}
                              />
                            </div>
                            {/* 显示已上传图片缩略图 */}
                            {uploadedFiles[q.id]?.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {uploadedFiles[q.id].map((url, idx) => (
                                  <img
                                    key={idx}
                                    src={url}
                                    alt={`Answer ${idx + 1}`}
                                    className="w-24 h-auto border border-gray-300 rounded"
                                  />
                                ))}
                              </div>
                            )}
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
                                  placeholder="Enter your answer..."
                                  value={answers[c.id] || ""}
                                  onChange={(e) =>
                                    setAnswers((prev) => ({ ...prev, [c.id]: e.target.value }))
                                  }
                                  onFocus={() => setActiveQuestionId(c.id)}
                                />
                                {/* 评分反馈 */}
                                {scoreFeedback[c.id] && (
                                  <div className="mt-3 p-3 border rounded bg-green-50 text-green-800">
                                    <p className="font-semibold">✅ 得分：{scoreFeedback[c.id].score}</p>
                                    <p className="text-sm">{scoreFeedback[c.id].reason}</p>
                                  </div>
                                )}
                                {/* 上传图片文件 */}
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
                                        setUploadedFiles((prev) => ({
                                          ...prev,
                                          [c.id]: [...(prev[c.id] || []), ...uploadedUrls],
                                        }));
                                      }
                                    }}
                                  />
                                </div>
                                {/* 显示已上传图片缩略图 */}
                                {uploadedFiles[c.id]?.length > 0 && (
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {uploadedFiles[c.id].map((url, idx) => (
                                      <img
                                        key={idx}
                                        src={url}
                                        alt={`Answer ${idx + 1}`}
                                        className="w-24 h-auto border border-gray-300 rounded"
                                      />
                                    ))}
                                  </div>
                                )}
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

        {/* 固定底部导航，仅在未显示评分反馈时展示 */}
        {!showFeedback && (
          <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-300 shadow-md p-4 z-50">
            <div className="max-w-4xl mx-auto flex justify-start gap-4">
              <button
                className="px-5 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                onClick={() => {
                  if (confirm("Are you sure you want to abandon this exam?")) {
                    router.push("/math/dashboard");
                  }
                }}
              >
                ❌ Abandon
              </button>
              <button
                className="px-5 py-2 bg-gray-300 rounded-lg disabled:opacity-50 font-semibold hover:bg-gray-400 transition"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
                disabled={currentPage === 0}
              >
                ⬅️ Previous
              </button>
              <button
                className="px-5 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 font-semibold hover:bg-blue-700 transition"
                onClick={async () => {
                  setIsScoring(true);
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
                        image_path: string | null;
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
                          exam_paper_id: examPaperId,
                          level: q.level,
                          question_number: q.question_number,
                          parent_label: q.parent_label,
                          label: q.label,
                          image_path: q.image_path || null,
                        },
                      };
                    }
                    return acc;
                  }, {});

                  // 打印所有题目的题干图片路径
                  Object.entries(answerPayload).forEach(([qid, ans]) => {
                    console.log(`题目ID ${qid} 传给 API 的题干图片路径:`, ans.meta.image_path);
                  });
                  // 新增：打印所有题目的图片答案路径
                  Object.entries(answerPayload).forEach(([qid, ans]) => {
                    console.log(`题目 ${qid} 的图片路径:`, ans.images);
                  });

                  if (Object.keys(answerPayload).length === 0) {
                    // 直接跳下一题
                    setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                    setIsScoring(false);
                    return;
                  }

                  const token = localStorage.getItem("token");
                  if (!token) {
                    alert("⚠️ Not logged in. Please login first.");
                    router.push("/math/login");
                    return;
                  }

                  try {
                    const res = await fetch("/api/save-and-score", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                      },
                      body: JSON.stringify({ sessionId, answers: answerPayload }),
                    });
                    const data = await res.json();
                    if (data.feedback) {
                      setScoreFeedback((prev) => ({ ...prev, ...data.feedback }));
                      // 判分完成后判断是否为最后一题
                      if (currentPage === groupedEntries.length - 1) {
                        setSubmitted(true);
                        setCurrentFeedback(data.feedback); // ✅ 只展示最后一页评分反馈
                        setShowFeedback(true);
                        const combined = { ...scoreFeedback, ...data.feedback };
                        const totalScore = Object.values(combined as Record<number, { score: number | null }>).reduce(
                          (sum, fb) => sum + (fb.score ?? 0),
                          0
                        );
                        const fullScore = questions.reduce((sum, q) => sum + (q.marks ?? 0), 0);
                        setFinalScoreSummary({ total: totalScore, full: fullScore });
                        return;
                      } else {
                        setCurrentFeedback(data.feedback);
                        setShowFeedback(true);
                      }
                    } else {
                      setCurrentPage((p) => Math.min(p + 1, groupedEntries.length - 1));
                    }
                  } catch (err) {
                    console.error("❌ 保存或判分失败:", err);
                  }
                  setIsScoring(false);
                }}
                disabled={isScoring}
              >
                {isScoring
                  ? "Scoring..."
                  : (currentPage === groupedEntries.length - 1 ? "Submit" : "Next ➡️")}
              </button>
            </div>
          </div>
        )}
        {/* Score summary after submission */}
        {submitted && finalScoreSummary && (
          <div className="mt-4 p-4 border border-gray-300 bg-white rounded">
            <p className="text-lg font-semibold text-gray-700">
              ✅ Submitted! Score: {finalScoreSummary.total} / {finalScoreSummary.full}
              {" "}({((finalScoreSummary.total / finalScoreSummary.full) * 100).toFixed(1)}%)
            </p>

            <div className="mt-6 space-y-6">
              {Object.entries(scoreFeedback).map(([qid, fb]) => {
                const q = questions.find(q => q.id === Number(qid));
                const label = (() => {
                  if (!q) return qid;
                  if (q.level === "main") return q.question_number;
                  if (q.level === "subsub") return `${q.question_number} ${q.parent_label}.${q.label}`;
                  if (q.level === "sub") return `${q.question_number} ${q.label}`;
                  return q.question_number;
                })();

                return (
                  <div key={qid} className="border rounded-lg bg-white shadow p-4">
                    <p className="text-gray-600 text-sm mb-1">
                      <strong>Question:</strong> {label}
                    </p>
                    <p className="text-gray-700 whitespace-pre-line mb-2">
                      <strong>Score:</strong> {fb.score}
                    </p>
                    <p className="text-gray-700 whitespace-pre-line">
                      <strong>Reason:</strong> {fb.reason}
                    </p>
                    {fb.matched && fb.matched.length > 0 && (
                      <p className="text-gray-700 mt-1">
                        <strong>Matched Points:</strong> {fb.matched.join(", ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-6 text-center">
              <button
                className="inline-block mt-2 px-6 py-2 bg-yellow-400 text-black font-semibold rounded hover:bg-yellow-300 transition"
                onClick={async () => {
                  const res = await fetch("/api/submit-exam", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                      sessionId,
                      score: finalScoreSummary?.total,
                      fullScore: finalScoreSummary?.full,
                    }),
                  });
                  const result = await res.json();
                  if (result.rewardGranted) {
                    alert(`🎉 You earned a reward of ${result.rewardAmount}元!`);
                  } else {
                    alert("No reward granted (must score above 50% within 2.5 hours).");
                  }
                  router.push("/math/dashboard");
                }}
              >
                🎁 Check & Claim Reward
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}