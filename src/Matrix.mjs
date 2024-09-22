function format(v) {
    const s = v.toString();
    return (s.length === 1) ? ` ${s}` : s;
}

export class Matrix {
    constructor(w, h) {
        this._w = w;
        this._h = h;
        this._cells = new Array(w * h);
    }

    _getIndex(x, y) {
        if (x < 0 || y < 0) throw new Error('index can not be negative');
        if (x >= this._w || y >= this._h) throw new Error('index out of bounds');
        return x + y * this._w;
    }

    isValidPosition(x, y) {
        return x >= 0 && y >= 0 && x < this._w && y < this._h;
    }

    _fromIndex(i) {
        const x = i % this._w;
        const y = Math.floor(i / this._w);
        return [x, y];
    }
    
    get(x, y) {
        return this._cells[this._getIndex(x, y)];
    }

    set(x, y, v) {
        this._cells[this._getIndex(x, y)] = v;
    }

    fill(v) {
        this._cells.fill(v);
    }
    
    [Symbol.iterator]() {
        let i = 0;
        return {
            next: () => {
                if (i === this._cells.length)
                    return { done: true };
                const v = this._cells[i];
                const pos = this._fromIndex(i);
                ++i;
                return {
                    done: false,
                    value: [v, pos],
                };;
            }
        }
    }

    toString() {
        return this._cells
        .map((v, i) => `${format(v)}${i % this._w === this._w - 1 ? '\n' : ' '}`)
        .join('');
    }
}
