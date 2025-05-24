import { useState } from "react";
import { useRouter } from "next/router";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");
    // 前端字段非空校验
    if (!email || !name || !password) {
      setError("Please fill in all fields");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, name, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      router.push("/math/login");
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
          <h1 className="text-xl font-bold mb-6">📝 Student Registration</h1>
          <div className="space-y-4">
            <Input
              placeholder="Name"
              value={name}
              onChange={e => setName(e.target.value)}
            />
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
            <Button onClick={handleRegister} disabled={loading} className="w-full text-base py-2">
              {loading ? "Registering..." : "✅ Register"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}