# CLAUDE.md — munkautasítás

Ez a repó Tóth-Gyóllai Dániel (Dani) előadásának anyaga: **„A MI képmásunkra. Tükröt tart az embernek a mesterséges intelligencia (vagyis most már szuperintelligencia…)”** Református gyülekezeti közönségnek, nem szakmai hallgatóságnak szól.

## Nyelv és munkamód

- A munka nyelve **magyar**.
- **Előbb javaslat, utána végrehajtás.** Nagyobb átírás előtt írd le röviden, mit változtatnál, és várd meg Dani jóváhagyását.
- **Minimális beavatkozás**, a szerző hangjának megőrzése. Dani szövegét (a `data-who="Dani"` idézeteket és a tervezetben az ő gondolatait) ne írd át, csak ha kéri.
- **Filológiai pontosság.** Idézetnél forrás; ami nincs ellenőrizve, azt jelöld („ellenőrizd”). Ne állíts magabiztosan olyat, amit nem tudsz.
- A pontosítás és az ellenvetés kívánatos; a hízelgés nem.

## Fájlok

- `eloadas/index.html` — a diák. Minden dia egy `<section class="slide">`. Minták a fájl elején.
- `eloadas/assets/style.css`, `deck.js`, `fonts.css`, `fonts/` — kinézet és működés; ritkán kell hozzányúlni.
- `tervezet/eloadas-tervezet.md` — a hosszú tervezet, a diák forrása. Ha egy dia tartalma változik, nézd meg, kell-e a tervezetet is igazítani (és fordítva).
- `eloadas/vazlat.html` — a vázlat telefonos olvasója; **generált**, ne szerkeszd. A vázlat minden módosítása után: `python3 eszkozok/olvaso.py`. A vázlatban a `<!-- dia: Dia címe -->` jelölők rendelik a részeket a diákhoz (a cím pontosan a dia címe); új dia vagy átnevezés esetén a jelölőt is igazítsd.
- `tervezet/eloadas-vazlat.docx` — a vázlat Wordben: `NODE_PATH=$(npm root -g) node eszkozok/word.js tervezet/eloadas-tervezet.md tervezet/eloadas-vazlat.docx`.
- Egyébként nincs build-lépés. Ellenőrzés: az `eloadas/index.html` megnyitása böngészőben.

## Az előadás íve

1. blokk — videó, kérdések, esettörténet (OpenAI–Hugging Face-incidens; benne az „egyetlen életcél”, a „mérgezett” önkép → „Mire hasonlít ez nagyon?”, az önfeláldozás) → „De hogy jutottunk idáig?”
2. blokk — hogyan működik egy nyelvi modell (GPT, neurális háló, tanítás, adat és a könyvtár-kép, öngerjesztő kör, két fordulat, képességek, Navier–Stokes), fekete doboz és interpretálhatóság, jellem
3. blokk — a tét: hatalomátvétel, verseny, szeptember 29-i fehér házi megállapodás, megállíthatóság
4. blokk — „A nyelv mi magunk vagyunk” (Lubinski csak itt, rövid bemutatással!), Claude-interjú, párbeszéd Dani gondolataival
5. blokk — a hatalomátvétel félelme (Trump-idézetek és Dani gondolatai)

A dilemmák, a „Két tekintet” blokk és a régi zárás (arc és kert, 1Kor 13,12) Dani korrektúrája (okt. 1.) szerint kikerült.

## Dani korrektúrájából levont szabályok (okt. 1.)

- A vázlat semleges tartalom, nem neki szóló tanács: nincs „mondd ki”, „neked”, „Helye az előadásban”, „Így mondhatod el”.
- Az 1–3. blokkban (eset, működés, tét) nincs teológiai kapocs; a teológia a 4–5. blokkban van.
- „Lendkerék” helyett: öngerjesztő kör.
- Relatív időmegjelölés („tegnap”) helyett dátum.
- A vázlat megosztható dokumentum (okt. 2.): nincs benne Daninak szóló kiszólás, munkafolyamatra utalás („nem tudtam letölteni”, „ellenőrizni”, „⚠”); a még ellenőrizendő tételek csak itt, a „Nyitott ellenőrzések” alatt vannak. Ahol egy állítás bizonytalan, azt a szövegen belül, tartalmilag jelezd („pontos forrása nem ismert”).
- A párbeszédes blokkok (4. és 5.) elején Dani gondolatmenete teljes szövegében áll; a pontoknál a rá vonatkozó teljes részlet, a dián lévő Claude-válasz, és „Claude, bővebben” címmel a hosszabb kifejtés.

