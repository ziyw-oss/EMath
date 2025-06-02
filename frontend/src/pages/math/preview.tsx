import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { InlineMath, BlockMath } from "react-katex";
import "katex/dist/katex.min.css";

function renderTextWithLatex(text: string) {
  const regex = /\\\[(.+?)\\\]|\\\((.+?)\\\)|\$\$(.+?)\$\$/g;
  const result: JSX.Element[] = [];
  const collectedBlockLatex: string[] = [];

  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    const matchStart = match.index!;
    const matchEnd = regex.lastIndex;

    // 文本段落
    if (matchStart > lastIndex) {
      result.push(<span key={lastIndex}>{text.slice(lastIndex, matchStart)}</span>);
    }

    const latex = (match[1] || match[2] || match[3] || "").trim();
    const clean = latex.replace(/\s+/g, "");

    if (!collectedBlockLatex.includes(clean)) {
      collectedBlockLatex.push(clean);
      const isBlock = !!match[1] || !!match[3];
      result.push(
        isBlock
          ? <BlockMath key={matchStart} math={latex} />
          : <InlineMath key={matchStart} math={latex} />
      );
    } else {
      const isBlock = !!match[1] || !!match[3];
      result.push(
        isBlock
          ? <BlockMath key={matchStart + "-dup"} math={latex} />
          : <InlineMath key={matchStart + "-dup"} math={latex} />
      );
    }

    lastIndex = matchEnd;
  }

  // 剩余文本
  if (lastIndex < text.length) {
    result.push(<span key={lastIndex}>{text.slice(lastIndex)}</span>);
  }

  return { rendered: result, collectedBlockLatex };
}

function groupQuestionsByMainLabel(questions: any[]) {
  // Group questions by main label (or question_number for non-main)
  const grouped: { [key: string]: any } = {};
  questions.forEach((q) => {
    const key = q.level === "main" ? q.label : q.question_number;
    if (!grouped[key]) {
      grouped[key] = { main: null, subs: [] };
    }
    if (q.level === "main") {
      grouped[key].main = q;
    } else {
      grouped[key].subs.push(q);
    }
  });

  // 在 subs 中加入 subsub 层，并用 parent_label 归类
  Object.values(grouped).forEach((group) => {
    const subs = group.subs || [];
    // 将 subsub 也包含在 subs 中，但标记为 subsub
    // 这里 subs 里已经包含所有非 main 题目，filter 出 subsub
    // 这里不需要额外操作，因为 subs 已包含所有非 main
    // 但后续渲染中需要根据 level 区分 sub 和 subsub
  });

  return Object.values(grouped);
}

