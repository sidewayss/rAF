// color-mix() currently set to "unstructured", obviating the need for CMixFunc.
class CMixFunc extends CFunc { // only for color-mix(), only one instance
    // colorspace is the first argument, hue-interpolation-method is the second
    static #spaces = ["srgb","srgb-linear","lab","oklab","xyz","xyz-d50","xyz-d65",
                      "hsl","hwb","lch","oklch"];
    static #hues   = ["shorter","longer","increasing","decreasing"];
    #space = CMixFunc.#spaces[0];
    #hue   = CMixFunc.#hues  [0];

    constructor() { super(...arguments); }

    get space()    { return this.#space; }
    set space(val) {
        if (CMixFunc.#spaces.includes(val))
            this.#space = val;
        else
            Ez._invalidErr("space", val, CMixFunc.#spaces);
    }
    get hue()    { return this.#space; }
    set hue(val) {
        if (CMixFunc.#hues.includes(val))
            this.#hue = val;
        else
            Ez._invalidErr("hue", val, CMixFunc.#hues);
    }
    get prefix() {
        const hue = (this.#hue == CMixFunc.#hues[0])
                  ? "" // shorter is the default and ignored by the browsers
                  : ` ${this.#hue} hue`;

        return `${this.name}(in ${this.space}${hue}, `;
    }
}