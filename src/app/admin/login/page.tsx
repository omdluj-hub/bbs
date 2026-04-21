"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });

      const data = await res.json();

      if (data.success) {
        // router.push와 router.refresh를 사용하여 전체 새로고침 없이 미들웨어가 쿠키를 인식하게 함
        router.refresh();
        router.push('/admin');
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError("서버 통신 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 text-gray-800">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black mb-2">후한의원 구미점 관리자</h1>
          <p className="text-sm text-gray-400 font-medium">관리자 전용 로그인입니다.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border-b border-gray-300 py-3 outline-none focus:border-black text-[16px]"
              placeholder="비밀번호를 입력하세요"
              required
              autoFocus
            />
          </div>
          
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full bg-black text-white py-4 rounded-lg font-bold text-[16px] transition-colors ${loading ? 'opacity-50' : 'hover:bg-gray-900'}`}
          >
            {loading ? "확인 중..." : "로그인"}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button 
            onClick={() => router.push('/')}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            ← 메인으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
}
