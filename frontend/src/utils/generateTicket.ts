import jsPDF from 'jspdf';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TicketData {
  _id: string;
  tripId: string;
  tripName: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  date: string;
  status: string;
  createdAt: string;
}

// ─── Colour palette — 3 colours max ──────────────────────────────────────────
//
//  TEAL     → brand primary, header, labels, borders
//  WHITE    → card backgrounds
//  NEUTRAL  → light gray backgrounds, footer
//  TEXT     → near-black for headings / dark gray for body
//  STATUS   → only used for the paid/not-paid badge (red / green / amber)
//
const T = {
  // Brand teal
  teal: [20, 184, 166] as const,   // teal-500
  tealDark: [15, 118, 110] as const,   // teal-700  (header triangle)
  tealLight: [240, 253, 250] as const,   // teal-50   (stub bg, info box bg)
  tealMid: [153, 234, 228] as const,   // teal-300  (divider, borders)

  // Neutral
  white: [255, 255, 255] as const,
  gray50: [248, 250, 252] as const,   // footer bg
  gray200: [226, 232, 240] as const,   // subtle borders
  gray400: [148, 163, 184] as const,   // muted text / dashes

  // Text
  textDark: [15, 23, 42] as const,   // slate-900  headings
  textMid: [51, 65, 85] as const,   // slate-700  body
  textLight: [100, 116, 139] as const,   // slate-500  sub-labels

  // Status (accent — used ONLY for the status badge)
  greenBg: [220, 252, 231] as const,
  greenBorder: [134, 239, 172] as const,
  greenText: [22, 163, 74] as const,
  redBg: [254, 226, 226] as const,
  redBorder: [252, 165, 165] as const,
  redText: [220, 38, 38] as const,
  amberBg: [254, 243, 199] as const,
  amberBorder: [252, 211, 77] as const,
  amberText: [161, 98, 7] as const,
};

// ─── Status config ────────────────────────────────────────────────────────────

function statusCfg(status: string) {
  switch (status) {
    case 'Paid':
      return { bg: T.greenBg, border: T.greenBorder, text: T.greenText, label: 'PAID' };
    case 'Pending':
      return { bg: T.amberBg, border: T.amberBorder, text: T.amberText, label: 'PENDING' };
    default:
      return { bg: T.redBg, border: T.redBorder, text: T.redText, label: 'NOT PAID' };
  }
}

// ─── Mini helpers ─────────────────────────────────────────────────────────────

const f = (doc: jsPDF, c: readonly [number, number, number]) =>
  doc.setFillColor(c[0], c[1], c[2]);
const d = (doc: jsPDF, c: readonly [number, number, number]) =>
  doc.setDrawColor(c[0], c[1], c[2]);
const t = (doc: jsPDF, c: readonly [number, number, number]) =>
  doc.setTextColor(c[0], c[1], c[2]);

function trunc(s: string, max: number): string {
  if (!s) return 'N/A';
  return s.length > max ? s.substring(0, max - 1) + '.' : s;
}

function fmtDateTime(iso: string): string {
  if (!iso) return 'N/A';
  try {
    const date = new Date(iso);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })
      + ' at '
      + date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
  } catch { return iso; }
}

function bookingId(id: string): string {
  return 'TL-' + id.slice(-8).toUpperCase();
}

async function fetchLogo(): Promise<string | null> {
  try {
    const res = await fetch('/images/traveland.png');
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(r.result as string);
      r.onerror = reject;
      r.readAsDataURL(blob);
    });
  } catch { return null; }
}

/** Draw a status badge at (x, y). Returns badge width so caller can position it. */
function drawBadge(
  doc: jsPDF,
  label: string,
  cfg: ReturnType<typeof statusCfg>,
  cx: number,   // centre x
  cy: number,   // centre y
  w = 36,
  h = 10,
) {
  const bx = cx - w / 2;
  const by = cy - h / 2;
  f(doc, cfg.bg);
  doc.roundedRect(bx, by, w, h, 2.5, 2.5, 'F');
  d(doc, cfg.border);
  doc.setLineWidth(0.35);
  doc.roundedRect(bx, by, w, h, 2.5, 2.5, 'S');
  doc.setFont('helvetica', 'bold').setFontSize(7.5);
  t(doc, cfg.text);
  doc.text(label, cx, cy + 2.7, { align: 'center' });
}

// ─── Core builder (reused by both download & email) ─────────────────────────

