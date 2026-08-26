export type Mercato = {
	/** Slug stabile: diventa anche il nome del file .ics. */
	id: string;
	/** Data ISO YYYY-MM-DD. */
	inizio: string;
	/** Ultimo giorno, se il mercato dura più di una giornata. */
	fine?: string;
	citta: string;
	luogo: string;
	dettaglio?: string;
	mappa: string;
};

const mappa = (q: string) =>
	`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;

export const mercati: readonly Mercato[] = [
	// ── Settembre 2026 ──
	{
		id: "2026-09-19-villa-guardia",
		inizio: "2026-09-19",
		fine: "2026-09-20",
		citta: "Villa Guardia",
		luogo: "Parco comunale",
		dettaglio: "L'isola che c'è",
		mappa: mappa("Parco comunale, Villa Guardia CO"),
	},
	{
		id: "2026-09-24-milano-diaz",
		inizio: "2026-09-24",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-09-27-bergamo-alta",
		inizio: "2026-09-27",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},

	// ── Ottobre 2026 ──
	{
		id: "2026-10-10-milano-darsena",
		inizio: "2026-10-10",
		citta: "Milano",
		luogo: "piazza XXIV Maggio",
		dettaglio: "Darsena",
		mappa: mappa("Piazza XXIV Maggio, Milano"),
	},
	{
		id: "2026-10-11-bergamo-cavour",
		inizio: "2026-10-11",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-10-14-milano-garibaldi",
		inizio: "2026-10-14",
		fine: "2026-10-15",
		citta: "Milano",
		luogo: "corso Garibaldi",
		dettaglio: "MM Moscova",
		mappa: mappa("Corso Garibaldi, Milano"),
	},
	{
		id: "2026-10-17-monza-italia",
		inizio: "2026-10-17",
		citta: "Monza",
		luogo: "corso Italia",
		mappa: mappa("Corso Italia, Monza"),
	},
	{
		id: "2026-10-18-milano-baggio",
		inizio: "2026-10-18",
		citta: "Milano",
		luogo: "Baggio",
		mappa: mappa("Baggio, Milano"),
	},
	{
		id: "2026-10-22-milano-diaz",
		inizio: "2026-10-22",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-10-23-milano-argentina",
		inizio: "2026-10-23",
		fine: "2026-10-24",
		citta: "Milano",
		luogo: "piazza Argentina",
		mappa: mappa("Piazza Argentina, Milano"),
	},
	{
		id: "2026-10-25-bergamo-alta",
		inizio: "2026-10-25",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-10-31-milano-gramsci",
		inizio: "2026-10-31",
		citta: "Milano",
		luogo: "piazza Gramsci",
		mappa: mappa("Piazza Gramsci, Milano"),
	},

	// ── Novembre 2026 ──
	{
		id: "2026-11-08-bergamo-cavour",
		inizio: "2026-11-08",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-11-15-monza-italia",
		inizio: "2026-11-15",
		citta: "Monza",
		luogo: "corso Italia",
		mappa: mappa("Corso Italia, Monza"),
	},
	{
		id: "2026-11-21-milano-marconi",
		inizio: "2026-11-21",
		citta: "Milano",
		luogo: "via Marconi",
		dettaglio: "angolo piazza Duomo",
		mappa: mappa("Via Marconi, Milano"),
	},
	{
		id: "2026-11-22-bergamo-alta",
		inizio: "2026-11-22",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-11-26-milano-diaz",
		inizio: "2026-11-26",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-11-29-bergamo-alta",
		inizio: "2026-11-29",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},

	// ── Dicembre 2026 ──
	{
		id: "2026-12-02-milano-garibaldi",
		inizio: "2026-12-02",
		fine: "2026-12-03",
		citta: "Milano",
		luogo: "corso Garibaldi",
		dettaglio: "MM Moscova",
		mappa: mappa("Corso Garibaldi, Milano"),
	},
	{
		id: "2026-12-08-bergamo-alta",
		inizio: "2026-12-08",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
	{
		id: "2026-12-12-milano-gramsci",
		inizio: "2026-12-12",
		citta: "Milano",
		luogo: "piazza Gramsci",
		mappa: mappa("Piazza Gramsci, Milano"),
	},
	{
		id: "2026-12-13-bergamo-cavour",
		inizio: "2026-12-13",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
	{
		id: "2026-12-18-milano-argentina",
		inizio: "2026-12-18",
		fine: "2026-12-20",
		citta: "Milano",
		luogo: "piazza Argentina",
		mappa: mappa("Piazza Argentina, Milano"),
	},
	{
		id: "2026-12-22-milano-diaz",
		inizio: "2026-12-22",
		citta: "Milano",
		luogo: "piazza Diaz",
		mappa: mappa("Piazza Diaz, Milano"),
	},
	{
		id: "2026-12-27-bergamo-alta",
		inizio: "2026-12-27",
		citta: "Bergamo",
		luogo: "Bergamo Alta, passaggio Torre Adalberto",
		dettaglio: "Colle Aperto",
		mappa: mappa("Colle Aperto, Bergamo Alta"),
	},
];
