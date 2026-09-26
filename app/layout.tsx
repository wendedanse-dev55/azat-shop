import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Salqyn Store — холодильники, кондиционеры и техника",
  description:
    "Salqyn Store — интернет-магазин холодильников, кондиционеров и бытовой техники с быстрой доставкой.",
};

// Runs before first paint: on the home page, first-time visitors (this session)
// get a dark cover so the store doesn't flash before the intro appears.
const INTRO_BOOT = `try{if(location.pathname==="/"&&sessionStorage.getItem("salqyn_intro_seen")!=="1"){document.documentElement.setAttribute("data-intro","1")}}catch(e){}`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: INTRO_BOOT }} />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
