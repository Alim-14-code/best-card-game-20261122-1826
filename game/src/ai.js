// Cinder, the rival: readable, counterable choices. She favours the element that
// beats what you played last, saves her Heal for when she is hurt, and otherwise
// plays her strongest strike — so a low card can bait out her big one.
import { ELEMENTS, HEAL_AMOUNT } from './config.js';
import { effectivePower } from './world.js';

/** Pick Cinder's card index from her hand. `foeLastElement` is your last played element (or null). */
export function chooseCard(hand, ownHp, foeLastElement) {
  if (hand.length === 0) return -1;
  if (ownHp <= 8) {
    const heal = hand.findIndex((c) => c.kind === 'heal');
    if (heal >= 0) return heal;
  }
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (card.kind === 'heal') continue;
    let score = effectivePower(card, null);
    if (foeLastElement && card.element && ELEMENTS[card.element].beats === foeLastElement) score += 2;
    if (card.kind === 'bolt') score += 1;
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  if (best < 0) return hand.findIndex((c) => c.kind === 'heal');
  return best;
}

/** The autopilot's pick for the player side: strongest card, Heal only when hurt. */
export function autopilotPick(hand, ownHp) {
  if (ownHp <= 6) {
    const heal = hand.findIndex((c) => c.kind === 'heal');
    if (heal >= 0) return heal;
  }
  let best = -1;
  let bestScore = -Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (card.kind === 'heal') continue;
    const score = effectivePower(card, null);
    if (score > bestScore) {
      bestScore = score;
      best = i;
    }
  }
  return best < 0 ? 0 : best;
}

/** The autopilot's worst pick (for the loss scene): the weakest strike it holds. */
export function autopilotWorst(hand) {
  let worst = -1;
  let worstScore = Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (card.kind === 'heal') continue;
    const score = effectivePower(card, null);
    if (score < worstScore) {
      worstScore = score;
      worst = i;
    }
  }
  return worst < 0 ? 0 : worst;
}
