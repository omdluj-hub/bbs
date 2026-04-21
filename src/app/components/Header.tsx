"use client";

import { useRouter } from "next/navigation";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const router = useRouter();

  return (
    <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
      <button 
        onClick={() => router.back()} 
        className="text-xl p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        ←
      </button>
      <h1 className="text-lg font-bold flex-1 text-center pr-8">{title}</h1>
    </div>
  );
}
