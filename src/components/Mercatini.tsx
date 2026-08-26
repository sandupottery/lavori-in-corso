import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import { ricorrenze } from "@/content/ricorrenze";
import type { Locale } from "@/lib/date";
import { giorniBrevi, raggruppaPerMese, ultimoGiorno } from "@/lib/date";
import { Zampina } from "./Zampina";

export function Mercatini({ locale }: { locale: Locale }) {
	const d = dizionari[locale];
	const gruppi = raggruppaPerMese(mercati, locale);

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-14 sm:px-10">
			<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
				{d.doveMiTrovi}
			</h2>
			<p className="pt-2 font-testo text-lg text-sp-tenue">{d.doveSottotitolo}</p>

			<div className="mt-7 grid gap-9 rounded bg-sp-sabbia p-6 sm:p-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-14">
				<div className="flex flex-col gap-4">
					<p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-sp-terracotta-scritta">
						{d.ogniMeseSempre}
					</p>
					<ul className="flex flex-col gap-4">
						{ricorrenze.map((r) => (
							<li key={r.luogo}>
								<p className="font-display text-sm font-semibold text-sp-inchiostro">{r.luogo}</p>
								<p className="font-testo text-[15px] leading-snug text-sp-testo">
									{locale === "it" ? r.regolaIt : r.regolaEn}
								</p>
							</li>
						))}
					</ul>
					<p className="pt-1 font-testo text-sm italic leading-relaxed text-sp-nota">
						{d.ogniMeseNota}
					</p>
				</div>

				<div className="flex flex-col gap-5 lg:border-l lg:border-sp-bordo lg:pl-14">
					<p className="font-display text-[11px] font-bold uppercase tracking-[0.16em] text-sp-terracotta-scritta">
						{d.prossimeDate}
					</p>

					<div data-elenco-date className="grid gap-7 sm:grid-cols-2">
						{gruppi.map((g) => (
							<div key={g.chiave} data-gruppo-mese className="flex flex-col gap-3">
								<p className="font-display text-base font-bold text-sp-inchiostro">{g.etichetta}</p>
								<ul className="flex flex-col gap-3">
									{g.voci.map((m) => (
										<li
											key={m.id}
											data-fine={ultimoGiorno(m)}
											className="flex items-baseline gap-2.5"
										>
											<Zampina className="mt-0.5 w-3.5 shrink-0 self-start text-sp-terracotta" />
											<span>
												<span className="font-display text-sm font-semibold text-sp-inchiostro">
													{giorniBrevi(m)}
												</span>{" "}
												<a
													href={m.mappa}
													target="_blank"
													rel="noreferrer"
													className="font-testo text-[15px] leading-snug text-sp-testo underline decoration-sp-rosa underline-offset-2 hover:decoration-sp-terracotta"
												>
													{m.citta}, {m.luogo}
													{m.dettaglio ? ` (${m.dettaglio})` : ""}
												</a>{" "}
												<a
													href={`/calendario/${m.id}.ics`}
													className="inline-block font-display text-xs text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-2 hover:decoration-sp-terracotta"
												>
													{d.aggiungiAlCalendario}
												</a>
											</span>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>

					<p data-nessuna-data className="font-testo text-lg text-sp-testo">
						{d.nessunaData}
					</p>

					<a
						data-tutte-le-date
						href="/calendario/mercatini.ics"
						className="self-start font-display text-sm font-semibold text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
					>
						{d.tutteLeDate}
					</a>
				</div>
			</div>
		</section>
	);
}
