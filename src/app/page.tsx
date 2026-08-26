import type { Metadata } from "next";
import { Pagina } from "@/components/Pagina";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: sito.nome,
	description: dizionari.it.descrizioneMeta,
	alternates: {
		canonical: sito.url,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
	openGraph: {
		type: "website",
		siteName: sito.nome,
		title: sito.nome,
		description: dizionari.it.descrizioneMeta,
		url: sito.url,
		locale: "it_IT",
		alternateLocale: ["en_GB"],
		images: [{ url: "/foto/og.jpg", width: 1200, height: 630, alt: sito.nome }],
	},
	twitter: {
		card: "summary_large_image",
		title: sito.nome,
		description: dizionari.it.descrizioneMeta,
		images: ["/foto/og.jpg"],
	},
};

export default function Home() {
	return <Pagina locale="it" />;
}
