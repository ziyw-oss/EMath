import { useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Login failed");
      router.push("/math/dashboard");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted px-4">
      <Card className="w-full max-w-md p-6 shadow-xl rounded-2xl">
        <CardContent>
          <h1 className="text-xl font-bold mb-6">🧠 Student Login</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <Input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            {error && <div className="text-red-600 text-sm font-medium">❌ {error}</div>}
            <Button type="submit" disabled={loading} className="w-full text-base py-2">
              {loading ? "Logging in..." : "🔓 Log In"}
            </Button>
            <div className="text-center mt-4 text-sm text-muted-foreground">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => router.push("/math/register")}
                className="text-blue-600 hover:underline font-medium"
              >
                Register here
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}