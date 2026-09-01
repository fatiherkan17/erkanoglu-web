import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Analytics from "./components/Analytics";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://erkanoglu.com.tr"),
  title: "Erkanoğlu | Mimarlık · Mühendislik · İnşaat · Yaşam Alanları",
  description: "Erkanoğlu; mimarlık, mühendislik, inşaat ve yaşam alanlarını tek merkezde buluşturur. Çanakkale ve çevresinde proje, mühendislik ve yapım çözümleri.",
  keywords: ["Erkanoğlu", "Erkanoğlu Mühendislik", "Çanakkale mühendislik", "Çanakkale inşaat", "statik proje", "mimari proje", "villa proje", "anahtar teslim inşaat"],
  icons: { icon: "/icon.svg", shortcut: "/icon.svg" },
  openGraph: {
    title: "Erkanoğlu | Projeden Yaşam Alanına",
    description: "Mimarlık, mühendislik, inşaat ve yaşam alanları tek merkezde.",
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
