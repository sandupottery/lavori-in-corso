import localFont from "next/font/local";

// Quicksand — display face. Matches the lettering of the client's own logo,
// so the wordmark and the page read as one system.
export const quicksand = localFont({
	src: [{ path: "../fonts/Quicksand.woff2", style: "normal", weight: "400 700" }],
	variable: "--font-display-var",
	display: "swap",
});

// Newsreader — body face. Warm, low-contrast text serif that holds up in the
// dense rows of the market calendar.
export const newsreader = localFont({
	src: [
		{ path: "../fonts/Newsreader.woff2", style: "normal", weight: "300 500" },
		{ path: "../fonts/Newsreader-Italic.woff2", style: "italic", weight: "300 500" },
	],
	variable: "--font-testo-var",
	display: "swap",
});
