import type { Metadata } from "next";
import { Pagina } from "@/components/Pagina";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const metadata: Metadata = {
	title: sito.nome,
	description: dizionari.en.descrizioneMeta,
	alternates: {
		canonical: `${sito.url}/en`,
		languages: { it: sito.url, en: `${sito.url}/en` },
	},
};

export default function HomeEn() {
	return <Pagina locale="en" />;
}
