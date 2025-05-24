import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getCurrentUser } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentDashboard() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    async function loadUser() {
      const res = await fetch("/api/dashboard");
      const data = await res.json();
      if (!res.ok) return router.push("/math/login");
      setUser(data);
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

          <div className="space-y-4 mt-6 text-sm">
            <div>⏱️ Total Practice Time: {user.practice_minutes ?? 0} minutes</div>
            <div>💰 Rewards This Week: {user.weekly_rewards ?? 0} points</div>

            <div>
              📌 Unfinished Exams:
              <ul className="list-disc list-inside ml-4">
                {(user.unfinished_exams ?? []).length === 0 && <li>None</li>}
                {(user.unfinished_exams ?? []).map((exam: any) => (
                  <li key={exam.session_id}>
                    {exam.title} – Started: {exam.started_at}
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
        </CardContent>
      </Card>
    </div>
  );
}