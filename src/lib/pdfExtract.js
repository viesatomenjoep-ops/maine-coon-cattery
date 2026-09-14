// Een PDF uitlezen in de browser en er herkenbare gegevens uit vissen.
// Werkt alleen op PDF's met een tekstlaag (dus uit een computer, geen scan).
// Alles gebeurt op het apparaat zelf — er gaat niets naar een server.

const MONTHS = {
  jan: 1, feb: 2, mrt: 3, maa: 3, apr: 4, mei: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, okt: 10, nov: 11, dec: 12,
};

// pdf.js wordt pas geladen wanneer je daadwerkelijk een PDF inleest,
// zodat de rest van het beheer er niet trager van wordt.
let pdfjsPromise = null;
async function getPdfjs() {
  if (!pdfjsPromise) {
    pdfjsPromise = import('pdfjs-dist').then((lib) => {
      lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
      return lib;
    });
  }
  return pdfjsPromise;
}

/** Haal de platte tekst uit alle pagina's van een PDF-bestand. */
export async function readPdfText(file, { maxPages = 15 } = {}) {
  const pdfjs = await getPdfjs();
  const buffer = await file.arrayBuffer();
  // Opruimen gaat via de laadtaak; het document zelf heeft geen destroy().
  const task = pdfjs.getDocument({ data: buffer });
  try {
    const doc = await task.promise;
    // Het aantal pagina's vastleggen vóór we opruimen.
    const pageCount = doc.numPages;
    const pages = Math.min(pageCount, maxPages);
    const parts = [];
    for (let i = 1; i <= pages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // Losse tekstblokjes met spaties aan elkaar, regels blijven herkenbaar.
      parts.push(content.items.map((it) => it.str).join(' '));
    }
    return { text: parts.join('\n'), pageCount, readPages: pages };
  } finally {
    // Ook bij een fout het geheugen netjes vrijgeven.
    try { await task.destroy(); } catch {}
  }
}

// --- Hulpjes voor het herkennen ---

const norm = (s) => (s || '').replace(/\s+/g, ' ').trim();

// Zoek de tekst die direct achter een label staat.
// Bijv. "Chipnummer: 528140000123456" of "Chipnr  528140000123456".
function afterLabel(text, labels, valuePattern) {
  for (const label of labels) {
    const re = new RegExp(
      `${label}\\s*[:.\\-]?\\s*(${valuePattern})`,
      'i'
    );
    const m = text.match(re);
    if (m) return norm(m[1]);
  }
  return null;
}

