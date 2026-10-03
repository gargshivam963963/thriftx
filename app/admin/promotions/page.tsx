import { requireUser } from "@/lib/auth-guard";
import { redirect } from "next/navigation";
import PromotionSettingsAdmin from "@/components/admin/PromotionSettingsModal";

export default async function AdminPromotionsPage() {
  const user = await requireUser();

  if (user.role !== "admin") {
    redirect("/");
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Promotions & Settings</h1>

        <PromotionSettingsAdmin />
      </div>
    </main>
  );
}
