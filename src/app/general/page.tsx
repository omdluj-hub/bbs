import prisma from "@/lib/prisma";
import GeneralSurveyForm from "./GeneralSurveyForm";

export default async function GeneralSurveyPage() {
  const questions = await prisma.question.findMany({
    where: { 
      isActive: true,
      category: 'general'
    },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <div className="sticky top-0 bg-white border-b px-4 py-4 flex items-center justify-between z-10">
        <button className="text-xl">←</button>
        <h1 className="text-lg font-bold">체질/일반 설문</h1>
        <div className="flex gap-4"><span>🏠</span><span>⋮</span></div>
      </div>

      <GeneralSurveyForm questions={questions} />
    </div>
  );
}
