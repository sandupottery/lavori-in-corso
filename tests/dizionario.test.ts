import { describe, expect, test } from "bun:test";
import { dizionari } from "@/content/dizionario";

describe("dizionari", () => {
	test("esistono entrambe le lingue", () => {
		expect(Object.keys(dizionari).sort()).toEqual(["en", "it"]);
	});

	test("le due lingue hanno esattamente le stesse chiavi", () => {
		expect(Object.keys(dizionari.en).sort()).toEqual(Object.keys(dizionari.it).sort());
	});

	test("nessuna stringa è vuota", () => {
		for (const [lingua, d] of Object.entries(dizionari)) {
			for (const [chiave, valore] of Object.entries(d)) {
				expect(typeof valore === "string" && valore.length > 0).toBe(true);
				if (typeof valore !== "string" || valore.length === 0) {
					throw new Error(`${lingua}.${chiave} è vuota`);
				}
			}
		}
	});

	test("nessuna stringa inglese è rimasta in italiano", () => {
		// Sentinella grossolana ma efficace su una copia così breve.
		expect(dizionari.en.titolo).not.toBe(dizionari.it.titolo);
		expect(dizionari.en.doveMiTrovi).not.toBe(dizionari.it.doveMiTrovi);
	});
});
