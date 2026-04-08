"use client";

import Link from "next/link";

export default function RootPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-black text-gray-900 mb-2 italic">BBS CLINIC</h1>
          <p className="text-gray-500 font-medium">상담을 원하시는 설문지를 선택해주세요.</p>
        </div>

        <div className="grid gap-4">
          <Link 
            href="/diet" 
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-green-500 hover:shadow-md transition-all text-center"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🥗</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">다이어트 설문</h2>
            <p className="text-sm text-gray-400">체계적인 다이어트 상담을 위한 차트</p>
          </Link>

          <Link 
            href="/general" 
            className="group relative bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:border-orange-500 hover:shadow-md transition-all text-center"
          >
            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🧘</div>
            <h2 className="text-xl font-bold text-gray-900 mb-1">체질 / 일반 설문</h2>
            <p className="text-sm text-gray-400">개인별 맞춤 체질 진단 및 일반 상담</p>
          </Link>
        </div>

        <div className="pt-12 text-center">
          <Link href="/admin" className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
            관리자 로그인
          </Link>
        </div>
      </div>
    </div>
  );
}
