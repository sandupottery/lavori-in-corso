import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { mercati } from "@/content/mercati";
import { sito } from "@/content/sito";
import { creaICS, type EventoICS } from "@/lib/ics";

const USCITA = join(process.cwd(), "out", "calendario");

/**
 * DTSTAMP fisso rispetto all'ultima data del calendario, non a "adesso":
 * così due build sullo stesso contenuto producono file identici.
 */
const DTSTAMP = "20260826T120000Z";

function aEvento(m: (typeof mercati)[number]): EventoICS {
	const dove = m.dettaglio ? `${m.luogo} (${m.dettaglio})` : m.luogo;
	return {
		uid: m.id,
		inizio: m.inizio,
		fine: m.fine,
		titolo: `${sito.nome} — ${m.citta}, ${dove}`,
		luogo: `${dove}, ${m.citta}`,
		url: sito.url,
	};
}

async function main(): Promise<void> {
	await mkdir(USCITA, { recursive: true });

	const eventi = mercati.map(aEvento);

	await writeFile(
		join(USCITA, "mercatini.ics"),
		creaICS(eventi, `${sito.nome} — mercatini`, DTSTAMP),
		"utf8",
	);

	await Promise.all(
		eventi.map((e) =>
			writeFile(join(USCITA, `${e.uid}.ics`), creaICS([e], e.titolo, DTSTAMP), "utf8"),
		),
	);

	console.log(`calendario: ${eventi.length + 1} file .ics scritti in out/calendario`);
}

await main();
