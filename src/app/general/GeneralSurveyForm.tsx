"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";

type Question = {
  id: number;
  label: string;
  hint: string | null;
  type: string;
  options: string | null;
  order: number;
  required: boolean;
};

interface GeneralSurveyFormProps {
  questions: Question[];
}

export default function GeneralSurveyForm({ questions }: GeneralSurveyFormProps) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data: any) => {
    if (!confirm("이대로 제출합니다. 괜찮습니까?")) return;

    setSubmitLoading(true);
    
    const { name, ssn, gender, ...rest } = data;
    
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'general',
          name: name || "미입력",
          ssn,
          gender,
          privacyAgreed: true,
          answers: rest
        })
      });
      if (response.ok) {
        setSuccess(true);
        reset();
      } else {
        alert("제출에 실패했습니다.");
      }
    } catch (error) {
      alert("오류가 발생했습니다.");
    }
    setSubmitLoading(false);
  };

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="text-center max-w-sm w-full">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">제출 완료</h2>
          <p className="text-gray-600 mb-8 font-medium">체질/일반 설문이 성공적으로 접수되었습니다.</p>
          <button onClick={() => setSuccess(false)} className="w-full bg-black text-white py-4 rounded-lg font-bold">확인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {questions.map((q) => (
          <div key={q.id} className="mb-8">
            <label className="font-bold text-[17px] text-[#333]">
              {q.label} {q.required && <span className="text-red-500">*</span>}
            </label>
            {q.hint && q.type !== 'text' && <p className="text-[13px] text-[#888] mt-1">{q.hint}</p>}
            
            <div className="mt-2">
              {q.type === 'text' && (
                <div className="relative">
                  <input 
                    type="text" 
                    {...register(q.label === "이름" ? "name" : q.label, { required: q.required })} 
                    className={`w-full border-b py-2 outline-none focus:border-black text-[16px] ${errors[q.label === "이름" ? "name" : q.label] ? 'border-red-500' : 'border-gray-300'}`} 
                    placeholder={q.hint || ""}
                  />
                  {errors[q.label === "이름" ? "name" : q.label] && <p className="text-red-500 text-xs mt-1">필수 입력 항목입니다.</p>}
                </div>
              )}
              
              {q.type === 'radio' && q.options && (
                <div className="flex flex-col gap-2">
                  {JSON.parse(q.options).map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 py-1 cursor-pointer">
                      <input 
                        type="radio" 
                        value={opt} 
                        {...register(q.label === "성별" ? "gender" : q.label, { required: q.required })} 
                        className="w-5 h-5 border-gray-300 text-black focus:ring-0" 
                      />
                      <span className="text-[15px] text-[#444]">{opt}</span>
                    </label>
                  ))}
                  {errors[q.label === "성별" ? "gender" : q.label] && <p className="text-red-500 text-xs mt-1">필수 선택 항목입니다.</p>}
                </div>
              )}

              {q.type === 'checkbox' && q.options && (
                <div className="flex flex-col gap-2">
                  {JSON.parse(q.options).map((opt: string) => (
                    <label key={opt} className="flex items-center gap-3 py-1 cursor-pointer">
                      <input 
                        type="checkbox" 
                        value={opt} 
                        {...register(q.label)} 
                        className="w-5 h-5 border-gray-300 rounded text-black focus:ring-0" 
                      />
                      <span className="text-[15px] text-[#444]">{opt}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
          <button type="submit" disabled={submitLoading} className={`w-full bg-black text-white py-4 rounded-lg font-bold text-[17px] ${submitLoading ? 'opacity-50' : ''}`}>
            {submitLoading ? '제출 중...' : '제출하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
