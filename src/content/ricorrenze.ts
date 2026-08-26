export type Ricorrenza = {
	luogo: string;
	regolaIt: string;
	regolaEn: string;
};

export const ricorrenze: readonly Ricorrenza[] = [
	{
		luogo: "Bergamo Bassa",
		regolaIt: "la 2ª domenica — da marzo a giugno, e da ottobre a dicembre",
		regolaEn: "2nd Sunday — March to June, and October to December",
	},
	{
		luogo: "Bergamo Alta",
		regolaIt: "la 4ª domenica — da aprile a giugno, e da settembre a dicembre",
		regolaEn: "4th Sunday — April to June, and September to December",
	},
	{
		luogo: "Milano, piazza Diaz",
		regolaIt: "il 4° giovedì di ogni mese",
		regolaEn: "4th Thursday of every month",
	},
];
