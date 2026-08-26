import type { MetadataRoute } from "next";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: sito.url,
			changeFrequency: "monthly",
			priority: 1,
			alternates: { languages: { it: sito.url, en: `${sito.url}/en` } },
		},
		{
			url: `${sito.url}/en`,
			changeFrequency: "monthly",
			priority: 0.8,
			alternates: { languages: { it: sito.url, en: `${sito.url}/en` } },
		},
	];
}
