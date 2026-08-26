const TOKEN = [
	["porcellana", "bg-sp-porcellana border border-sp-bordo"],
	["sabbia", "bg-sp-sabbia"],
	["inchiostro", "bg-sp-inchiostro"],
	["testo", "bg-sp-testo"],
	["tenue", "bg-sp-tenue"],
	["nota", "bg-sp-nota"],
	["terracotta", "bg-sp-terracotta"],
	["terracotta-scritta", "bg-sp-terracotta-scritta"],
	["rosa", "bg-sp-rosa"],
	["glassa", "bg-sp-glassa"],
	["verderame", "bg-sp-verderame"],
] as const;

export default function Home() {
	return (
		<main className="flex flex-col gap-10 p-10">
			<h1 className="font-display text-5xl font-semibold">Sto rifacendo il sito.</h1>
			<p className="max-w-xl font-testo text-xl leading-relaxed text-sp-testo">
				Nel frattempo ci vediamo ai mercatini. Ogni pezzo nasce al tornio, viene modellato e
				decorato a mano: uno per volta, tutti diversi.
			</p>
			<p className="max-w-xl font-testo text-lg italic text-sp-nota">
				La 2ª domenica e il 4° giovedì — corsivo, accenti, ordinali.
			</p>
			<div className="grid grid-cols-4 gap-4">
				{TOKEN.map(([nome, classe]) => (
					<div key={nome} className="flex flex-col gap-2">
						<div className={`h-16 rounded-sm ${classe}`} />
						<span className="font-display text-xs">{nome}</span>
					</div>
				))}
			</div>
		</main>
	);
}
