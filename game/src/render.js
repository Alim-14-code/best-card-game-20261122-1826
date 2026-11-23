// Canvas painter for EMBER DUEL: felt table, HP bars, both hands, the played
// pair with its verdict, and the title / win / loss screens. All art is drawn
// in code — no image files. Suits are told by colour AND shape, never text alone.
import { BEAT_BONUS, CARD, ELEMENTS, START_HP, VIEW } from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_LOSE = 'lose';

const FELT = '#14532d';
const FELT_DARK = '#0b2e1a';
const GOLD = '#f5c542';
const CREAM = '#f7f0dc';
const INK = '#1c1917';

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawGlyph(ctx, kind, cx, cy, s, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  ctx.lineWidth = s * 0.12;
  ctx.lineCap = 'round';
  if (kind === 'flame') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.bezierCurveTo(cx + s * 0.9, cy - s * 0.2, cx + s * 0.55, cy + s * 0.5, cx, cy + s * 0.75);
    ctx.bezierCurveTo(cx - s * 0.55, cy + s * 0.5, cx - s * 0.9, cy - s * 0.2, cx, cy - s);
    ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.25);
    ctx.bezierCurveTo(cx + s * 0.4, cy + s * 0.15, cx + s * 0.2, cy + s * 0.55, cx, cy + s * 0.6);
    ctx.bezierCurveTo(cx - s * 0.2, cy + s * 0.55, cx - s * 0.4, cy + s * 0.15, cx, cy - s * 0.25);
    ctx.fill();
  } else if (kind === 'leaf') {
    ctx.beginPath();
    ctx.moveTo(cx, cy - s);
    ctx.bezierCurveTo(cx + s, cy - s * 0.4, cx + s * 0.7, cy + s * 0.8, cx, cy + s);
    ctx.bezierCurveTo(cx - s * 0.7, cy + s * 0.8, cx - s, cy - s * 0.4, cx, cy - s);
    ctx.fill();
    ctx.strokeStyle = '#0b2e1a';
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.7);
    ctx.lineTo(cx, cy + s * 0.8);
    ctx.stroke();
  } else if (kind === 'wave') {
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.arc(cx, cy + i * s * 0.55, s * 0.5, Math.PI * 0.15, Math.PI * 0.85);
      ctx.stroke();
    }
  } else if (kind === 'bolt') {
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.2, cy - s);
    ctx.lineTo(cx - s * 0.5, cy + s * 0.1);
    ctx.lineTo(cx - s * 0.05, cy + s * 0.1);
    ctx.lineTo(cx - s * 0.2, cy + s);
    ctx.lineTo(cx + s * 0.5, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.05, cy - s * 0.1);
    ctx.closePath();
    ctx.fill();
  } else if (kind === 'heal') {
    ctx.fillRect(cx - s * 0.25, cy - s, s * 0.5, s * 2);
    ctx.fillRect(cx - s, cy - s * 0.25, s * 2, s * 0.5);
  }
  ctx.restore();
}

