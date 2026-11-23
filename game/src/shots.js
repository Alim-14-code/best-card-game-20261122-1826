// The screenshot scenes behind ?shot=start|play|win|lose. Each one plays the real
// rules forward from a fresh world with a fixed seed, so the frame is what a real
// game looks like and the same seed always gives the same frame.
import { autopilotPick, autopilotWorst, chooseCard } from './ai.js';
import { SCREEN_LOSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';

/** Play rounds until `stop` says so; `pick` chooses the player's card, `foePick` Cinder's. */
function playRounds(world, pick, foePick, stop, maxRounds = 40) {
  for (let round = 0; round < maxRounds; round += 1) {
    const state = world.state;
    if (state.you.hand.length === 0 || state.foe.hand.length === 0) break;
    const youIndex = pick(state.you.hand, state.you.hp, state.foeLastElement);
    const foeIndex = foePick(state.foe.hand, state.foe.hp, state.foeLastElement);
    const events = world.playRound(youIndex, foeIndex);
    if (stop(state) || events === 2) break;
  }
}

/** Cinder's weakest strike (for the win scene): she plays badly, you play well. */
function foeWorst(hand) {
  let worst = -1;
  let worstScore = Infinity;
  for (let i = 0; i < hand.length; i += 1) {
    const card = hand[i];
    if (card.kind === 'heal') continue;
    if (card.value < worstScore) {
      worstScore = card.value;
      worst = i;
    }
  }
  return worst < 0 ? 0 : worst;
}

/**
 * Set `world` to the named scene (start, play, win, lose; any other name is start)
 * and return the screen to draw over it and the best run to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name === 'play') {
    playRounds(world, autopilotPick, chooseCard, (state) => state.round >= 4 && state.you.hp > 0 && state.foe.hp > 0);
    return { screen: SCREEN_PLAY, best: 0 };
  }
  if (name === 'win') {
    playRounds(world, autopilotPick, foeWorst, (state) => state.phase === 'win');
    return { screen: world.state.phase === 'win' ? SCREEN_WIN : SCREEN_PLAY, best: 1 };
  }
  if (name === 'lose') {
    // The player plays its weakest card while Cinder plays her best: a real loss.
    playRounds(world, autopilotWorst, chooseCard, (state) => state.phase === 'lose');
    return { screen: world.state.phase === 'lose' ? SCREEN_LOSE : SCREEN_PLAY, best: 0 };
  }
  return { screen: SCREEN_TITLE, best: 0 };
}
