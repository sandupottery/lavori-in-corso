import { dizionari } from "@/content/dizionario";
import { mercati } from "@/content/mercati";
import type { Locale } from "@/lib/date";
import { etichettaLunga, ultimoGiorno } from "@/lib/date";
import { Zampina } from "./Zampina";

export function CartaProssimo({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<div
			data-carta-prossimo
			className="flex items-start gap-4 rounded border border-sp-bordo bg-sp-sabbia p-5"
		>
			<Zampina className="mt-1 w-5 shrink-0 text-sp-terracotta" />
			<div>
				{mercati.map((m) => (
					<div
						key={m.id}
						data-voce-prossimo
						data-inizio={m.inizio}
						data-fine={ultimoGiorno(m)}
						hidden
					>
						<p className="font-display text-[11px] uppercase tracking-[0.14em] text-sp-tenue">
							<span data-etichetta-prossimo data-oggi={d.oggiSonoA}>
								{d.prossimoMercatino}
							</span>
						</p>
						<p className="pt-1 font-display text-lg font-semibold text-sp-inchiostro">
							{etichettaLunga(m, locale)}
						</p>
						<p className="font-testo text-base text-sp-testo">
							{m.citta}, {m.luogo}
							{m.dettaglio ? ` (${m.dettaglio})` : ""}
						</p>
					</div>
				))}
				<p data-nessun-prossimo className="font-testo text-base text-sp-testo">
					{d.nessunaData}
				</p>
			</div>
		</div>
	);
}
