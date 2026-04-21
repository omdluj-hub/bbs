import prisma from "@/lib/prisma";
import AdminDashboard from "./AdminDashboard";

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const consultations = await prisma.consultation.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8 text-gray-800">
      <AdminDashboard initialConsultations={consultations} />
    </div>
  );
}
