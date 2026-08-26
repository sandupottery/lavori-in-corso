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
		const chiavi = Object.keys(dizionari.it) as (keyof typeof dizionari.it)[];
		expect(chiavi.length).toBe(20);
		const uguali = chiavi.filter((c) => dizionari.en[c] === dizionari.it[c]);
		expect(uguali).toEqual([]);
	});
});