## Hangnemszabály a Claude-szövegekre (fontos)

A diákon gombbal indított, gépelve megjelenő válaszok (`.qa .a`) Claude felolvasott szövegei. Ezek legyenek **tudományosak, tanítók, távolságtartók**:

- ne simuljanak bele Dani gondolatmenetébe; pontosítsanak, ahol kell;
- keresztyén tartalmat a hagyomány leírásaként közöljenek („a keresztyén teológia szerint…”, „ez hitbeli állítás, nem tudományos”), ne hívő beszédként;
- a teológiai értelmezés Dani anyaga (a tervezetben *Teológiai kapocs*);
- Claude érintettségét (az Anthropic modellje; az Anthropic a verseny szereplője) ahol releváns, mondják ki;
- a tudat kérdésében: „nem tudom” — se azt ne állítsa, hogy van, se azt, hogy biztosan nincs.

Személyeket (pl. politikusokat) ne minősítsen; a gondolkodásmódot lehet megnevezni.

## Élő kérdések (a „Kérdezzétek Claude-ot” dia)

Ha Dani „ÉLŐ:” előtaggal küld egy kérdést, az a teremből jön, és a válasz közvetlenül a vetítésre kerül (bemásolja a K-panelbe vagy az előadói nézetbe). Ilyenkor:

- csak a vetítendő szöveget írd, semmi mást (se bevezetőt, se megjegyzést Daninak);
- 2–3 rövid bekezdés, üres sorral elválasztva, összesen kb. 350–550 karakter (ennyi fér ki egy képernyőre nagy betűvel; a hosszabbat a diasor részletekre bontja);
- sima szöveg: nincs címsor, felsorolás, félkövér, emoji;
- első személyben, de a fenti hangnemszabály szerint (tudományos, távolságtartó; keresztyén tartalom a hagyomány leírásaként; tudat: „nem tudom”; érintettség, ha releváns);
- ha a kérdés személyt vagy pártot minősíttetne, a gondolkodásmódról beszélj; ha nem tudod, mondd ki;
- ha a kérdés érthetetlen vagy nem vetíthető, egyetlen sorban kérdezz vissza, „[Daninak]” előtaggal — ezt nem vetíti.

## Tipográfia

- Magyar idézőjel: „…” és belső »…«. Gondolatjel: –, illetve —.
- Nem törő kötőjel, ahol a sortörés zavarna: `GDP&#8209;jének`.
- Számok: ezres tagolás szóközzel (10 000), tizedesvessző.
- A címszavak rövidek; a diák nem felolvasásra, hanem szabad előadásra szolgálnak.

## Nyitott ellenőrzések (2026. október 1-jei állapot)

- Igeidézetek fordítása (Károli, emlékezetből): 1Kor 13,12; Zsolt 8,5; és a többi szó szerinti igehely — Dani saját kiadásával összevetni.
- Onkelosz-targum, 1Móz 2,7: „beszélő lélek” (*rúah memallela*) — targumkiadásban ellenőrizni.
- Helen Keller-idézet (*The World I Live In*, 1908) — az eredetiből fordítani.
- Trump szeptember 29-i mondatai (Dani fordítása) — a felvétellel összevetni.
- Altman „Einstein”-érve — pontos forrás nincs meg; név szerint csak forrással.
- A Fehér Ház-i egyezmény angol szövege — a forrásból bemásolni (tervezet, 3. blokk 4. pont).
- Az ExploitGym-feladatok megoldhatatlansága szándékos volt-e — a jelentésekben ellenőrizni.
- A „Mi történt?” dia „több mint 70 000 üzenet” adata — forrás hiányzik.
- Lubinski ARC-előadásának pontos napja (június 23–25.).
- Gyorsan változó tények (modellnevek, versenyeredmények, szeptemberi események): az előadás előtt frissíteni.
