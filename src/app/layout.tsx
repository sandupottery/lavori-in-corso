import type { Metadata, Viewport } from "next";
import { sito } from "@/content/sito";
import { newsreader, quicksand } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sandu Pottery",
	metadataBase: new URL(sito.url),
	robots: { index: true, follow: true },
};

export const viewport: Viewport = {
	themeColor: "#faf7f3",
	colorScheme: "light",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={`${quicksand.variable} ${newsreader.variable} antialiased`}>
			<body className="font-testo">{children}</body>
		</html>
	);
}