function drawCardFace(ctx, card, x, y, w, h, opts = {}) {
  const small = opts.small === true;
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 14;
  ctx.shadowOffsetY = 6;
  rr(ctx, x, y, w, h, small ? 10 : CARD.radius);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, x, y, w, h, small ? 10 : CARD.radius);
  ctx.clip();
  if (card.kind === 'strike') {
    const el = ELEMENTS[card.element];
    ctx.fillStyle = el.color;
    ctx.fillRect(x, y, w, h * 0.24);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${small ? 13 : 19}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText(el.name, x + 10, y + (small ? 20 : 30));
    ctx.fillStyle = INK;
    ctx.font = `bold ${small ? 44 : 72}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(String(card.value), x + w / 2, y + h * 0.58);
    drawGlyph(ctx, el.glyph, x + w / 2, y + h * 0.8, small ? 14 : 22, el.color);
  } else if (card.kind === 'heal') {
    ctx.fillStyle = '#46a758';
    ctx.fillRect(x, y, w, h * 0.24);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${small ? 13 : 19}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('HEAL', x + 10, y + (small ? 20 : 30));
    drawGlyph(ctx, 'heal', x + w / 2, y + h * 0.5, small ? 20 : 30, '#46a758');
    ctx.fillStyle = INK;
    ctx.font = `bold ${small ? 20 : 28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText(`+${5}`, x + w / 2, y + h * 0.82);
  } else {
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(x, y, w, h * 0.24);
    ctx.fillStyle = '#fff';
    ctx.font = `bold ${small ? 13 : 19}px sans-serif`;
    ctx.textAlign = 'left';
    ctx.fillText('BOLT', x + 10, y + (small ? 20 : 30));
    drawGlyph(ctx, 'bolt', x + w / 2, y + h * 0.5, small ? 20 : 30, '#f59e0b');
    ctx.fillStyle = INK;
    ctx.font = `bold ${small ? 20 : 28}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('6 flat', x + w / 2, y + h * 0.82);
  }
  if (opts.glow) {
    rr(ctx, x - 3, y - 3, w + 6, h + 6, (small ? 10 : CARD.radius) + 3);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 4;
    ctx.stroke();
  }
  ctx.restore();
}

function drawCardBack(ctx, x, y, w, h) {
  ctx.save();
  ctx.shadowColor = 'rgba(0,0,0,0.45)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetY = 5;
  rr(ctx, x, y, w, h, 10);
  ctx.fillStyle = '#3b1d5a';
  ctx.fill();
  ctx.restore();
  ctx.save();
  rr(ctx, x, y, w, h, 10);
  ctx.clip();
  ctx.strokeStyle = 'rgba(245,197,66,0.7)';
  ctx.lineWidth = 2;
  rr(ctx, x + 8, y + 8, w - 16, h - 16, 7);
  ctx.stroke();
  drawGlyph(ctx, 'flame', x + w / 2, y + h / 2, 20, GOLD);
  ctx.restore();
}

function drawHpBar(ctx, x, y, w, label, hp, alignRight) {
  ctx.save();
  ctx.font = 'bold 22px sans-serif';
  ctx.fillStyle = '#fff';
  ctx.textAlign = alignRight ? 'right' : 'left';
  const labelX = alignRight ? x + w : x;
  ctx.fillText(label, labelX, y);
  ctx.fillText(`❤ ${hp}/${START_HP}`, labelX, y + 28);
  ctx.fillStyle = 'rgba(0,0,0,0.55)';
  rr(ctx, x, y + 38, w, 16, 8);
  ctx.fill();
  const frac = Math.max(0, hp / START_HP);
  ctx.fillStyle = hp > 7 ? '#46a758' : '#e5484d';
  if (frac > 0) {
    rr(ctx, x, y + 38, Math.max(16, w * frac), 16, 8);
    ctx.fill();
  }
  ctx.restore();
}

export function createRenderer(canvas) {
  const ctx = canvas.getContext('2d');
  const scale = canvas.width / VIEW.width;

  function handX(index, count, cardW, gap) {
    const total = count * cardW + (count - 1) * gap;
    return (VIEW.width - total) / 2 + index * (cardW + gap);
  }

  function drawTable(state) {
    ctx.save();
    ctx.scale(scale, scale);
    const g = ctx.createRadialGradient(640, 330, 80, 640, 360, 820);
    g.addColorStop(0, FELT);
    g.addColorStop(1, FELT_DARK);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    rr(ctx, 14, 14, VIEW.width - 28, VIEW.height - 28, 26);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(245,197,66,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.ellipse(640, 360, 560, 250, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function draw(state, screen, best, opts = {}) {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawTable(state);
    ctx.save();
    ctx.scale(scale, scale);

    // Top bar: HP both sides, round in the middle.
    drawHpBar(ctx, 40, 48, 260, 'YOU', state.you.hp, false);
    drawHpBar(ctx, 980, 48, 260, 'CINDER', state.foe.hp, true);
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`ROUND ${state.round}`, 640, 56);
    ctx.fillStyle = 'rgba(255,255,255,0.75)';
    ctx.font = '18px sans-serif';
    ctx.fillText(`Wins ${state.wins} · Losses ${state.losses} · Duels won ${best}`, 640, 84);

    // Cinder's hand, face down.
    const foeW = 96;
    const foeH = 134;
    for (let i = 0; i < state.foe.hand.length; i += 1) {
      drawCardBack(ctx, handX(i, state.foe.hand.length, foeW, 14), 108, foeW, foeH);
    }
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = 'bold 16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CINDER — RIVAL', 640, 262);

    // Middle: the last played pair, or the duel prompt.
    const midY = 272;
    if (state.lastPlay) {
      const lp = state.lastPlay;
      const animT = opts.final ? 1 : Math.min(1, (performance.now() - (state.lastPlayAt || 0)) / 300);
      const slide = (1 - animT) * 60;
      drawCardFace(ctx, lp.youCard, 440, midY - slide * 0.4, 140, 190, { glow: lp.winner === 'you' });
      drawCardFace(ctx, lp.foeCard, 700, midY - slide * 0.4, 140, 190, { glow: lp.winner === 'foe' });
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.arc(640, midY + 95, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = INK;
      ctx.font = 'bold 22px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('VS', 640, midY + 103);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(lp.text, 640, 484);
    } else {
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      ctx.font = 'bold 26px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('Play a card from your hand — highest power wins the round!', 640, midY + 90);
      ctx.font = '18px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.65)';
      ctx.fillText('Flame beats Leaf · Leaf beats Wave · Wave beats Flame (+3) · Heal +5 · Bolt hits 6 flat', 640, midY + 122);
    }

    // Your hand, big and readable.
    const hover = opts.hover ?? -1;
    for (let i = 0; i < state.you.hand.length; i += 1) {
      const lift = i === hover ? -14 : 0;
      drawCardFace(ctx, state.you.hand[i], handX(i, state.you.hand.length, 140, 16), 500 + lift, 140, 196, { glow: i === hover });
    }
    // The round log lives in the screen-reader status line only: the verdict line
    // above the hand already carries it, and the bottom edge clips canvas text.

    if (screen === SCREEN_TITLE) drawTitle(state, best);
    else if (screen === SCREEN_WIN) drawEnd(state, true, best);
    else if (screen === SCREEN_LOSE) drawEnd(state, false, best);
    ctx.restore();
  }

  function drawTitle(state, best) {
    ctx.save();
    ctx.fillStyle = '#0b2e1a';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.strokeStyle = GOLD;
    ctx.lineWidth = 5;
    rr(ctx, 14, 14, VIEW.width - 28, VIEW.height - 28, 26);
    ctx.stroke();
    // Fanned sample cards behind the title.
    const samples = [
      { kind: 'strike', element: 'flame', value: 9, name: 'flame 9' },
      { kind: 'strike', element: 'wave', value: 7, name: 'wave 7' },
      { kind: 'strike', element: 'leaf', value: 8, name: 'leaf 8' },
    ];
    for (let i = 0; i < samples.length; i += 1) {
      ctx.save();
      ctx.translate(640 + (i - 1) * 170, 330);
      ctx.rotate((i - 1) * 0.12);
      drawCardFace(ctx, samples[i], -74, -104, 148, 208);
      ctx.restore();
    }
    ctx.fillStyle = GOLD;
    ctx.font = 'bold 92px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillText('EMBER DUEL', 640, 150);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('A fast elemental card duel — outplay Cinder, keep your embers lit.', 640, 470);
    ctx.font = '22px sans-serif';
    ctx.fillStyle = '#ffd166';
    ctx.fillText('Flame beats Leaf · Leaf beats Wave · Wave beats Flame (+3)', 640, 510);
    ctx.fillText('Heal +5 · Ember Bolt hits 6 flat · First to 0 HP loses', 640, 542);
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText('CLICK OR PRESS SPACE TO DUEL', 640, 620);
    if (best > 0) {
      ctx.font = '20px sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.8)';
      ctx.fillText(`Duels won: ${best}`, 640, 660);
    }
    ctx.restore();
  }

  function drawEnd(state, won, best) {
    ctx.save();
    ctx.fillStyle = won ? 'rgba(20,60,10,0.88)' : 'rgba(60,10,10,0.88)';
    ctx.fillRect(0, 0, VIEW.width, VIEW.height);
    ctx.fillStyle = won ? GOLD : '#e5484d';
    ctx.font = 'bold 96px sans-serif';
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.6)';
    ctx.shadowBlur = 18;
    ctx.fillText(won ? 'VICTORY!' : 'DEFEAT', 640, 300);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 30px sans-serif';
    ctx.fillText(won ? "Cinder's embers are out — you win the duel!" : 'Your embers are out — Cinder takes the duel.', 640, 370);
    ctx.font = '24px sans-serif';
    ctx.fillText(`Final HP — You ${state.you.hp} · Cinder ${state.foe.hp} · ${state.round} rounds`, 640, 420);
    ctx.fillText(`Wins ${state.wins} · Losses ${state.losses} · Duels won ${best}`, 640, 458);
    ctx.font = 'bold 28px sans-serif';
    ctx.fillStyle = GOLD;
    ctx.fillText('PRESS SPACE TO DUEL AGAIN', 640, 540);
    ctx.restore();
  }

  return { draw };
}
