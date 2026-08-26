import type { MetadataRoute } from "next";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: sito.nome,
		short_name: sito.nome,
		description: dizionari.it.descrizioneMeta,
		start_url: "/",
		display: "browser",
		background_color: "#faf7f3",
		theme_color: "#faf7f3",
		lang: "it",
		icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }],
	};
}
