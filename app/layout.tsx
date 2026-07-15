import type { Metadata } from "next";
import { headers } from "next/headers";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const host = headerList.get("x-forwarded-host") || headerList.get("host") || "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") || (host.includes("localhost") ? "http" : "https");
  const base = new URL(`${protocol}://${host}`);
  const image = new URL("/og.png", base).toString();

  return {
    metadataBase: base,
    title: "ORIGI 原界｜正版手办精选商店",
    description: "严选官方授权与日本原装进口手办，每一件热爱都有来处。",
    openGraph: {
      title: "ORIGI 原界｜收藏，从真品开始",
      description: "正版溯源、原装进口、专业防震包装。",
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: "ORIGI 原界正版手办精选商店" }],
    },
    twitter: {
      card: "summary_large_image",
      title: "ORIGI 原界｜收藏，从真品开始",
      description: "正版手办精选商店",
      images: [image],
    },
  };
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
