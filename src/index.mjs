import { COLORS, DENSITY } from './constants.mjs';
import { generate } from './generate.mjs';

const u = new URL(location.href);
const search = u.searchParams;

const DEBUG = search.get('debug');

let W = 6;
let H = 8;
if (search.get('w')) W = parseFloat(search.get('w'));
if (search.get('h')) H = parseFloat(search.get('h'));

const density = search.get('d') ? parseFloat(search.get('d')) : DENSITY;

const GAP = 1; // visible area above the puzzle itself (to help identify badly rotated pieces)
let S = 1; // scale up to maximize the visible area
{
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    while (
        S * (W + GAP * 2) < vw &&
        S * (H + GAP * 2) < vh) ++S;
    --S;

    // elect longest axis according to aspect ratio of the window
    if (vw > vh && W < H) {
        const tmp = W;
        W = H;
        H = tmp;
    }
}

let t0;
let numMoves = 0;
let done = false;

const [perimeters, centers, sizes, topLefts] = generate(W, H, density);
const canvases = [];
const rotations = centers.map((_) => Math.floor(4 * Math.random()));
const targetRotations = Array.from(rotations);

const gameCanvasEl = document.createElement('canvas');
gameCanvasEl.width  = S * (W + GAP * 2);
gameCanvasEl.height = S * (H + GAP * 2);
gameCanvasEl.style.marginLeft = -0.5 * gameCanvasEl.width  + 'px';
gameCanvasEl.style.marginTop  = -0.5 * gameCanvasEl.height + 'px';

let i = 0;
for (const perimeter of perimeters) {
    const center = centers[i];
    const [w, h] = sizes[i];

    const canvasEl = document.createElement('canvas');
    canvasEl.width  = S * w;
    canvasEl.height = S * h;
    const ctx = canvasEl.getContext('2d');

    const color = COLORS[i % COLORS.length];
    ctx.fillStyle = color;

    ctx.globalAlpha = 0.55;
    ctx.strokeStyle = color;
    ctx.beginPath();
    let z = 0;
    for (const [a, b] of perimeter) {
        if (z === 0) ctx.moveTo(S * a[0], S * a[1]);
        ctx.lineTo(S * b[0], S * b[1]);
        ++z;
    }
    ctx.fill();
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'black';
    ctx.globalAlpha = 0.33;
    ctx.beginPath();
    ctx.arc(S * center[0], S * center[1], 0.25 * S, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.globalAlpha = 1;

    canvases.push(canvasEl);
    ++i;
}

const pivotBoxes = topLefts.map(([x, y], i) => {
    const ctr = centers[i];
    return [
        S * (x + ctr[0] + GAP),
        S * (y + ctr[1] + GAP),
    ];
});

gameCanvasEl.addEventListener('contextmenu', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    return false;
});

gameCanvasEl.addEventListener('mousedown', (ev) => {
    if (done) return;
    const isRMB = !(ev.button === 0 || ev.which === 1);
    const sign = isRMB ? -1 : 1;
    const o = gameCanvasEl.getBoundingClientRect();
    const x = ev.clientX - o.left;
    const y = ev.clientY - o.top;
    const s = 0.5 * S;
    pivotBoxes.forEach(([xc, yc], i) => {
        if (x >= xc - s &&
            x <= xc + s &&
            y >= yc - s &&
            y <= yc + s) {
            ++numMoves;
            if (!t0) t0 = Date.now();
            targetRotations[i] += sign;
            if (targetRotations.every((tgtRot, i) => {
                const ok = tgtRot % 4 === 0;
                //if (!ok) console.log(`#${i} wrong`);
                return ok;
            })) {
                done = true;
                const elapsed = Date.now() - t0;
                const moves = numMoves;
                setTimeout(() => {
                    window.alert(`puzzle solved by doing ${moves} moves in ${Math.ceil(elapsed / 1000)} seconds.`);
                    location.reload();
                }, 400);
            }
        }
    });
    return false;
});

const SPEED = 3;

let lastT = -1000/60;
const fontSize = Math.round(S * 0.4);
function draw(t) {
    const dt = (t - lastT) / 1000;
    lastT = t;
    window.requestAnimationFrame(draw);

    const ctx = gameCanvasEl.getContext('2d');
    ctx.clearRect(0, 0, gameCanvasEl.width, gameCanvasEl.height);

    if (DEBUG) {
        ctx.font = `${fontSize}px sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
    }

    for (let i = 0; i < perimeters.length; ++i) {
        let angle = rotations[i];
        const targetAngle = targetRotations[i];
        if (angle !== targetAngle) {
            const sign = targetAngle > angle ? 1 : -1;
            const delta = sign * dt * SPEED;
            angle = (sign > 0 ? Math.min : Math.max)(angle + delta, targetAngle);
            rotations[i] = angle;
        }

        ctx.save();
        const topLeft = topLefts[i].map((v) => v * S);
        const ctr = centers[i].map((v) => v * S);
        ctx.translate(
            topLeft[0] + ctr[0] + GAP * S,
            topLeft[1] + ctr[1] + GAP * S,
        );
        ctx.rotate(0.5 * Math.PI * angle);
        ctx.translate(-ctr[0], -ctr[1]);
        ctx.drawImage(canvases[i], 0, 0);
        ctx.restore();

        if (DEBUG) {
            const ok = targetRotations[i] % 4 === 0;
            ctx.fillStyle = ok ? '#7f7' : '#f77';
            ctx.fillText(`${i + 1}`, topLeft[0] + ctr[0] + GAP * S, topLeft[1] + ctr[1] + GAP * S);
        }
    }
}

draw(0);

document.body.appendChild(gameCanvasEl);
