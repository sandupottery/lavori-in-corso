import type { Locale } from "@/lib/date";

export function Pagina({ locale }: { locale: Locale }) {
	return <main data-locale={locale}>Sandu Pottery</main>;
}
