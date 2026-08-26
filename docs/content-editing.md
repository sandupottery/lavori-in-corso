# Aggiungere o modificare una data

Tutto il calendario vive in un solo file: `src/content/mercati.ts`.

## Aggiungere un mercato

Inserisci un oggetto **in ordine cronologico** nell'array `mercati`:

```ts
	{
		id: "2027-03-14-bergamo-cavour",
		inizio: "2027-03-14",
		citta: "Bergamo",
		luogo: "Bergamo centro, piazza Cavour",
		mappa: mappa("Piazza Cavour, Bergamo"),
	},
```

Per un mercato di più giorni aggiungi `fine` con l'ultimo giorno:

```ts
		inizio: "2027-03-14",
		fine: "2027-03-15",
```

Regole:

- `id` deve essere unico e contenere solo minuscole, cifre e trattini — diventa il nome del file `.ics`.
- `inizio` e `fine` sono ISO `YYYY-MM-DD`.
- `mappa` usa sempre l'helper `mappa(...)`.
- L'array deve restare ordinato per `inizio`.

## Verificare

```bash
bun test
```

`tests/mercati.test.ts` controlla l'ordine, l'unicità degli id, la validità delle date e il giorno della settimana dei mercati ricorrenti (Bergamo Alta e Bergamo Bassa/piazza Cavour di domenica, Milano piazza Diaz di giovedì — con le due eccezioni dell'8 e 22 dicembre già documentate). Se passa, il calendario è coerente.

Poi:

```bash
bun run build
```

Le date passate spariscono da sole nel browser: non serve ricostruire il sito quando una data scade.

## Aggiornare le ricorrenze

`src/content/ricorrenze.ts`. Ricorda di aggiornare **entrambe** le lingue (`regolaIt` e `regolaEn`).
