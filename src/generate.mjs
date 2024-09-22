import { Matrix } from './Matrix.mjs';

function manhattanDistance(a, b) {
    return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

function eqPos(a, b) {
    return a[0] === b[0] && a[1] === b[1];
}

function randFromArr(arr) {
    const i = Math.floor(arr.length * Math.random());
    return arr[i];
}

function neighbors(a) {
    return [
        [a[0] - 1, a[1]    ],
        [a[0] + 1, a[1]    ],
        [a[0],     a[1] - 1],
        [a[0],     a[1] + 1],
    ];
}

function cellPerimeter(a) {
    const x0 = a[0];
    const x1 = a[0] + 1;
    const y0 = a[1];
    const y1 = a[1] + 1;

    const p0 = [x0, y0];
    const p1 = [x1, y0];
    const p2 = [x1, y1];
    const p3 = [x0, y1];

    return [
        [p0, p1],
        [p1, p2],
        [p2, p3],
        [p3, p0],
    ];
}

export function generate(w, h, density) {
    const m = new Matrix(w, h);
    m.fill(0);
    const numCells = Math.floor(w * h  * density);

    const mDist = new Matrix(w, h);
    mDist.fill(Number.MAX_SAFE_INTEGER);

    // 1) fill m with sparse values
    for (let i = 0; i < numCells; ++i) {
        for (const [v, pos] of m) {
            let leastDist = Number.MAX_SAFE_INTEGER;
            for (const [v2, pos2] of m) {
                if (eqPos(pos, pos2)) continue;
                if (!v2) continue;
                const d = manhattanDistance(pos, pos2);
                if (d < leastDist) leastDist = d;
            }
            mDist.set(pos[0], pos[1], v ? 0 : leastDist);
        }

        const maxValue = mDist._cells.reduce((prev, curr) => Math.max(prev, curr), 0);
        const candidates = [];
        for (const [v, pos] of mDist) {
            if (v === maxValue) candidates.push(pos);
        }
        const pos = randFromArr(candidates);
        m.set(pos[0], pos[1], 1);
    }

    // 2) number islands
    const islands = [];
    let i = 0;
    for (const [v, pos] of m) {
        if (v) {
            islands.push([pos]);
            m.set(pos[0], pos[1], ++i);
        }
    }
    //console.log(m.toString());

    // 2) grow islands to nearby neighbors until matrix is full
    while (true) {
        const isFilled = !m._cells.some((v) => v === 0);
        if (isFilled) break;

        for (let [i, island] of Object.entries(islands)) {
            const visited = structuredClone(island);
            const candidates = [];
            i = parseFloat(i);

            for (const pos of island) {
                const neighs = neighbors(pos).filter((p) => m.isValidPosition(...p));
                for (const n of neighs) {
                    if (visited.some((p) => eqPos(p, n))) continue;
                    if (m.get(n[0], n[1]) !== 0) continue;
                    candidates.push(n);
                    visited.push(n);
                }
            }

            const nn = randFromArr(candidates);
            if (!nn) continue;
            island.push(nn);
            m.set(nn[0], nn[1], i+1);
        }

        //console.log(m.toString());
    }

    // 3) extract islands perimeters
    const centers = [];
    const sizes = [];
    const topLefts = [];
    const perimeters = islands.map((island, ii) => {
        let perimeter = [];
        for (const p of island) {
            const segments = cellPerimeter(p);
            perimeter = perimeter.concat(segments);
        }

        // remove duplicates
        const histogram = new Map();
        for (const seg of perimeter) {
            const [[x1, y1], [x2, y2]] = seg;
            let s;
            if (x1 + y1 < x2 + y2) s = `${x1},${y1}-${x2},${y2}`;
            else                   s = `${x2},${y2}-${x1},${y1}`;
            const v = histogram.get(s);
            if (!v) histogram.set(s, 1);
            else    histogram.set(s, v + 1);
        }
        const perimeter2 = [];
        for (const [k, v] of Array.from(histogram)) {
            const [a, b] = k.split('-');
            const p1 = a.split(',').map(parseFloat);
            const p2 = b.split(',').map(parseFloat);
            if (v === 1) perimeter2.push([p1, p2]);
        }

        // order points
        const perimeter3 = [];
        let i = 0;
        let reverseSeg = false;
        while (true) {
            let seg = perimeter2[i];
            seg = reverseSeg ? [seg[1], seg[0]] : Array.from(seg);
            const [_, b] = seg;
            perimeter2.splice(i, 1);
            perimeter3.push(seg);
            if (perimeter2.length === 0) break;
            i = perimeter2.findIndex((s) => {
                const [c, d] = s;
                const res = (eqPos(b, c) || eqPos(b, d));
                if (res) reverseSeg = eqPos(b, d);
                return res;
            });
        }

        let min = [ Infinity,  Infinity];
        let max = [-Infinity, -Infinity];
        for (const seg of perimeter3) {
            const [a, b] = seg;
            if (a[0] < min[0]) min[0] = a[0];
            if (a[0] > max[0]) max[0] = a[0];
            if (a[1] < min[1]) min[1] = a[1];
            if (a[1] > max[1]) max[1] = a[1];
        }

        topLefts.push(min);

        const centerOfMass = island.reduce(
            (prev, curr) => [
                prev[0] + curr[0],
                prev[1] + curr[1],
            ],
            [0, 0]
        );
        centerOfMass[0] /= island.length;
        centerOfMass[1] /= island.length;
        let center;
        while (true) {
            center = randFromArr(island);
            const distCM = Math.abs(center[0] - centerOfMass[0]) + Math.abs(center[1] - centerOfMass[1]);
            if (distCM > 0.1) break;
        }
        center = center.map((v) => v + 0.5);;
         
        centers.push(center);
        
        sizes.push([
            max[0] - min[0],
            max[1] - min[1],
        ]);

        for (let i = 0; i < 2; ++i) center[i] -= min[i];

        const perimeter4 = perimeter3.map(([a, b]) => [
            a.map((v, i) => v - min[i]),
            b.map((v, i) => v - min[i]),
        ]);

        return perimeter4;
    });

    // console.log(m.toString());

    return [perimeters, centers, sizes, topLefts];
}
