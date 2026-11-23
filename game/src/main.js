// Boot and the one loop: input is read every frame, the renderer paints what is
// there. The game moves between four screens: title, play, win and loss.
//
// ?seed=N fixes the deal. ?shot=start|play|win|lose (with &seed=N) stages that
// scene instead of running the loop, paints it and sets window.__shotReady.
import { BEST_KEY } from './config.js';
import { createRandom } from './random.js';
import { createWorld, EVENT_OVER } from './world.js';
import { chooseCard } from './ai.js';
import { ACTION_CONFIRM, createInput } from './input.js';
import { createRenderer, SCREEN_LOSE, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN } from './render.js';
import { stageShot } from './shots.js';

const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');
const seedParam = Number.parseInt(params.get('seed') ?? '', 10);
const seed = Number.isInteger(seedParam) ? seedParam : Math.floor(Math.random() * 4294967296);

const canvas = document.getElementById('game');
const status = document.getElementById('status');
const world = createWorld(createRandom(seed));
const renderer = createRenderer(canvas);

function readBest() {
  try {
    return Number.parseInt(window.localStorage.getItem(BEST_KEY) ?? '0', 10) || 0;
  } catch {
    return 0;
  }
}

function saveBest(value) {
  try {
    window.localStorage.setItem(BEST_KEY, String(value));
  } catch {
    // Storage can be off (private windows): the best run then lasts this visit only.
  }
}

function runShot(name) {
  const scene = stageShot(name, world);
  renderer.draw(world.state, scene.screen, scene.best, { final: true });
  renderer.draw(world.state, scene.screen, scene.best, { final: true });
  window.__shotReady = true;
}

function runGame() {
  const input = createInput(canvas, () => world.state.you.hand.length);
  let screen = SCREEN_TITLE;
  let best = readBest();

  function announce(message) {
    status.textContent = message;
  }

  function startGame() {
    world.reset();
    screen = SCREEN_PLAY;
    announce(`Duel started. ${world.state.you.hp} HP each — play a card!`);
  }

  function endGame() {
    screen = world.state.phase === 'win' ? SCREEN_WIN : SCREEN_LOSE;
    if (world.state.phase === 'win' && world.state.wins > best) {
      best = world.state.wins;
      saveBest(best);
    }
    announce(world.state.phase === 'win' ? 'Victory! Cinder is beaten.' : 'Defeat. Cinder takes the duel.');
  }

  function frame() {
    requestAnimationFrame(frame);
    const actions = input.takeActions();
    if (actions & ACTION_CONFIRM && screen !== SCREEN_PLAY) startGame();
    if (screen === SCREEN_PLAY) {
      const clicked = input.takeClicked();
      if (clicked >= 0 && clicked < world.state.you.hand.length) {
        const foeIndex = chooseCard(world.state.foe.hand, world.state.foe.hp, world.state.foeLastElement);
        if (foeIndex >= 0) {
          const events = world.playRound(clicked, foeIndex);
          if (events & EVENT_OVER) endGame();
          else announce(world.state.message);
        }
      }
    }
    renderer.draw(world.state, screen, best, { hover: input.hoverIndex() });
  }

  announce('Ember Duel. Press Space or click to start.');
  requestAnimationFrame(frame);
}

if (shot) runShot(shot);
else runGame();
