import { Stamp, TravelerProfile } from '../types';

/**
 * High-Resolution HTML5 Canvas Exporter for the Complete Passport.
 * Generates an authentic high-resolution JPG containing the Passport Cover,
 * the Traveler Identity & Biodata page, and the Visa Stamp Pages.
 */
export async function exportPassportAsJPG(
  traveler: TravelerProfile,
  stamps: Stamp[]
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const width = 2400;
      const height = 1600;

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        throw new Error('Canvas 2D context not available');
      }

      // Background: Consular Desk textured slate
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, width, height);

      // Top Title Banner
      ctx.fillStyle = '#f59e0b';
      ctx.font = 'bold 36px "Cinzel", Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText('REPUBLIC ISEEECH • OFFICIAL TRAVELER PASSPORT', width / 2, 65);

      ctx.fillStyle = '#94a3b8';
      ctx.font = '600 20px "Courier New", monospace';
      ctx.fillText(
        `BEARER: ${(traveler.fullName || 'UNREGISTERED TRAVELER').toUpperCase()} • PASSPORT NO: ${traveler.passportNumber || 'N/A'} • TOTAL STAMPS: ${stamps.length}`,
        width / 2,
        100
      );

      // Divider line
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(100, 120);
      ctx.lineTo(width - 100, 120);
      ctx.stroke();

      // We render 3 sections across the canvas:
      // 1. Passport Cover (Left: x: 100, w: 680, h: 1380)
      // 2. Identity Biodata Page (Center: x: 840, w: 680, h: 1380)
      // 3. Visa Stamps Page (Right: x: 1580, w: 720, h: 1380)

      drawCover(ctx, 100, 150, 680, 1380);
      drawIdentityPage(ctx, 840, 150, 680, 1380, traveler, stamps.length);
      drawVisaStampsPage(ctx, 1580, 150, 720, 1380, stamps);

      // Export as JPG
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error('Failed to generate image blob'));
            return;
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          const cleanName = (traveler.fullName || 'traveler')
            .toLowerCase()
            .replace(/[^a-z0-9]/g, '-');
          a.href = url;
          a.download = `Passport-REPUBLIC-ISEEECH-${traveler.passportNumber || 'MEX'}-${cleanName}.jpg`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setTimeout(() => URL.revokeObjectURL(url), 2000);
          resolve();
        },
        'image/jpeg',
        0.95
      );
    } catch (err) {
      reject(err);
    }
  });
}

// 1. DRAW PASSPORT COVER
function drawCover(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) {
  ctx.save();

  // Leather book gradient
  const leatherGrad = ctx.createLinearGradient(x, y, x + w, y + h);
  leatherGrad.addColorStop(0, '#1c1917');
  leatherGrad.addColorStop(0.5, '#292524');
  leatherGrad.addColorStop(1, '#0c0a09');

  ctx.fillStyle = leatherGrad;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, [16, 24, 24, 16]);
  ctx.fill();

  // Shadow / border
  ctx.strokeStyle = '#44403c';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Gold foil borders
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 3;
  ctx.strokeRect(x + 24, y + 24, w - 48, h - 48);

  ctx.strokeStyle = 'rgba(245, 158, 11, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 32, y + 32, w - 64, h - 64);

  // Top Title
  ctx.fillStyle = '#fef3c7';
  ctx.textAlign = 'center';
  ctx.font = '900 32px "Cinzel", Georgia, serif';
  ctx.fillText('PASSPORT', x + w / 2, y + 120);

  ctx.fillStyle = '#fbbf24';
  ctx.font = 'bold 20px "Cinzel", Georgia, serif';
  ctx.fillText('PASAPORTE OFICIAL', x + w / 2, y + 160);

  // Center Emblem (Circle + Globe + Stars)
  const cx = x + w / 2;
  const cy = y + h / 2 - 40;
  const radius = 130;

  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();

  ctx.setLineDash([8, 8]);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 14, 0, Math.PI * 2);
  ctx.stroke();
  ctx.setLineDash([]);

  // Draw globe latitude / longitude inside emblem
  ctx.strokeStyle = 'rgba(251, 191, 36, 0.6)';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 30, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.ellipse(cx, cy, (radius - 30) / 2, radius - 30, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(cx - (radius - 30), cy);
  ctx.lineTo(cx + (radius - 30), cy);
  ctx.stroke();

  // Emblem Banner
  ctx.fillStyle = '#1c1917';
  ctx.fillRect(cx - 150, cy + radius - 20, 300, 36);
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 2;
  ctx.strokeRect(cx - 150, cy + radius - 20, 300, 36);

  ctx.fillStyle = '#fde68a';
  ctx.font = 'bold 15px "Cinzel", Georgia, serif';
  ctx.fillText('OFFICIAL EXPEDITION', cx, cy + radius + 4);

  // Big Golden Name: REPUBLIC ISEEECH
  ctx.fillStyle = '#fef08a';
  ctx.font = '900 36px "Cinzel", Georgia, serif';
  ctx.fillText('REPUBLIC ISEEECH', x + w / 2, cy + radius + 110);

  // Biometric symbol at bottom
  const bx = x + w / 2;
  const by = y + h - 140;
  ctx.strokeStyle = '#fbbf24';
  ctx.lineWidth = 2.5;
  ctx.strokeRect(bx - 36, by - 20, 72, 40);
  ctx.beginPath();
  ctx.arc(bx, by, 12, 0, Math.PI * 2);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(bx - 36, by);
  ctx.lineTo(bx - 12, by);
  ctx.moveTo(bx + 12, by);
  ctx.lineTo(bx + 36, by);
  ctx.stroke();

  ctx.fillStyle = '#94a3b8';
  ctx.font = '600 14px "Courier New", monospace';
  ctx.fillText('GLOBAL DISCOVERY CONSULATE', x + w / 2, y + h - 60);

  ctx.restore();
}

