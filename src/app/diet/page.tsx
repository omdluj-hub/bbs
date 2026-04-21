import prisma from "@/lib/prisma";
import DietSurveyForm from "./DietSurveyForm";
import Header from "../components/Header";

export default async function DietSurveyPage() {
  const questions = await prisma.question.findMany({
    where: { 
      isActive: true,
      category: 'diet'
    },
    orderBy: { order: 'asc' }
  });

  return (
    <div className="min-h-screen bg-white text-gray-800">
      <Header title="다이어트 차트" />
      <DietSurveyForm questions={questions} />
    </div>
  );
}
