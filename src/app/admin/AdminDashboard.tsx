"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface AdminDashboardProps {
  initialConsultations: any[];
}

export default function AdminDashboard({ initialConsultations }: AdminDashboardProps) {
  const [consultations, setConsultations] = useState<any[]>(initialConsultations);
  const [loading, setLoading] = useState(false);
  const [currentCategory, setCurrentCategory] = useState<string>('all');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
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

  const fetchConsultations = async () => {
    setLoading(true);
    try {
      const url = currentCategory === 'all' ? '/api/consultations' : `/api/consultations?category=${currentCategory}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setConsultations(json.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setSelectedIds([]);
    }
  };

  // 카테고리가 변경될 때만 다시 가져오기
  useEffect(() => {
    // 초기 마운트 시 'all'이면서 데이터가 이미 있으면 페칭 건너뜀
    if (currentCategory === 'all' && consultations.length > 0 && consultations === initialConsultations) {
      return;
    }
    fetchConsultations();
  }, [currentCategory]);

  const toggleRead = async (id: number, currentRead: boolean) => {
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isRead: !currentRead })
      });
      const json = await res.json();
      if (json.success) {
        setConsultations(consultations.map(c => c.id === id ? { ...c, isRead: !currentRead } : c));
      }
    } catch (error) {
      alert("상태 변경에 실패했습니다.");
    }
  };

  const deleteConsultation = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    try {
      const res = await fetch(`/api/consultations/${id}`, {
        method: 'DELETE'
      });
      const json = await res.json();
      if (json.success) {
        setConsultations(consultations.filter(c => c.id !== id));
        setSelectedIds(selectedIds.filter(sid => sid !== id));
      }
    } catch (error) {
      alert("삭제에 실패했습니다.");
    }
  };

  const deleteSelected = async () => {
    if (selectedIds.length === 0) return;
    if (!confirm(`선택한 ${selectedIds.length}건을 정말 삭제하시겠습니까?`)) return;

    try {
      const res = await fetch('/api/consultations', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selectedIds })
      });
      const json = await res.json();
      if (json.success) {
        setConsultations(consultations.filter(c => !selectedIds.includes(c.id)));
        setSelectedIds([]);
      }
    } catch (error) {
      alert("일괄 삭제에 실패했습니다.");
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === consultations.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(consultations.map(c => c.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(sid => sid !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  return (
    <div className="max-w-6xl mx-auto bg-white rounded-lg shadow p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-gray-900">통합 상담 접수 관리</h1>
            <button onClick={fetchConsultations} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="새로고침">
              🔄
            </button>
          </div>
          <div className="flex gap-2 mt-4">
            <button 
              onClick={() => setCurrentCategory('all')}
              className={`px-4 py-2 rounded text-sm font-bold ${currentCategory === 'all' ? 'bg-black text-white' : 'bg-white border'}`}
            >
              전체
            </button>
            <button 
              onClick={() => setCurrentCategory('diet')}
              className={`px-4 py-2 rounded text-sm font-bold ${currentCategory === 'diet' ? 'bg-green-600 text-white' : 'bg-white border'}`}
            >
              다이어트
            </button>
            <button 
              onClick={() => setCurrentCategory('general')}
              className={`px-4 py-2 rounded text-sm font-bold ${currentCategory === 'general' ? 'bg-orange-600 text-white' : 'bg-white border'}`}
            >
              체질/일반
            </button>
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button 
              onClick={handleLogout}
              className="bg-gray-100 text-gray-600 px-4 py-2 rounded text-sm font-bold hover:bg-gray-200 transition-colors"
            >
              로그아웃
            </button>
            <button 
              onClick={deleteSelected}
              disabled={selectedIds.length === 0}
              className={`px-4 py-2 rounded text-sm font-bold transition-colors ${selectedIds.length > 0 ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}
            >
              선택 삭제 ({selectedIds.length})
            </button>
            <Link href="/admin/questions" className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold">문항 관리하기</Link>
          </div>
          <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium flex items-center">총 {consultations.length}건</span>
        </div>
      </div>
      
      {loading ? (
        <div className="py-20 text-center text-gray-500">데이터를 불러오는 중...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="text-left text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-50">
                <th className="px-6 py-4">
                  <input 
                    type="checkbox" 
                    checked={selectedIds.length === consultations.length && consultations.length > 0} 
                    onChange={toggleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
                <th className="px-6 py-4">상태</th>
                <th className="px-6 py-4">유형</th>
                <th className="px-6 py-4">접수일시</th>
                <th className="px-6 py-4">이름</th>
                <th className="px-6 py-4">연락처</th>
                <th className="px-6 py-4">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 bg-white">
              {consultations.map((c: any) => (
                <tr key={c.id} className={`hover:bg-gray-50 transition-colors ${!c.isRead ? 'bg-blue-50/30' : ''}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <input 
                      type="checkbox" 
                      checked={selectedIds.includes(c.id)} 
                      onChange={() => toggleSelect(c.id)}
                      className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button 
                      onClick={() => toggleRead(c.id, c.isRead)}
                      className={`px-2 py-1 rounded text-xs font-bold ${c.isRead ? 'bg-gray-200 text-gray-600' : 'bg-blue-500 text-white'}`}
                    >
                      {c.isRead ? '읽음' : '안읽음'}
                    </button>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${c.category === 'diet' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                      {c.category === 'diet' ? '다이어트' : '체질/일반'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(c.createdAt).toLocaleString('ko-KR')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">{c.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{c.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Link href={`/admin/${c.id}`} className="text-blue-600 hover:text-blue-900 font-bold">상세보기</Link>
                    <button onClick={() => deleteConsultation(c.id)} className="text-red-600 hover:text-red-900 font-bold">삭제</button>
                  </td>
                </tr>
              ))}
              {consultations.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">접수된 데이터가 없습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
