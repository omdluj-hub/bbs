"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Question = {
  id: number;
  label: string;
  hint: string | null;
  type: string;
  options: string | null;
  order: number;
  isActive: boolean;
};

export default function QuestionsAdmin() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<Partial<Question>>({});
  const [currentCategory, setCurrentCategory] = useState<string>('diet');
  const router = useRouter();

  const handleLogout = async () => {
    if (!confirm("로그아웃 하시겠습니까?")) return;
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch (error) {
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  const fetchQuestions = () => {
    fetch(`/api/questions?category=${currentCategory}`)
      .then(res => res.json())
      .then(res => { if (res.success) setQuestions(res.data); });
  };

  useEffect(() => {
    fetchQuestions();
  }, [currentCategory]);

  const handleEdit = (q: Question) => {
    setEditingId(q.id);
    setEditForm({ ...q, options: q.options ? JSON.parse(q.options).join('\n') : '' });
  };

  const handleSave = async () => {
    if (!editingId) return;
    const body = {
      ...editForm,
      options: editForm.options ? (editForm.options as string).split('\n').filter(o => o.trim()) : null
    };

    const res = await fetch(`/api/questions/${editingId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    if (res.ok) {
      setEditingId(null);
      fetchQuestions();
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    await fetch(`/api/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  };

  const handleAdd = async () => {
    const res = await fetch('/api/questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        label: "새 질문", 
        type: "text", 
        order: questions.length + 1,
        category: currentCategory
      })
    });
    if (res.ok) fetchQuestions();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 text-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">설문 문항 관리</h1>
            <div className="flex gap-2 mt-4">
              <button 
                onClick={() => setCurrentCategory('diet')}
                className={`px-4 py-2 rounded text-sm font-bold ${currentCategory === 'diet' ? 'bg-black text-white' : 'bg-white border'}`}
              >
                다이어트 설문
              </button>
              <button 
                onClick={() => setCurrentCategory('general')}
                className={`px-4 py-2 rounded text-sm font-bold ${currentCategory === 'general' ? 'bg-black text-white' : 'bg-white border'}`}
              >
                체질/일반 설문
              </button>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={handleLogout}
              className="bg-gray-200 text-gray-600 px-4 py-2 rounded text-sm font-bold hover:bg-gray-300 transition-colors"
            >
              로그아웃
            </button>
            <Link href="/admin" className="bg-gray-200 px-4 py-2 rounded text-sm">신청 목록 보기</Link>
            <button onClick={handleAdd} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">+ 문항 추가</button>
          </div>
        </div>

        <div className="space-y-4">
          {questions.length === 0 && (
            <div className="bg-white p-12 text-center rounded-lg border border-dashed text-gray-400">
              이 설문에 등록된 문항이 없습니다.
            </div>
          )}
          {questions.map((q) => (
            <div key={q.id} className="bg-white p-6 rounded-lg shadow-sm border">
              {editingId === q.id ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-400">질문 제목</label>
                    <input type="text" value={editForm.label} onChange={e => setEditForm({...editForm, label: e.target.value})} className="w-full border p-2 rounded mt-1" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-400">힌트/설명</label>
                    <input type="text" value={editForm.hint || ''} onChange={e => setEditForm({...editForm, hint: e.target.value})} className="w-full border p-2 rounded mt-1" />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs font-bold text-gray-400">유형</label>
                      <select value={editForm.type} onChange={e => setEditForm({...editForm, type: e.target.value})} className="w-full border p-2 rounded mt-1">
                        <option value="text">직접 입력 (Text)</option>
                        <option value="radio">단일 선택 (Radio)</option>
                        <option value="checkbox">복수 선택 (Checkbox)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-400">순서</label>
                      <input type="number" value={editForm.order} onChange={e => setEditForm({...editForm, order: parseInt(e.target.value)})} className="w-full border p-2 rounded mt-1" />
                    </div>
                    <div className="flex items-end pb-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={editForm.required || false} 
                          onChange={e => setEditForm({...editForm, required: e.target.checked})}
                          className="w-4 h-4"
                        />
                        <span className="text-sm font-bold text-gray-600">필수 답변</span>
                      </label>
                    </div>
                  </div>
                  {(editForm.type === 'radio' || editForm.type === 'checkbox') && (
                    <div>
                      <label className="text-xs font-bold text-gray-400">선택지 (한 줄에 하나씩 입력)</label>
                      <textarea value={editForm.options as string} onChange={e => setEditForm({...editForm, options: e.target.value})} rows={4} className="w-full border p-2 rounded mt-1" />
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <button onClick={handleSave} className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">저장</button>
                    <button onClick={() => setEditingId(null)} className="bg-gray-200 px-4 py-2 rounded text-sm">취소</button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">순서: {q.order} | 유형: {q.type}</span>
                    <h3 className="text-lg font-bold">{q.label}</h3>
                    {q.hint && <p className="text-sm text-gray-500 mt-1">{q.hint}</p>}
                    {q.options && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {JSON.parse(q.options).map((o: string) => (
                          <span key={o} className="text-xs border px-2 py-1 rounded bg-gray-50 text-gray-600">{o}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleEdit(q)} className="text-sm text-gray-600 hover:text-black font-bold">수정</button>
                    <button onClick={() => handleDelete(q.id)} className="text-sm text-red-500 font-bold">삭제</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
