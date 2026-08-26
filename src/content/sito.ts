export type Profilo = {
	etichetta: string;
	url: string;
};

export const sito = {
	url: "https://sandupottery.com",
	nome: "Sandu Pottery",
	citta: "Bergamo",
	email: "info@sandupottery.com",
	/**
	 * Due account, due mondi del suo lavoro: gli animali e i corpi.
	 * Facebook è stato tolto su richiesta della cliente.
	 */
	profili: [
		{ etichetta: "@sandu_pottery", url: "https://www.instagram.com/sandu_pottery/" },
		{ etichetta: "@letettazze", url: "https://www.instagram.com/letettazze/" },
	] as readonly Profilo[],
} as const;
