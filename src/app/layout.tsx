import type { Metadata } from "next";
import { newsreader, quicksand } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
	title: "Sandu Pottery",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="it" className={`${quicksand.variable} ${newsreader.variable} antialiased`}>
			<body className="font-testo">{children}</body>
		</html>
	);
}
