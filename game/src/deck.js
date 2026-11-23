// The deck: 27 elemental strike cards (values 1-9 x Flame/Leaf/Wave) plus
// 2 Heal cards and 1 Ember Bolt. Every card is an original EMBER DUEL card.
import { ELEMENT_ORDER, HEAL_AMOUNT, BOLT_POWER } from './config.js';
import { shuffle } from './random.js';

let nextId = 1;

export function makeStrikeCard(element, value) {
  return { id: nextId, kind: 'strike', element, value, name: `${element} ${value}` };
}

export function makeHealCard() {
  return { id: nextId, kind: 'heal', element: null, value: 0, name: `Heal +${HEAL_AMOUNT}` };
}

export function makeBoltCard() {
  return { id: nextId, kind: 'bolt', element: null, value: BOLT_POWER, name: 'Ember Bolt' };
}

/** A fresh 30-card deck, shuffled by `rand`. */
export function buildDeck(rand) {
  const cards = [];
  for (const element of ELEMENT_ORDER) {
    for (let value = 1; value <= 9; value += 1) cards.push(makeStrikeCard(element, value));
  }
  cards.push(makeHealCard(), makeHealCard(), makeBoltCard());
  return shuffle(rand, cards);
}

/** Draw from the deck into `hand` until it holds `size` cards (or the deck empties). */
export function drawUp(deck, hand, size) {
  while (hand.length < size && deck.length > 0) hand.push(deck.pop());
}