// 2. DRAW IDENTITY BIODATA PAGE
function drawIdentityPage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  traveler: TravelerProfile,
  stampsCount: number
) {
  ctx.save();

  // Vintage Security Paper background
  ctx.fillStyle = '#fbf8f0';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Guilloche style security patterns
  ctx.strokeStyle = 'rgba(217, 119, 6, 0.08)';
  ctx.lineWidth = 1;
  for (let i = 0; i < h; i += 28) {
    ctx.beginPath();
    ctx.moveTo(x + 20, y + i);
    ctx.bezierCurveTo(x + w * 0.3, y + i + 15, x + w * 0.7, y + i - 15, x + w - 20, y + i);
    ctx.stroke();
  }

  // Header
  ctx.fillStyle = '#1c1917';
  ctx.textAlign = 'left';
  ctx.font = '900 24px "Cinzel", Georgia, serif';
  ctx.fillText('PASSPORT', x + 40, y + 60);

  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('REPUBLIC ISEEECH • TRAVELER IDENTIFICATION & BIODATA', x + 40, y + 85);

  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 40, y + 105);
  ctx.lineTo(x + w - 40, y + 105);
  ctx.stroke();

  // Left Photo / Seal Box
  const photoX = x + 40;
  const photoY = y + 130;
  const photoW = 180;
  const photoH = 240;

  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(photoX, photoY, photoW, photoH);
  ctx.strokeStyle = '#a8a29e';
  ctx.lineWidth = 2;
  ctx.strokeRect(photoX, photoY, photoW, photoH);

  // Compass watermark inside photo box
  ctx.strokeStyle = '#78350f';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(photoX + photoW / 2, photoY + photoH / 2 - 20, 50, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = '#78350f';
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px "Cinzel", Georgia, serif';
  ctx.fillText('OFFICIAL SEAL', photoX + photoW / 2, photoY + photoH / 2 + 50);
  ctx.font = 'bold 11px "Courier New", monospace';
  ctx.fillStyle = '#047857';
  ctx.fillText('✓ VERIFIED', photoX + photoW / 2, photoY + photoH / 2 + 70);

  // Right Side: Traveler Biodata Fields
  const infoX = x + 250;
  let curY = y + 145;

  const drawField = (label: string, value: string, isBig = false) => {
    ctx.textAlign = 'left';
    ctx.fillStyle = '#78716c';
    ctx.font = 'bold 12px "Courier New", monospace';
    ctx.fillText(label.toUpperCase(), infoX, curY);

    ctx.fillStyle = '#0c0a09';
    ctx.font = isBig ? '900 22px "Cinzel", Georgia, serif' : 'bold 17px "Cinzel", Georgia, serif';
    ctx.fillText(value || '—', infoX, curY + 24);

    curY += 56;
  };

  drawField('Full Name', traveler.fullName || 'UNREGISTERED BEARER', true);
  drawField('Nationality', `${traveler.nationality || 'MEXICAN'} (${traveler.nationalityCode || 'MEX'})`);
  drawField('Passport No.', traveler.passportNumber || 'PENDING');
  drawField('Language', traveler.language || 'Spanish');
  drawField('Acquired Stamps', `${stampsCount} ${stampsCount === 1 ? 'STAMP' : 'STAMPS'}`);

  // Official Stamp of Issuance in Biodata Page
  const stampBoxY = y + 540;
  ctx.fillStyle = '#fef3c7';
  ctx.fillRect(x + 40, stampBoxY, w - 80, 110);
  ctx.strokeStyle = '#d97706';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 40, stampBoxY, w - 80, 110);

  ctx.fillStyle = '#92400e';
  ctx.textAlign = 'left';
  ctx.font = 'bold 14px "Cinzel", Georgia, serif';
  ctx.fillText('ISSUING AUTHORITY', x + 60, stampBoxY + 32);

  ctx.fillStyle = '#451a03';
  ctx.font = '600 13px "Courier New", monospace';
  ctx.fillText('GENERAL CONSULATE OF GLOBAL EXPLORERS • REPUBLIC ISEEECH', x + 60, stampBoxY + 58);
  ctx.fillText(`DOCUMENT STATUS: OFFICIALLY ACTIVE • ISO-7810 COMPLIANT`, x + 60, stampBoxY + 84);

  // Machine Readable Zone (MRZ) at Bottom
  const mrzY = y + h - 140;
  ctx.fillStyle = '#f5f5f4';
  ctx.fillRect(x + 20, mrzY - 10, w - 40, 110);
  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x + 20, mrzY - 10, w - 40, 110);

  const cleanTravelerName = (traveler.fullName || 'TRAVELER')
    .toUpperCase()
    .replace(/[^A-Z]/g, '<');
  const passportNumPad = (traveler.passportNumber || 'MEX99999999')
    .toUpperCase()
    .padEnd(9, '<');

  const mrzLine1 = `P<MEX${cleanTravelerName}`.padEnd(36, '<').substring(0, 36);
  const mrzLine2 = `${passportNumPad}4MEX0001018M3001012<<<<<<<<<<<02`.substring(0, 36);

  ctx.fillStyle = '#1c1917';
  ctx.textAlign = 'center';
  ctx.font = '700 20px "Courier New", monospace';
  ctx.fillText(mrzLine1, x + w / 2, mrzY + 32);
  ctx.fillText(mrzLine2, x + w / 2, mrzY + 68);

  ctx.restore();
}