export default function PreviewQuestion() {
  const router = useRouter();
  const [questions, setQuestions] = useState<any[]>([]);
  const [examInfo, setExamInfo] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const examPaperId = router.query.exam_paper_id as string | undefined;
    if (examPaperId) {
      fetch(`/api/load-qp?exam_paper_id=${encodeURIComponent(examPaperId)}`, { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setExamInfo(data.exam_metadata);
          setQuestions(data.questions);
        })
        .catch((err) => console.error("❌ Failed to load questions:", err));
    } else {
      fetch("/output_qp202402.json", { cache: "no-store" })
        .then((res) => res.json())
        .then((data) => {
          setExamInfo(data.exam_metadata);
          setQuestions(data.questions);
        })
        .catch((err) => console.error("❌ Failed to load questions:", err));
    }
    // router.query is stable in Next.js, but if SSR, consider router.isReady
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.exam_paper_id]);

  async function handleSaveToDatabase() {
    setSaving(true);
    try {
      const res = await fetch("/api/import-qp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exam_metadata: examInfo, questions })
      });
      const data = await res.json();
      if (res.ok && data.exam_paper_id) {
        // 跳转到当前页并带上 exam_paper_id
        router.push({
          pathname: router.pathname,
          query: { ...router.query, exam_paper_id: data.exam_paper_id }
        });
      } else {
        console.error("❌ Save failed:", data);
      }
    } catch (err) {
      console.error("❌ Save error:", err);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold mb-4">Restored Exam Format</h1>
      {examInfo && (
        <div className="mb-4 text-sm text-gray-700 space-y-1">
          <div><strong>Session:</strong> {examInfo.exam_session}</div>
          <div><strong>Subject:</strong> {examInfo.subject}</div>
          <div><strong>Paper:</strong> {examInfo.paper_name}</div>
        </div>
      )}
      {groupQuestionsByMainLabel(questions).map((group, i) => {
        const mainRenderResult = group.main ? renderTextWithLatex(group.main.question_text || "") : { rendered: [], collectedBlockLatex: [] };
        const collectedBlockLatexMain = mainRenderResult.collectedBlockLatex;

        return (
          <div key={i} className="border-b pb-4">
            {group.main && (
              <>
                <div className="mb-1 flex justify-between items-center font-semibold">
                  <div>{group.main.label}</div>
                  {group.main.marks !== null && group.main.marks !== undefined && (
                    <div className="text-sm text-gray-600">
                      ({group.main.marks} mark{group.main.marks > 1 ? "s" : ""})
                    </div>
                  )}
                </div>
                <div className="whitespace-pre-wrap">
                  {mainRenderResult.rendered}
                  {group.main.latex_blocks?.map((latex: string, j: number) => {
                    const cleanLatex = latex.replace(/^\\\[|\\\]$/g, "").trim();
                    if (collectedBlockLatexMain.includes(cleanLatex.replace(/\s+/g, ""))) return null;
                    return <BlockMath key={`latex-main-${i}-${j}`} math={cleanLatex} />;
                  })}
                </div>
              </>
            )}
            {group.subs?.filter((s: any) => s.level === "sub").map((sub: any, j: number) => {
              const subRenderResult = renderTextWithLatex(sub.question_text || "");
              const collectedBlockLatexSub = subRenderResult.collectedBlockLatex;

              const subsubs = group.subs?.filter((s: any) => s.level === "subsub" && s.parent_label === sub.label);

              return (
                <div key={j} className="ml-4 mt-2">
                  <div className="flex justify-between items-center font-medium">
                    <div>{sub.label}</div>
                    {sub.marks !== null && sub.marks !== undefined && (
                      <div className="text-sm text-gray-600">
                        ({sub.marks} mark{sub.marks > 1 ? "s" : ""})
                      </div>
                    )}
                  </div>
                  <div className="whitespace-pre-wrap">
                    {subRenderResult.rendered}
                    {sub.latex_blocks?.map((latex: string, k: number) => {
                      const cleanLatex = latex.replace(/^\\\[|\\\]$/g, "").trim();
                      if (collectedBlockLatexSub.includes(cleanLatex.replace(/\s+/g, ""))) return null;
                      return <BlockMath key={`latex-sub-${i}-${j}-${k}`} math={cleanLatex} />;
                    })}
                  </div>
                  {subsubs.map((subsub: any, k: number) => {
                    const subsubRenderResult = renderTextWithLatex(subsub.question_text || "");
                    const collectedBlockLatexSubsub = subsubRenderResult.collectedBlockLatex;

                    return (
                      <div key={k} className="ml-8 mt-2">
                        <div className="flex justify-between items-center font-medium">
                          <div>{subsub.label}</div>
                          {subsub.marks !== null && subsub.marks !== undefined && (
                            <div className="text-sm text-gray-600">
                              ({subsub.marks} mark{subsub.marks > 1 ? "s" : ""})
                            </div>
                          )}
                        </div>
                        <div className="whitespace-pre-wrap">
                          {subsubRenderResult.rendered}
                          {subsub.latex_blocks?.map((latex: string, m: number) => {
                            const cleanLatex = latex.replace(/^\\\[|\\\]$/g, "").trim();
                            if (collectedBlockLatexSubsub.includes(cleanLatex.replace(/\s+/g, ""))) return null;
                            return <BlockMath key={`latex-subsub-${i}-${j}-${k}-${m}`} math={cleanLatex} />;
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        );
      })}
      {questions.length > 0 && (
        <div className="mt-6">
          <button
            onClick={handleSaveToDatabase}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? "Saving..." : "📥 Save to Database"}
          </button>
        </div>
      )}
    </div>
  );
}
