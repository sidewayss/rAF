// Not exported by raf.js
export {Func, CFunc, ColorFunc, SRFunc};

import {PFactory, ANGLES, EMPTY_PCT} from "./pfactory.js";
import {rgbToHXX}                    from "./color-convert.js";

import {E, Ez, Fn, Is, U} from "../raf.js";

class Func {                     //\ Func: CSS or SVG function
    #units; #separator;           // c = count, r = required, s = separator
    constructor(name, units, utype, c, r, s = E.comma) {
        Ez.readOnly(this, "name", name);
        Ez.readOnly(this, utype,  true);
        if (!Is.def(c)) {         // else called from sub-class constructor
            switch (name) {
            case Fn.dS:           // units = px
                units = [units, units, units, ""];
                Ez.is(this, "DropShadow");
                s = E.sp;
                c = 4;  r = 2;  break;
            case Fn.cubicBezier:  // no units
                c = 4;  r = 4;  break;
            case Fn.skew:         // units = "" for transforms
            case Fn.scale: case Fn.translate:
                c = 2;  r = 1;  break;
            case Fn.rotate:       // values for CSS rotate()
                c = 1;  r = 1;  break;
            case Fn.matrix:
                c = 6;  r = 6;  break;
            case Fn.scale3d: case Fn.translate3d:
                c = 3;  r = 3;  break;
            case Fn.rotate3d:     // 4th arg is <angle>
                c = 4;  r = 4;
                units = ["", "", "", units];
                Ez.is(this, "Rotate3d");
                break;
            case Fn.matrix3d:
                c = 16; r = 16; break
            default:              // 1 arg or N args, N args = isUn
                const n = Number(!this.IsUn);
                c = n;            // isUn never uses count/required internally,
                r = n;            // but 0 is a better value than 1.
            }
        }
        Ez.readOnly(this, "count",    c); // count    = total    argument count
        Ez.readOnly(this, "required", r); // required = required argument count
        this.#units = units;
        this.#separator = s;
        Ez.is(this, "Func"); // doubles with isCFunc, isColorFunc, isSRFunc
    }
    get units()  {
        return !Is.A(this.#units) ? this.#units
             : this.isRotate3d    ? this.#units[3]
                                  : this.#units[0];
    }
    set units(val) { // units arrays are a necessary hassle
        val = PFactory._validUnits(val, this.name, this);
        if (this.isCFunc) {
            if (this.hasHue) {
                if (this.isHXX)
                    this.#units[0] = val;
                else // lch, oklch
                    this.#units.fill(val, 0, CFunc.A - 1);
            }
            else
                this.#units.fill(val, 0, CFunc.A);
        }
        else
            this.isSRFunc     ? this.#units.fill(val)
          : this.isDropShadow ? this.#units.fill(val, 0, 3)
          : this.isRotate3d   ? this.#units[3] = val
                              : this.#units    = val;
    }
// this._u opens the backdoor to #units for CFunc. PBase has it, but write-only.
    get _u()  { return this.#units; }

// this.prefix helps apply(), ColorFunc.prototype overrides it
    get prefix() {
        return this.name + E.lp;
    }
//  apply()
    apply(val) {
        return this.prefix + val + E.rp;
    }
//  join()
    join(arr, u = this.#units) {
        Ez._join(arr, u, this.#separator);
    }

//  _seps() sets o.seps to a dense array of concatenated units + separators,
//   bookended as ["func(", ..., "u)"]. Leaves o.numBeg & o.numEnd booleans
//   undefined. Returns a value as a convenience for Easy.#plugCV().
//   c = arg count, u = units, s = seps, us = combined units + seps
    _seps(o) {
        const c  = o.c;              // normalize u to array:
        const u  = Is.A(o.u) ? o.u : new Array(c).fill(o.u);
        const us = new Array(c + 1); // the target array of units + separators

        o.numBeg = false;
        o.numEnd = false;
        us[0] = this.prefix;         // the bookends
        us[c] = u[c - 1] + E.rp;
        if (c > 1) {                 // 1-arg func has no separators
            let i, s;
            s = this.#separator;     // s = separator
            if (!Is.A(s))            // normalize s to array
                s = new Array(c - 1).fill(s);
            for (i = 1, j = 0; i < c; i++, j++)
                us[i] = u[j] + s[j];
        }
        o.seps = us;
        return us;
    }
}
//==============================================================================
class CFunc extends Func { ///////////\ CFunc: CSS color functions
    static _funcs = [];              // see F.alphaUnits()
    static A = 3;                    // alpha value index into arguments[]
    constructor(name, units, utype) {
        const u = (name[0] == "h")
                ? [units, U.pct, U.pct, units]  // units = ""
                : [units, units, units, units]; // alpha units set separately

        super(name, u, utype, CFunc.A + 1, CFunc.A, [E.sp, E.sp, " / "]);

        CFunc._funcs.push(this);
        Ez.is(this);
    }

    get alphaUnits() { return this._u[CFunc.A]; }
    set alphaUnits(val) {
        this._u[CFunc.A] = PFactory._validUnits(val, "alphaUnits", EMPTY_PCT);
    }
    get hueUnits() {
        if (this.hasHue)
            return this._u[this.hueIndex];
    }
    set hueUnits(val) {
        if (this.hasHue)
            this._u[this.hueIndex] = PFactory._validUnits(val, "hueUnits", ANGLES);
    }
    //================================= color conversion for rgb, hsl, hwb =====
    // fromColor() converts hex, color name, or color function value to an array
    //             of 3 or 4 color function arguments.
    fromColor(v, toNum = true, u = this._u) {
        let n, toHXX;                // n = array of numeric values
        if (v.at(-1) == E.rp) {      // v = func(...arguments)
            n = v.split(E.sepfunc).slice(1, -1);
            if (n.length > this.count) {
                if (this.space)            // color() function = ColorFunc
                    n.splice(0, 1);
                if (n.length > this.count) // remove "/" separator from array
                    n.splice(CFunc.A, 1);
            }
            toHXX = this.isHXX && v.substring(0, Fn.rgb.length) == Fn.rgb;
            if (toNum || toHXX)
                n = n.map(m => parseFloat(m));
        }
        else  {
            if (C[v])                // v == color name
                n = this.isRGB ? C[v].rgb
                  : this.isHSL ? C[v].hsl
                               : C[v].hwb;
            else if (v[0] == "#") {  // v == hex RGB, RGBA, RRGGBB, RRGGBBAA
                let bxx, d, pct, rx;  // pct for final result as rgb only, else
                v   = v.substring(1); // converted later to hsl|hwb.
                bxx = v.length > 4;   // bxx = RR versus R, 6 or 8 versus 3 or 4
                rx  = new RegExp(`.{${bxx + 1}}`, "g");
                pct = this.isRGB && u[0] == U.pct;
                d   = pct ? 2.55 : 1;
                n   = v.match(rx).map(s => parseInt(bxx ? s : s + s, 16) / d);
                if (n.length == 4) {  // convert alpha value to correct units
                    let ap = (u[CFunc.A] == U.pct);
                    n[CFunc.A] /= pct ? (ap ? 1 : 100) : (ap ? 2.55 : 255);
                }
                toHXX = this.isHXX;
            }
        }
        if (n) {
            if (toHXX)
                n = rgbToHXX(n, this.isHSL, u[0]);
            if (!toNum)
                n = n.map((num, i) => num + u[i]);
            return n;
        }
        return v;
    }
}
class ColorFunc extends CFunc {     //\ Only for color(), only one instance
    // colorspace is the first argument, and the raison d'être for this class
    static #spaces = ["srgb","srgb-linear","a98-rgb","prophoto-rgb",
                      "display-p3","rec2020","xyz","xyz-d50","xyz-d65"];
    static #spaces_ex = [...this.#spaces,"a98rgb-linear","acescc","acescg",
        "hsv","ictcp","jzczhz","jzazbz","lab-d65","p3-linear","prophoto-linear",
        "rec2020-linear","rec2100hlg","rec2100pq","xyz-abs-d65",]
    #space = ColorFunc.#spaces[0];
    #isEx  = false;
    constructor() { super(...arguments); }

    get space()    { return this.#space; }
    set space(val) {
        if (ColorFunc.#spaces_ex.includes(val)) {
            this.#space = val;
            this.#isEx  = !ColorFunc.#spaces.includes(val);
        }
        else
            Ez._invalidErr("space", val, ColorFunc.#spaces_ex);
    }
    get prefix() { return `${this.name}(${this.space} `; }
}
//==============================================================================
class SRFunc extends Func {         //\ SR = <shape-radius>: circle(), ellipse()
    constructor(name, units, utype) {
        let c, r, s, u;
        const at = " at ";
        if (name == Fn.circle) {
            u = [units, units, units];
            c = 3;
            r = 1;
            s = [at, E.sp];
        }
        else {  // ellipse
            u = [units, units, units, units];
            r = 2;
            c = 4;
            s = [E.sp, at, E.sp];
        }
        super(name, u, utype, c, r, s);
        Ez.is(this);
    }
}
//==============================================================================
//--color-mix() currently set to "unstructured", obviating the need for CMixFunc.
//--class CMixFunc extends CFunc {     //\ Only for color-mix(), only one instance
//--    // colorspace is the first argument, hue-interpolation-method is the second
//--    static #spaces = ["srgb","srgb-linear","lab","oklab","xyz","xyz-d50","xyz-d65",
//--                      "hsl","hwb","lch","oklch"];
//--    static #hues   = ["shorter","longer","increasing","decreasing"];
//--    #space = CMixFunc.#spaces[0];
//--    #hue   = CMixFunc.#hues  [0];
//--
//--    constructor() { super(...arguments); }
//--
//--    get space()    { return this.#space; }
//--    set space(val) {
//--        if (CMixFunc.#spaces.includes(val))
//--            this.#space = val;
//--        else
//--            Ez._invalidErr("space", val, CMixFunc.#spaces);
//--    }
//--    get hue()    { return this.#space; }
//--    set hue(val) {
//--        if (CMixFunc.#hues.includes(val))
//--            this.#hue = val;
//--        else
//--            Ez._invalidErr("hue", val, CMixFunc.#hues);
//--    }
//--    get prefix() {
//--        const hue = (this.#hue == CMixFunc.#hues[0])
//--                  ? "" // shorter is the default and ignored by the browsers
//--                  : ` ${this.#hue} hue`;
//--
//--        return `${this.name}(in ${this.space}${hue}, `;
//--    }
//--}
