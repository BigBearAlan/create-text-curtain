const canvas = document.querySelector("#curtain");
const resetButton = document.querySelector("#reset");
const context = canvas.getContext("2d");
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const copy = `山川异域风月同天长风破浪会有时直挂云帆济沧海明月松间照清泉石上流行到水穷处坐看云起时云山苍苍江水泱泱先生之风山高水长天地有大美而不言四时有明法而不议万物有成理而不说纸上得来终觉浅绝知此事要躬行春有百花秋有月夏有凉风冬有雪若无闲事挂心头便是人间好时节一花一世界一叶一菩提心若无尘清风自来人生天地之间若白驹之过隙忽然而已知者不惑仁者不忧勇者不惧且听风吟静待花开星垂平野阔月涌大江流海内存知己天涯若比邻疏影横斜水清浅暗香浮动月黄昏千山鸟飞绝万径人踪灭日出江花红胜火春来江水绿如蓝`;

const state = {
  width: 0,
  height: 0,
  dpr: 1,
  gapY: 20,
  marginY: 30,
  strands: [],
  pointer: { x: 0, y: 0, visible: false, down: false },
  previousPointer: null,
  previousTime: 0,
};

function resize() {
  const bounds = canvas.getBoundingClientRect();
  state.dpr = Math.min(window.devicePixelRatio || 1, 2);
  state.width = bounds.width;
  state.height = bounds.height;
  canvas.width = Math.round(bounds.width * state.dpr);
  canvas.height = Math.round(bounds.height * state.dpr);
  context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
  buildCurtain();
}

function buildCurtain() {
  const compact = state.width < 640;
  const gapX = compact ? 16 : 18;
  state.gapY = compact ? 19 : 20;
  const marginX = compact ? 20 : 34;
  state.marginY = compact ? 24 : 30;
  const columns = Math.floor((state.width - marginX * 2) / gapX);
  const rows = Math.floor((state.height - state.marginY * 2) / state.gapY);

  state.strands = [];
  let characterIndex = 0;

  for (let column = 0; column < columns; column += 1) {
    const strand = {
      x: marginX + column * gapX,
      phase: Math.sin(column * 19.73) || 1,
      beads: [],
      accelerations: new Float32Array(rows),
    };

    for (let row = 0; row < rows; row += 1) {
      strand.beads.push({
        offset: 0,
        velocity: 0,
        drawX: strand.x,
        drawY: state.marginY + row * state.gapY,
        rotation: 0,
        character: copy[characterIndex % copy.length],
      });
      characterIndex += 1;
    }

    state.strands.push(strand);
  }
}

function localPointer(event) {
  const bounds = canvas.getBoundingClientRect();
  return {
    x: event.clientX - bounds.left,
    y: event.clientY - bounds.top,
  };
}

function enterInteraction(position, time) {
  state.pointer.visible = true;
  state.pointer.x = position.x;
  state.pointer.y = position.y;
  state.previousPointer = { ...position };
  state.previousTime = time;
}

function strikeCurtain(position, eventTime) {
  if (!state.previousPointer) {
    enterInteraction(position, eventTime);
    return;
  }

  const elapsed = Math.max(8, Math.min(34, eventTime - state.previousTime || 16));
  const frameScale = 16.67 / elapsed;
  const rawMoveX = (position.x - state.previousPointer.x) * frameScale;
  const rawMoveY = (position.y - state.previousPointer.y) * frameScale;
  // Treat the pointer like a passing breeze. Capping its sampled velocity keeps
  // fast mouse movements from turning into violent, throw-like impulses.
  const moveX = Math.max(-18, Math.min(18, rawMoveX));
  const moveY = Math.max(-18, Math.min(18, rawMoveY));
  const speed = Math.hypot(moveX, moveY);
  const collisionRadius = 58;
  const motionScale = reducedMotion.matches ? 0.28 : 1;

  state.pointer.x = position.x;
  state.pointer.y = position.y;
  state.pointer.visible = true;

  for (const strand of state.strands) {
    const approximateRow = Math.round((position.y - state.marginY) / state.gapY);
    const firstRow = Math.max(1, approximateRow - 4);
    const lastRow = Math.min(strand.beads.length - 1, approximateRow + 4);

    for (let row = firstRow; row <= lastRow; row += 1) {
      const bead = strand.beads[row];
      const beadX = strand.x + bead.offset;
      const dx = beadX - position.x;
      const dy = bead.drawY - position.y;
      const distance = Math.hypot(dx, dy);
      if (distance >= collisionRadius) continue;

      const influence = Math.pow(1 - distance / collisionRadius, 2);
      const fallbackDirection = Math.sign(strand.x - position.x) || Math.sign(strand.phase);
      const travelDirection = Math.abs(moveX) > 0.35 ? Math.sign(moveX) : fallbackDirection;
      const glancingPush = moveX * 0.16;
      const partingPush = fallbackDirection * (speed * 0.1 + 0.45);
      const impulse = (glancingPush + partingPush) * influence * motionScale;

      bead.velocity += impulse;

      // A struck bead tugs its immediate neighbours along the same string.
      for (let reach = 1; reach <= 3; reach += 1) {
        const spread = impulse * Math.pow(0.38, reach);
        if (strand.beads[row - reach]) strand.beads[row - reach].velocity += spread;
        if (strand.beads[row + reach]) strand.beads[row + reach].velocity += spread;
      }
    }
  }

  state.previousPointer = { ...position };
  state.previousTime = eventTime;
}