// 3. DRAW VISA STAMPS PAGE
function drawVisaStampsPage(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stamps: Stamp[]
) {
  ctx.save();

  // Paper background
  ctx.fillStyle = '#faf6ed';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 16);
  ctx.fill();

  ctx.strokeStyle = '#d6d3d1';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Header
  ctx.fillStyle = '#1c1917';
  ctx.textAlign = 'left';
  ctx.font = '900 24px "Cinzel", Georgia, serif';
  ctx.fillText('VISAS & OFFICIAL STAMPS', x + 40, y + 60);

  ctx.fillStyle = '#78716c';
  ctx.font = 'bold 13px "Courier New", monospace';
  ctx.fillText('CONSULAR ACTIVITY STAMPS DIRECTIVE', x + 40, y + 85);

  ctx.strokeStyle = '#1c1917';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x + 40, y + 105);
  ctx.lineTo(x + w - 40, y + 105);
  ctx.stroke();

  // Stamps Grid: up to 6 stamps displayed cleanly (2 columns x 3 rows)
  if (stamps.length === 0) {
    // Empty state
    ctx.fillStyle = '#a8a29e';
    ctx.textAlign = 'center';
    ctx.font = 'italic 18px "Cinzel", Georgia, serif';
    ctx.fillText('No official stamps collected yet.', x + w / 2, y + h / 2 - 20);

    ctx.font = '14px "Courier New", monospace';
    ctx.fillText('Scan an activity QR code with the Official Guide', x + w / 2, y + h / 2 + 15);
    ctx.fillText('to imprint official seals onto these pages.', x + w / 2, y + h / 2 + 40);
  } else {
    const colWidth = (w - 100) / 2;
    const rowHeight = (h - 220) / 3;

    stamps.slice(0, 6).forEach((stamp, idx) => {
      const col = idx % 2;
      const row = Math.floor(idx / 2);
      const sx = x + 40 + col * (colWidth + 20);
      const sy = y + 130 + row * (rowHeight + 15);

      drawSingleStamp(ctx, sx, sy, colWidth, rowHeight, stamp);
    });
  }

  // Footer
  ctx.fillStyle = '#a8a29e';
  ctx.textAlign = 'center';
  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillText('REPUBLIC ISEEECH • IMMIGRATION & ACTIVITY CONTROL • PAGE 01-02', x + w / 2, y + h - 30);

  ctx.restore();
}

