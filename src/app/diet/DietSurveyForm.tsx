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

interface DietSurveyFormProps {
  questions: Question[];
}

export default function DietSurveyForm({ questions }: DietSurveyFormProps) {
  const [submitLoading, setSubmitLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const onSubmit = async (data: any) => {
    if (!data.privacyAgreed) {
      alert("개인정보 수집 및 이용에 동의해주세요.");
      return;
    }
    if (!confirm("이대로 제출합니다. 괜찮습니까?")) return;

    setSubmitLoading(true);
    
    // 기본 정보 분리 로직 (이름, 전화번호는 테이블 컬럼에 직접 저장하기 위해 추출)
    const { name, phone, ssn, gender, privacyAgreed, ...rest } = data;
    
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          category: 'diet',
          name: name || "미입력", // 이름이 필수 해제되었을 경우 대비
          phone: phone || "",
          ssn,
          gender,
          privacyAgreed,
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
          <p className="text-gray-600 mb-8 font-medium">다이어트 차트가 성공적으로 접수되었습니다.</p>
          <button onClick={() => setSuccess(false)} className="w-full bg-black text-white py-4 rounded-lg font-bold">확인</button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 pb-24">
      <form onSubmit={handleSubmit(onSubmit)}>
        {/* 모든 문항을 관리자 설정에 따라 동적으로 렌더링 */}
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
                    // '이름'과 '전화번호'는 DB의 전용 컬럼과 매칭하기 위해 name 고정
                    {...register(q.label === "이름" ? "name" : q.label === "전화번호" ? "phone" : q.label, { required: q.required })} 
                    className={`w-full border-b py-2 outline-none focus:border-black text-[16px] ${errors[q.label === "이름" ? "name" : q.label === "전화번호" ? "phone" : q.label] ? 'border-red-500' : 'border-gray-300'}`} 
                    placeholder={q.hint || ""}
                  />
                  {errors[q.label === "이름" ? "name" : q.label === "전화번호" ? "phone" : q.label] && <p className="text-red-500 text-xs mt-1">필수 입력 항목입니다.</p>}
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

        <div className="mt-12 p-4 bg-gray-50 rounded-lg text-[13px] text-[#666] leading-relaxed">
          <h3 className="font-bold mb-2 text-gray-800">[개인정보 수집 및 이용 동의 / 약관] <span className="text-red-500">*</span></h3>
          <div className="h-40 overflow-y-auto border border-gray-200 p-3 bg-white mb-4 whitespace-pre-wrap text-[12px]">
            ♣개인정보 수집 이용 활용 동의서{"\n\n"}
            1. 개인정보 수집 및 이용목적{"\n"}
            -의료법 제 22조에 따른 진료기록부 등의 기록 및 보존 목적{"\n"}
            -진단 및 치료를 위한 진료서비스와 원무서비스 제공{"\n"}
            -의학정보 안내 및 한의원 소식 제공{"\n\n"}
            2. 개인정보 항목{"\n"}
            성명, 주민번호, 진료기록정보, 주소, 연락처{"\n\n"}
            3. 개인정보의 보유 및 이용기간{"\n"}
            -환자명부는 법정 보유기간 5년 이후 정보제공자가 개인정보 삭제를 요청할 경우 즉시 삭제합니다.{"\n"}
            -소비자의 불만 또는 분쟁처리에 관한 기록: 3년(전자상거래 소비자보호에 관한 법률){"\n"}
            -신용정보의 수집/ 처리 및 이용 등에 관한 기록: 3년(신용정보 이용 및 보호에 관한 법률){"\n"}
            -본인확인에 관한 기록: 6개월 (정보통신망 이용촉진 및 정보보호에 관한 법률){"\n\n"}
            개인정보 제공 동의거부 권리 및 동의거부에 따른 불이익{"\n"}
            -귀하는 개인정보 제공 동의를 거부할 권리가 있으며, 동의거부에 따른 불이익은 없음, 다만, 진료관련 안내 서비스를 받을 수 없음.{"\n\n"}
            ※개인정보 제공자가 동의한 내용 외의 다른 목적으로 활용하지 않으며, 제공된 개인정보의 이용을 거부하고자 할 때에는 개인정보 관리책임자를 통해 열람, 정정, 삭제를 요구할 수 있음.{"\n\n"}
            「개인정보보호법」 등 관련 법규에 의거하여 상기 본인은 위와 같이 개인정보 수집 및 활용에 동의함.{"\n\n"}
            ※만 14세 미만 아동의 경우 법적 대리인의 동의가 필요함. 본인은 미성년자의 법정대리인으로 본원 서비스 이용에 동의합니다.{"\n\n"}
            ♣교환 환불 약관{"\n"}
            -다요스틱, 다요정, 다요시럽은 박스 미개봉 상태에서 1주일 안으로 환불 및 교환이 가능합니다.{"\n"}
            -환불 시에는 왕복 택배비 본인 부담이며 상담료가 별도 청구됩니다.{"\n"}
            -미감탕, 비움탕은 맞춤 조제된 한약이므로 교환 및 환불이 불가합니다.
          </div>
          <label className="flex items-center gap-3 cursor-pointer py-2">
            <input type="checkbox" {...register("privacyAgreed", { required: true })} className="w-5 h-5 border-gray-300 rounded text-black focus:ring-0" />
            <span className="text-[14px] font-bold text-gray-900">개인정보 수집 및 이용에 동의합니다.</span>
          </label>
          {errors.privacyAgreed && <p className="text-red-500 text-xs mt-1">개인정보 수집 및 이용에 동의해주셔야 합니다.</p>}
        </div>

        <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto p-4 bg-white border-t">
          <button type="submit" disabled={submitLoading} className={`w-full bg-black text-white py-4 rounded-lg font-bold text-[17px] ${submitLoading ? 'opacity-50' : ''}`}>
            {submitLoading ? '제출 중...' : '제출하기'}
          </button>
        </div>
      </form>
    </div>
  );
}
