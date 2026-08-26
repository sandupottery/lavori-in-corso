import { giornoDopo } from "@/lib/date";

export type EventoICS = {
	uid: string;
	inizio: string;
	fine?: string;
	titolo: string;
	luogo: string;
	url: string;
};

const DOMINIO = "sandupottery.com";

/** RFC 5545 §3.3.11: virgola, punto e virgola, barra rovescia e a capo. */
function escapeTesto(v: string): string {
	return v
		.replace(/\\/g, "\\\\")
		.replace(/;/g, "\\;")
		.replace(/,/g, "\\,")
		.replace(/\r?\n/g, "\\n");
}

/** RFC 5545 §3.1: righe di massimo 75 ottetti, continuazioni con uno spazio. */
function piega(riga: string): string {
	const byte = Buffer.from(riga, "utf8");
	if (byte.length <= 75) return riga;

	const pezzi: string[] = [];
	let inizio = 0;
	let limite = 75;

	while (inizio < byte.length) {
		let fine = Math.min(inizio + limite, byte.length);
		// Non spezzare mai a metà di un carattere multi-byte: i byte di
		// continuazione UTF-8 hanno i due bit alti a 10.
		// Le parentesi contano: `x as number & 0xc0` verrebbe letto come
		// intersezione di tipi e la maschera non verrebbe mai applicata.
		while (fine > inizio && fine < byte.length && ((byte[fine] as number) & 0xc0) === 0x80) {
			fine--;
		}
		pezzi.push(byte.subarray(inizio, fine).toString("utf8"));
		inizio = fine;
		limite = 74; // le righe successive perdono un ottetto per lo spazio iniziale
	}

	return pezzi.join("\r\n ");
}

const data = (iso: string) => iso.replace(/-/g, "");

export function creaICS(
	eventi: readonly EventoICS[],
	nomeCalendario: string,
	dtstamp: string,
): string {
	const righe: string[] = [
		"BEGIN:VCALENDAR",
		"VERSION:2.0",
		`PRODID:-//${DOMINIO}//lavori in corso//IT`,
		"CALSCALE:GREGORIAN",
		"METHOD:PUBLISH",
		`X-WR-CALNAME:${escapeTesto(nomeCalendario)}`,
	];

	for (const e of eventi) {
		righe.push(
			"BEGIN:VEVENT",
			`UID:${e.uid}@${DOMINIO}`,
			`DTSTAMP:${dtstamp}`,
			`DTSTART;VALUE=DATE:${data(e.inizio)}`,
			`DTEND;VALUE=DATE:${data(giornoDopo(e.fine ?? e.inizio))}`,
			`SUMMARY:${escapeTesto(e.titolo)}`,
			`LOCATION:${escapeTesto(e.luogo)}`,
			`URL:${escapeTesto(e.url)}`,
			"END:VEVENT",
		);
	}

	righe.push("END:VCALENDAR");

	return `${righe.map(piega).join("\r\n")}\r\n`;
}