function leaveInteraction() {
  state.pointer.visible = false;
  state.pointer.down = false;
  state.previousPointer = null;
}

function resetCurtain() {
  leaveInteraction();
  for (const strand of state.strands) {
    for (const bead of strand.beads) {
      bead.offset = 0;
      bead.velocity = 0;
    }
  }
}

canvas.addEventListener("pointerenter", (event) => {
  enterInteraction(localPointer(event), event.timeStamp);
});
canvas.addEventListener("pointermove", (event) => {
  strikeCurtain(localPointer(event), event.timeStamp);
});
canvas.addEventListener("pointerleave", leaveInteraction);
canvas.addEventListener("pointerdown", (event) => {
  state.pointer.down = true;
  canvas.setPointerCapture(event.pointerId);
});
canvas.addEventListener("pointerup", (event) => {
  state.pointer.down = false;
  if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
});
resetButton.addEventListener("click", resetCurtain);

function simulateStrand(strand) {
  const beads = strand.beads;
  const accelerations = strand.accelerations;
  const damping = reducedMotion.matches ? 0.91 : 0.987;

  for (let row = 1; row < beads.length; row += 1) {
    const bead = beads[row];
    const previousOffset = row === 1 ? 0 : beads[row - 1].offset;
    const nextOffset = row === beads.length - 1 ? bead.offset : beads[row + 1].offset;
    const stringTension = (previousOffset + nextOffset - bead.offset * 2) * 0.118;
    const lengthRatio = row / Math.max(1, beads.length - 1);
    const gravity = -bead.offset * (0.0062 - lengthRatio * 0.0028);
    const nonlinearLimit = -Math.sign(bead.offset) * Math.pow(Math.abs(bead.offset) / 220, 3) * 0.7;
    accelerations[row] = stringTension + gravity + nonlinearLimit;
  }

  beads[0].offset = 0;
  beads[0].velocity = 0;

  for (let row = 1; row < beads.length; row += 1) {
    const bead = beads[row];
    bead.velocity = (bead.velocity + accelerations[row]) * damping;
    bead.velocity = Math.max(-6, Math.min(6, bead.velocity));
    bead.offset += bead.velocity;
    const travelLimit = Math.min(76, state.width * 0.1);
    bead.offset = Math.max(-travelLimit, Math.min(travelLimit, bead.offset));
  }

  let previousX = strand.x;
  let previousY = state.marginY;
  beads[0].drawX = previousX;
  beads[0].drawY = previousY;
  beads[0].rotation = 0;

  for (let row = 1; row < beads.length; row += 1) {
    const bead = beads[row];
    const desiredX = strand.x + bead.offset;
    const segmentX = desiredX - previousX;
    const constrainedX = Math.max(-state.gapY * 0.91, Math.min(state.gapY * 0.91, segmentX));
    const segmentY = Math.sqrt(Math.max(1, state.gapY ** 2 - constrainedX ** 2));

    bead.drawX = previousX + constrainedX;
    bead.drawY = previousY + segmentY;
    bead.rotation = Math.atan2(constrainedX, segmentY) * 0.72;
    previousX = bead.drawX;
    previousY = bead.drawY;
  }
}

function render() {
  context.clearRect(0, 0, state.width, state.height);
  context.fillStyle = "#35322c";
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.font = `${state.width < 640 ? 11 : 12}px "Songti SC", "Noto Serif CJK SC", serif`;

  for (const strand of state.strands) {
    simulateStrand(strand);

    for (let row = 0; row < strand.beads.length; row += 1) {
      const bead = strand.beads[row];
      const activity = Math.min(1, Math.abs(bead.velocity) / 12 + Math.abs(bead.offset) / 130);
      context.save();
      context.translate(bead.drawX, bead.drawY);
      context.rotate(bead.rotation);
      context.globalAlpha = 0.68 + activity * 0.25;
      context.fillText(bead.character, 0, 0);
      context.restore();
    }
  }

  if (state.pointer.visible) {
    context.save();
    context.translate(state.pointer.x, state.pointer.y);
    context.strokeStyle = "rgb(38 36 31 / 0.72)";
    context.lineWidth = 1;
    context.beginPath();
    context.arc(0, 0, state.pointer.down ? 7 : 5, 0, Math.PI * 2);
    context.stroke();
    context.beginPath();
    context.moveTo(-10, 0);
    context.lineTo(-6, 0);
    context.moveTo(6, 0);
    context.lineTo(10, 0);
    context.moveTo(0, -10);
    context.lineTo(0, -6);
    context.moveTo(0, 6);
    context.lineTo(0, 10);
    context.stroke();
    context.restore();
  }

  requestAnimationFrame(render);
}

const observer = new ResizeObserver(resize);
observer.observe(canvas);
requestAnimationFrame(render);
