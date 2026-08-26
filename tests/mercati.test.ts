import { describe, expect, test } from "bun:test";
import { mercati } from "@/content/mercati";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe("mercati", () => {
	test("contiene le 25 date del calendario del cliente", () => {
		expect(mercati.length).toBe(25);
	});

	test("ogni data è una stringa ISO valida", () => {
		for (const m of mercati) {
			expect(m.inizio).toMatch(ISO);
			expect(Number.isNaN(Date.parse(m.inizio))).toBe(false);
			if (m.fine !== undefined) {
				expect(m.fine).toMatch(ISO);
				expect(Number.isNaN(Date.parse(m.fine))).toBe(false);
			}
		}
	});

	test("la fine non precede mai l'inizio", () => {
		for (const m of mercati) {
			if (m.fine !== undefined) expect(m.fine >= m.inizio).toBe(true);
		}
	});

	test("l'elenco è ordinato cronologicamente", () => {
		const date = mercati.map((m) => m.inizio);
		expect([...date].sort()).toEqual(date);
	});

	test("gli id sono unici", () => {
		expect(new Set(mercati.map((m) => m.id)).size).toBe(mercati.length);
	});

	test("gli id sono slug sicuri per un nome di file", () => {
		for (const m of mercati) expect(m.id).toMatch(/^[a-z0-9-]+$/);
	});

	test("ogni mercato ha città, luogo e un link a una mappa", () => {
		for (const m of mercati) {
			expect(m.citta.length).toBeGreaterThan(0);
			expect(m.luogo.length).toBeGreaterThan(0);
			expect(m.mappa.startsWith("https://www.google.com/maps/search/?api=1&query=")).toBe(true);
		}
	});

	// Le due date che escono dallo schema, entrambe documentate nel PDF del cliente:
	// l'8 dicembre è l'Immacolata (mercato di martedì) e il 22 dicembre è
	// l'ultimo banco prima di Natale, spostato dal giovedì al martedì.
	const ECCEZIONI = new Set(["2026-12-08", "2026-12-22"]);

	test("i mercati ricorrenti compaiono il giorno della settimana giusto", () => {
		const giorno = (iso: string) => new Date(`${iso}T12:00:00Z`).getUTCDay();
		for (const m of mercati) {
			if (ECCEZIONI.has(m.inizio)) continue;
			// Bergamo Alta è di domenica, piazza Diaz di giovedì, piazza Cavour di domenica.
			if (m.luogo.includes("Torre Adalberto")) expect(giorno(m.inizio)).toBe(0);
			if (m.luogo === "piazza Diaz") expect(giorno(m.inizio)).toBe(4);
			if (m.luogo.includes("piazza Cavour")) expect(giorno(m.inizio)).toBe(0);
		}
	});

	test("le eccezioni dichiarate esistono davvero nel calendario", () => {
		// Se una data d'eccezione sparisce o cambia, questo test lo dice invece di
		// lasciare l'esclusione a coprire silenziosamente un errore nuovo.
		for (const iso of ECCEZIONI) {
			expect(mercati.some((m) => m.inizio === iso)).toBe(true);
		}
	});
});
