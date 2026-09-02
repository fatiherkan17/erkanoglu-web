import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Analytics from "./components/Analytics";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://erkanoglu.com.tr"),
  title: "Erkanoğlu | Mimarlık · Mühendislik · İnşaat · Tadilat",
  description: "Erkanoğlu; mimarlık, mühendislik, danışmanlık, müteahhitlik, tadilat, uygulama ve şantiye yönetimini tek proje anlayışında buluşturur. Çanakkale ve çevresinde çalışır.",
  keywords: [
    "Erkanoğlu", "Erkanoğlu Mühendislik", "Çanakkale mimarlık", "Çanakkale mühendislik", "Çanakkale inşaat",
    "statik proje", "mimari proje", "uygulama projesi", "villa proje", "ruhsat projesi", "tadilat", "renovasyon",
    "müteahhitlik", "şantiye yönetimi", "anahtar teslim inşaat",
  ],
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "Erkanoğlu | Fikirden Uygulamaya",
    description: "Mimarlık, mühendislik, danışmanlık, yapım, tadilat ve şantiye yönetimi.",
    type: "website",
    locale: "tr_TR",
    siteName: "Erkanoğlu",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" className={`${geist.variable} antialiased`}>
      <body className="min-h-screen">
        <Analytics />
        {children}
      </body>
    </html>
  );
}
