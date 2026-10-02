#!/usr/bin/env python3
"""A vázlat telefonos olvasója.

Bemenet:  tervezet/eloadas-tervezet.md  (a „<!-- dia: Cím -->” jelölőkkel)
          eloadas/index.html            (a diák címe, sorrendje és címszavai)
Kimenet:  eloadas/vazlat.html           (egyetlen, internet nélkül is működő fájl)

A vázlat részei a jelölők szerint a diákhoz kerülnek, és diasorrendben jelennek meg;
minden dia új oldalon kezdődik. Futtatás a repó gyökeréből:  python3 eszkozok/olvaso.py
"""
import html
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MD = ROOT / 'tervezet' / 'eloadas-tervezet.md'
DECK = ROOT / 'eloadas' / 'index.html'
OUT = ROOT / 'eloadas' / 'vazlat.html'


# ---------- a diák ----------
def clean(t):
    t = re.sub(r'<br\s*/?>', ' ', t)
    return re.sub(r'\s+', ' ', html.unescape(re.sub(r'<[^>]+>', ' ', t))).strip()


def read_slides():
    src = re.sub(r'<!--.*?-->', '', DECK.read_text(encoding='utf-8'), flags=re.S)
    slides = []
    for s in re.findall(r'<section class="slide[^"]*"[^>]*>.*?</section>', src, re.S):
        m = re.search(r'<h2>(.*?)</h2>|<p class="big">(.*?)</p>|<h1>(.*?)</h1>|<cite>(.*?)</cite>', s, re.S)
        title = clean(next(g for g in m.groups() if g)) if m else ''
        block = re.search(r'data-block="([^"]*)"', s)
        items = [clean(x) for x in re.findall(r'<li[^>]*>(.*?)</li>', s, re.S)]
        q = re.search(r'<p class="q">(.*?)</p>', s, re.S)
        sub = re.search(r'<p class="sub">(.*?)</p>', s, re.S)
        verse = re.search(r'<blockquote>(.*?)<cite>', s, re.S)
        extra = []
        if sub: extra.append(clean(sub.group(1)))
        if verse: extra.append(clean(verse.group(1)))
        if q: extra.append('Kérdés a gombon: ' + clean(q.group(1)))
        if 'class="dani' in s:
            who = re.search(r'data-who="([^"]*)"', s)
            quote = re.search(r'<blockquote class="dani[^"]*"[^>]*>(.*?)</blockquote>', s, re.S)
            if quote: extra.append(f'{who.group(1) if who else "Idézet"}: „{clean(quote.group(1))}”')
        if '<div class="qa">' in s or 'class="qa"' in s: extra.append('Claude-válasz gombbal.')
        slides.append({'title': title, 'block': block.group(1) if block else '', 'items': items, 'extra': extra})
    return slides


# ---------- Markdown → HTML (a vázlatban használt elemekre szabva) ----------
def inline(t):
    t = html.escape(t, quote=False)
    t = re.sub(r'\[([^\]]+)\]\(([^)]+)\)', r'<a href="\2" target="_blank" rel="noopener">\1</a>', t)
    t = re.sub(r'`([^`]+)`', r'<code>\1</code>', t)
    t = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', t)
    t = re.sub(r'(?<![\w*])\*(?!\s)(.+?)(?<!\s)\*(?![\w*])', r'<em>\1</em>', t)
    return t.replace('⚠', '<span class="warn">⚠</span>')


def md_block(line):
    if not line.strip() or line.startswith('|'):
        return ''
    m = re.match(r'^(#{2,4}) (.*)$', line)
    if m:
        lvl = len(m.group(1))
        return f'<h{lvl}>{inline(m.group(2))}</h{lvl}>'
    m = re.match(r'^(\s*)- (.*)$', line)
    if m:
        return f'<p class="li{" li2" if m.group(1) else ""}">{inline(m.group(2))}</p>'
    m = re.match(r'^(\d+)\. (.*)$', line)
    if m:
        return f'<p class="ol"><span class="n">{m.group(1)}.</span> {inline(m.group(2))}</p>'
    m = re.match(r'^ {3}(.*)$', line)
    if m:
        return f'<p class="ol cont">{inline(m.group(1))}</p>'
    m = re.match(r'^> ?(.*)$', line)
    if m:
        q = re.sub(r'^- ', '– ', m.group(1))
        return f'<blockquote><p>{inline(q)}</p></blockquote>' if q.strip() else ''
    cls = ''
    if line.startswith('**Claude (dián)'): cls = 'claude'
    elif line.startswith(('**Teológiai kapocs', '**Ige.', '**A felelősség', '**A tükör-metafora')): cls = 'teol'
    elif line.startswith('**Háttér'): cls = 'hatter'
    return f'<p class="{cls}">{inline(line)}</p>' if cls else f'<p>{inline(line)}</p>'