async function buildTicketDoc(raw: TicketData): Promise<{ doc: jsPDF; bid: string }> {
  const data: TicketData = {
    _id: raw._id || 'unknown',
    tripId: raw.tripId || '',
    tripName: raw.tripName || 'Unknown Trip',
    customerName: raw.customerName || 'Guest',
    customerEmail: raw.customerEmail || 'N/A',
    customerPhone: raw.customerPhone || 'N/A',
    date: raw.date || 'TBD',
    status: raw.status || 'Not Paid',
    createdAt: raw.createdAt || new Date().toISOString(),
  };

  const bid = bookingId(data._id);
  const stat = statusCfg(data.status);
  const logo = await fetchLogo();

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const PW = 210;
  const PH = 297;

  // ════════════════════════════════════════════════════════
  //  PAGE BACKGROUND — clean white
  // ════════════════════════════════════════════════════════
  f(doc, T.white);
  doc.rect(0, 0, PW, PH, 'F');

  // ════════════════════════════════════════════════════════
  //  HEADER — solid teal, 56 mm tall
  //  No orange bar. Teal flows directly into the white card.
  // ════════════════════════════════════════════════════════
  f(doc, T.teal);
  doc.rect(0, 0, PW, 56, 'F');

  // Darker teal triangle — subtle depth, same hue family
  doc.setFillColor(T.tealDark[0], T.tealDark[1], T.tealDark[2]);
  doc.lines([[140, 0], [-140, 56], [0, -56]], 0, 0, [1, 1], 'F', true);

  // ── Logo ─────────────────────────────────────────────────
  if (logo) {
    try { doc.addImage(logo, 'PNG', 8, 7, 42, 42); }
    catch {
      doc.setFont('helvetica', 'bold').setFontSize(20);
      t(doc, T.white);
      doc.text('Traveland', 12, 34);
    }
  } else {
    doc.setFont('helvetica', 'bold').setFontSize(20);
    t(doc, T.white);
    doc.text('Traveland', 12, 34);
  }

  // ── Title & subtitle ─────────────────────────────────────
  doc.setFont('helvetica', 'bold').setFontSize(21);
  t(doc, T.white);
  doc.text('RESERVATION CONFIRMATION', PW / 2, 22, { align: 'center' });

  doc.setFont('helvetica', 'normal').setFontSize(8.5);
  doc.setTextColor(210, 245, 240);
  doc.text("traveland.tn  |  Tunisia's Premier Travel Experience", PW / 2, 31, { align: 'center' });

  // ── Booking ID pill ───────────────────────────────────────
  const pillX = PW - 64;
  doc.setFillColor(15, 118, 110);           // teal-700 — same palette, darker shade
  doc.roundedRect(pillX, 37, 56, 15, 3, 3, 'F');
  d(doc, T.tealMid);
  doc.setLineWidth(0.4);
  doc.roundedRect(pillX, 37, 56, 15, 3, 3, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(6.5);
  doc.setTextColor(180, 240, 235);
  doc.text('BOOKING ID', pillX + 28, 43, { align: 'center' });

  doc.setFont('helvetica', 'bold').setFontSize(11);
  t(doc, T.white);
  doc.text(bid, pillX + 28, 50, { align: 'center' });

  // ════════════════════════════════════════════════════════
  //  MAIN CARD — white, with a teal left accent border
  // ════════════════════════════════════════════════════════
  const CX = 12;
  const CY = 62;
  const CW = PW - 24;

  // Teal left border accent
  f(doc, T.teal);
  doc.roundedRect(CX, CY, 3, 120, 1.5, 1.5, 'F');

  // White card body
  f(doc, T.white);
  doc.roundedRect(CX + 3, CY, CW - 3, 120, 0, 0, 'F');

  // Subtle card border
  d(doc, T.gray200);
  doc.setLineWidth(0.3);
  doc.roundedRect(CX, CY, CW, 120, 2, 2, 'S');

  // ── Customer name ─────────────────────────────────────────
  const nameY = CY + 16;
  doc.setFont('helvetica', 'bold').setFontSize(19);
  t(doc, T.textDark);
  doc.text(trunc(data.customerName, 30), CX + 12, nameY);

  // Status badge — right-aligned beside name
  drawBadge(doc, stat.label, stat, CX + CW - 30, nameY - 4, 40, 11);

  // Thin teal divider below name
  d(doc, T.tealMid);
  doc.setLineWidth(0.4);
  doc.line(CX + 12, nameY + 5, CX + CW - 12, nameY + 5);

  // ── Details grid ─────────────────────────────────────────
  const L1 = CX + 12;
  const L2 = CX + CW / 2 + 4;
  const ROW_H = 22;
  let Y = nameY + 17;

  function field(label: string, value: string, x: number, y: number, maxLen = 32) {
    doc.setFont('helvetica', 'bold').setFontSize(6.5);
    t(doc, T.teal);
    doc.text(label, x, y);
    doc.setFont('helvetica', 'normal').setFontSize(10);
    t(doc, T.textMid);
    doc.text(trunc(value, maxLen), x, y + 7);
  }

  // Row 1
  field('TRIP / EXPERIENCE', data.tripName, L1, Y);
  field('TRIP DATE', data.date, L2, Y);
  Y += ROW_H;

  // Row 2
  field('EMAIL ADDRESS', data.customerEmail, L1, Y);
  field('WHATSAPP / PHONE', data.customerPhone, L2, Y);
  Y += ROW_H;

  // Row 3
  field('BOOKING DATE & TIME', fmtDateTime(data.createdAt), L1, Y, 36);
  field('PAYMENT STATUS', data.status, L2, Y);
  Y += ROW_H;

  // Row 4 (full width)
  field('BOOKING REFERENCE', bid, L1, Y);

  // ════════════════════════════════════════════════════════
  //  TEAR LINE
  // ════════════════════════════════════════════════════════
  const TY = CY + 120 + 8;

  // Small notch circles at both edges
  f(doc, T.gray200);
  doc.circle(CX - 3, TY, 4, 'F');
  doc.circle(CX + CW + 3, TY, 4, 'F');

  // Dashed rule
  d(doc, T.gray400);
  doc.setLineWidth(0.35);
  for (let x = CX + 4; x < CX + CW - 4; x += 6) {
    doc.line(x, TY, x + 3.5, TY);
  }

  // ════════════════════════════════════════════════════════
  //  STUB — light teal background (same hue as header, very pale)
  //  Consistent with the header colour family, not dark navy.
  // ════════════════════════════════════════════════════════
  const SY = TY + 6;
  const SH = 36;

  f(doc, T.tealLight);
  doc.roundedRect(CX, SY, CW, SH, 3, 3, 'F');
  d(doc, T.tealMid);
  doc.setLineWidth(0.35);
  doc.roundedRect(CX, SY, CW, SH, 3, 3, 'S');

  // Teal left accent on stub
  f(doc, T.teal);
  doc.roundedRect(CX, SY, 3, SH, 1.5, 1.5, 'F');

  // Trip name
  doc.setFont('helvetica', 'bold').setFontSize(13);
  t(doc, T.textDark);
  doc.text(trunc(data.tripName, 32), CX + 12, SY + 13);

  // Date & booking time
  doc.setFont('helvetica', 'normal').setFontSize(8.5);
  t(doc, T.textLight);
  doc.text('Departure:  ' + data.date, CX + 12, SY + 22);
  doc.text('Booked:  ' + fmtDateTime(data.createdAt), CX + 12, SY + 29);

  // Booking ID right side
  doc.setFont('helvetica', 'bold').setFontSize(10);
  t(doc, T.tealDark);
  doc.text(bid, CX + CW - 12, SY + 13, { align: 'right' });

  // Same status badge — identical component as above
  drawBadge(doc, stat.label, stat, CX + CW - 28, SY + 25, 36, 10);

  // ════════════════════════════════════════════════════════
  //  INFO BOX — teal-50 bg, teal border
  // ════════════════════════════════════════════════════════
  const IY = SY + SH + 10;

  f(doc, T.tealLight);
  doc.roundedRect(CX, IY, CW, 24, 3, 3, 'F');
  d(doc, T.tealMid);
  doc.setLineWidth(0.35);
  doc.roundedRect(CX, IY, CW, 24, 3, 3, 'S');

  doc.setFont('helvetica', 'bold').setFontSize(7);
  t(doc, T.teal);
  doc.text('IMPORTANT INFORMATION', CX + 10, IY + 8);

  doc.setFont('helvetica', 'normal').setFontSize(8);
  t(doc, T.textMid);
  doc.text('Reservations are confirmed upon payment and are non-refundable, with a 100% cancellation fee applying in all cases.', CX + 10, IY + 15);
  doc.text('For assistance contact us on whatsapp:+216 26 081 639  | benfrajfahmi8@gmail.com ', CX + 10, IY + 21);

  // ════════════════════════════════════════════════════════
  //  FOOTER — calm light gray, dark text
  // ════════════════════════════════════════════════════════
  // ════════════════════════════════════════════════════════
  //  FOOTER — calm light gray, dark text
  // ════════════════════════════════════════════════════════
  const FY = PH - 28;

  f(doc, T.gray50);
  doc.rect(0, FY, PW, 30, 'F');

  // Use normal weight to reduce letter-spacing/width compared to bold
  doc.setFont('helvetica', 'normal').setFontSize(8.5);
  t(doc, T.tealDark);

  // Use ASCII hyphen instead of em-dash to prevent garbled text
  const welcomeText = 'Traveland & AIESEC Hadrumet are delighted to welcome you to Tunisia - explore boldly, connect deeply, and let every journey become a story worth telling.';

  // Wrap text to fit within page margins (16mm padding on each side)
  const welcomeLines = doc.splitTextToSize(welcomeText, PW - 32);
  doc.text(welcomeLines, PW / 2, FY + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal').setFontSize(7);
  t(doc, T.textLight);
  doc.text(
    `(c) ${new Date().getFullYear()} traveland.tn |  All rights reserved.`,
    PW / 2, FY + 22, { align: 'center' }
  );

  return { doc, bid };
}

// ─── Download PDF ─────────────────────────────────────────────────────────────
export async function generateReservationTicket(raw: TicketData): Promise<void> {
  const { doc, bid } = await buildTicketDoc(raw);
  doc.save(`Traveland-Ticket-${bid}.pdf`);
}

// ─── Get base64 data URI (used for email attachment) ─────────────────────────
export async function getReservationTicketBase64(raw: TicketData): Promise<string> {
  const { doc } = await buildTicketDoc(raw);
  return doc.output('datauristring');
}
