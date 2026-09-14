// PDF's opbouwen uit wat er al in de fokkerij staat. Eén gedeelde opmaak,
// zodat alles wat je meegeeft aan een koper er hetzelfde uitziet.

import jsPDF from 'jspdf';
import { termsFor, sexLabel } from '@/lib/species';

const M = 18; // marge
const cap = (s) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

const nlDate = (d) => {
  if (!d) return '—';
  const date = new Date(d);
  return isNaN(date) ? '—' : date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Basis van elk document: kop met fokkerijnaam, titel en datum.
function startDoc(pdf, { fokkerij, title, subtitle }) {
  const w = pdf.internal.pageSize.getWidth();
  pdf.setFillColor(36, 64, 46); // forest-800
  pdf.rect(0, 0, w, 32, 'F');

  pdf.setTextColor(253, 253, 251);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(15);
  pdf.text(fokkerij || 'Fokkerij', M, 14);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text(title, M, 23);

  pdf.setTextColor(120, 120, 120);
  pdf.setFontSize(8);
  pdf.text(`Aangemaakt op ${nlDate(new Date())}`, w - M, 23, { align: 'right' });

  pdf.setTextColor(28, 20, 15);
  let y = 46;
  if (subtitle) {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(16);
    pdf.text(subtitle, M, y);
    y += 10;
  }
  return y;
}

// Nieuwe bladzijde zodra de inhoud tegen de onderkant loopt.
function ensureRoom(pdf, y, needed = 12) {
  if (y + needed > pdf.internal.pageSize.getHeight() - 18) {
    pdf.addPage();
    return 24;
  }
  return y;
}

function sectionTitle(pdf, y, text) {
  y = ensureRoom(pdf, y, 16);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(36, 64, 46);
  pdf.text(text.toUpperCase(), M, y);
  pdf.setDrawColor(220, 214, 200);
  pdf.line(M, y + 2, pdf.internal.pageSize.getWidth() - M, y + 2);
  pdf.setTextColor(28, 20, 15);
  return y + 9;
}

// Rij met label links en waarde rechts ervan.
function row(pdf, y, label, value) {
  y = ensureRoom(pdf, y);
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(110, 110, 110);
  pdf.text(String(label), M, y);
  pdf.setTextColor(28, 20, 15);
  pdf.setFont('helvetica', 'bold');
  pdf.text(String(value ?? '—'), M + 52, y);
  return y + 6.5;
}

function table(pdf, y, headers, rows, widths) {
  y = ensureRoom(pdf, y, 14);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(8.5);
  pdf.setTextColor(110, 110, 110);
  let x = M;
  headers.forEach((h, i) => { pdf.text(h, x, y); x += widths[i]; });
  y += 4;
  pdf.setDrawColor(228, 222, 210);
  pdf.line(M, y, pdf.internal.pageSize.getWidth() - M, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(28, 20, 15);
  for (const r of rows) {
    y = ensureRoom(pdf, y);
    x = M;
    r.forEach((c, i) => { pdf.text(String(c ?? '—'), x, y); x += widths[i]; });
    y += 6;
  }
  return y + 2;
}

function footer(pdf, fokkerij) {
  const pages = pdf.internal.getNumberOfPages();
  const w = pdf.internal.pageSize.getWidth();
  const h = pdf.internal.pageSize.getHeight();
  for (let i = 1; i <= pages; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text(fokkerij || '', M, h - 10);
    pdf.text(`${i} / ${pages}`, w - M, h - 10, { align: 'right' });
  }
}

const slug = (s) => (s || 'document').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// ---------- De documenten ----------

// 1. Dierpaspoort: één dier, alle kerngegevens op één A4.
export function buildAnimalPassport({ cat, litter, fokkerij, species }) {
  const t = termsFor(species);
  const pdf = new jsPDF();
  let y = startDoc(pdf, { fokkerij, title: `${cap(t.animal)}paspoort`, subtitle: cat.name || 'Naamloos' });

  y = sectionTitle(pdf, y, 'Gegevens');
  y = row(pdf, y, 'Naam', cat.name);
  y = row(pdf, y, 'Geslacht', sexLabel(cat.gender || cat.sex, species));
  y = row(pdf, y, 'Geboortedatum', nlDate(cat.date_of_birth || litter?.date_of_birth));
  y = row(pdf, y, 'Ras', cat.breed);
  y = row(pdf, y, 'Kleur', [cat.color, cat.pattern].filter(Boolean).join(' · '));
  if (cat.ems_code) y = row(pdf, y, 'EMS-code', cat.ems_code);
  y = row(pdf, y, 'Chipnummer', cat.chip_number || cat.chip_no);
  y = row(pdf, y, 'Stamboomnummer', cat.registration_no);
  y += 4;

  if (litter) {
    y = sectionTitle(pdf, y, 'Afstamming');
    y = row(pdf, y, 'Vader', litter.sire_name);
    y = row(pdf, y, 'Moeder', litter.dam_name);
    y = row(pdf, y, cap(t.litter), litter.name);
    y += 4;
  }

  const meds = cat.medical || [];
  if (meds.length) {
    y = sectionTitle(pdf, y, 'Gezondheid');
    y = table(
      pdf, y,
      ['Behandeling', 'Uitgevoerd', 'Volgende keer'],
      meds.map((m) => [m.type, nlDate(m.date), nlDate(m.due)]),
      [70, 50, 50]
    );
  }

  const weights = cat.weights || [];
  if (weights.length) {
    y = sectionTitle(pdf, y, 'Gewicht');
    y = table(
      pdf, y,
      ['Datum', 'Gewicht'],
      weights.map((w) => [nlDate(w.date || w.weigh_date), `${w.grams ?? w.weight_grams} g`]),
      [70, 50]
    );
  }

  footer(pdf, fokkerij);
  pdf.save(`${slug(fokkerij)}-paspoort-${slug(cat.name)}.pdf`);
}

// 2. Gezondheidsoverzicht: alle zorg van één dier, om mee te geven.
export function buildHealthSummary({ cat, fokkerij, species }) {
  const t = termsFor(species);
  const pdf = new jsPDF();
  let y = startDoc(pdf, { fokkerij, title: 'Gezondheidsoverzicht', subtitle: cat.name || 'Naamloos' });

  y = sectionTitle(pdf, y, `Over dit ${t.animal}`);
  y = row(pdf, y, 'Geboortedatum', nlDate(cat.date_of_birth));
  y = row(pdf, y, 'Chipnummer', cat.chip_number || cat.chip_no);
  y += 4;

  const meds = cat.medical || [];
  const gedaan = meds.filter((m) => m.completed || m.date);
  const gepland = meds.filter((m) => m.due && !m.completed);

  y = sectionTitle(pdf, y, 'Uitgevoerd');
  y = gedaan.length
    ? table(pdf, y, ['Behandeling', 'Datum', 'Notitie'], gedaan.map((m) => [m.type, nlDate(m.date), m.note || '—']), [60, 45, 65])
    : row(pdf, y, '', 'Nog niets geregistreerd.');

  y += 4;
  y = sectionTitle(pdf, y, 'Nog gepland');
  y = gepland.length
    ? table(pdf, y, ['Behandeling', 'Nodig op', 'Notitie'], gepland.map((m) => [m.type, nlDate(m.due), m.note || '—']), [60, 45, 65])
    : row(pdf, y, '', 'Niets openstaand.');

  footer(pdf, fokkerij);
  pdf.save(`${slug(fokkerij)}-gezondheid-${slug(cat.name)}.pdf`);
}

// 3. Nestoverzicht: alle jongen van één nestje met hun kerngegevens.
export function buildLitterRecord({ litter, kittens, fokkerij, species }) {
  const t = termsFor(species);
  const pdf = new jsPDF();
  let y = startDoc(pdf, { fokkerij, title: `${cap(t.litter)}overzicht`, subtitle: litter.name });

  y = sectionTitle(pdf, y, 'Gegevens');
  y = row(pdf, y, 'Vader', litter.sire_name);
  y = row(pdf, y, 'Moeder', litter.dam_name);
  y = row(pdf, y, 'Geboortedatum', nlDate(litter.date_of_birth));
  y = row(pdf, y, 'Ras', litter.breed);
  y = row(pdf, y, `Aantal ${t.youngPlural}`, kittens.length);
  y += 4;

  y = sectionTitle(pdf, y, cap(t.youngPlural));
  y = table(
    pdf, y,
    ['Naam', 'Geslacht', 'Kleur', 'Chipnummer', 'Status'],
    kittens.map((k) => [k.name, sexLabel(k.gender || k.sex, species), k.color || '—', k.chip_number || k.chip_no || '—', k.status || '—']),
    [38, 26, 38, 44, 28]
  );

  footer(pdf, fokkerij);
  pdf.save(`${slug(fokkerij)}-${slug(t.litter)}-${slug(litter.name)}.pdf`);
}

// 4. Overdrachtsdocument: wat de koper meekrijgt bij het ophalen.
export function buildHandoverPacket({ cat, litter, customer, fokkerij, species }) {
  const t = termsFor(species);
  const pdf = new jsPDF();
  let y = startDoc(pdf, { fokkerij, title: 'Overdracht', subtitle: cat.name || 'Naamloos' });

  y = sectionTitle(pdf, y, `Het ${t.animal}`);
  y = row(pdf, y, 'Naam', cat.name);
  y = row(pdf, y, 'Geslacht', sexLabel(cat.gender || cat.sex, species));
  y = row(pdf, y, 'Geboortedatum', nlDate(cat.date_of_birth || litter?.date_of_birth));
  y = row(pdf, y, 'Kleur', [cat.color, cat.pattern].filter(Boolean).join(' · '));
  y = row(pdf, y, 'Chipnummer', cat.chip_number || cat.chip_no);
  y = row(pdf, y, 'Stamboomnummer', cat.registration_no);
  y += 4;

  if (litter) {
    y = sectionTitle(pdf, y, 'Ouders');
    y = row(pdf, y, 'Vader', litter.sire_name);
    y = row(pdf, y, 'Moeder', litter.dam_name);
    y += 4;
  }

  if (customer) {
    y = sectionTitle(pdf, y, 'Nieuwe eigenaar');
    y = row(pdf, y, 'Naam', customer.name);
    y = row(pdf, y, 'E-mail', customer.email);
    y = row(pdf, y, 'Telefoon', customer.whatsapp_number);
    if (customer.address) {
      y = ensureRoom(pdf, y, 20);
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(9); pdf.setTextColor(110, 110, 110);
      pdf.text('Adres', M, y);
      pdf.setTextColor(28, 20, 15); pdf.setFont('helvetica', 'bold');
      String(customer.address).split('\n').forEach((line, i) => pdf.text(line, M + 52, y + i * 5.5));
      y += String(customer.address).split('\n').length * 5.5 + 2;
    }
    y += 4;
  }

  const meds = (cat.medical || []).filter((m) => m.completed || m.date);
  if (meds.length) {
    y = sectionTitle(pdf, y, 'Wat er al is gedaan');
    y = table(pdf, y, ['Behandeling', 'Datum'], meds.map((m) => [m.type, nlDate(m.date)]), [80, 60]);
  }

  y += 8;
  y = ensureRoom(pdf, y, 40);
  y = sectionTitle(pdf, y, 'Voor akkoord');
  y += 6;
  pdf.setDrawColor(190, 190, 190);
  pdf.line(M, y + 14, M + 70, y + 14);
  pdf.line(M + 95, y + 14, M + 165, y + 14);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8.5); pdf.setTextColor(120, 120, 120);
  pdf.text('Fokker', M, y + 19);
  pdf.text('Nieuwe eigenaar', M + 95, y + 19);

  footer(pdf, fokkerij);
  pdf.save(`${slug(fokkerij)}-overdracht-${slug(cat.name)}.pdf`);
}

// 5. Klantenlijst: alle kopers met contactgegevens, om te bewaren.
export function buildCustomerList({ customers, kittens, fokkerij }) {
  const pdf = new jsPDF();
  let y = startDoc(pdf, { fokkerij, title: 'Klantenlijst', subtitle: `${customers.length} klanten` });

  y = table(
    pdf, y,
    ['Naam', 'E-mail', 'Telefoon', 'Gekoppeld'],
    customers.map((c) => [
      c.name,
      c.email || '—',
      c.whatsapp_number || '—',
      kittens.filter((k) => k.customer_id === c.id).map((k) => k.name).join(', ') || '—',
    ]),
    [40, 55, 38, 41]
  );

  footer(pdf, fokkerij);
  pdf.save(`${slug(fokkerij)}-klanten.pdf`);
}
