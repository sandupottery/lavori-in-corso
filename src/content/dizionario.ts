import type { Locale } from "@/lib/date";

export type Dizionario = {
	occhiello: string;
	titolo: string;
	introduzione: string;
	prossimoMercatino: string;
	oggiSonoA: string;
	doveMiTrovi: string;
	doveSottotitolo: string;
	ogniMeseSempre: string;
	ogniMeseNota: string;
	prossimeDate: string;
	nessunaData: string;
	tutteLeDate: string;
	qualchePezzo: string;
	qualcheSottotitolo: string;
	scrivimi: string;
	scrivimiTesto: string;
	altraLingua: string;
	altraLinguaHref: string;
	descrizioneMeta: string;
	suggerimentoDate: string;
};

export const dizionari: Record<Locale, Dizionario> = {
	it: {
		occhiello: "Ceramica fatta a mano · Bergamo",
		titolo: "Sto rifacendo il sito.",
		introduzione:
			"Nel frattempo ci vediamo ai mercatini. Ogni pezzo nasce al tornio, viene modellato e decorato a mano: uno per volta, ognuno diverso.",
		prossimoMercatino: "Prossimo mercatino",
		oggiSonoA: "Oggi sono a",
		doveMiTrovi: "Dove mi trovi",
		doveSottotitolo: "Le date dei prossimi mercatini.",
		ogniMeseSempre: "Ogni mese, sempre",
		ogniMeseNota: "Queste non cambiano mai: se sei di Bergamo, sai già dove trovarmi.",
		prossimeDate: "Prossime date",
		nessunaData: "Le date del prossimo anno arrivano presto — scrivimi e ti dirò dove sono.",
		tutteLeDate: "Scarica tutte le date",
		qualchePezzo: "Qualche pezzo",
		qualcheSottotitolo: "Gattine, Tettazze, foglie e molte altre.",
		scrivimi: "Scrivimi",
		scrivimiTesto:
			"Per un pezzo su misura, un regalo o solo per sapere dove sarò: mandami due righe.",
		altraLingua: "English",
		altraLinguaHref: "/en",
		descrizioneMeta:
			"Creazioni in ceramica lavorate a mano e al tornio, da Bergamo. Il calendario dei prossimi mercatini e come contattarmi.",
		suggerimentoDate: "Tocca la data per salvarla nel calendario, il luogo per aprire la mappa.",
	},
	en: {
		occhiello: "Handmade ceramics · Bergamo, Italy",
		titolo: "I'm rebuilding the site.",
		introduzione:
			"In the meantime, come and find me at the markets. Every piece is thrown on the wheel, shaped and decorated by hand: one at a time, each one different.",
		prossimoMercatino: "Next market",
		oggiSonoA: "Today I'm at",
		doveMiTrovi: "Where to find me",
		doveSottotitolo: "The markets I'll be at over the coming months.",
		ogniMeseSempre: "Every month, always",
		ogniMeseNota: "These never change — if you're local, you already know where I am.",
		prossimeDate: "Upcoming dates",
		nessunaData: "Next year's dates are coming soon — write to me and I'll tell you where I'll be.",
		tutteLeDate: "Download every date",
		qualchePezzo: "A few pieces",
		qualcheSottotitolo: "Gattine, Tettazze, leaves and plenty more.",
		scrivimi: "Write to me",
		scrivimiTesto: "For a commission, a gift, or just to ask where I'll be next: drop me a line.",
		altraLingua: "Italiano",
		altraLinguaHref: "/",
		descrizioneMeta:
			"Handmade wheel-thrown ceramics from Bergamo, Italy. The calendar of upcoming craft markets and how to get in touch.",
		suggerimentoDate: "Tap a date to save it to your calendar, or a place to open the map.",
	},
};
