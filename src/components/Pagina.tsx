import { mercati } from "@/content/mercati";
import type { Locale } from "@/lib/date";
import { graficoJsonLd } from "@/lib/jsonld";
import { Apertura } from "./Apertura";
import { Contatti } from "./Contatti";
import { Filo } from "./Filo";
import { Galleria } from "./Galleria";
import { Intestazione } from "./Intestazione";
import { Mercatini } from "./Mercatini";
import { PiePagina } from "./PiePagina";
import { ScriptFreschezza } from "./ScriptFreschezza";

export function Pagina({ locale }: { locale: Locale }) {
	return (
		<>
			<Intestazione locale={locale} />
			<main>
				<Apertura locale={locale} />
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
					<Filo />
				</div>
				<Mercatini locale={locale} />
				<Galleria locale={locale} />
				<Contatti locale={locale} />
				<ScriptFreschezza />
			</main>
			<PiePagina locale={locale} />
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: graficoJsonLd(mercati, locale) }}
			/>
		</>
	);
}
