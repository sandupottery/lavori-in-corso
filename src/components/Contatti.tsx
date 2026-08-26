import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";
import { Filo } from "./Filo";

export function Contatti({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
			<Filo />
			<div className="grid gap-8 pt-10 lg:grid-cols-2 lg:items-end">
				<div className="flex flex-col gap-4">
					<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
						{d.scrivimi}
					</h2>
					<p className="max-w-md font-testo text-lg leading-relaxed text-sp-testo">
						{d.scrivimiTesto}
					</p>
					<a
						href={`mailto:${sito.email}`}
						className="inline-flex min-h-11 items-center self-start font-display text-xl font-semibold text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
					>
						{sito.email}
					</a>
				</div>

				<ul className="flex flex-col gap-3 font-display text-base lg:pb-1">
					{sito.profili.map((profilo) => (
						<li key={profilo.url}>
							<a
								href={profilo.url}
								target="_blank"
								rel="me noreferrer"
								className="inline-flex min-h-11 items-center text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
							>
								Instagram — {profilo.etichetta}
							</a>
						</li>
					))}
				</ul>
			</div>
		</section>
	);
}
