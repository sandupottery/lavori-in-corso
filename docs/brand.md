# Sistema visivo

Direzione: **Porcellana + tocco Quaderno**. Fondo porcellana, molta aria, testo a inchiostro, un solo accento terracotta. Il segno disegnato a mano compare solo due volte: il filo fra le sezioni e la zampina nell'elenco delle date.

## Colori

I valori sono campionati dalle fotografie della cliente e corretti sul bilanciamento del bianco. Il contrasto è misurato, non stimato.

| Token | Hex | su porcellana | su sabbia | Uso |
| --- | --- | --- | --- | --- |
| `sp-porcellana` | `#FAF7F3` | — | — | fondo pagina |
| `sp-sabbia` | `#EDE3D6` | — | — | scheda mercatini |
| `sp-inchiostro` | `#241F1C` | 15.27 | 12.86 | titoli, testo forte |
| `sp-testo` | `#4A423D` | 9.20 | 7.75 | paragrafi |
| `sp-tenue` | `#5B534E` | 7.04 | 5.93 | testo secondario |
| `sp-nota` | `#6E645B` | 5.41 | 4.55 | corsivi, minori |
| `sp-terracotta` | `#C2603A` | 3.91 | 3.29 | **solo segni** — zampine, filo |
| `sp-terracotta-scritta` | `#9A4526` | 6.04 | 5.09 | link e testo d'accento |
| `sp-rosa` | `#E4A896` | 1.90 | 1.60 | **mai testo** — sottolineature |
| `sp-glassa` | `#9FAEBD` | 2.12 | 1.79 | **mai testo** — filo disegnato |
| `sp-verderame` | `#4A6654` | 5.92 | 4.99 | in riserva, sito definitivo |
| `sp-bordo` | `#DFD1BF` | — | — | l'unico filetto della scheda |

Terracotta è volutamente **due** token: quello bello non passa AA per il testo corrente.

## Caratteri

| Ruolo | Famiglia | Perché |
| --- | --- | --- |
| Display | Quicksand 400–700 | Quasi identico al lettering del logo: pagina e marchio diventano una cosa sola |
| Testo | Newsreader 300–500 + corsivo | Serif caldo a basso contrasto; regge le righe fitte del calendario |

Entrambi self-hosted in `src/fonts/` come `woff2` variabili, sottoinsieme `latin`. La build non deve mai dipendere dalla rete.

## Voce

Prima persona singolare, calda, semplice. È una donna con un tornio, non un brand.

- Sì: «Sto rifacendo il sito.» «Nel frattempo ci vediamo ai mercatini.»
- No: «Coming soon», «Sito in costruzione», «Stay tuned».

La pagina è una vetrina con un biglietto scritto a mano dentro, non un cantiere.
