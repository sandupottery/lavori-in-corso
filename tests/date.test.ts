import { describe, expect, test } from "bun:test";
import {
	eFuturo,
	eOggi,
	etichettaLunga,
	giorniBrevi,
	giornoDopo,
	oggiRoma,
	raggruppaPerMese,
	ultimoGiorno,
} from "@/lib/date";

describe("oggiRoma", () => {
	test("restituisce la data di Roma, non quella UTC", () => {
		// 2026-06-14T23:30:00Z è già il 15 giugno a Roma (UTC+2).
		expect(oggiRoma(new Date("2026-06-14T23:30:00Z"))).toBe("2026-06-15");
	});

	test("gestisce l'ora solare", () => {
		// 2026-01-14T23:30:00Z è già il 15 gennaio a Roma (UTC+1).
		expect(oggiRoma(new Date("2026-01-14T23:30:00Z"))).toBe("2026-01-15");
	});

	test("prima di mezzanotte a Roma resta il giorno precedente", () => {
		expect(oggiRoma(new Date("2026-06-14T21:30:00Z"))).toBe("2026-06-14");
	});
});

describe("ultimoGiorno", () => {
	test("usa fine quando c'è", () => {
		expect(ultimoGiorno({ inizio: "2026-09-19", fine: "2026-09-20" })).toBe("2026-09-20");
	});

	test("ricade su inizio quando manca fine", () => {
		expect(ultimoGiorno({ inizio: "2026-09-24" })).toBe("2026-09-24");
	});
});

describe("eFuturo", () => {
	test("un mercato di oggi è ancora futuro", () => {
		expect(eFuturo({ inizio: "2026-09-24" }, "2026-09-24")).toBe(true);
	});

	test("l'ultimo giorno di un mercato lungo è ancora futuro", () => {
		expect(eFuturo({ inizio: "2026-09-19", fine: "2026-09-20" }, "2026-09-20")).toBe(true);
	});

	test("il giorno dopo la fine non lo è più", () => {
		expect(eFuturo({ inizio: "2026-09-19", fine: "2026-09-20" }, "2026-09-21")).toBe(false);
	});
});

describe("eOggi", () => {
	test("vero nel mezzo di un mercato di più giorni", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-19")).toBe(true);
	});

	test("falso prima dell'inizio", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-17")).toBe(false);
	});

	test("vero il primo giorno", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-18")).toBe(true);
	});

	test("vero l'ultimo giorno", () => {
		expect(eOggi({ inizio: "2026-12-18", fine: "2026-12-20" }, "2026-12-20")).toBe(true);
	});
});

describe("giornoDopo", () => {
	test("avanza di un giorno", () => {
		expect(giornoDopo("2026-09-20")).toBe("2026-09-21");
	});

	test("attraversa il cambio di mese", () => {
		expect(giornoDopo("2026-10-31")).toBe("2026-11-01");
	});

	test("attraversa il cambio d'anno", () => {
		expect(giornoDopo("2026-12-31")).toBe("2027-01-01");
	});
});

describe("giorniBrevi", () => {
	test("un solo giorno", () => {
		expect(giorniBrevi({ inizio: "2026-09-24" })).toBe("24");
	});

	test("due giorni consecutivi", () => {
		expect(giorniBrevi({ inizio: "2026-09-19", fine: "2026-09-20" })).toBe("19–20");
	});
});

describe("etichettaLunga", () => {
	test("italiano, un giorno", () => {
		expect(etichettaLunga({ inizio: "2026-09-24" }, "it")).toBe("giovedì 24 settembre");
	});

	test("italiano, due giorni", () => {
		expect(etichettaLunga({ inizio: "2026-09-19", fine: "2026-09-20" }, "it")).toBe(
			"sabato 19 – domenica 20 settembre",
		);
	});

	test("italiano, intervallo a cavallo di due mesi", () => {
		expect(etichettaLunga({ inizio: "2026-10-31", fine: "2026-11-01" }, "it")).toBe(
			"sabato 31 ottobre – domenica 1 novembre",
		);
	});

	test("inglese", () => {
		expect(etichettaLunga({ inizio: "2026-09-24" }, "en")).toBe("Thursday 24 September");
	});
});

describe("raggruppaPerMese", () => {
	const voci = [{ inizio: "2026-09-24" }, { inizio: "2026-09-27" }, { inizio: "2026-10-10" }];

	test("raggruppa in ordine e conserva le voci", () => {
		const gruppi = raggruppaPerMese(voci, "it");
		expect(gruppi.map((g) => g.chiave)).toEqual(["2026-09", "2026-10"]);
		expect(gruppi[0]?.voci.length).toBe(2);
		expect(gruppi[1]?.voci.length).toBe(1);
	});

	test("etichetta il mese nella lingua giusta", () => {
		expect(raggruppaPerMese(voci, "it")[0]?.etichetta).toBe("Settembre");
		expect(raggruppaPerMese(voci, "en")[0]?.etichetta).toBe("September");
	});
});
