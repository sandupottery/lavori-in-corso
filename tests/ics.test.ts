import { describe, expect, test } from "bun:test";
import { creaICS, type EventoICS } from "@/lib/ics";

const STAMP = "20260826T120000Z";

const evento: EventoICS = {
	uid: "2026-09-24-milano-diaz",
	inizio: "2026-09-24",
	titolo: "Sandu Pottery — Milano, piazza Diaz",
	luogo: "piazza Diaz, Milano",
	url: "https://sandupottery.com",
};

describe("creaICS", () => {
	test("usa terminatori di riga CRLF", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics.includes("\r\n")).toBe(true);
		expect(/[^\r]\n/.test(ics)).toBe(false);
	});

	test("apre e chiude il calendario", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
		expect(ics.endsWith("END:VCALENDAR\r\n")).toBe(true);
		expect(ics).toContain("VERSION:2.0");
		expect(ics).toContain("CALSCALE:GREGORIAN");
	});

	test("scrive un evento di un giorno come data intera con DTEND esclusivo", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics).toContain("DTSTART;VALUE=DATE:20260924");
		// DTEND è esclusivo: il giorno DOPO l'ultimo giorno.
		expect(ics).toContain("DTEND;VALUE=DATE:20260925");
	});

	test("scrive un evento di due giorni con DTEND al terzo giorno", () => {
		const ics = creaICS(
			[{ ...evento, uid: "x", inizio: "2026-09-19", fine: "2026-09-20" }],
			"Mercatini",
			STAMP,
		);
		expect(ics).toContain("DTSTART;VALUE=DATE:20260919");
		expect(ics).toContain("DTEND;VALUE=DATE:20260921");
	});

	test("rende gli UID unici per dominio", () => {
		const ics = creaICS([evento], "Mercatini", STAMP);
		expect(ics).toContain("UID:2026-09-24-milano-diaz@sandupottery.com");
	});

	test("fa l'escape di virgole, punti e virgola e barre rovesce", () => {
		const ics = creaICS(
			[{ ...evento, titolo: "Milano, piazza Diaz; banco 3 \\ tornio" }],
			"Mercatini",
			STAMP,
		);
		expect(ics).toContain("SUMMARY:Milano\\, piazza Diaz\\; banco 3 \\\\ tornio");
	});

	test("piega le righe più lunghe di 75 ottetti", () => {
		const lungo = "A".repeat(200);
		const ics = creaICS([{ ...evento, titolo: lungo }], "Mercatini", STAMP);
		for (const riga of ics.split("\r\n")) {
			expect(Buffer.byteLength(riga, "utf8")).toBeLessThanOrEqual(75);
		}
		// Le continuazioni iniziano con uno spazio.
		expect(ics).toContain("\r\n A");
	});

	test("non spezza un carattere multi-byte a fine riga", () => {
		// Accenti fitti attorno all'ottetto 75: se la maschera di continuazione
		// non viene applicata, qui compare un carattere di sostituzione.
		const titolo = `${"è".repeat(60)} coda`;
		const ics = creaICS([{ ...evento, titolo }], "Mercatini", STAMP);
		expect(ics).not.toContain("�");
		const ricomposto = ics
			.split("\r\n")
			.filter((r) => r.startsWith("SUMMARY:") || r.startsWith(" "))
			.map((r, i) => (i === 0 ? r.slice("SUMMARY:".length) : r.slice(1)))
			.join("");
		expect(ricomposto).toBe(titolo);
	});

	test("è deterministico a parità di input", () => {
		expect(creaICS([evento], "Mercatini", STAMP)).toBe(creaICS([evento], "Mercatini", STAMP));
	});
});