/** Zet een gevonden datum om naar het formaat dat de database wil (jjjj-mm-dd). */
export function toIsoDate(raw) {
  if (!raw) return null;
  const s = norm(raw).toLowerCase();

  // 21-06-2026 / 21/06/2026 / 21.06.2026
  let m = s.match(/\b(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})\b/);
  if (m) {
    const [, d, mo, y] = m;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 2026-06-21 (al goed)
  m = s.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
  if (m) {
    const [, y, mo, d] = m;
    return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  // 21 juni 2026 / 21 jun 2026
  m = s.match(/\b(\d{1,2})\s+([a-z]{3,})\s+(\d{4})\b/);
  if (m) {
    const [, d, maand, y] = m;
    const mo = MONTHS[maand.slice(0, 3)];
    if (mo) return `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
  }

  return null;
}

// Een geldig chipnummer is 15 cijfers. Nederlandse beginnen meestal met 528.
const CHIP = '\\d{15}';
const DATE = '\\d{1,2}\\s*[-/.]\\s*\\d{1,2}\\s*[-/.]\\s*\\d{4}|\\d{4}-\\d{1,2}-\\d{1,2}|\\d{1,2}\\s+[a-zA-Z]{3,}\\s+\\d{4}';

/**
 * Vis de gegevens uit de tekst die we betrouwbaar kunnen herkennen.
 * Elk gevonden veld krijgt een zekerheid mee, zodat het scherm eerlijk kan
 * tonen hoe stellig we zijn.
 */
export function findFields(rawText) {
  const text = norm(rawText);
  const found = {};

  // --- Chipnummer ---
  let chip = afterLabel(text, [
    'transpondernummer', 'transponder\\s*nr', 'microchip\\s*nummer', 'microchip',
    'chipnummer', 'chip\\s*nr', 'chipcode', 'chip',
  ], CHIP);
  let chipZeker = chip ? 'hoog' : null;
  if (!chip) {
    // Geen label gevonden: pak een los 15-cijferig getal, maar wees eerlijk
    // dat we minder zeker zijn.
    const loose = text.match(/\b\d{15}\b/g) || [];
    const uniek = [...new Set(loose)];
    if (uniek.length === 1) { chip = uniek[0]; chipZeker = 'middel'; }
  }
  if (chip) found.chip_number = { value: chip, confidence: chipZeker, label: 'Chipnummer' };

  // --- Geboortedatum ---
  const gebRaw = afterLabel(text, [
    'geboortedatum', 'geboren\\s*op', 'geboren', 'date\\s*of\\s*birth', 'dob',
  ], DATE);
  const geb = toIsoDate(gebRaw);
  if (geb) found.date_of_birth = { value: geb, confidence: 'hoog', label: 'Geboortedatum', raw: gebRaw };

  // --- EMS-code (kattenkleurcode, bijv. "MCO n 22") ---
  const ems = afterLabel(text, ['ems\\s*-?\\s*code', 'ems'], '[A-Z]{3}\\s+[a-z]{1,3}(\\s+\\d{2})?(\\s+\\d{2})?')
    || (text.match(/\b(MCO|NFO|SIB|RAG|BRI|PER|BEN)\s+[a-z]{1,3}(\s+\d{2})?(\s+\d{2})?\b/) || [])[0];
  if (ems) found.ems_code = { value: norm(ems), confidence: 'middel', label: 'EMS-code' };

  // --- Stamboomnummer ---
  const reg = afterLabel(text, [
    'stamboomnummer', 'stamboeknummer', 'stamboom\\s*nr', 'registratienummer',
    'registration\\s*number', 'reg\\.?\\s*nr', 'nhsb',
  ], '[A-Z0-9][A-Z0-9\\-/. ]{3,24}');
  if (reg) found.registration_no = { value: reg, confidence: 'middel', label: 'Stamboomnummer' };

  // --- Naam ---
  const naam = afterLabel(text, ['naam\\s*dier', 'naam\\s*van\\s*het\\s*dier', 'roepnaam', 'naam'], "[A-Za-zÀ-ÿ'’\\- ]{2,40}");
  if (naam && naam.length >= 2) found.name = { value: naam, confidence: 'laag', label: 'Naam' };

  // --- Ras ---
  const ras = afterLabel(text, ['ras', 'breed'], "[A-Za-zÀ-ÿ'’\\- ]{3,40}");
  if (ras) found.breed = { value: ras, confidence: 'laag', label: 'Ras' };

  // --- Alle losse datums, handig voor entingen ---
  const alleDatums = [...new Set((text.match(new RegExp(DATE, 'gi')) || [])
    .map(toIsoDate)
    .filter(Boolean))].sort();
  if (alleDatums.length) found._dates = alleDatums;

  return found;
}

/**
 * Raad op basis van de inhoud om wat voor soort document het gaat.
 *
 * Let op de volgorde: een stamboomnummer staat als verwijzing op bijna elk
 * papier, dus daar mogen we niet op afgaan. We kijken eerst naar wat het
 * document *doet* (een uitslag, een enting, een verkoop) en pas daarna naar
 * losse kenmerken.
 */
export function guessDocType(rawText) {
  const t = norm(rawText).toLowerCase();
  const heeft = (...w) => w.some((x) => t.includes(x));

  // 1. Specifieke uitslagen — die zijn het meest eenduidig.
  if (heeft('hcm', 'echocardio', 'cardiolog')) return 'hcm_echo';
  if (heeft('pkd', 'polycystic')) return 'pkd';
  if (heeft('fiv', 'felv')) return 'fiv_felv';

  // 2. Entingen.
  if (heeft('vaccinat', 'enting', 'inenting', 'nobivac', 'entingsboekje', 'tricat')) return 'vaccinatie';

  // 3. Geld en afspraken.
  if (heeft('koopovereenkomst', 'koopcontract', 'overeenkomst')) return 'contract';
  if (heeft('factuur', 'aankoopnota', 'betaalbewijs')) return 'aankoopnota';

  // 4. Stamboom — alleen bij een sterk signaal, níét bij "stamboomnummer".
  if (heeft('stamboomcertificaat', 'stamboombewijs', 'pedigree certificate', 'afstammingsbewijs', 'afstamming')) return 'stamboom';

  // 5. Algemenere aanduidingen.
  if (heeft('dierenarts', 'veterinair', 'kliniek', 'praktijk')) return 'dierenarts';
  if (heeft('paspoort', 'passport')) return 'paspoort';
  if (heeft('transponder', 'chipnummer', 'microchip')) return 'chip';

  return 'overig';
}

/** Alles in één keer: lezen, herkennen en het soort raden. */
export async function scanPdf(file) {
  const { text, pageCount, readPages } = await readPdfText(file);
  const clean = norm(text);
  return {
    text: clean,
    pageCount,
    readPages,
    // Te weinig tekst betekent vrijwel zeker een scan zonder tekstlaag.
    looksScanned: clean.length < 40,
    fields: findFields(clean),
    docType: guessDocType(clean),
  };
}
