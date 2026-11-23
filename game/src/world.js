// The duel state and its rules. One round: you play a card, Cinder plays one,
// the stronger effective power wins and deals the difference as damage.
// Element that beats the other earns +3. Heal restores, Bolt hits for 6 flat.
import { BEAT_BONUS, BOLT_POWER, ELEMENTS, HAND_SIZE, HEAL_AMOUNT, START_HP } from './config.js';
import { buildDeck, drawUp } from './deck.js';
import { shuffle } from './random.js';

export const EVENT_NONE = 0;
export const EVENT_ROUND = 1;
export const EVENT_OVER = 2;

/** Effective power of `card` against `foeCard` (null when unknown). */
export function effectivePower(card, foeCard) {
  if (card.kind === 'bolt') return BOLT_POWER;
  if (card.kind === 'heal') return 0;
  let power = card.value;
  if (foeCard && foeCard.element && card.element && ELEMENTS[card.element].beats === foeCard.element) {
    power += BEAT_BONUS;
  }
  return power;
}

export function createWorld(rand) {
  const state = {
    deck: [],
    discard: [],
    you: { hp: START_HP, hand: [] },
    foe: { hp: START_HP, hand: [] },
    round: 1,
    wins: 0,
    losses: 0,
    phase: 'title',
    lastPlay: null,
    foeLastElement: null,
    message: '',
    log: '',
  };

  function reset() {
    state.deck = buildDeck(rand);
    state.discard = [];
    state.you.hp = START_HP;
    state.you.hand = [];
    state.foe.hp = START_HP;
    state.foe.hand = [];
    drawUp(state.deck, state.you.hand, HAND_SIZE);
    drawUp(state.deck, state.foe.hand, HAND_SIZE);
    state.round = 1;
    state.phase = 'play';
    state.lastPlay = null;
    state.foeLastElement = null;
    state.message = 'Round 1 — play a card!';
    state.log = 'Flame beats Leaf · Leaf beats Wave · Wave beats Flame (+3)';
  }

  /** Resolve one round. `youIndex` is your card's index in your hand, `foeIndex` Cinder's. */
  function playRound(youIndex, foeIndex) {
    const youCard = state.you.hand.splice(youIndex, 1)[0];
    const foeCard = state.foe.hand.splice(foeIndex, 1)[0];
    state.foeLastElement = foeCard.element;
    let damage = 0;
    let winner = 'none';
    let text = '';

    if (youCard.kind === 'heal' && foeCard.kind === 'heal') {
      state.you.hp = Math.min(START_HP, state.you.hp + HEAL_AMOUNT);
      state.foe.hp = Math.min(START_HP, state.foe.hp + HEAL_AMOUNT);
      text = `Both heal +${HEAL_AMOUNT} — nobody bleeds!`;
    } else if (youCard.kind === 'heal') {
      state.you.hp = Math.min(START_HP, state.you.hp + HEAL_AMOUNT);
      const foePower = effectivePower(foeCard, youCard);
      state.you.hp = Math.max(0, state.you.hp - foePower);
      damage = foePower;
      winner = 'foe';
      text = `You heal +${HEAL_AMOUNT}, Cinder strikes for ${foePower}!`;
    } else if (foeCard.kind === 'heal') {
      state.foe.hp = Math.min(START_HP, state.foe.hp + HEAL_AMOUNT);
      const youPower = effectivePower(youCard, foeCard);
      state.foe.hp = Math.max(0, state.foe.hp - youPower);
      damage = youPower;
      winner = 'you';
      text = `Cinder heals +${HEAL_AMOUNT}, you strike for ${youPower}!`;
    } else {
      const youPower = effectivePower(youCard, foeCard);
      const foePower = effectivePower(foeCard, youCard);
      if (youPower > foePower) {
        damage = youPower - foePower;
        state.foe.hp = Math.max(0, state.foe.hp - damage);
        winner = 'you';
        text = `Your ${youPower} beats her ${foePower} — ${damage} damage!`;
      } else if (foePower > youPower) {
        damage = foePower - youPower;
        state.you.hp = Math.max(0, state.you.hp - damage);
        winner = 'foe';
        text = `Her ${foePower} beats your ${youPower} — ${damage} damage!`;
      } else {
        text = `CLASH! ${youPower} vs ${foePower} — sparks, no damage.`;
      }
    }

    state.lastPlay = { youCard, foeCard, winner, damage, text };
    state.lastPlayAt = performance.now();
    state.discard.push(youCard, foeCard);
    state.message = text;
    state.log = `${youCard.name} vs ${foeCard.name} — ${text}`;

    if (state.you.hp <= 0 || state.foe.hp <= 0) {
      state.phase = state.foe.hp <= 0 && state.you.hp > 0 ? 'win' : state.you.hp <= 0 && state.foe.hp > 0 ? 'lose' : 'lose';
      if (state.phase === 'win') state.wins += 1;
      else state.losses += 1;
      return EVENT_OVER;
    }
    // The deck never runs dry: played cards are shuffled back in, so a duel
    // always ends with a winner instead of stalling on empty hands.
    if (state.deck.length === 0 && state.discard.length > 0) {
      state.deck = shuffle(rand, state.discard);
      state.discard = [];
      state.log = 'Deck reshuffled — the embers burn on!';
    }
    drawUp(state.deck, state.you.hand, HAND_SIZE);
    drawUp(state.deck, state.foe.hand, HAND_SIZE);
    state.round += 1;
    return EVENT_ROUND;
  }

  return { state, reset, playRound };
}
