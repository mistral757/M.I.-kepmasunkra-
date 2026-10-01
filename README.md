# A MI képmásunkra

*Tükröt tart az embernek a mesterséges intelligencia (vagyis most már szuperintelligencia…)* — előadás és előadás-tervezet.

## Mi van a repóban?

```
eloadas/                  ← ez kerül ki a webre (Netlify)
  index.html              ← a diák — itt szerkeszted a szöveget
  assets/style.css        ← kinézet (pixeles stílus)
  assets/deck.js          ← működés: lapozás, lépések, gépelő animáció
  assets/fonts.css        ← betűtípusok bekötése
  assets/fonts/           ← Press Start 2P és VT323 (OFL-licenc)
  media/                  ← feliratok (SRT és böngészőhöz VTT); ide jöhet a videó
  vazlat.html             ← a vázlat telefonos olvasója (eszkozok/olvaso.py állítja elő, ne szerkeszd)
eszkozok/                 ← olvaso.py (telefonos olvasó), word.js (Word-változat)
tervezet/
  eloadas-tervezet.md     ← az előadás vázlata (a diák forrása)
  eloadas-vazlat.docx     ← ugyanez Wordben, korrektúrához
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

## Indítás és nézetek

Megnyitáskor felugrik egy ablak: **Teljes képernyő** (a böngészők csak kattintásra engedik; iPhone-on egyáltalán nem — ott fekvő helyzet ajánlott), utána a nézet:

- **Dani nézet** — a vetítés: előadói nézet (P), élő kérdés (K vagy a dián lévő gomb), minden billentyű.
- **Bibliaórai nézet** — a résztvevők saját eszközén: mindenki maga lapoz (nyilak, lapozó vagy telefonon oldalra húzás). Minden dia alján **✎ Jegyzet** gomb: jegyzet írható az adott diához, automatikusan mentődik. Ha a diához már van jegyzet, a gomb sárga, és rákattintva megnyílik. Jobbra fent: **Következő jegyzet ▶** (a szám a jegyzetek darabszáma) — a következő jegyzetes diára ugrik és megnyitja. A jegyzetablakban: **Összes letöltése** szövegfájlba.

A jegyzetek csak az adott eszközön, abban a böngészőben maradnak meg (privát ablakban nem; ezt az ablak jelzi). A diasor nem szinkronizál: a résztvevők a saját tempójukban lapoznak, az élő kérdések válaszai csak Dani gépén jelennek meg.

Közvetlen link a nézetválasztás nélkül: `…/?nezet=dani` vagy `…/?nezet=bibliaora` (a teljes képernyős kérdés ilyenkor is megjelenik).

**QR-kód a címlapon:** a weblapra mutat, és rögtön a bibliaórai nézetet nyitja meg (`?nezet=bibliaora`). Ha a diasort a weblapról vetíted, a cím magától kerül bele. Ha helyi fájlból vetítesz, írd be a weblap címét az `eloadas/assets/deck.js` elején a `WEBCIM` sorba (pl. `const WEBCIM = 'https://valami.netlify.app/';`) — enélkül a címlapon a QR helyén ez a figyelmeztetés áll. A kódot a `assets/qrcode.js` rajzolja (Kazuhiko Arase, MIT-licenc), internet nélkül is.

**Előadói nézet:** Dani nézetben nyomd meg a **P** betűt — külön ablak nyílik (óra, eltelt idő, következő dia, jegyzet, élő kérdés). Ha nem jelenik meg, a böngésző letiltotta a felugró ablakot: a címsor jobb szélén engedélyezd ennél az oldalnál, és nyomd meg újra a P-t. Két kijelzőnél ezt az ablakot hagyd a laptopon, a diasort húzd a projektorra, és ott nyomd meg az F-et.

## A vázlat telefonon (`vazlat.html`)

Az előadáshoz a vázlat telefonon is olvasható, ebookszerűen lapozva: `…/vazlat.html` (helyben: `eloadas/vazlat.html`).

- Álló nézetre készült; lapozás oldalra húzással, a képernyő jobb / bal szélére koppintva, vagy az alsó nyilakkal.
- A szöveg **diasorrendben** halad; minden dia új oldalon kezdődik. Felül a sáv mutatja a dia számát és címét; az új dia első oldalán sárga, „ÚJ DIA” felirattal (és ha a telefon tudja, rezeg egyet). A többi oldalon: „— folytatás”.
- Minden dia elején egy doboz mutatja, mi van a vásznon (cím, címszavak, idézet).
- Alul: betűméret (A− / A+), világos / sötét, ☰ tartalom (ugrás bármelyik diára). Megjegyzi a betűméretet és azt, hol tartottál.
- Internet nélkül is működik, ha a fájl le van töltve; a Netlify-címen át a legkényelmesebb.
- **Figyelem:** a Netlifyon ez is nyilvános cím (a keresők elől rejtve), ahogy a GitHub-repó is nyilvános.

**Ha a vázlat változik**, az olvasót újra kell építeni: `python3 eszkozok/olvaso.py` (a repó gyökeréből). A vázlatban a `<!-- dia: Dia címe -->` sorok jelölik, melyik rész melyik diához tartozik; ami egy jelölő után áll, az ahhoz a diához kerül, a következő jelölőig. A címnek pontosan egyeznie kell a dia címével. A Word-változat: `NODE_PATH=$(npm root -g) node eszkozok/word.js tervezet/eloadas-tervezet.md tervezet/eloadas-vazlat.docx`.

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
| K | élő kérdés betöltése (egy kijelzős módban; két kijelzővel az előadói nézetből) |

**Előadói nézet két kijelzővel:** a vetítő ablakot húzd a projektorra (F: teljes képernyő), a laptopon nyomd meg a P-t. Ha a böngésző letiltja a felugró ablakot, engedélyezd ennél az oldalnál. Jegyzetet egy diához így adhatsz: `<aside class="notes">…</aside>` a dián belül — a vetítésen nem látszik.

**Élő kérdések a végén („Kérdezzétek Claude-ot” dia):** a teremből érkező kérdést beírod Claude-nak egy chatbe, a választ bemásolod a diasorba, és ott a megszokott gépelő animációval fut le. A fájlt nem kell szerkeszteni:

1. Két kijelzővel: a projektoron a diasor (F), a laptopon az előadói nézet (P) és a Claude-chat.
2. A kérdést leírod a chatbe („ÉLŐ:” előtaggal), és közben a kérdést már beírhatod az előadói nézet „Élő kérdés” mezőjébe.
3. A választ bemásolod a második mezőbe → „Betöltés”. A diasor az élő diára ugrik, a sárga gombon a kérdés áll.
4. Enter (vagy a lapozó): indul a válasz. Újabb kérdésnél ugyanígy, a régi helyére kerül az új.

Egy kijelzővel a dián lévő **✎ Kérdés és válasz beírása** gomb (vagy a **K** billentyű) nyit egy ablakot ugyanezzel a két mezővel. Ez a vetítésen látszik; ha nem akarod, hogy a válasz előre látsszon, nyomd meg előbb a **B**-t (fekete képernyő), aztán a **K**-t: az ablak a fekete fölött nyílik, a betöltés után bármelyik billentyűre visszajön a kép. A chatből hozott „Claude:” előtagot és csillagos kiemelést a diasor magától eltávolítja.

Ha a claude.ai-on (nem Claude Code-ban) kérdezed, egy új beszélgetés elején ezt küldd el:

> Egy gyülekezeti előadás végén élő kérdéseket kapsz a közönségtől, „ÉLŐ:” előtaggal. A válaszodat szó szerint kivetítem. Csak a vetítendő szöveget írd: magyarul, első személyben, 2–3 rövid bekezdésben, üres sorral elválasztva, összesen kb. 350–550 karakterben, címsor, felsorolás és kiemelés nélkül. Légy tudományos, tanító és távolságtartó. Keresztyén tartalmat a hagyomány leírásaként közölj, ne hitvallásként. A tudat kérdésében mondd: nem tudod. Ahol releváns, mondd ki, hogy az Anthropic modellje vagy, és az Anthropic a verseny szereplője. Személyt ne minősíts. Ha a kérdés érthetetlen, egyetlen sorban kérdezz vissza „[Daninak]” előtaggal.

**Hosszú válaszok:** ha egy Claude-válasz nem fér ki, a betű kissé kisebb lesz; ha így sem, bekezdések mentén részletekben jelenik meg („▼ folytatás”), és a következő gombnyomás hozza a folytatást. A szöveg nem változik.

**Biztonsági tartalék:** az előadás napján legyen a laptopodon egy letöltött példány is. Az `eloadas/index.html` internet nélkül, dupla kattintással is fut (a betűk is helyben vannak). Érdemes PDF-et is menteni (Ctrl+P → Mentés PDF-ként, „Háttérgrafika” bekapcsolva): ez egy másik gépen vagy kiosztott anyagként is használható.

## Szerkesztés

A diák az `eloadas/index.html`-ben vannak; a fájl elején magyar nyelvű útmutató mutatja a mintákat (címszó, lépésenként megjelenő címszó, Claude-kérdés, Dani-idézet). Szerkesztés után nyisd meg a fájlt böngészőben, és nézd meg.

**Videó a dián:** tedd a videót az `eloadas/media/` mappába `omg-agents.mp4` néven, és az első 1. blokkos dián töröld a videóblokk körüli megjegyzésjeleket. A magyar felirat automatikusan bekapcsol. (A GitHub egy fájlra 100 MB-os korlátot szab.)

## Munka Claude-dal

A repó gyökerében lévő `CLAUDE.md` rögzíti a munkamódszert, a hangnemet és a nyitott ellenőrzéseket. A Claude Code ezt a fájlt a munka elején beolvassa, így nem kell újra elmagyarázni. Dokumentáció: https://docs.claude.com/en/docs/claude-code/overview

## Licenc és források

A betűtípusok a SIL Open Font License 1.1 alatt állnak (`eloadas/assets/fonts/OFL-*.txt`). A videó (Pavel Kasík: *OMG! We've found other agents!*) nem része a repónak; a felirat a mi fordításunk. A tényállítások forrásai a tervezetben, a megfelelő helyen.