// Helper to draw an individual stamp on the canvas
function drawSingleStamp(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  stamp: Stamp
) {
  ctx.save();

  // Pick ink color
  let inkColor = '#142850'; // navy
  let subColor = 'rgba(20, 40, 80, 0.85)';
  let bgTint = 'rgba(20, 40, 80, 0.05)';

  if (stamp.stampColor === 'crimson') {
    inkColor = '#8b1e1e';
    subColor = 'rgba(139, 30, 30, 0.85)';
    bgTint = 'rgba(139, 30, 30, 0.05)';
  } else if (stamp.stampColor === 'emerald') {
    inkColor = '#1b5e39';
    subColor = 'rgba(27, 94, 57, 0.85)';
    bgTint = 'rgba(27, 94, 57, 0.05)';
  } else if (stamp.stampColor === 'amber') {
    inkColor = '#b27814';
    subColor = 'rgba(178, 120, 20, 0.85)';
    bgTint = 'rgba(178, 120, 20, 0.07)';
  }

  // Slight random/preset tilt for authentic passport stamp feel
  const cx = x + w / 2;
  const cy = y + h / 2;
  const angle = ((stamp.stampRotation || 0) * Math.PI) / 180;

  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Background box
  ctx.fillStyle = bgTint;
  ctx.strokeStyle = inkColor;
  ctx.lineWidth = 3.5;

  const shape = stamp.stampShape || 'circle';

  if (shape === 'circle') {
    const r = Math.min(w, h) / 2 - 10;
    ctx.beginPath();
    ctx.arc(0, 0, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.setLineDash([4, 4]);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(0, 0, r - 8, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
  } else if (shape === 'shield') {
    const sw = w / 2 - 14;
    const sh = h / 2 - 10;
    ctx.beginPath();
    ctx.moveTo(-sw, -sh);
    ctx.lineTo(sw, -sh);
    ctx.lineTo(sw, sh * 0.4);
    ctx.quadraticCurveTo(sw * 0.8, sh, 0, sh);
    ctx.quadraticCurveTo(-sw * 0.8, sh, -sw, sh * 0.4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (shape === 'oval') {
    const rx = w / 2 - 12;
    const ry = h / 2 - 10;
    ctx.beginPath();
    ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  } else {
    // Rectangle / Hexagon default
    const rw = w - 24;
    const rh = h - 20;
    ctx.beginPath();
    ctx.roundRect(-rw / 2, -rh / 2, rw, rh, 10);
    ctx.fill();
    ctx.stroke();
  }

  // Stamp Content
  ctx.fillStyle = inkColor;
  ctx.textAlign = 'center';

  // Country & ISO
  ctx.font = '900 15px "Cinzel", Georgia, serif';
  ctx.fillText(
    `${stamp.country.toUpperCase()} (${stamp.countryCode || 'INT'})`,
    0,
    -h / 4
  );

  // Center Emblem Drawing
  drawStampEmblem(ctx, 0, -4, stamp.iconName, inkColor);

  // Activity Name
  ctx.font = 'bold 11px "Cinzel", Georgia, serif';
  const cleanActivity =
    stamp.activityName.length > 28
      ? stamp.activityName.substring(0, 26) + '...'
      : stamp.activityName;
  ctx.fillText(cleanActivity, 0, h / 4 - 6);

  // Guide & Date & Code
  ctx.fillStyle = subColor;
  ctx.font = 'bold 9.5px "Courier New", monospace';
  ctx.fillText(`GUIDE: ${stamp.guideName} • ${stamp.date}`, 0, h / 4 + 10);
  ctx.font = '8px "Courier New", monospace';
  ctx.fillText(stamp.verificationCode || 'OFFICIAL-STAMP', 0, h / 4 + 24);

  ctx.restore();
}

// Draw vector emblems inside stamp
function drawStampEmblem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  iconName: string,
  color: string
) {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = 2.4;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (iconName === 'Torii') {
    // Japanese Torii Gate
    // Kasagi top curved lintel
    ctx.beginPath();
    ctx.moveTo(cx - 20, cy - 14);
    ctx.quadraticCurveTo(cx, cy - 18, cx + 20, cy - 14);
    ctx.stroke();

    // Nuki tie beam
    ctx.beginPath();
    ctx.moveTo(cx - 17, cy - 8);
    ctx.lineTo(cx + 17, cy - 8);
    ctx.stroke();

    // Center strut
    ctx.beginPath();
    ctx.moveTo(cx, cy - 16);
    ctx.lineTo(cx, cy - 8);
    ctx.stroke();

    // Pillars
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy - 8);
    ctx.lineTo(cx - 10, cy + 14);
    ctx.moveTo(cx + 10, cy - 8);
    ctx.lineTo(cx + 10, cy + 14);
    ctx.stroke();
  } else if (iconName === 'Pisa') {
    // Leaning Tower of Pisa
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 14);
    ctx.lineTo(cx + 14, cy + 14);
    ctx.stroke();

    // Leaning tower body tilted 10 degrees
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 14);
    ctx.lineTo(cx - 3, cy - 12);
    ctx.lineTo(cx + 9, cy - 10);
    ctx.lineTo(cx + 4, cy + 14);
    ctx.stroke();

    // Tiers
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 5);
    ctx.lineTo(cx + 6, cy + 7);
    ctx.moveTo(cx - 5, cy - 3);
    ctx.lineTo(cx + 7, cy - 1);
    ctx.stroke();
  } else if (iconName === 'Crown') {
    // King's Crown
    ctx.beginPath();
    ctx.moveTo(cx - 16, cy + 10);
    ctx.lineTo(cx + 16, cy + 10);
    ctx.lineTo(cx + 14, cy - 4);
    ctx.lineTo(cx + 8, cy + 3);
    ctx.lineTo(cx, cy - 8);
    ctx.lineTo(cx - 8, cy + 3);
    ctx.lineTo(cx - 14, cy - 4);
    ctx.closePath();
    ctx.stroke();

    // Jewels on tips
    ctx.beginPath();
    ctx.arc(cx, cy - 10, 2, 0, Math.PI * 2);
    ctx.arc(cx - 14, cy - 6, 2, 0, Math.PI * 2);
    ctx.arc(cx + 14, cy - 6, 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Landmark / Monument (Parthenon columns)
    ctx.beginPath();
    // Triangular pediment
    ctx.moveTo(cx - 18, cy - 6);
    ctx.lineTo(cx, cy - 16);
    ctx.lineTo(cx + 18, cy - 6);
    ctx.closePath();
    ctx.stroke();

    // Base steps
    ctx.strokeRect(cx - 18, cy + 8, 36, 4);

    // Columns
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 5);
    ctx.lineTo(cx - 12, cy + 8);
    ctx.moveTo(cx - 4, cy - 5);
    ctx.lineTo(cx - 4, cy + 8);
    ctx.moveTo(cx + 4, cy - 5);
    ctx.lineTo(cx + 4, cy + 8);
    ctx.moveTo(cx + 12, cy - 5);
    ctx.lineTo(cx + 12, cy + 8);
    ctx.stroke();
  }

  ctx.restore();
}
