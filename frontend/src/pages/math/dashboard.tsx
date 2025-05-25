import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (!res.ok) return router.push("/math/login");
      setUser(data);

      const rewardRes = await fetch("/api/rewards-history");
      const rewardData = await rewardRes.json();
      setHistory(rewardData);
    }
    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-muted px-4 py-8">
      <Card className="max-w-xl mx-auto p-6">
        <CardContent>
          <h1 className="text-xl font-bold mb-2">👋 Welcome, {user.name}</h1>
          <p className="text-muted-foreground mb-4">
            This is your student dashboard.
          </p>

          <div className="mb-4 text-sm bg-gray-100 border border-gray-300 rounded p-4">
            <h2 className="font-semibold mb-1">🎯 Reward Rules:</h2>
            <ul className="list-disc list-inside space-y-1">
              <li>📝 For each full paper submitted:</li>
              <ul className="ml-6 list-[circle]">
                <li>Score rate must be above 50%</li>
                <li>Submitted within 2 hours 30 minutes</li>
                <li>Reward = Score Rate × 100元</li>
                <li>Can claim multiple times for repeated practice</li>
              </ul>
              <li>✅ Unclaimed rewards can be collected below</li>
            </ul>
          </div>

          <div className="space-y-4 mt-6 text-sm">
            <div>⏱️ Total Practice Time: {user.practice_minutes ?? 0} minutes</div>
            <div>💰 Rewards This Week: {user.weekly_rewards ?? 0} points</div>

            <div>
              📌 Unfinished Exams:
              <ul className="list-disc list-inside ml-4">
                {(user.unfinished_exams ?? []).length === 0 && <li>None</li>}
                {(user.unfinished_exams ?? []).map((exam: any) => (
                  <li key={exam.session_id}>
                    <span className="font-medium">{exam.title}</span> —{" "}
                    <span className="text-gray-500">Started at: {new Date(exam.started_at).toLocaleString()}</span>{" "}
                    <button
                      onClick={() => router.push(`/math/doing?sessionId=${exam.session_id}`)}
                      className="ml-2 text-blue-600 underline hover:text-blue-800"
                    >
                      Resume
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className="mt-4 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
              onClick={() => router.push("/math/setup")}
            >
              🚀 Start New Exam
            </button>
          </div>

          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold mb-2">📚 Exam History & Rewards</h2>
            {history.length === 0 && <p>No past exam records found.</p>}
            <ul className="space-y-3">
              {history.map((rec) => (
                <li key={rec.session_id} className="border rounded px-4 py-2 bg-white shadow-sm">
                  <div>
                    <span className="font-medium">Exam:</span> {rec.title} ({new Date(rec.started_at).toLocaleString()})
                  </div>
                  <div>🎯 Score: {rec.score} / {rec.fullScore} — Accuracy: {(rec.accuracy * 100).toFixed(1)}%</div>
                  <div>💰 Reward: {rec.amount} 元 — {rec.confirmed ? "✅ Claimed" : (
                    <button
                      onClick={async () => {
                        await fetch(`/api/rewards-confirm?id=${rec.reward_id}`, { method: "POST" });
                        location.reload(); // simple way to update UI
                      }}
                      className="ml-2 text-green-700 underline hover:text-green-900"
                    >
                      Claim now
                    </button>
                  )}</div>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}