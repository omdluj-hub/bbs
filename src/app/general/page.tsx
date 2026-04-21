import prisma from "@/lib/prisma";
import GeneralSurveyForm from "./GeneralSurveyForm";
import Header from "../components/Header";

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
      <Header title="체질/일반 설문" />
      <GeneralSurveyForm questions={questions} />
    </div>
  );
}
