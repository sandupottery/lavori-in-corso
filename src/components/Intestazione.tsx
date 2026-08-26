import Image from "next/image";
import Link from "next/link";
import { dizionari } from "@/content/dizionario";
import { sito } from "@/content/sito";
import type { Locale } from "@/lib/date";

export function Intestazione({ locale }: { locale: Locale }) {
	const d = dizionari[locale];

	return (
		<header className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 pt-8 sm:px-10">
			<Image
				src="/logo.svg"
				alt={sito.nome}
				width={186}
				height={60}
				priority
				className="h-auto w-36 sm:w-44"
			/>
			<Link
				href={d.altraLinguaHref}
				className="font-display text-sm text-sp-terracotta-scritta underline decoration-sp-rosa underline-offset-4 hover:decoration-sp-terracotta"
			>
				{d.altraLingua}
			</Link>
		</header>
	);
}
