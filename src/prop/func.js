// Not exported by raf.js
export {Func, CFunc, ColorFunc, SRFunc};

import {ANGLES, EMPTY_PCT, Fn, PFunc} from "./pfunc.js";
import {C}                            from "./color-names.js"

import {E, Is, U} from "../globals.js";
import {Ez}       from "../ez.js";
//==============================================================================
class Func {                    //\ Func: CSS or SVG function
    #units; #separator;          // c = count, r = required, s = separator

    static gradients = ["linear-gradient","radial-gradient","conic-gradient",
                        "repeating-linear-gradient","repeating-radial-gradient",
                        "repeating-conic-gradient"];

    // name is the CSS/SVG function name, key is a camelCase version of name
    constructor(name, key, units, utype, c, r, s = E.comma) {
        Ez.readOnly(this, "name", name);
        Ez.readOnly(this, "key",  key);
        Ez.readOnly(this, utype,  true);
        if (!Is.def(c)) {        // else called from sub-class constructor
            switch (name) {
            case Fn.dS:          // units = px
                units = [units, units, units, ""];
                Ez.is(this, "DropShadow");
                s = E.sp;
                c = 4;  r = 2;  break;
            case Fn.cubicBezier: // no units
                c = 4;  r = 4;  break;
            case Fn.skew:        // units = "" for transforms
            case Fn.scale: case Fn.translate:
                c = 2;  r = 1;  break;
            case Fn.rotate:      // CSS rotate(), SVG rotate in class Bute
            case Fn.rotateX: case Fn.rotateY: case Fn.rotateZ:
                c = 1;  r = 1;  break;
            case Fn.matrix:
                c = 6;  r = 6;  break;
            case Fn.scale3d: case Fn.translate3d:
                c = 3;  r = 3;  break;
            case Fn.rotate3d:    // 4th arg is <angle>
                c = 4;  r = 4;
                units = ["", "", "", units];
                Ez.is(this, "Rotate3d");
                break;
            case Fn.matrix3d:
                c = 16; r = 16; break
            default:             // 1 arg or N args, N args == isUn = 0 here
                const n = Number(!this.IsUn);
                c = n;           // isUn never uses count or required
                r = n;           // internally, but 0 is a better value than 1
            }
        }
        Ez.readOnly(this, "count",    c); // count    = total    argument count
        Ez.readOnly(this, "required", r); // required = required argument count
        this.#units = units;
        this.#separator = s;
        Ez.is(this, "Func");     // along with isCFunc, isSRFunc
    }
// this.units
    get units()  {
        return !Is.A(this.#units) ? this.#units
              : this.isRotate3d   ? this.#units[3]
                                  : this.#units[0];
    }
    set units(val) {    // units arrays are a necessary hassle
        val = PFunc._validUnits(val, this.key, this);
        if (this.isCFunc)
            if (this.hasHue)
                if (this.isHXX)
                    this.#units[0] = val;
                else    // lch, oklch
                    this.#units.fill(val, 0, C.a - 1);
            else
                this.#units.fill(val, 0, C.a);
        else
            this.isSRFunc     ? this.#units.fill(val)
          : this.isDropShadow ? this.#units.fill(val, 0, 3)
          : this.isRotate3d   ? this.#units[3] = val
                              : this.#units    = val;
    }
// this._u opens the backdoor for CFunc, PBase
    get _u() { return this.#units; }

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
        return Ez._join(arr, u, this.#separator);
    }
//  _seps() sets o.seps to a dense array of concatenated units + separators,
//   bookended as ["func(", ..., "u)"]. Leaves o.numBeg & o.numEnd booleans
//   undefined. Returns a value as a convenience for Easy.#plugCV().
//   c = arg count, u = units, s = seps, us = combined units + seps
    _seps(o) {
        const c  = o.c;              // normalize u to array:
        const u  = Is.A(o.u) ? o.u : Array(c).fill(o.u);
        const us = Array(c + 1);     // the target array of units + separators

        o.numBeg = false;
        o.numEnd = false;
        us[0] = this.prefix;         // the bookends
        us[c] = u[c - 1] + E.rp;
        if (c > 1) {                 // 1-arg func has no separators
            let i, j, s;
            s = this.#separator;     // s = separator
            if (!Is.A(s))            // normalize s to array
                s = Array(c - 1).fill(s);
            for (i = 1, j = 0; i < c; i++, j++)
                us[i] = u[j] + s[j];
        }
        o.seps = us;
        return us;
    }
}
//==============================================================================
class CFunc extends Func {      //\ CFunc: CSS color functions
    static funcs = {};
    static funcNames = ["rgb","hsl","hwb","lch","oklch","lab","oklab"];

    constructor(name, key, units, utype) {
        const u = (name[0] == "h")
                ? [units, U.pct, U.pct, units]  // units = ""
                : [units, units, units, units]; // alpha has its own get/setters

        super(name, key, u, utype, C.a + 1, C.a, [E.sp, E.sp, " / "]);

        CFunc.funcs[name] = this;
        Ez.is(this, "CFunc");
    }
// this.alphaUnits are the units for the alpha argument: "" or U.pct
    get alphaUnits() { return this._u[C.a]; }
    set alphaUnits(val) {
        this._u[C.a] = PFunc._validUnits(val, "alphaUnits", EMPTY_PCT);
    }
// this.hueUnits are the units for the hue argument in hsl, hwb, lch, oklch
    get hueUnits() {
        if (this.hasHue)
            return this._u[this.hueIndex]; // .hueIndex set in PFactory.init()
    }
    set hueUnits(val) {
        if (this.hasHue)
            this._u[this.hueIndex] = PFunc._validUnits(val, "hueUnits", ANGLES);
    }
//  These two set all the funcs' units at once:
    static set alphaUnits(val) {
        val = this._validUnits(val, "alphaUnits", EMPTY_PCT);
        for (const f of Object.values(CFunc.funcs))
            f._u[C.a] = val;
    }
    static set hueUnits(val) {
        val = this._validUnits(val, "hueUnits", ANGLES);
        for (const f of Object.values(CFunc.funcs))
            if (f.hasHue)
                f._u[f.hueIndex] = val;
    }
}
//==============================================================================
class ColorFunc extends CFunc { //\ ColorFunc: CSS color() function
    // colorspace is the first argument, and the raison d'être for this class
    static spaces  = ["srgb","srgb-linear","a98-rgb","prophoto-rgb",
                      "display-p3","rec2020","xyz-d65","xyz-d50"];
    static aliases = [,,"a98rgb","prophoto", "p3",,"xyz",];
    #space;
    constructor(name, key, units, utype) {
        super(Fn.color, key, units, utype);
        this.#space = name; // no validation, called only by PFactory.init()
    }
    get space()  { return this.#space; }
    get prefix() { return `${this.name}(${this.space} `; }
}
//==============================================================================
class SRFunc extends Func {     //\ SRFunc: <shape-radius> = circle(), ellipse()
    constructor(name, key, units, utype) {
        let c, r, s, u;
        const at = " at ";
        if (name == Fn.circle) {
            u = [units, units, units];  // units
            c = 3;                      // arg count
            r = 1;                      // required arg count
            s = [at, E.sp];             // separators
        }
        else {  // ellipse
            u = [units, units, units, units];
            c = 4;
            r = 2;
            s = [E.sp, at, E.sp];
        }
        super(name, key, u, utype, c, r, s);
        Ez.is(this);
    }
}