import type { MetadataRoute } from "next";
import { sito } from "@/content/sito";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: { userAgent: "*", allow: "/" },
		sitemap: `${sito.url}/sitemap.xml`,
	};
}