def build():
    slides = read_slides()
    index = {s['title']: i for i, s in enumerate(slides)}
    chunks = {i: [] for i in range(len(slides))}
    front, appendix, current = [], [], None
    title_line, subtitle = '', ''
    for raw in MD.read_text(encoding='utf-8').split('\n'):
        line = raw.rstrip()
        m = re.match(r'^<!-- dia: (.*) -->$', line)
        if m:
            t = m.group(1)
            if t == 'FÜGGELÉK': current = 'app'
            elif t in index: current = index[t]
            else: raise SystemExit(f'Ismeretlen dia a jelölőben: {t}')
            continue
        if line.startswith('<!--'): continue
        if line.startswith('# '): title_line = line[2:]; continue
        if current is None:
            if line.startswith('*') and not subtitle and not line.startswith('**'): subtitle = line.strip('*'); continue
            if line.startswith('## Áttekintés') or line.startswith('- **') or line.startswith('Összesen'): continue
            front.append(md_block(line))
        elif current == 'app':
            appendix.append(md_block(line))
        else:
            chunks[current].append(md_block(line))

    blocks_seen = set()
    pages = []
    for i, s in enumerate(slides):
        body = ''.join(x for x in chunks[i] if x).replace('</p></blockquote><blockquote><p>', '</p><p>')  # egymás utáni idézetsorok egy blokkban
        dia = ''.join(f'<li>{html.escape(x)}</li>' for x in s['items'])
        extra = ''.join(f'<p>{html.escape(x)}</p>' for x in s['extra'])
        head = ''
        if s['block'] and s['block'] not in blocks_seen:
            blocks_seen.add(s['block'])
            head = f'<p class="blk">{html.escape(s["block"])}</p>'
        onslide = f'<div class="onslide"><p class="lbl">A dián</p><p class="st">{html.escape(s["title"])}</p>{extra}{"<ul>" + dia + "</ul>" if dia else ""}</div>'
        if not body:
            body = '<p class="empty">Ehhez a diához nincs külön szöveg a vázlatban.</p>'
        pages.append(f'<section class="dia" data-n="{i + 1}" id="d{i + 1}">{head}{onslide}{body}</section>')

    meta = [{'n': i + 1, 't': s['title'], 'b': s['block']} for i, s in enumerate(slides)]
    front_html = (f'<section class="dia front" data-n="0" id="d0"><h1>{inline(title_line)}</h1>'
                  f'<p class="subt">{inline(subtitle)}</p>{"".join(x for x in front if x)}'
                  '<p class="how">Lapozás: húzd oldalra, vagy koppints a képernyő jobb / bal szélére. '
                  'Felül mindig látszik, melyik diánál tartasz; új dián a sáv felvillan.</p></section>')
    app_body = ''.join(x for x in appendix if x)
    app_html = f'<section class="dia app" data-n="-1" id="dapp">{app_body}</section>' if app_body else ''
    tpl = (Path(__file__).resolve().parent / 'olvaso_sablon.html').read_text(encoding='utf-8')
    out = (tpl.replace('/*__META__*/', json.dumps(meta, ensure_ascii=False))
              .replace('<!--__BODY__-->', front_html + ''.join(pages) + app_html)
              .replace('__TITLE__', html.escape(title_line)))
    OUT.write_text(out, encoding='utf-8')
    print(f'kész: {OUT.relative_to(ROOT)} — {len(slides)} dia')


if __name__ == '__main__':
    build()
