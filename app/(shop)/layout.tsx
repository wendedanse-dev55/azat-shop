import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNav from "@/components/BottomNav";
import { CartProvider } from "@/components/CartProvider";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function ShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <Header categories={categories} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-24 pt-5 md:pb-10">
          {children}
        </main>
        <Footer />
      </div>
      <BottomNav />
    </CartProvider>
  );
}
