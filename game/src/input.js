// Mouse + keyboard input: click (or press 1-5) to play a hand card, Space or
// click to start / restart. Reports the hovered hand index for the renderer.
import { CARD, VIEW } from './config.js';

export const ACTION_CONFIRM = 1;

export function createInput(canvas, handCount) {
  let actions = 0;
  let clickedIndex = -1;
  let hover = -1;

  function handLayout() {
    const count = handCount();
    const total = count * 140 + (count - 1) * 16;
    const startX = (VIEW.width - total) / 2;
    return { count, startX };
  }

  function indexAt(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * VIEW.width;
    const y = ((clientY - rect.top) / rect.height) * VIEW.height;
    const { count, startX } = handLayout();
    if (y < 500 || y > 500 + 196) return -1;
    for (let i = 0; i < count; i += 1) {
      const cx = startX + i * (140 + 16);
      if (x >= cx && x <= cx + 140) return i;
    }
    return -1;
  }

  canvas.addEventListener('mousemove', (event) => {
    hover = indexAt(event.clientX, event.clientY);
  });
  canvas.addEventListener('mouseleave', () => {
    hover = -1;
  });
  canvas.addEventListener('click', (event) => {
    const i = indexAt(event.clientX, event.clientY);
    if (i >= 0) clickedIndex = i;
    else actions |= ACTION_CONFIRM;
  });
  window.addEventListener('keydown', (event) => {
    if (event.code === 'Space' || event.code === 'Enter') {
      actions |= ACTION_CONFIRM;
      event.preventDefault();
    } else if (event.key >= '1' && event.key <= '5') {
      const i = Number.parseInt(event.key, 10) - 1;
      if (i < handCount()) clickedIndex = i;
    }
  });

  return {
    takeActions() {
      const taken = actions;
      actions = 0;
      return taken;
    },
    takeClicked() {
      const taken = clickedIndex;
      clickedIndex = -1;
      return taken;
    },
    hoverIndex() {
      return hover;
    },
  };
}
