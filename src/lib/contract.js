// Het koopcontract van de fokkerij als nette PDF, met logo en ingevulde
// gegevens. De tekst volgt het papieren contract dat tot nu toe met de hand
// werd ingevuld; alleen de opmaak is verzorgder.

import jsPDF from 'jspdf';

const M = 20;            // marge links/rechts
const REGEL = 5.2;       // regelhoogte in de lopende tekst

const nlDate = (d) => {
  if (!d) return '';
  const date = new Date(d);
  return isNaN(date) ? '' : date.toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' });
};

const euro = (n) =>
  (n === null || n === undefined || n === '') ? '' :
  new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(Number(n));

const klantnummer = (n) => (n ? `KL-${String(n).padStart(4, '0')}` : '—');

/** Laad het logo als data-URL, zodat jsPDF het kan plaatsen. */
async function loadLogo(src = '/logo.png') {
  try {
    const res = await fetch(src);
    if (!res.ok) return null;
    const blob = await res.blob();
    return await new Promise((resolve) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result);
      fr.onerror = () => resolve(null);
      fr.readAsDataURL(blob);
    });
  } catch { return null; }
}

export async function buildPurchaseContract({
  cat = {}, litter = null, customer = null, fokkerij = {}, verkoop = {}, species = 'katten',
}) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = pdf.internal.pageSize.getWidth();
  const H = pdf.internal.pageSize.getHeight();
  const logo = await loadLogo();

  let y = 0;

  // ---------- Hulpjes ----------
  const nieuwePagina = () => { pdf.addPage(); y = 22; };
  const ruimte = (nodig = 10) => { if (y + nodig > H - 22) nieuwePagina(); };

  const alinea = (tekst, { grootte = 9.5, stijl = 'normal', inspringen = 0, na = 3 } = {}) => {
    pdf.setFont('helvetica', stijl);
    pdf.setFontSize(grootte);
    pdf.setTextColor(30, 30, 30);
    const breedte = W - M * 2 - inspringen;
    const regels = pdf.splitTextToSize(tekst, breedte);
    for (const r of regels) {
      ruimte(REGEL);
      pdf.text(r, M + inspringen, y);
      y += REGEL;
    }
    y += na;
  };

  const kop = (tekst) => {
    ruimte(14);
    y += 2;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10.5);
    pdf.setTextColor(36, 64, 46);
    pdf.text(tekst, M, y);
    y += 6;
    pdf.setTextColor(30, 30, 30);
  };

  // Een ingevuld gegeven: label grijs, waarde zwart, met stippellijn eronder
  // als er niets is ingevuld (dan kun je het met de pen aanvullen).
  const veld = (label, waarde, x, breedte) => {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8.5);
    pdf.setTextColor(115, 115, 115);
    pdf.text(label, x, y);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor(25, 25, 25);
    const v = (waarde ?? '').toString();
    if (v) {
      pdf.text(v, x, y + 5.5);
    } else {
      pdf.setDrawColor(190, 190, 190);
      pdf.setLineDashPattern([0.7, 0.7], 0);
      pdf.line(x, y + 5.5, x + breedte - 4, y + 5.5);
      pdf.setLineDashPattern([], 0);
    }
  };

  const veldRij = (velden) => {
    ruimte(14);
    const kolom = (W - M * 2) / velden.length;
    velden.forEach((f, i) => veld(f[0], f[1], M + i * kolom, kolom));
    y += 12;
  };

  // ---------- Briefhoofd ----------
  pdf.setFillColor(36, 64, 46);
  pdf.rect(0, 0, W, 34, 'F');

  if (logo) {
    // Logo is 1024x558; op 20 mm breed wordt dat ruim 10 mm hoog.
    try { pdf.addImage(logo, 'PNG', M, 8, 20, 10.9); } catch {}
  }

  pdf.setTextColor(253, 253, 251);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(14);
  pdf.text(fokkerij.name || "Wendy's Dream", logo ? M + 25 : M, 15);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(215, 225, 218);
  pdf.text(fokkerij.subtitle || 'Maine Coon Cattery', logo ? M + 25 : M, 20.5);

  pdf.setFontSize(13);
  pdf.setFont('helvetica', 'bold');
  pdf.setTextColor(253, 253, 251);
  pdf.text('Koopovereenkomst', W - M, 15, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8.5);
  pdf.setTextColor(215, 225, 218);
  pdf.text(`Klantnummer ${klantnummer(customer?.customer_no)}`, W - M, 20.5, { align: 'right' });

  y = 45;

  // ---------- Openingsregels ----------
  alinea(`Overeenkomst in tweevoud opgesteld op ${nlDate(verkoop.contractdatum) || '……………………'}.`, { na: 1 });
  alinea(`Verkocht als ${verkoop.verkocht_als || 'huisdier'}.`, { na: 4 });

  // ---------- Bedragen ----------
  kop('Prijs en betaling');
  veldRij([
    ['Prijs kitten', euro(verkoop.prijs)],
    ['Aanbetaald', euro(verkoop.aanbetaling)],
    ['Resterend bij levering', euro(verkoop.restbedrag)],
  ]);

  // ---------- Het kitten ----------
  kop('Gegevens kitten');
  veldRij([
    ['Naam', cat.name],
    ['Geboortedatum', nlDate(cat.date_of_birth || litter?.date_of_birth)],
  ]);
  veldRij([
    ['Geslacht', cat.gender || cat.sex],
    ['Kleur', [cat.color, cat.pattern].filter(Boolean).join(' ') || cat.ems_code],
    ['Gewicht bij overdracht', verkoop.gewicht ? `${verkoop.gewicht} gram` : ''],
  ]);
  veldRij([
    ['Chipnummer', cat.chip_number || cat.chip_no],
    ['Stamboomnummer', cat.registration_no],
  ]);
  if (litter?.sire_name || litter?.dam_name) {
    veldRij([
      ['Vader', litter.sire_name],
      ['Moeder', litter.dam_name],
    ]);
  }

  alinea('Onze kittens zijn in het bezit van twee vaccinaties en een ID-chip.', { na: 5 });

  // ---------- Voorwaarden ----------
  kop('Voorwaarden nieuwe eigenaar');
  const voorwaarden = [
    'Het kitten krijgt alle zorg en liefde die hij of zij maar wenst.',
    'Het kitten mag enkel beschermd buiten lopen en nooit los op straat.',
    'Men neemt de volledige zorg over en wij zien het liefst dat het kitten bij een huisdierenverzekering ondergebracht wordt.',
    `De gezondheid van het kitten staat vermeld in het boekje. De nieuwe eigenaar dient binnen vijf werkdagen een verklaring van de eigen dierenarts bij ons in te dienen dat het kitten geheel in goede gezondheid is. Dit kan per e-mail naar ${fokkerij.email || 'Wammes37@ziggo.nl'}.`,
  ];
  voorwaarden.forEach((t, i) => {
    ruimte(REGEL * 3);
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9.5);
    pdf.text(`${i + 1}.`, M, y);
    alinea(t, { inspringen: 6, na: 2.5 });
  });

  alinea(
    'Men gaat direct naar een dierenarts als men denkt dat het kitten ziek wordt. Ook wordt dit dezelfde dag aan de fokker doorgegeven en wordt de fokker volledig op de hoogte gebracht. Dit doet men tot de dag dat de garantie verloopt; de garantie gaat zes maanden in vanaf de dag dat het kitten verhuist.',
    { na: 5 }
  );

  // ---------- Pagina 2 ----------
  nieuwePagina();

  kop('Garanties');
  alinea('Een garantie houdt het volgende in. Wanneer een kitten komt te overlijden door een erfelijke afwijking waarvan de ouders vrij zijn, kan men een ander kitten krijgen uit een volgend nest dat bij ons geboren wordt. Er kunnen geen dierenartskosten bij ons geclaimd worden.');

  kop('Verzekering');
  alinea('Wilt u niet voor verrassingen komen te staan, dan adviseren wij u een goede huisdierenverzekering (bijvoorbeeld OHRA). Deze kan de dierenartskosten tot maximaal 80% dekken. Houd er rekening mee dat uw kat in zijn groeiperiode niet te hoog klimt en springt: dit kan zorgen voor acute verstuikingen en kniebandletsel. Koppen en kommen bij katten zijn op een leeftijd van 1,5 jaar volgroeid.');

  kop('Voeding');
  alinea('Onze katten worden gevoed met droogvoeding van Royal Canin. Wij leggen u uit welke variant u moet geven.');

  kop('Castratie en sterilisatie');
  alinea('Een kitten wordt vrijwel altijd als liefhebbersdier verkocht. Men mag dus niet met de kat fokken. Sterilisatie van een poes dient te geschieden vanaf een leeftijd van zes maanden, een kater vanaf acht maanden en bij eerder sproeigedrag eerder. Men brengt de fokker op de hoogte met een verklaring van uw dierenarts dat de kat onvruchtbaar gemaakt is.');

  // ---------- Partijen ----------
  y += 4;
  kop('Gegevens partijen');
  alinea('Naam en achternaam in blokletters en handtekening door beide partijen te tekenen.', { grootte: 8.5, na: 6 });

  const kolomBreedte = (W - M * 2) / 2;
  const startY = y;

  const partij = (x, titel, regels) => {
    let ly = startY;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(36, 64, 46);
    pdf.text(titel, x, ly);
    ly += 6;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(30, 30, 30);
    for (const r of regels.filter(Boolean)) {
      pdf.text(String(r), x, ly);
      ly += 5;
    }
    return ly;
  };

  const linksEind = partij(M, 'Fokker', [
    fokkerij.owner || 'Willem de Graaf',
    fokkerij.street || 'Henriette Bosmansstraat 13',
    fokkerij.city || '4207 JA  Gorinchem',
    fokkerij.email || 'Wammes37@ziggo.nl',
    fokkerij.phone || 'Tel 0645070868',
  ]);

  const rechtsEind = partij(M + kolomBreedte, 'Nieuwe eigenaar', [
    customer?.name,
    ...(customer?.address ? String(customer.address).split('\n') : []),
    customer?.email,
    customer?.whatsapp_number,
    customer?.customer_no ? `Klantnummer ${klantnummer(customer.customer_no)}` : null,
  ]);

  y = Math.max(linksEind, rechtsEind) + 16;

  // ---------- Handtekeningen ----------
  ruimte(30);
  pdf.setDrawColor(150, 150, 150);
  pdf.line(M, y, M + kolomBreedte - 12, y);
  pdf.line(M + kolomBreedte, y, M + kolomBreedte * 2 - 4, y);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text('Handtekening fokker', M, y + 4.5);
  pdf.text('Handtekening nieuwe eigenaar', M + kolomBreedte, y + 4.5);

  // ---------- Voettekst op elke pagina ----------
  const paginas = pdf.internal.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    pdf.setPage(i);
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(7.5);
    pdf.setTextColor(150, 150, 150);
    pdf.text(`${fokkerij.name || "Wendy's Dream"} — koopovereenkomst${cat.name ? ` ${cat.name}` : ''}`, M, H - 10);
    pdf.text(`Pagina ${i} van ${paginas}`, W - M, H - 10, { align: 'right' });
  }

  return pdf;
}

/** Maak het contract en bied het meteen aan als download. */
export async function downloadPurchaseContract(opts) {
  const pdf = await buildPurchaseContract(opts);
  const naam = (opts.cat?.name || 'kitten').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  pdf.save(`koopovereenkomst-${naam}.pdf`);
}

/** Maak het contract en geef het als bestand terug, om te bewaren bij het dier. */
export async function purchaseContractFile(opts) {
  const pdf = await buildPurchaseContract(opts);
  const naam = (opts.cat?.name || 'kitten').toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const blob = pdf.output('blob');
  return new File([blob], `koopovereenkomst-${naam}.pdf`, { type: 'application/pdf' });
}

export { klantnummer };
