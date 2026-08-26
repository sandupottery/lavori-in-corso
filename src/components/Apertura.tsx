import Image from "next/image";
import { dizionari } from "@/content/dizionario";
import type { Locale } from "@/lib/date";
import { CartaProssimo } from "./CartaProssimo";

export function Apertura({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<section className="sp-entra mx-auto grid w-full max-w-5xl gap-10 px-6 pt-14 sm:px-10 lg:grid-cols-2 lg:items-center lg:gap-16 lg:pt-20">
			<div className="flex flex-col gap-6">
				<p className="font-display text-[11px] uppercase tracking-[0.16em] text-sp-tenue">
					{d.occhiello}
				</p>
				<h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight text-sp-inchiostro sm:text-5xl lg:text-6xl">
					{d.titolo}
				</h1>
				<p className="max-w-md font-testo text-lg leading-relaxed text-sp-testo sm:text-xl">
					{d.introduzione}
				</p>
				<CartaProssimo locale={locale} />
			</div>

			<div className="relative p-3.5">
				<div className="absolute inset-0 -rotate-1 rounded-sm border border-sp-bordo" />
				<Image
					src="/foto/gatti-calico.jpg"
					alt={
						locale === "it"
							? "Tre gattini in ceramica smaltata, bianchi con macchie nere e arancioni"
							: "Three glazed ceramic kittens, white with black and orange patches"
					}
					width={1400}
					height={1400}
					priority
					className="relative h-[320px] w-full rounded-sm object-cover sm:h-[420px] lg:h-[480px]"
				/>
			</div>
		</section>
	);
}
