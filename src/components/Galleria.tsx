import Image from "next/image";
import { dizionari } from "@/content/dizionario";
import type { Locale } from "@/lib/date";

const FOTO = [
	{
		file: "/foto/mani-al-tornio.jpg",
		it: "Le mani della ceramista al tornio, mentre alza una ciotola",
		en: "The potter's hands at the wheel, throwing a bowl",
	},
	{
		file: "/foto/gatti-grigi.jpg",
		it: "Due tazze-gatto smaltate, grigie e bianche, impilate",
		en: "Two stacked grey and white glazed cat cups",
	},
	{
		file: "/foto/tettazza.jpg",
		it: "Una tettazza: tazza scultura in ceramica smaltata rosa",
		en: "A “tettazza” — a sculptural mug in pink glazed ceramic",
	},
	{
		file: "/foto/tazze-foglie.jpg",
		it: "Tazze in ceramica decorate con foglie di fragola dipinte a mano",
		en: "Ceramic mugs decorated with hand-painted strawberry leaves",
	},
	{
		file: "/foto/servizio-gatti.jpg",
		it: "Servizio da caffè con gatti e zampine dipinti a mano",
		en: "Coffee set with hand-painted cats and paw prints",
	},
	{
		file: "/foto/brocca-mentine.jpg",
		it: "Brocca in ceramica con foglie di menta impresse, fotografata tra la menta",
		en: "Ceramic jug with impressed mint leaves, photographed among mint",
	},
	{
		file: "/foto/colori-tavola.jpg",
		it: "Servizio da tavola a righe verdi e rosse su tessuto blu",
		en: "Green and red striped tableware on blue cloth",
	},
	{
		file: "/foto/ciondoli-cuore.jpg",
		it: "Due ciondoli a cuore in ceramica smaltata verde",
		en: "Two heart pendants in green glazed ceramic",
	},
] as const;

export function Galleria({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="mx-auto w-full max-w-5xl px-6 pt-16 sm:px-10">
			<h2 className="font-display text-3xl font-semibold text-sp-inchiostro sm:text-4xl">
				{d.qualchePezzo}
			</h2>
			<p className="pt-2 font-testo text-lg text-sp-tenue">{d.qualcheSottotitolo}</p>

			<div className="mt-7 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
				{FOTO.map((f) => (
					<Image
						key={f.file}
						src={f.file}
						alt={locale === "it" ? f.it : f.en}
						width={1400}
						height={1400}
						className="h-44 w-full rounded-sm object-cover sm:h-64 lg:h-72"
					/>
				))}
			</div>
		</section>
	);
}
