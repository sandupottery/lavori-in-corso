import { describe, expect, test } from "bun:test";
import type { Mercato } from "@/content/mercati";
import { costruisciAttivita, costruisciEventi, graficoJsonLd } from "@/lib/jsonld";

const unGiorno: Mercato = {
	id: "2026-09-24-milano-diaz",
	inizio: "2026-09-24",
	citta: "Milano",
	luogo: "piazza Diaz",
	mappa: "https://www.google.com/maps/search/?api=1&query=Piazza%20Diaz%2C%20Milano",
};

const dueGiorni: Mercato = {
	id: "2026-09-19-villa-guardia",
	inizio: "2026-09-19",
	fine: "2026-09-20",
	citta: "Villa Guardia",
	luogo: "Parco comunale",
	dettaglio: "L'isola che c'è",
	mappa: "https://www.google.com/maps/search/?api=1&query=x",
};

const ostile: Mercato = {
	id: "2026-09-24-ostile",
	inizio: "2026-09-24",
	citta: "Milano",
	luogo: "</script><script>alert(1)</script>",
	mappa: "https://www.google.com/maps/search/?api=1&query=x",
};

describe("costruisciEventi", () => {
	test("produce un Event per mercato", () => {
		expect(costruisciEventi([unGiorno, dueGiorni], "it").length).toBe(2);
	});

	test("marca il tipo e lo stato richiesti da Google", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		expect(e?.["@type"]).toBe("Event");
		expect(e?.eventStatus).toBe("https://schema.org/EventScheduled");
		expect(e?.eventAttendanceMode).toBe("https://schema.org/OfflineEventAttendanceMode");
	});

	test("un evento di un giorno ha startDate uguale a endDate", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		expect(e?.startDate).toBe("2026-09-24");
		expect(e?.endDate).toBe("2026-09-24");
	});

	test("un evento lungo ha endDate all'ultimo giorno, non al giorno dopo", () => {
		const [e] = costruisciEventi([dueGiorni], "it") as Record<string, unknown>[];
		expect(e?.startDate).toBe("2026-09-19");
		expect(e?.endDate).toBe("2026-09-20");
	});

	test("la location è un Place con indirizzo postale", () => {
		const [e] = costruisciEventi([unGiorno], "it") as Record<string, unknown>[];
		const luogo = e?.location as Record<string, unknown>;
		expect(luogo["@type"]).toBe("Place");
		expect(luogo.name).toBe("piazza Diaz");
		const indirizzo = luogo.address as Record<string, unknown>;
		expect(indirizzo["@type"]).toBe("PostalAddress");
		expect(indirizzo.addressLocality).toBe("Milano");
		expect(indirizzo.addressCountry).toBe("IT");
	});

	test("il dettaglio entra nel nome dell'evento", () => {
		const [e] = costruisciEventi([dueGiorni], "it") as Record<string, unknown>[];
		expect(String(e?.name)).toContain("L'isola che c'è");
	});
});

describe("costruisciAttivita", () => {
	test("descrive l'attività come LocalBusiness a Bergamo", () => {
		const a = costruisciAttivita("it") as Record<string, unknown>;
		expect(a["@type"]).toBe("LocalBusiness");
		expect(a.name).toBe("Sandu Pottery");
		const indirizzo = a.address as Record<string, unknown>;
		expect(indirizzo.addressLocality).toBe("Bergamo");
	});

	test("elenca entrambi i profili Instagram come sameAs", () => {
		const a = costruisciAttivita("it") as Record<string, unknown>;
		const sameAs = a.sameAs as string[];
		expect(sameAs.length).toBe(2);
		expect(sameAs.every((u) => u.includes("instagram.com"))).toBe(true);
		expect(sameAs.some((u) => u.includes("sandu_pottery"))).toBe(true);
		expect(sameAs.some((u) => u.includes("letettazze"))).toBe(true);
	});

	test("non rimanda più a Facebook", () => {
		const a = costruisciAttivita("it") as Record<string, unknown>;
		expect((a.sameAs as string[]).some((u) => u.includes("facebook"))).toBe(false);
	});
});

describe("graficoJsonLd", () => {
	test("è JSON valido con un @graph", () => {
		const analizzato = JSON.parse(graficoJsonLd([unGiorno], "it")) as Record<string, unknown>;
		expect(analizzato["@context"]).toBe("https://schema.org");
		expect((analizzato["@graph"] as unknown[]).length).toBe(2);
	});

	test("neutralizza i < che potrebbero chiudere il tag script", () => {
		const grafo = graficoJsonLd([ostile], "it");
		expect(grafo).not.toContain("<");
		expect(grafo).toContain("\\u003c");
		// Il valore deve sopravvivere intatto una volta ri-analizzato:
		// l'escape serve a proteggere l'HTML, non a corrompere i dati.
		const analizzato = JSON.parse(grafo) as { "@graph": Record<string, unknown>[] };
		const evento = analizzato["@graph"].find((n) => n["@type"] === "Event");
		const luogo = evento?.location as Record<string, unknown>;
		expect(luogo.name).toBe("</script><script>alert(1)</script>");
	});
});
