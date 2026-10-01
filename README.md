# A M.I. képmásunkra

*Az ember Isten-képűsége a mesterséges intelligencia tükrében* — előadás és előadás-tervezet.

## Mi van a repóban?

```
eloadas/                  ← ez kerül ki a webre (Netlify)
  index.html              ← a diák — itt szerkeszted a szöveget
  assets/style.css        ← kinézet (pixeles stílus)
  assets/deck.js          ← működés: lapozás, lépések, gépelő animáció
  assets/fonts.css        ← betűtípusok bekötése
  assets/fonts/           ← Press Start 2P és VT323 (OFL-licenc)
  media/                  ← feliratok (SRT és böngészőhöz VTT); ide jöhet a videó
tervezet/
  eloadas-tervezet.md     ← a teljes, hosszú előadás-tervezet (a diák forrása)
CLAUDE.md                 ← munkautasítás Claude-nak (Claude Code olvassa)
netlify.toml              ← Netlify-beállítás
```

A webre csak az `eloadas/` mappa kerül ki. A tervezet a GitHubon marad; ha a repót privátnak állítod, csak te látod.

## Feltöltés a GitHubra

1. A GitHubon: **New repository** → név (pl. `mi-kepmasunkra`) → Private vagy Public → **Create repository**.
2. A letöltött ZIP-et csomagold ki.
3. A repó üres oldalán: **uploading an existing file** → húzd be a kicsomagolt mappa *tartalmát* (az `eloadas`, `tervezet` mappákat és a fájlokat, a rejtett `.gitignore`-t is, ha látszik) → **Commit changes**.
   (Kényelmesebb a GitHub Desktop alkalmazás: ott a mappát egyben hozzá tudod adni.)

## Összekötés a Netlifyval

1. Netlify → **Add new site** → **Import an existing project** → **GitHub** → válaszd ki a repót.
2. A beállításokat a `netlify.toml` megadja (publish: `eloadas`, nincs build) — csak **Deploy**.
3. Ezután minden GitHubra feltöltött változtatás után a Netlify magától frissíti az oldalt.

## Előadás közben

| Billentyű | Mit csinál |
|---|---|
| → · Szóköz · PageDown (lapozó) | tovább — ha a dián van el nem indított kérdés vagy címszó, előbb azt indítja |
| ← · PageUp · Backspace | vissza |
| Enter | a dián lévő következő kérdés / címszó |
| bármelyik gépelés közben | a válasz azonnal teljesen kiíródik |
| M | diák listája |
| F | teljes képernyő |
| R | az aktuális dia alaphelyzetbe |
| Home / End | első / utolsó dia |
| B · . | fekete képernyő (bármelyik billentyű visszahozza) |
| P | előadói nézet külön ablakban: óra, eltelt idő, következő dia, jegyzet — innen is lapozható |
| O | olvasható mód: a hosszabb szövegek rendes betűvel (ki-be) |
| Ctrl+P | nyomtatás / PDF: minden dia egy oldal, minden válasz kinyitva |

**Előadói nézet két kijelzővel:** a vetítő ablakot húzd a projektorra (F: teljes képernyő), a laptopon nyomd meg a P-t. Ha a böngésző letiltja a felugró ablakot, engedélyezd ennél az oldalnál. Jegyzetet egy diához így adhatsz: `<aside class="notes">…</aside>` a dián belül — a vetítésen nem látszik.

**Hosszú válaszok:** ha egy Claude-válasz nem fér ki, a betű kissé kisebb lesz; ha így sem, bekezdések mentén részletekben jelenik meg („▼ folytatás”), és a következő gombnyomás hozza a folytatást. A szöveg nem változik.

**Biztonsági tartalék:** az előadás napján legyen a laptopodon egy letöltött példány is. Az `eloadas/index.html` internet nélkül, dupla kattintással is fut (a betűk is helyben vannak). Érdemes PDF-et is menteni (Ctrl+P → Mentés PDF-ként, „Háttérgrafika” bekapcsolva): ez egy másik gépen vagy kiosztott anyagként is használható.

## Szerkesztés

A diák az `eloadas/index.html`-ben vannak; a fájl elején magyar nyelvű útmutató mutatja a mintákat (címszó, lépésenként megjelenő címszó, Claude-kérdés, Dani-idézet). Szerkesztés után nyisd meg a fájlt böngészőben, és nézd meg.

**Videó a dián:** tedd a videót az `eloadas/media/` mappába `omg-agents.mp4` néven, és az első 1. blokkos dián töröld a videóblokk körüli megjegyzésjeleket. A magyar felirat automatikusan bekapcsol. (A GitHub egy fájlra 100 MB-os korlátot szab.)

## Munka Claude-dal

A repó gyökerében lévő `CLAUDE.md` rögzíti a munkamódszert, a hangnemet és a nyitott ellenőrzéseket. A Claude Code ezt a fájlt a munka elején beolvassa, így nem kell újra elmagyarázni. Dokumentáció: https://docs.claude.com/en/docs/claude-code/overview

## Licenc és források

A betűtípusok a SIL Open Font License 1.1 alatt állnak (`eloadas/assets/fonts/OFL-*.txt`). A videó (Pavel Kasík: *OMG! We've found other agents!*) nem része a repónak; a felirat a mi fordításunk. A tényállítások forrásai a tervezetben, a megfelelő helyen.
