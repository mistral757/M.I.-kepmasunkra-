// A vázlat (Markdown) → Word. Egyszerű, a vázlatban használt elemekre szabott átalakító.
// Futtatás a repó gyökeréből:  NODE_PATH=$(npm root -g) node eszkozok/word.js tervezet/eloadas-tervezet.md tervezet/eloadas-vazlat.docx
// (a „docx” npm-csomag kell hozzá). A „<!-- dia: … -->” jelölők kimaradnak.
const fs = require('fs');
const D = require('docx');
const [,, src, dst] = process.argv;
const md = fs.readFileSync(src, 'utf8').split('\n');

// soron belüli formázás: **félkövér**, *dőlt*, `kód`, [szöveg](url)
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  let last = 0, m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new D.TextRun({ text: text.slice(last, m.index), ...base }));
    const t = m[0];
    if (t.startsWith('**')) out.push(...runs(t.slice(2, -2), { ...base, bold: true }));
    else if (t.startsWith('*')) out.push(...runs(t.slice(1, -1), { ...base, italics: true }));
    else if (t.startsWith('`')) out.push(new D.TextRun({ text: t.slice(1, -1), font: 'Consolas', ...base }));
    else {
      const [, label, url] = t.match(/\[([^\]]+)\]\(([^)]+)\)/);
      out.push(new D.ExternalHyperlink({ link: url, children: [new D.TextRun({ text: label, style: 'Hyperlink', ...base })] }));
    }
    last = re.lastIndex;
  }
  if (last < text.length) out.push(new D.TextRun({ text: text.slice(last), ...base }));
  return out;
}

const children = [];
let tableRows = null;
const flushTable = () => {
  if (!tableRows) return;
  const widths = [1700, 4660, 3000];
  children.push(new D.Table({
    width: { size: 9360, type: D.WidthType.DXA }, columnWidths: widths,
    rows: tableRows.map((cells, r) => new D.TableRow({ children: cells.map((c, i) => new D.TableCell({
      width: { size: widths[i], type: D.WidthType.DXA },
      shading: r === 0 ? { type: D.ShadingType.CLEAR, fill: 'E8E4F0', color: 'auto' } : undefined,
      margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new D.Paragraph({ children: runs(c, r === 0 ? { bold: true } : {}) })] })) }))
  }));
  tableRows = null;
};

for (const raw of md) {
  const line = raw.replace(/\s+$/, '');
  if (line.startsWith('|')) {
    if (/^\|[-| ]+\|$/.test(line)) continue;
    (tableRows ||= []).push(line.slice(1, -1).split('|').map(s => s.trim()));
    continue;
  }
  flushTable();
  if (!line.trim()) continue;
  if (line.startsWith('<!--')) continue;            // dia-jelölők (az olvasóhoz)
  let m;
  if ((m = line.match(/^(#{1,4}) (.*)$/))) {
    const lvl = m[1].length;
    const heading = [D.HeadingLevel.TITLE, D.HeadingLevel.HEADING_1, D.HeadingLevel.HEADING_2, D.HeadingLevel.HEADING_3][lvl - 1];
    children.push(new D.Paragraph({ heading, children: runs(m[2]) }));
  } else if ((m = line.match(/^(\s*)- (.*)$/))) {
    children.push(new D.Paragraph({ numbering: { reference: 'bullets', level: m[1].length ? 1 : 0 }, children: runs(m[2]) }));
  } else if ((m = line.match(/^(\d+)\. (.*)$/))) {
    children.push(new D.Paragraph({ numbering: { reference: 'numbers', level: 0 }, children: runs(m[2]) }));
  } else if ((m = line.match(/^ {3}(.*)$/))) {           // számozott pont folytatása
    children.push(new D.Paragraph({ indent: { left: 720 }, children: runs(m[1]) }));
  } else if ((m = line.match(/^> ?(.*)$/))) {
    const text = m[1];
    const quote = { indent: { left: 567 }, border: { left: { style: D.BorderStyle.SINGLE, size: 12, color: '8E7CC3', space: 8 } } };
    if (!text.trim()) continue;
    children.push(new D.Paragraph({ ...quote, children: runs(text.replace(/^- /, '– ')) }));
  } else {
    children.push(new D.Paragraph({ children: runs(line) }));
  }
}
flushTable();

const doc = new D.Document({
  creator: 'Tóth-Gyóllai Dániel',
  title: 'A MI képmásunkra — előadásvázlat',
  styles: {
    default: { document: { run: { font: 'Calibri', size: 22 }, paragraph: { spacing: { after: 120, line: 276 } } } },
    paragraphStyles: [
      { id: 'Title', name: 'Title', basedOn: 'Normal', run: { size: 40, bold: true, color: '29366F' }, paragraph: { spacing: { after: 120 } } },
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 32, bold: true, color: 'B13E53' }, paragraph: { spacing: { before: 360, after: 160 }, outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 26, bold: true, color: '29366F' }, paragraph: { spacing: { before: 240, after: 120 }, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { size: 23, bold: true, color: '333C57' }, paragraph: { spacing: { before: 200, after: 80 }, outlineLevel: 2 } },
    ],
  },
  numbering: { config: [
    { reference: 'bullets', levels: [
      { level: 0, format: D.LevelFormat.BULLET, text: '•', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } },
      { level: 1, format: D.LevelFormat.BULLET, text: '–', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 1440, hanging: 360 } } } } ] },
    { reference: 'numbers', levels: [
      { level: 0, format: D.LevelFormat.DECIMAL, text: '%1.', alignment: D.AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } } ] },
  ] },
  sections: [{ properties: { page: { margin: { top: 1134, bottom: 1134, left: 1247, right: 1247 } } }, children }],
});
D.Packer.toBuffer(doc).then(b => { fs.writeFileSync(dst, b); console.log('ok', dst, b.length); });
