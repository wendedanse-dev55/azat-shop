import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import BannerForm from "@/components/BannerForm";
import { updateBanner } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function EditBannerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div className="space-y-6">
      <nav className="text-sm text-gray-500">
        <Link href="/admin/banners" className="hover:underline">
          Баннеры
        </Link>{" "}
        / <span className="text-gray-900">{banner.title}</span>
      </nav>
      <h1 className="text-2xl font-bold">Редактировать баннер</h1>
      <BannerForm
        action={updateBanner.bind(null, banner.id)}
        banner={banner}
        submitLabel="Сохранить изменения"
      />
    </div>
  );
}
