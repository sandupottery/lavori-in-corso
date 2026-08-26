import type { Mercato } from "@/content/mercati";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { ultimoGiorno } from "@/lib/date";

const DESCRIZIONE: Record<Locale, string> = {
	it: "Creazioni in ceramica lavorate a mano e al tornio, da Bergamo.",
	en: "Handmade wheel-thrown ceramics from Bergamo, Italy.",
};

function nomeEvento(m: Mercato): string {
	const dove = m.dettaglio ? `${m.dettaglio}, ${m.luogo}` : m.luogo;
	return `${sito.nome} — ${dove}, ${m.citta}`;
}

export function costruisciEventi(mercati: readonly Mercato[], locale: Locale): object[] {
	return mercati.map((m) => ({
		"@type": "Event",
		name: nomeEvento(m),
		description: DESCRIZIONE[locale],
		startDate: m.inizio,
		// schema.org endDate è INCLUSIVO — al contrario del DTEND dei .ics.
		endDate: ultimoGiorno(m),
		eventStatus: "https://schema.org/EventScheduled",
		eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
		location: {
			"@type": "Place",
			name: m.luogo,
			address: {
				"@type": "PostalAddress",
				addressLocality: m.citta,
				addressCountry: "IT",
			},
			hasMap: m.mappa,
		},
		organizer: {
			"@type": "Organization",
			name: sito.nome,
			url: sito.url,
		},
		url: sito.url,
	}));
}

export function costruisciAttivita(locale: Locale): object {
	return {
		"@type": "LocalBusiness",
		name: sito.nome,
		description: DESCRIZIONE[locale],
		url: sito.url,
		address: {
			"@type": "PostalAddress",
			addressLocality: sito.citta,
			addressCountry: "IT",
		},
		sameAs: sito.profili.map((profilo) => profilo.url),
	};
}

/**
 * Il grafo serializzato, pronto per <script type="application/ld+json">.
 * Gli < vengono neutralizzati: un < non sfuggito chiuderebbe il tag script.
 */
export function graficoJsonLd(mercati: readonly Mercato[], locale: Locale): string {
	const grafo = {
		"@context": "https://schema.org",
		"@graph": [costruisciAttivita(locale), ...costruisciEventi(mercati, locale)],
	};
	return JSON.stringify(grafo).replace(/</g, "\\u003c");
}
