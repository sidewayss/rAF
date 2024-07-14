// Not exported by raf.js
export {Func, CFunc, ColorFunc, SRFunc};

import {PFactory, ANGLES, EMPTY_PCT} from "./pfactory.js";
import {E, Ez, Fn, Is, U} from "../raf.js";
//==============================================================================
class Func {                    //\ Func: CSS or SVG function
    #units; #separator;          // c = count, r = required, s = separator
    constructor(name, units, utype, c, r, s = E.comma) {
        Ez.readOnly(this, "name", name);
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
            case Fn.rotate:      // these settings are for CSS rotate()
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
        val = PFactory._validUnits(val, this.name, this);
        if (this.isCFunc)
            if (this.hasHue)
                if (this.isHXX)
                    this.#units[0] = val;
                else    // lch, oklch
                    this.#units.fill(val, 0, CFunc.A - 1);
            else
                this.#units.fill(val, 0, CFunc.A);
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
        const u  = Is.A(o.u) ? o.u : new Array(c).fill(o.u);
        const us = new Array(c + 1); // the target array of units + separators

        o.numBeg = false;
        o.numEnd = false;
        us[0] = this.prefix;         // the bookends
        us[c] = u[c - 1] + E.rp;
        if (c > 1) {                 // 1-arg func has no separators
            let i, j, s;
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
class CFunc extends Func {      //\ CFunc: CSS color functions
    static _funcs = {};          // see PFactory.alphaUnits(), hueUnits()
    static A = 3;                // alpha value index in arguments
    constructor(name, units, utype) {
        const u = (name[0] == "h")
                ? [units, U.pct, U.pct, units]  // units = ""
                : [units, units, units, units]; // alpha has its own get/setters

        super(name, u, utype, CFunc.A + 1, CFunc.A, [E.sp, E.sp, " / "]);

        CFunc._funcs[name] = this;
        Ez.is(this, "CFunc");
    }
// this.alphaUnits are the units for the alpha argument: "" or U.pct
    get alphaUnits() { return this._u[CFunc.A]; }
    set alphaUnits(val) {
        this._u[CFunc.A] = PFactory._validUnits(val, "alphaUnits", EMPTY_PCT);
    }
// this.hueUnits are the units for the hue argument in hsl, hwb, lch, oklch
    get hueUnits() {
        if (this.hasHue)
            return this._u[this.hueIndex]; // .hueIndex set in PFactory.init()
    }
    set hueUnits(val) {
        if (this.hasHue)
            this._u[this.hueIndex] = PFactory._validUnits(val, "hueUnits", ANGLES);
    }
}
//==============================================================================
class ColorFunc extends CFunc { //\ ColorFunc: CSS color() function
    // colorspace is the first argument, and the raison d'être for this class
    // spaces excludes srgb (use rgb() instead) and xyz-d65 becomes an alias.
    static spaces  = ["srgb-linear","a98-rgb","prophoto-rgb",
                      "display-p3","rec2020","xyz-d65","xyz-d50"];
    static aliases = [,"a98rgb","prophoto", "p3",,"xyz",];
    #space;
    constructor(units, utype, space) {
        super(Fn.color, units, utype);
        this.#space = space; // no validation, called only by PFactory.init()
    }
    get space()  { return this.#space; }
    get prefix() { return `${this.name}(${this.space} `; }
}
//==============================================================================
class SRFunc extends Func {     //\ SRFunc: <shape-radius> = circle(), ellipse()
    constructor(name, units, utype) {
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
        super(name, u, utype, c, r, s);
        Ez.is(this);
    }
}