// Table and card geometry for EMBER DUEL (1280x720 logical canvas).
export const VIEW = { width: 1280, height: 720 };
export const STEP = 1 / 60;
export const BEST_KEY = 'ember-duel-best';
export const START_HP = 20;
export const HAND_SIZE = 5;
export const CARD = { width: 148, height: 208, radius: 14 };
export const ELEMENTS = {
  flame: { name: 'FLAME', color: '#e5484d', dark: '#8f1d22', beats: 'leaf', glyph: 'flame' },
  leaf: { name: 'LEAF', color: '#46a758', dark: '#1d5c2e', beats: 'wave', glyph: 'leaf' },
  wave: { name: 'WAVE', color: '#3e9bff', dark: '#144a7d', beats: 'flame', glyph: 'wave' },
};
export const ELEMENT_ORDER = ['flame', 'leaf', 'wave'];
/** Element bonus when your element beats the other card's element. */
export const BEAT_BONUS = 3;
export const HEAL_AMOUNT = 5;
export const BOLT_POWER = 6;
