import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";

export function PiePagina({ locale }: { locale: Locale }) {
	const riga =
		locale === "it"
			? `${sito.nome} — ceramiche fatte a mano, ${sito.citta}`
			: `${sito.nome} — handmade ceramics, ${sito.citta}, Italy`;

	return (
		<footer className="mx-auto w-full max-w-5xl px-6 pb-14 pt-20 sm:px-10">
			<div className="border-t border-sp-bordo pt-5 font-display text-xs text-sp-nota">
				<span>{riga}</span>
			</div>
		</footer>
	);
}
