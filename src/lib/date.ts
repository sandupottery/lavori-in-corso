export type Locale = "it" | "en";

export type Intervallo = {
	inizio: string;
	fine?: string;
};

const FUSO = "Europe/Rome";

/**
 * La data di oggi a Roma, come stringa ISO.
 * Non usare toISOString(): a mezzanotte e mezza ora legale UTC è ancora ieri,
 * e la pagina annuncerebbe il mercato del giorno prima.
 */
export function oggiRoma(adesso: Date = new Date()): string {
	// en-CA formatta come YYYY-MM-DD.
	return new Intl.DateTimeFormat("en-CA", { timeZone: FUSO }).format(adesso);
}

/** L'ultimo giorno dell'intervallo: quello che finisce in data-fine. */
export function ultimoGiorno(m: Intervallo): string {
	return m.fine ?? m.inizio;
}

/** Il mercato non è ancora finito rispetto a `oggi`. */
export function eFuturo(m: Intervallo, oggi: string): boolean {
	return ultimoGiorno(m) >= oggi;
}

/** `oggi` cade dentro l'intervallo, estremi inclusi. */
export function eOggi(m: Intervallo, oggi: string): boolean {
	return m.inizio <= oggi && oggi <= ultimoGiorno(m);
}

/** ISO + 1 giorno. Serve al DTEND dei .ics, che è esclusivo. */
export function giornoDopo(iso: string): string {
	const d = new Date(`${iso}T00:00:00Z`);
	d.setUTCDate(d.getUTCDate() + 1);
	return d.toISOString().slice(0, 10);
}

const giorno = (iso: string) => Number(iso.slice(8, 10));

/** "24" oppure "19–20": solo i numeri, per l'elenco fitto. */
export function giorniBrevi(m: Intervallo): string {
	if (m.fine === undefined || m.fine === m.inizio) return String(giorno(m.inizio));
	return `${giorno(m.inizio)}–${giorno(m.fine)}`;
}

function formatta(iso: string, locale: Locale, opzioni: Intl.DateTimeFormatOptions): string {
	const lingua = locale === "it" ? "it-IT" : "en-GB";
	return new Intl.DateTimeFormat(lingua, { ...opzioni, timeZone: "UTC" }).format(
		new Date(`${iso}T12:00:00Z`),
	);
}

/** "giovedì 24 settembre" oppure "sabato 19 – domenica 20 settembre". */
export function etichettaLunga(m: Intervallo, locale: Locale): string {
	const conMese: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long" };
	const senzaMese: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric" };

	if (m.fine === undefined || m.fine === m.inizio) return formatta(m.inizio, locale, conMese);

	const stessoMese = m.inizio.slice(0, 7) === m.fine.slice(0, 7);
	const primo = formatta(m.inizio, locale, stessoMese ? senzaMese : conMese);
	return `${primo} – ${formatta(m.fine, locale, conMese)}`;
}

/**
 * Raggruppa per mese conservando l'ordine di arrivo.
 * PRECONDIZIONE: `voci` deve essere già ordinato per `inizio`. Il confronto
 * avviene solo con l'ultimo gruppo, quindi un mese che ricompare più avanti
 * genererebbe un secondo gruppo invece di unirsi al primo.
 */
export function raggruppaPerMese<T extends Intervallo>(
	voci: readonly T[],
	locale: Locale,
): { chiave: string; etichetta: string; voci: T[] }[] {
	const gruppi: { chiave: string; etichetta: string; voci: T[] }[] = [];

	for (const voce of voci) {
		const chiave = voce.inizio.slice(0, 7);
		const ultimo = gruppi.at(-1);
		if (ultimo?.chiave === chiave) {
			ultimo.voci.push(voce);
			continue;
		}
		const nome = formatta(voce.inizio, locale, { month: "long" });
		gruppi.push({
			chiave,
			etichetta: nome.charAt(0).toUpperCase() + nome.slice(1),
			voci: [voce],
		});
	}

	return gruppi;
}
