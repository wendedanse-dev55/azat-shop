import Link from "next/link";
import BannerForm from "@/components/BannerForm";
import { createBanner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/admin/banners" className="hover:underline">
          Баннеры
        </Link>{" "}
        / <span className="text-gray-900">Новый</span>
      </nav>
      <h1 className="text-2xl font-bold">Новый баннер</h1>
      <BannerForm action={createBanner} submitLabel="Создать баннер" />
    </div>
  );
}
