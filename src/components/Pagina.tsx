import type { Locale } from "@/lib/date";
import { Apertura } from "./Apertura";
import { Filo } from "./Filo";
import { Intestazione } from "./Intestazione";

export function Pagina({ locale }: { locale: Locale }) {
	return (
		<>
			<Intestazione locale={locale} />
			<main>
				<Apertura locale={locale} />
				<div className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
					<Filo />
				</div>
			</main>
		</>
	);
}
