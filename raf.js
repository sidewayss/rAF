////////////////////////////////////////////////////////////////////////////////
// rAF stands for requestAnimationFrame().
// Copyright (C) 2023 Sideways S, www.sidewayss.com
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details: <https://www.gnu.org/licenses/>
////////////////////////////////////////////////////////////////////////////////
/* jshint esversion: 6 *//* jshint strict: global *//* jshint elision: true */
/* jshint -W014 *//* jshint -W069 *//* jshint -W078 */
/* jshint -W083 *//* jshint -W117 *//* jshint -W138 */
"use strict";
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| Global Constants |||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
const C = {              // CSS4 named colors as rgb and hsl arrays
    aliceblue            : { rgb:[240,248,255], hsl:[208,100, 97] },
    antiquewhite         : { rgb:[250,235,215], hsl:[ 34, 78, 91] },
    aqua                 : { rgb:[  0,255,255], hsl:[180,100, 50] },
    aquamarine           : { rgb:[127,255,212], hsl:[160,100, 75] },
    azure                : { rgb:[240,255,255], hsl:[180,100, 97] },
    beige                : { rgb:[245,245,220], hsl:[ 60, 56, 91] },
    bisque               : { rgb:[255,228,196], hsl:[ 33,100, 88] },
    black                : { rgb:[  0,  0,  0], hsl:[  0,  0,  0] },
    blanchedalmond       : { rgb:[255,235,205], hsl:[ 36,100, 90] },
    blue                 : { rgb:[  0,  0,255], hsl:[240,100, 50] },
    blueviolet           : { rgb:[138, 43,226], hsl:[271, 76, 53] },
    brown                : { rgb:[165, 42, 42], hsl:[  0, 41, 41] },
    burlywood            : { rgb:[222,184,135], hsl:[ 34, 57, 70] },
    cadetblue            : { rgb:[ 95,158,160], hsl:[182, 25, 50] },
    chartreuse           : { rgb:[127,255,  0], hsl:[ 90,100, 50] },
    chocolate            : { rgb:[210,105, 30], hsl:[ 25, 67, 47] },
    coral                : { rgb:[255,127, 80], hsl:[ 16,100, 66] },
    cornflowerblue       : { rgb:[100,149,237], hsl:[219, 79, 66] },
    cornsilk             : { rgb:[255,248,220], hsl:[ 48,100, 93] },
    crimson              : { rgb:[220, 20, 60], hsl:[348, 74, 47] },
    cyan                 : { rgb:[  0,255,255], hsl:[180,100, 50] },
    darkblue             : { rgb:[  0,  0,139], hsl:[240, 37, 27] },
    darkcyan             : { rgb:[  0,139,139], hsl:[180, 37, 27] },
    darkgoldenrod        : { rgb:[184,134, 11], hsl:[ 43, 55, 38] },
    darkgray             : { rgb:[169,169,169], hsl:[  0,  0, 66] },
    darkgreen            : { rgb:[  0,100,  0], hsl:[120, 24, 20] },
    darkgrey             : { rgb:[169,169,169], hsl:[  0,  0, 66] },
    darkkhaki            : { rgb:[189,183,107], hsl:[ 56, 38, 58] },
    darkmagenta          : { rgb:[139,  0,139], hsl:[300, 37, 27] },
    darkolivegreen       : { rgb:[ 85,107, 47], hsl:[ 82, 17, 30] },
    darkorange           : { rgb:[255,140,  0], hsl:[ 33,100, 50] },
    darkorchid           : { rgb:[153, 50,204], hsl:[280, 60, 50] },
    darkred              : { rgb:[139,  0,  0], hsl:[  0, 37, 27] },
    darksalmon           : { rgb:[233,150,122], hsl:[ 15, 72, 70] },
    darkseagreen         : { rgb:[143,188,143], hsl:[120, 25, 65] },
    darkslateblue        : { rgb:[ 72, 61,139], hsl:[248, 25, 39] },
    darkslategray        : { rgb:[ 47, 79, 79], hsl:[180,  8, 25] },
    darkslategrey        : { rgb:[ 47, 79, 79], hsl:[180,  8, 25] },
    darkturquoise        : { rgb:[  0,206,209], hsl:[181, 69, 41] },
    darkviolet           : { rgb:[148,  0,211], hsl:[282, 71, 41] },
    deeppink             : { rgb:[255, 20,147], hsl:[328,100, 54] },
    deepskyblue          : { rgb:[  0,191,255], hsl:[195,100, 50] },
    dimgray              : { rgb:[105,105,105], hsl:[  0,  0, 41] },
    dimgrey              : { rgb:[105,105,105], hsl:[  0,  0, 41] },
    dodgerblue           : { rgb:[ 30,144,255], hsl:[210,100, 56] },
    firebrick            : { rgb:[178, 34, 34], hsl:[  0, 48, 42] },
    floralwhite          : { rgb:[255,250,240], hsl:[ 40,100, 97] },
    forestgreen          : { rgb:[ 34,139, 34], hsl:[120, 31, 34] },
    fuchsia              : { rgb:[255,  0,255], hsl:[300,100, 50] },
    gainsboro            : { rgb:[220,220,220], hsl:[  0,  0, 86] },
    ghostwhite           : { rgb:[248,248,255], hsl:[240,100, 99] },
    gold                 : { rgb:[255,215,  0], hsl:[ 51,100, 50] },
    goldenrod            : { rgb:[218,165, 32], hsl:[ 43, 72, 49] },
    gray                 : { rgb:[128,128,128], hsl:[  0,  0, 50] },
    green                : { rgb:[  0,128,  0], hsl:[120, 34, 25] },
    greenyellow          : { rgb:[173,255, 47], hsl:[ 84,100, 59] },
    grey                 : { rgb:[128,128,128], hsl:[  0,  0, 50] },
    honeydew             : { rgb:[240,255,240], hsl:[120,100, 97] },
    hotpink              : { rgb:[255,105,180], hsl:[330,100, 71] },
    indianred            : { rgb:[205, 92, 92], hsl:[  0, 53, 58] },
    indigo               : { rgb:[ 75,  0,130], hsl:[275, 34, 25] },
    ivory                : { rgb:[255,255,240], hsl:[ 60,100, 97] },
    khaki                : { rgb:[240,230,140], hsl:[ 54, 77, 75] },
    lavender             : { rgb:[230,230,250], hsl:[240, 67, 94] },
    lavenderblush        : { rgb:[255,240,245], hsl:[340,100, 97] },
    lawngreen            : { rgb:[124,252,  0], hsl:[ 90, 98, 49] },
    lemonchiffon         : { rgb:[255,250,205], hsl:[ 54,100, 90] },
    lightblue            : { rgb:[173,216,230], hsl:[195, 53, 79] },
    lightcoral           : { rgb:[240,128,128], hsl:[  0, 79, 72] },
    lightcyan            : { rgb:[224,255,255], hsl:[180,100, 94] },
    lightgoldenrodyellow : { rgb:[250,250,210], hsl:[ 60, 80, 90] },
    lightgray            : { rgb:[211,211,211], hsl:[  0,  0, 83] },
    lightgreen           : { rgb:[144,238,144], hsl:[120, 73, 75] },
    lightgrey            : { rgb:[211,211,211], hsl:[  0,  0, 83] },
    lightpink            : { rgb:[255,182,193], hsl:[351,100, 86] },
    lightsalmon          : { rgb:[255,160,122], hsl:[ 17,100, 74] },
    lightseagreen        : { rgb:[ 32,178,170], hsl:[177, 49, 41] },
    lightskyblue         : { rgb:[135,206,250], hsl:[203, 92, 75] },
    lightslategray       : { rgb:[119,136,153], hsl:[210, 14, 53] },
    lightslategrey       : { rgb:[119,136,153], hsl:[210, 14, 53] },
    lightsteelblue       : { rgb:[176,196,222], hsl:[214, 41, 78] },
    lightyellow          : { rgb:[255,255,224], hsl:[ 60,100, 94] },
    lime                 : { rgb:[  0,255,  0], hsl:[120,100, 50] },
    limegreen            : { rgb:[ 50,205, 50], hsl:[120, 61, 50] },
    linen                : { rgb:[250,240,230], hsl:[ 30, 67, 94] },
    magenta              : { rgb:[255,  0,255], hsl:[300,100, 50] },
    maroon               : { rgb:[128,  0,  0], hsl:[  0, 34, 25] },
    mediumaquamarine     : { rgb:[102,205,170], hsl:[160, 51, 60] },
    mediumblue           : { rgb:[  0,  0,205], hsl:[240, 67, 40] },
    mediumorchid         : { rgb:[186, 85,211], hsl:[288, 59, 58] },
    mediumpurple         : { rgb:[147,112,219], hsl:[260, 60, 65] },
    mediumseagreen       : { rgb:[ 60,179,113], hsl:[147, 44, 47] },
    mediumslateblue      : { rgb:[123,104,238], hsl:[249, 80, 67] },
    mediumspringgreen    : { rgb:[  0,250,154], hsl:[157, 96, 49] },
    mediumturquoise      : { rgb:[ 72,209,204], hsl:[178, 60, 55] },
    mediumvioletred      : { rgb:[199, 21,133], hsl:[322, 61, 43] },
    midnightblue         : { rgb:[ 25, 25,112], hsl:[240, 23, 27] },
    mintcream            : { rgb:[245,255,250], hsl:[150,100, 98] },
    mistyrose            : { rgb:[255,228,225], hsl:[  6,100, 94] },
    moccasin             : { rgb:[255,228,181], hsl:[ 38,100, 85] },
    navajowhite          : { rgb:[255,222,173], hsl:[ 36,100, 84] },
    navy                 : { rgb:[  0,  0,128], hsl:[240, 34, 25] },
    oldlace              : { rgb:[253,245,230], hsl:[ 39, 85, 95] },
    olive                : { rgb:[128,128,  0], hsl:[ 60, 34, 25] },
    olivedrab            : { rgb:[107,142, 35], hsl:[ 80, 32, 35] },
    orange               : { rgb:[255,165,  0], hsl:[ 39,100, 50] },
    orangered            : { rgb:[255, 69,  0], hsl:[ 16,100, 50] },
    orchid               : { rgb:[218,112,214], hsl:[302, 59, 65] },
    palegoldenrod        : { rgb:[238,232,170], hsl:[ 55, 67, 80] },
    palegreen            : { rgb:[152,251,152], hsl:[120, 93, 79] },
    paleturquoise        : { rgb:[175,238,238], hsl:[180, 65, 81] },
    palevioletred        : { rgb:[219,112,147], hsl:[340, 60, 65] },
    papayawhip           : { rgb:[255,239,213], hsl:[ 37,100, 92] },
    peachpuff            : { rgb:[255,218,185], hsl:[ 28,100, 86] },
    peru                 : { rgb:[205,133, 63], hsl:[ 30, 59, 53] },
    pink                 : { rgb:[255,192,203], hsl:[350,100, 88] },
    plum                 : { rgb:[221,160,221], hsl:[300, 47, 75] },
    powderblue           : { rgb:[176,224,230], hsl:[187, 52, 80] },
    purple               : { rgb:[128,  0,128], hsl:[300, 34, 25] },
    rebeccapurple        : { rgb:[102, 51,153], hsl:[270, 33, 40] },
    red                  : { rgb:[255,  0,  0], hsl:[  0,100, 50] },
    rosybrown            : { rgb:[188,143,143], hsl:[  0, 25, 65] },
    royalblue            : { rgb:[ 65,105,225], hsl:[225, 73, 57] },
    saddlebrown          : { rgb:[139, 69, 19], hsl:[ 25, 34, 31] },
    salmon               : { rgb:[250,128,114], hsl:[  6, 93, 71] },
    sandybrown           : { rgb:[244,164, 96], hsl:[ 28, 87, 67] },
    seagreen             : { rgb:[ 46,139, 87], hsl:[146, 29, 36] },
    seashell             : { rgb:[255,245,238], hsl:[ 25,100, 97] },
    sienna               : { rgb:[160, 82, 45], hsl:[ 19, 38, 40] },
    silver               : { rgb:[192,192,192], hsl:[  0,  0, 75] },
    skyblue              : { rgb:[135,206,235], hsl:[197, 71, 73] },
    slateblue            : { rgb:[106, 90,205], hsl:[248, 53, 58] },
    slategray            : { rgb:[112,128,144], hsl:[210, 13, 50] },
    slategrey            : { rgb:[112,128,144], hsl:[210, 13, 50] },
    snow                 : { rgb:[255,250,250], hsl:[  0,100, 99] },
    springgreen          : { rgb:[  0,255,127], hsl:[150,100, 50] },
    steelblue            : { rgb:[ 70,130,180], hsl:[207, 42, 49] },
    tan                  : { rgb:[210,180,140], hsl:[ 34, 44, 69] },
    teal                 : { rgb:[  0,128,128], hsl:[180, 34, 25] },
    thistle              : { rgb:[216,191,216], hsl:[300, 24, 80] },
    tomato               : { rgb:[255, 99, 71], hsl:[  9,100, 64] },
    turquoise            : { rgb:[ 64,224,208], hsl:[174, 72, 56] },
    violet               : { rgb:[238,130,238], hsl:[300, 76, 72] },
    wheat                : { rgb:[245,222,179], hsl:[ 39, 77, 83] },
    white                : { rgb:[255,255,255], hsl:[  0,  0,100] },
    whitesmoke           : { rgb:[245,245,245], hsl:[  0,  0, 96] },
    yellow               : { rgb:[255,255,  0], hsl:[ 60,100, 50] },
    yellowgreen          : { rgb:[154,205, 50], hsl:[ 80, 61, 50] }
};

/* eslint-disable no-useless-escape */
const E  = {          // E for Easy and psuedo-enums
     wsp:/[\s]+/,         sp:" ",    x:0,  R:0,  H:0,  let:0,  arrived:0,
   comsp:/[,\s]+/,     comma:",",    y:1,  G:1,  S:1,  set:1,  return :1,
   gdash:/-/g,          hash:"#",    w:2,  B:2,  L:2,  net:2,  pausing:2,
    func:/[\(\)]/,        lp:"(",    h:3,  A:3,        in :0,  mid    :3,
   gfunc:/t\(/,           rp:")",    yes:"Y",          out:1,  outward:4,
 sepfunc:/[,\s\(\)]+/,   num:/-?[\d\.]+/g,       increment:2,  waiting:5
};
/* eslint-enable no-useless-escape */

// These consts are populated by class Ez
const P  = {}; // property (attribute) names as strings
const PR = {}; // class Prop instances
const F  = {}; // function names
const FN = {}; // class Func instances
const U  = {}; // units strings, e.g. "px", "deg"

//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| Class Library ||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
class Is {                           // Is: helpful boolean functions wrapped-up
    static A(v)      { return Array.isArray(v);          }
    static A2(a)     { return a.some(v => Is.A(v));      } // is 2D array?
    static N(v)      { return typeof v == "number";      }
    static String(v) { return typeof v == "string";      }
    static def(v)    { return v !== undefined;           }
    static oneElm(v) { return v.tagName || Is.String(v); }
}
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| Prop classes: Func, Prop, Ez |||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
class Func {                         // Func: CSS or SVG function ||||||||||||||
    constructor(name, units) {
        this.name = name;
        switch (name) {              // count property == function arg count
      //case F.calc: case F.lg: case F.rg: case F.rlg: case F.rrg:
      //    this.count = -2;         // CSS gradients have a flexible structure
      //    break;
        case F.hsl: case F.hsla:
            this.hsl   = true;       // eslint-disable-line no-fallthrough
        case F.rgb: case F.rgba:
            this.color = true;
            this.count = this.name.length;
            break;
        case F.t:   case F.s:   case F.skew:
            this.count =  2;
            break;
        case F.r:   case F.s3:  case F.t3:
            this.count =  3;
            break;
        case F.cb:  case F.r3:
            this.count =  4;
            break;
        case F.m:
            this.count =  6;
            break;
        case F.m3:
            this.count = 16;         // eslint-disable-line no-fallthrough
        default:                     // .count used as a boolean: array or not?
        }                            // unitz = variable, units = getter/setter
        this.constructor.setUnits(this, units);
        this.separator = (name == F.calc ? E.sp : E.comma);
        this.plug      = (name == F.s ||
                          name == F.s3   ? "1"  : "0") + units;
        if (E.gfunc.test(this.name))
            this.isGradient = true;
        Object.seal(this);
    }
    /////////////////////////////////// apply()
    apply(v) { return this.name + E.lp + v + E.rp; }
    /////////////////////////////////// units is public, unitz is "private"
    get units()  { return this.unitz; }
    set units(u) { this.constructor.setUnits(this, u); }
    static setUnits(f, u) {          // kludgy to call setter from contructor
        if (f === FN.r3)             // units arrays are a necessary hassle
            f.unitz = ["", "", "", u];
        else if (f.hsl)              // hsla is funky, I fix alpha as percent
            f.unitz = [u, U.pct, U.pct, U.pct];
        else
            f.unitz = u;
    }
    /////////////////////////////////// hex and named colors require conversion
    fromColor(v, u = this.units) {   // fromColor() converts hex or named color
        if (!this.color) return v;   // to array of numeric args for this func.

        let n, pct;                  // rgb units "" or %, hsl units "" or angle
        pct = (u == U.pct);          // percent units require conversion
        if (v.charAt(0) == E.hash) {
            let bRR, d, rx;          // convert hex RGB, RGBA, RRGGBB, RRGGBBAA
            v   = v.substring(1);    // to an array of 3 or 4 numeric arguments.
            bRR = v.length > 4;      // bRR = RR versus R, 6 or 8 versus 3 or 4
            rx  = new RegExp(`.{${bRR + 1}}`, "g");
            d   = pct ? 2.55 : 1;
            n   = v.match(rx).map(s => parseInt(bRR ? s : s + s, 16) / d);
            if (this.count == 4 && n.length == 4 && !pct)
                n[3] /= 255;         // alpha value is 0 to 1, not 0 to 255
            if (this.hsl)
                n = this.constructor.toHSL(n, pct);
        }
        else if (C[v])               // color name
            n = this.hsl ? C[v].hsl : C[v].rgb;

        if (n && n.length < this.count)
            n.push(pct ? 100 : 1);   // assumes only the alpha value is missing,
                                     // otherwise it's not a legit color value.
        return n || v;
    }
    static toHSL(n, pct, u = false) {// helps fromColor()
        let diff, hsl, max, min, rgb, sum;
        const R = 0, G = 1, B = 2, A = 3, H = 0, S = 1, L = 2;
        rgb  = n.slice(0, 3).map(v => v / (pct ? 100 : 255));
        max  = Math.max(...rgb);     // n is an array of 3 or 4 numbers
        min  = Math.min(...rgb);     // pct is a boolean: isPercent
        diff = max - min;
        sum  = max + min;
        hsl  = new Array(n.length);
        if (n.length > A)
            hsl[A] = n[A];
        hsl[L] = (sum / 2) * 100;    // saturation and lightness are percents
        if (diff) {
            hsl[S] = diff / (hsl[2] < 50 ? sum : 2 - sum) * 100;
            switch(max) {
            case rgb[R]:
                n =  (rgb[G] - rgb[B]) / diff;
                break;
            case rgb[1]:
                n = ((rgb[B] - rgb[R]) / diff) + 2;
                break;
            case rgb[2]:
                n = ((rgb[R] - rgb[G]) / diff) + 4;
                break;
            }
            hsl[H] = n * 60;         // hue defaults to degrees, but other units
            if (u && u != U.deg)     // are allowed. how often are they used??
                hsl[H] *= EZ[u];     // the tradeoff = only % allowed for alpha
        }
        else {
            hsl[H] = 0;
            hsl[S] = 0;
        }
        return hsl;
    }
} ///////////////////////////////////// end class Func |||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Prop {                         // Prop: CSS property or SVG attribute ||||
    constructor(name, units, func = undefined) {
        this.name = name;
        this.func = func;
        if (units === false) {       // false means SVG attribute
            this.svg   = true;
            this.units = "";
            if (name == P.d || name == P.p) // d and points are unstructured
                this.isDPoints = true;      // <text>/<tspan> x, y, dx, dy, and
        }                                   // rotate are optional unstructured
        else {
            this.units = units;
            const rx   = /[A-Z]/g;   // CSS names != JavaScript names :(
            let x = rx.exec(name);   // only this.cut() requires cssName, but
            if (x) {                 // it might be useful elsewhere...
                let s = "";          // the property is only defined as needed
                let i = 0;
                let z;
                while (x) {
                    s += (name.substring(i, x.index) + "-"
                        + name.charAt(x.index).toLowerCase());
                    i = x.index + 1;
                    z = name.substring(i);
                    x = rx.exec(name);
                }
                this.cssName = s + z;
            }
        }
        if (name == P.t)             // these last ifs are so that I can seal it
            this.isTransform = true; // a mild performance hit for a clean const
        if (name == P.sc)
            this.svg = true;
        if (name == P.w || name == P.h)
            this.svg1 = true;        // SVG1 cannot style these, SVG2 can.
        Object.seal(this);
    }
    /////////////////////////////////// count() separator() plug() units() /////
    count(f = this.func) {          //\ count() returns argument count
        if (f && !Is.A(f) && !(f === FN.r && this === PR.tCSS))
            return f.count;          // if (count < 2) return undefined
        else {
            switch (this) {
          //case PR.d: PR.points:
          //    return -1;           // d and points have a flexible structure
            case PR.bF:
                return  2;
            case PR.tO:
                return  3;
            case PR.vB: case PR.m: case PR.p:
                return  4;
            case PR.values:
                return 20;
            default:      }
        }
    }                               //\ separator() plug() for value lists only
    separator(f = this.func) {       // only font-family uses commas
        if (f)                       // to set font-family with multiple values
            return f.separator;      // you must use set() with 1 string value.
        return E.sp;                 // PR.fF.let() is an unlikely requirement.
    }
    plug(f = this.func) {           //\ plug() is the default sub-value
        if (f)
            return f.plug;
        return "0" + this.units;     //??any other plug defaults??
    }
    unitz(f = this.func) {          //\ unitz() is because getters have no args
        if (f) {
            if (f.units)
                return f.units;
            else if (this === PR.tCSS) {
                switch (f) {
                case FN.t:           // fallback if no value specified
                    return U.px;
                case FN.r:           // CSS FN.r == FN.rZ
                    return U.deg;
                }
            }
        }
        return this.units;
    }
    //!!izSVG() might need a way to force .style, i.e return false
    izSVG(elm) { return this.svg || this.svg1 && elm instanceof SVGElement; }
    /////////////////////////////////// Remove Function: renamed to "cut" //////
    cut(elms) {
        elms = this.constructor.elmArray(elms);
        elms.forEach((elm) => {
            if (this.izSVG(elm))
                elm.removeAttribute(this.name);
            else
                elm.style.removeProperty(this.cssName || this.name);
        });
    }
    /////////////////////////////////// Get Functions: get() getn() getu() /////
    get(elms) {             //////////\ get() returns the raw string values
        let b = Is.oneElm(elms);    //\ if elms is any kind of collection, it
        elms  = this.constructor.elmArray(elms);
        if (!b) {                   //\ returns an array, even if length == 1.
            let l = elms.length;    //\ normalizes CSS/SVG and converts null to
            let s = new Array(l);   //\ "", see zget().
            for (let i = 0; i < l; i++)
                s[i] = this.constructor.zget(this, elms[i]);
            return s;
        }
        else    return this.constructor.zget(this, elms[0]);
    }
    static zget(t, elm) {           //\ zget() gets a single element's value
        let s;
        if (t.svg)
            s = elm.getAttribute(t.name);
        else {
            s = elm.style[t.name];   // two possible fallbacks: svg value or...
            if (!s & elm instanceof SVGElement)
                s = elm.getAttribute(t.name);
            if (!s)                  // ...css value within document's <style>.
                s = getComputedStyle(elm)[t.name];
        }
        return s ? s.trim() : "";    // trim is safe, "" is friendlier than null
    }                       ////////////////////////////////////////////////////
    getn(elms, f, u) {      //////////\ getn() converts values to numbers
        let v = this.get(elms);
        return Is.A(v) ? this.za(v, f, u) : this.zn(v, f, u);
    }
    za(arr, f, u) {                 //\ za() converts an array of elms' values
        let l = arr.length;         //\ za(), zn(), and zparse() are called by
        let v = new Array(l);       //\ new Easer() too.
        for (let i = 0; i < l; i++)
            v[i] = this.zn(arr[i], f, u);
        return v;
    }
    zn(s, f, u = this.unitz(f)) {   //\ zn() converts 1 element's value(s)
        s = this.zparse(s, f);
        return Is.A(s) ? s.map(v => Prop.toNumber(v, f, u))
                       : Prop.toNumber(s, f, u);
    }
    zparse(s, f = this.func) {      //\ zparse() parses one element's value
        let v = "";
        let i = s.indexOf(E.lp);
        while (i >= 0) {             // if (function) get the arguments
            v += s.substring(++i, s.indexOf(E.rp, i)) + E.sp;
            i  = s.indexOf(E.lp, i); // if (>1 function) separate with E.sp
        }
        v = (v ? v.trim() : s);
        v = v.split(E.comsp);
                                     // if (value list) always return an array
        return v.length > 1 || this.count(f) ? v : v[0];
    }                       ////////////////////////////////////////////////////
    getu(elms, f = this.func) { //////\ getu() is for unstructured attrs/funcs
        let i, l, o, seps, vals, x; //\ it is designed to help new Geaser()
        elms = this.constructor.elmArray(elms);
        l = elms.length;            //\ it returns an object with 5 properties
        x = this.get(elms);          // elms and x are always arrays
        o = {};                      // returned object has 3 array properties
        o.vals = new Array(l);       // numeric values as strings
        o.seps = new Array(l);       // string leftovers as separators
        o.nums = new Array(l);       // numeric values as numbers
        for (i = 0; i < l; i++) {    // pre-process hex and named colors
            if (x[i] && f && f.color) {
                vals = x[i].split(E.sepfunc);
                seps = x[i].match(E.sepfunc);
                x[i] = "";
                if (seps.length < vals.length)
                    seps.push("");   // simplifies the loop
                vals.forEach((v, i) => {
                    v = f.fromColor(v);
                    if (Is.A(v))      // named colors limit the use of RegExp
                        vals[i] = f.apply(v.join(f.separator));
                    x[i] += vals[i] + seps[i];
                });
            }                        // create the return values
            o.vals[i] = x[i].match(E.num) || [""];
            o.seps[i] = x[i].split(E.num);
            o.nums[i] = o.vals[i].map(this.constructor.toNumber);
        }                            // does it begin and/or end with a number?
        o.numBeg = new RegExp("^" + E.num.source).test(x[0]);
        o.numEnd = new RegExp(E.num.source + "$").test(x[0]);
        return o;                    // if (>1 element) value formats must align
    }
    /////////////////////////////////// Set Functions: set() let() vet() net()
    set(elms, v, f, u) {    //////////\ set() overrides everything
        let b, c, i;
        elms = this.constructor.elmArray(elms);
        c    = this.count(f);
        b    = this.constructor.dims(v) == (c ?  2 : 1);
        for (i = 0; i < elms.length; i++)
           this.constructor.set(this, elms[i], this.zet(b ? v[i] : v, f, u, c));
    }
                            //////////\ let(), vet(), net() set sub-values only
    let(elms, v, m, f, u) { //////////\ let() is for structured value/arg lists
        let b, b0, bf, bi, c, fs, i, j, k, l, mf, p, s, tc, tf, tp, vf, x, z;
        tc   = this.constructor;
        elms = tc.elmArray(elms);
        if (Is.A(f))                 // multi-func transforms eat up a lot of
            bf = true;               // code: multi-existing and/or multi-user
        else {
            m  = tc.svgRot(this.svg, f, m, 1, v);
            c  = this.count(f);      // if (c == 0) it's a multi-func transform
            f  = f ? [f] : [];       // or you should call set() instead.
            b0 = f.length < 1;       // user array of 1 func is not valid
            bi = tc.izByElm(v, c);
        }
        z = v;
        x = this.get(elms);          // x = existing values
        for (i = 0; i < x.length; i++) {
            if (bi) z = v[i];        // values by element for 1 or 0 funcs

            if (x[i]) {
                p = x[i];            // p = plug, which is preset to full x[i]
                if (p.includes(E.lp)) {
                    b = !b0 && f[0] !== FN[p[0]];
                    p = p.split(E.func);
                    if (p.length % 2)// trim trailing empty element
                        p.length--;
                    if (this.isTransform && (p.length > 2 || bf || b)) {
                        l  = p.length / 2;
                        fs = new Set;
                        tf = new Array(l);
                        tp = new Array(l);
                        for (j = 0, k = 0; j < l; j++) {
                            tf[j] = p[k++].trim();
                            tp[j] = p[k++].trim();
                            fs.add(FN[tf[j]]);
                        }            // existing func order overrides user order
                        f.forEach((func) => { fs.add(func); });
                        s  = "";
                        Array.from(fs).forEach((func, fi) => {
                            j = f.indexOf(func);
                            if (j >= 0) {
                                c = this.count(func);
                                if (bf) {
                                    vf = tc.ztf(v, func, j);
                                    mf = tc.ztf(m, func, j);
                                    mf = tc.svgRot(this.svg, func, mf, vf);
                                    z  = tc.izByElm(v, c) ? vf[i] : vf;
                                }
                                s += this.zet(z, func, u, c, m, tp[fi]) + E.sp;
                            }
                            else
                                s += FN[tf[fi]].apply(tp[fi]) + E.sp;
                        });
                        tc.set(this, elms[i], s.trimEnd());
                        continue;    // already called set(), leapfrog to next
                    }
                    else {           // only transforms accept >1 func
                        if (b0)      // if only one existing func, f is optional
                            f = [FN[p[0]]];
                        p = p[1];
                    }
                }
                tc.set(this, elms[i], this.zet(z, f[0], u, c, m, p));
            }
            else                     // !x[i] = fall back to this.set()
                this.set(elms[i], z, f[0], u);
        }
    }                               //\ zet() helps instance.set() and .let()
    zet(v, f = this.func, u = this.unitz(f), c = this.count(f),
           m = false,     p = undefined)
    {
        if (c) {                     // list of values
            let isAv = Is.A(v);
            let isAu = Is.A(u);      // hsl(), hsla(), and rotate3d() mix units
            if (f && !isAv) {
                v = f.fromColor(v)   // fromColor ignores non-color properties
                isAv = Is.A(v);
            }
            if (m || (isAv && (v.length < c || v.includes(undefined)))) {
                let i, isAp, z;      // the array needs plugging
                if (Is.def(p)) {
                    p = p.trim().split(E.comsp);
                    while (p.length < c)
                        p.push(this.plug(f));
                }
                else
                    p = this.plug(f);

                isAp = Is.A(p);      // let() uses p[]
                z    = new Array(c); // array of new values
                if (m) {             // mask is bitmask
                    let j, k;
                    if (!isAv)
                        v = [v];
                    for (i = 0, j = 1, k = 0; i < c; i++, j *= 2)
                        z[i] = m & j
                             ? v[k++] + (isAu ? u[i] : u) : (isAp ? p[i] : p);
                }
                else {               // mask is array with empty elements
                    for (i = 0; i < c; i++)
                        z[i] = Is.def(v[i])
                             ? v[i]   + (isAu ? u[i] : u) : (isAp ? p[i] : p);
                }
                v = z.join(this.separator(f));
            }
            else if (isAv) {         // the array is fully specified
                if (u)
                    v.forEach((n, i, a) => { a[i] = n + (isAu ? u[i] : u); });
                v = v.join(this.separator(f));
            }
        }
        else    v += u;              // single value

        if (f) return f.apply(v);
        else   return v;
    }                                // izByElm() helps let()
    static izByElm(v, c) { return Prop.dims(v) == (c ? 2 : 1); }
                            //////////\ vet(), net() are for unstructured values
    vet(elms, v, m) {               //\ vet() "values" include functions, text
        this.zvnet(false, elms, v, m);
    }
    net(elms, v, m, f = this.func) {//\ net() replaces only numbers
        this.zvnet(true,  elms, v, m, f);
    }                               //\ zvnet() consolidates vet() and net()
    zvnet(isN, elms, v, m, f = undefined) {
        let av, b2, i, j, l, seps, vals, x;
        elms = this.constructor.elmArray(elms);
        if (isN)
           x = this.getu(elms, f);   // x = existing values;
        else {
           x = this.get(elms);
           if (!Is.A(x)) x = [x];
        }
        if (!Is.A(m)) m = [m];       // m = mask = array of indices into x[elm]
        if (!Is.A(v)) v = [v];
        else if (Is.A(v[0]))
            b2 = true;               // v is a 2D array
        for (i = 0; i < x.length; i++) {
            if ((isN && x.vals[i][0]) || (!isN && x[i])) {
                vals = isN ? x.vals[i] : x[i].split(E.sepfunc);
                seps = isN ? x.seps[i] : x[i].match(E.sepfunc);
                for (j = 0; j < m.length; j++)
                    vals[m[j]] = b2 ? v[i][j] : v[j];
                av = "";             // av = attribute value, rebuild it
                l  = vals.length;    // vals can be different lengths, so long
                if (seps.length < l) // as the minimum length > m[m.length - 1].
                    seps.push("");   // simplifies the next loop
                for (i = 0; i < l; i++)
                    av += vals[i] + seps[i];
                this.constructor.set(this, elms[i], av);
            }                        // if no existing value, no way to plug it
        }
    }
    /////////////////////////////////// public static methods //////////////////
    static set(attr, elm, v) {       // Prop.set() handles CSS versus SVG
        if (attr.izSVG(elm)) //!!need a way to force use of .style, maybe elm.useStyle?
            elm.setAttribute(attr.name, v);
        else
            elm.style[attr.name] = v;
    }
    static visible(elm, b) {         // useful as a boolean - for 1 element!
        Prop.set(PR.visibility, elm, b ? "visible" : "hidden");
    }
    static colorFunc(f) {            // changes color function globally
        for (let i of Prop._colors())
            PR[i].func = f;
    }
    static lengthUnits(u) {          // changes <length> units globally
        let i;
        for (i of Prop._cssL())
            PR[i].units = u;
        for (i of Prop._cssL2())
            PR[i].units = u;
        for (i of Prop._funcL())
            FN[i].units = u;
    }
    static angleUnits(u) {           // changes <angle>  units globally
        for (let i of Prop._funcA())
            FN[i].units = u;
    }
    /////////////////////////////////// "friend class" static methods //////////
    static dims(v) {                //\ dims() counts array dimensions up to 2
        return(Is.def(v) ? (Is.A(v) ? (Is.A2(v) ? 2 : 1) : 0) : -1);
    }                                // if (!Is.def(v))  return -1;
    static elmArray(elms, doc = document) {
        if (elms) {                 //\ elmArray() returns an array of elements
            if (!Is.A(elms)) {      //\ user flexibility + internal consistency
                if (Is.oneElm(elms)) // if it's not class Array, convert it now:
                    elms = [elms];                   // Element, String
                else if (elms.size)
                    elms = Array.from(elms.values());// Map, Set
                else if (elms.length)
                    elms = Array.from(elms);         // HTMLCollection, NodeList
                else
                    elms = Object.values(elms);      // Object
            }
            elms.forEach((v, i, a) => {
                if (Is.String(v))    // convert Strings to Elements, by id
                    a[i] = doc.getElementById(v);
            });
        }
        return elms;
    }
    static svgRot(b, func, m, l, f = 0, a = 0, p = 0) {
        b &= (func === FN.r);       //\ svgRot() handles SVG rotate's quirks
        if (!m) {                   //\ and if (!b) zap() helps Teaser
            m = Prop.zap(0, f, a, p);
            if (b && (!m || Prop.dims(m) < Math.min(l, 2)))
                m = EZ.x;            // special lazy syntax: angle-only
        }
        else if (b) {                // else alternate arg order: (angle, x, y)
            if (m & EZ.y)     m += EZ.y;
            if (m & EZ.x)     m += EZ.x;
            if (m & EZ.angle) m -= EZ.angle - 1;
        }
        return m;
    }                               //\ toNumber() is soft numeric conversion
    static toNumber(v, f = false, u = undefined) {
        let n = parseFloat(v);      //\ if it fails to convert, you must revert
        return Number.isNaN(n) ? (f ? f.fromColor(v, u) : v) : n;
    }
    static toBools(v, l) {          //\ toBools() returns 2 arrays of array
        let o = {};                 //\ indices for an addend/plug: true/false
        if (v) {
            let f, i, j, t;
            t = [];                  // t for true, f for false
            f = [];
            if (Is.A(v)) {           // v is an array with empty slots
                for (i = 0; i < l; i++)
                    (Is.def(v[i]) ? t : f).push(i);
            }
            else {                   // v is a bitmask
                if (!l) l = Math.floor(Math.log2(v)) + 1;
                for (i = 0, j = 1; i < l; i++, j *= 2)
                    (v & j       ? t : f).push(i);
            }
            o.true  = t;
            o.false = f;
        }
        else if (l) {
            o.true  = Array.from({length:l}, (_, i) => i);
            o.false = [];
        }
        return o;
    }                               //\ Prop.toBools(Ez.zap(...), length);
    static zap(mask, factor, addend, plug) {
        return mask || Prop.zv(factor) || Prop.zv(addend) || Prop.zv(plug);
    }
    static zv(v) { return Is.A(v) ? v : false; }
                                    //\ ztf() called by let() and new Teaser()
    static ztf(v, f, i) {           //\ parses multi-func transform user values
        if (!v || Is.N(v) || Is.String(v)) return v;  //- number or string
        if (Is.def(v.length))       return v[i];      //- array or "array-like"
        if (Is.def(v.get))          return v.get(f);  //- map or set
        if (f && Is.def(v[f.name])) return v[f.name]; //- object w/string keys
    }
    /////////////////////////////////// javascript does not have class variables
    static _colors() {
        return ["fill","stroke","stop-color","color","backgroundColor",
                "borderTopColor", "borderBottomColor","borderColor",
                "borderLeftColor","borderRightColor"];
    }
    static _svg() {
        return ["x","y","x1","x2","y1","y2","r","cx","cy","d","dx","dy",
                "stop-opacity","xlink:href","preserveAspectRatio","viewBox",
                "azimuth","baseFrequency","elevation","k1","k2","k3","values",
                "stdDeviation","surfaceScale"];
    }
    static _css() {                  // <number> or <string>, no default units
        return ["display","pointerEvents",
                "flexFlow","justifyContent","alignItems","alignSelf",
                "fontFamily","fontWeight","fontStyle","fontStretch",
                "opacity","fillOpacity","strokeOpacity","overflowX","overflowY",
                "transform","transformOrigin","transitionDuration",
                "textAnchor","vectorEffect"];
    }
    static _cssL() {                 // <length> or <percent> data type
        return ["height","width","maxHeight","maxWidth","minHeight","minWidth",
                "border","margin","padding","left","right","bottom","fontSize",
                "borderTop", "borderBottom", "borderLeft", "borderRight",
                "marginTop", "marginBottom", "marginLeft", "marginRight",
                "paddingTop","paddingBottom","paddingLeft","paddingRight",
                "strokeWidth"];
    }
    static _svg2() {                 // 2 = attribute names with no abbreviation
        return ["class","offset","points","scale","seed","type"];
    }
    static _css2() {
        return ["background","cursor","filter","flex","mask","overflow",
                "position","visibility"];
    }
    static _cssL2() {
        return ["top"];
    }
    static _funcs() {                // functions: first 4 are the color funcs
        return ["rgb","rgba","hsl","hsla",
                "url","attr","var","calc","cubic-bezier",
                "repeating-linear-gradient","repeating-radial-gradient",
                          "linear-gradient",          "radial-gradient",
                "matrix",  "rotate",   "scale",  "translate",
                "matrix3d","rotate3d", "scale3d"];
    }
    static _funcL() {                // functions that take <length> arguments
        return ["perspective", "translate3d", "translateX", "translateY"];
    }
    static _funcA() {                // functions that take <angle> arguments
        return ["rotateX","rotateY","rotateZ"];
    }
    static _func2() {                // no abbreviations
        return ["skew","skewX","skewY"];
    }
    static _lengths () {             // units "class variables"
        return ["px","em","rem","vw","vh","vmin","vmax","pt","pc","mm","in"];
    }
    static _angles() {
        return ["deg","rad","grad","turn"];
    }
} ///////////////////////////////////// end class Prop |||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */ class Ez {      // Ez: bitmask pseudo-enums for value lists
    constructor() {                  //     also fills: E, F, FN, P, and AT
        let abcd, rgba, rgbc;
        rgba = ["R","G","B","A"];    // rgb(), rgba(), hsl(), hsla(), viewBox++
        this.make(rgba);
        this.make(["H","S","L"]);
        rgbc = rgba.slice();         // <feColorMatrix type="matrix" values>
        rgbc.push("C");              // C for constant, the fifth column
        this.make(Array.from({length:20},
                             (_, i) => rgbc[i % 5] + rgba[Math.floor(i / 5)]));
        abcd = ["a","b","c","d"];    // matrix3d()
        this.make(Array.from({length:16},
                             (_, i) => abcd[i % 4] + Math.floor(i / 4 + 1)));
        abcd.push("e","f");          // SVG matrix() naming conventions
        this.make(abcd);             // matrix()
        this.tx = this.e;            // CSS matrix() naming conventions
        this.ty = this.f;
                                     // fill the other objects:
        this.fill(U, Prop._lengths(), 4);
        this.fill(U, Prop._angles(),  5);
        this.fill(F, Prop._funcs(),   5, FN, ""   );
        this.fill(F, Prop._funcL(),   5, FN, U.px );
        this.fill(F, Prop._funcA(),   5, FN, U.deg);
        this.fill(F, Prop._func2(),  99, FN, ""   );
        this.fill(P, Prop._colors(),  3, PR, "", FN.rgb);
        this.fill(P, Prop._svg(),     3, PR, false);
        this.fill(P, Prop._css(),     3, PR, ""   );
        this.fill(P, Prop._cssL(),    3, PR, U.px );
        this.fill(P, Prop._svg2(),   99, PR, false);
        this.fill(P, Prop._css2(),   99, PR, ""   );
        this.fill(P, Prop._cssL2(),  99, PR, U.px );
        U.pct   = "%";               // not easily automated
        PR.tCSS = PR.t;              // transform is very special
        PR.tSVG = new Prop(P.t, false);
        P .bg   = P .background;     // background shortcuts not calculatable
        PR.bg   = PR.background;     // P.b == "border"
        P .bgC  = P .backgroundColor;
        PR.bgC  = PR.backgroundColor;
        PR.sc.svg  = true;           // stop-color grouped with colors, not svg
        PR.filter.func = FN.url;
                                     // finish filling this, aka EZ
        this.make([P.x, P.y, P.w, P.h]);
        this.w     = this.width;     // for convenience and consistency w/Prop
        this.h     = this.height;
        this.z     = this.w;         // for most 3D transforms
        this.angle = this.h;         // for rotate3d()
        this.rad   = Math.PI / 180;  // some non-bitmask values too
        this.grad  = 10 / 9;
        this.turn  =  1 / 360;
        Object.freeze(E);     Object.freeze(F);
        Object.freeze(this);  Object.freeze(FN);
    }
    make(v) {                        // creates bitmasks for this
        for (let i = 0, j = 1; i < v.length; i++, j *= 2)
            this[v[i]] = j;
    }
    fill(o, a, l, obj = false, units = undefined, func = undefined)
    {                                // populates global consts: P, PR, F, FN, U
        let i, k, ln, m, s, xh;      // k = key, ln = long name, m = match
        const rx = /[A-Z]|\d|-(.)/g;
        for (s of a) {
            if (s.length < l)        // l == min length for shortening a name
                k = s;
            else {
                k = s.charAt(0);
                m = s.match(rx);     // no look-back in js regexp, so
                if (m) {             // the "-" is included in the match.
                    for (i of m)
                        k += i.charAt(i.length - 1);
                    xh = false;
                }
                else {               // xlink:href becomes href, SVG 2.0 style
                    xh = s.indexOf(":") + 1;
                    if (xh)
                        k = s.substring(xh);
                }
            }
            o[k] = s;
            if (k != s && !xh) {     // : is a legit char, but no PR.xlink:href
                ln = s.replace(E.gdash, "");
                o[ln] = s;           // long name is a duplicate entry (strings)
            }
            if (obj) {               // add to objects collections: FN, AT
                if (obj === FN) obj[k] = new Func(s, units);
                else            obj[k] = new Prop(s, units, func);
                if (k != s)
                    obj[ln] = obj[k];// long name links to the original entry
            }
        }
    }
} ///////////////////////////////////// end class Ez |||||||||||||||||||||||||||
const EZ  = new Ez;
const POS = {l:PR.left, r:PR.right, t:PR.top, b:PR.bottom};//eslint-disable-line
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| Easy classes: Easer, Geaser, Teaser, |||
//||||||||||||||||||||||||||||||||||||||||||||||||||  Easee, Easy  |||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */ class Easer {   // Subject of: "The easer eases the easee."
    constructor(ee, elms = false,    // args after elms defined only by Teaser
                func = ee.func, u = ee.units, c = ee.count,
                values = undefined, prefix = undefined, suffix = undefined,
                f   = (Is.def(values) ? undefined : ee.factor),
                a   = (Is.def(values) ? undefined : ee.addend),
                p   = (Is.def(values) ? undefined : ee.plug),
                max = (Is.def(values) ? undefined : ee.max),
                min = (Is.def(values) ? undefined : ee.min),
                b   = (c ? Prop.toBools(Prop.zap(ee.mask, f, a, p), c) : false))
    {
        if (!elms) return;           // called from new Geaser() via super()
        let d, dims, o, xv;
        let l  = elms.length;
        let bl = elms.length > 1;
        let tc = this.constructor;   // a much shorter name, and one less lookup

        this.easee = ee;    this.elms  = elms;          this.prefix = prefix;
        this.count = c;     this.func  = func;          this.suffix = suffix;
        this.units = u;     this.bools = undefined;     this.addend = undefined;
        this.max = max;     this.plug  = undefined;     this.factor = undefined;
        this.min = min;     this.turn  = undefined;     this.number = undefined;
        this.idx = 0;   this.separator = undefined;   this.computer = undefined;
        /////////////////////////////// parse the factor, addend, and plug /////
        o    = tc.zobj(max, min, a, f, p, c, b, ee.attr.plug(func), ee.isEnd);
        dims = Array.from(o, (v) => v.dims);
        d    = Math.max(...dims);
        if (!c && o.length == 3 && !Is.def(a) && o[0].value == Infinity
                                && !Is.def(p) && o[1].value ==-Infinity) {
            this.type = null;     ////\ apply raw ease().value to attribute
            this.max  = o[0].value;  // 0 = max, 1 = min, 2 = addend, 3 = factor
            this.min  = o[1].value;  // if (c) {4 = plug; if (f == 1) 3 = plug;}
            Object.seal(this);       // if (factor == 1) 3 is spliced out
            return;                  // the logic gets goofy w/o this return
        }
        if (!c) {                 ////\ single value with factor/addend/plug
            if (bl)                  // izF = izFull, like the static function
                o.forEach((v) => { v.izF = Is.A(v.value); });
                                     // if any undefined, get existing values
            if (o.some(v => tc.zundef(v)))
                xv = tc.zex(elms, ee, values, true);
                                     // this.type = true|false = array|value
            this.type = o.some(v => v.izF) || (xv && xv.length > 1) || false;
            if (this.type) {         // 1D array by element
                this.number = new Array(l);
                b = Prop.toBools(null, l);
            }                        // b.true contains 100% of the indices
            o.forEach((v) => {       // it's an off-label use of Prop.toBools()
                if (this.type) {     // it makes this call to izFull() possible
                    v.bools = b.true;
                    if (v.izF)
                        v.izF &= tc.izFull(v, 1, l);
                    this[v.key] = tc.zap(v, xv, l, 0);
                }
                else                 // xv is alway an array, if it's defined
                    this[v.key] = tc.zval(v, xv ? xv[0] : undefined);
            });
            if (Is.def(this.factor)) {
                this.factor   = tc.zReplace(ee.isEnd, this.factor, this.addend);
                this.computer = this.type ? this.computeSub : this.computeOne;
            }
            else
                this.computer = this.type ? this.addSub     : this.addOne;
        }
        else {                    ////\ value list assumes factor|addend|plug
            let be, l2;
            be = ee.byElm;           // determine dimensionality and fullness
            if (b.true.length == 1) {// single sub-value has multiple syntaxes
                let i = dims.indexOf(0);
                if (i >= 0) {
                    d = Math.max(d, 1);
                    do {             // ensure that it's an array
                        o[i].value = [o[i].value];
                        o[i].dims++;
                        i = dims.indexOf(0, i + 1);
                    } while (i >= 0);
                }
                if (d > 0 && bl) {   // 1D array for one sub-value is by elm...
                    o.forEach((v) => {
                        if (v.dims == 1 && v.value.length > 1) {
                            v.tmp   = v.value;
                            v.value = new Array(c);
                            v.value[v.bools[0]] = v.tmp;
                            v.dims++;
                            d = Math.max(d, 2);
                        }            // ...convert it to 2D by sub-value by elm.
                    });
                }
            }
            d = Math.max(d, 1);      // if (c) it's a minimum of 1
            o.forEach((v) => {
                v.izF = tc.izFull(v, d, c, l, be);
            });
            if (d == 1 && bl && o.some(v => !v.izF)) {
                d++;                 // if getting existing values for >1 elm,
                o.forEach((v) => {   // it's a two-dimensional setup.
                    if (v.izF)
                        v.izF = tc.izFull(v, d, c, l, be);
                });
            }
            l2 = (d == 2 ? l : 0);  //\ get existing values?
            if (o.some(v => !v.izF)) {
                xv = tc.zex(elms, ee, values);
                if (!l2)
                    xv = xv[0];
                if (func && func.color) {
                    let isAu = Is.A(u);
                    for (let i = 0; i < l; i++) {
                        if (xv[i] && xv[i].length == 1)
                            xv[i] = func.fromColor(xv[i][0], u)
                                        .map(n => n + (isAu ? u[i] : u));
                    }
                }
            }
            o.reverse();            //\ set this.max, min, factor, addend, plug
            o.forEach((v, i) => {    // plug must be first, pre-zReplace()
                this[v.key] = tc.zap(v, xv, c, l2, be);
                if (i == 0)          // convert xv to numbers for post-plug
                    xv = tc.zReplace(3, xv, func, ee.units);
            });
            if (Is.def(this.factor)) {
                this.factor   = tc.zReplace(ee.isEnd, this.factor, this.addend);
                this.computer = (d == 2 ? this.computeElm : this.computeSub);
            }                       //\ set everything else
            else
                this.computer = (d == 2 ? this.addElm     : this.addSub);

            this.type      = d;      // this.type = 1 or 2
            this.bools     = b;
            this.number    = tc.arrayz(c, l2);
            this.separator = ee.attr.separator(ee.func);
        }
        Object.seal(this);
    } ///////////////////////////////// end constructor() //////////////////////
    /////////////////////////////////// static helpers for Easer and Geaser ////
    static arrayz(li, lo, fill = undefined)
    {                             ////\ arrayz() creates a sized/filled array
        if (Is.def(fill))           //\ li = inner length, lo = outer length
            return(lo ? Array.from({length:lo}, () => new Array(li).fill(fill))
                      : new Array(li).fill(fill));
        else                         // the outer dimension is the optional one
            return(lo ? Array.from({length:lo}, () => new Array(li))
                      : new Array(li));
    }                             ////\ zex() gets and/or parses existing values
    static zex(elms, ee, v = ee.attr.get(elms), b = false) {
        return b ? ee.attr.za(v, ee.func, ee.units)
                 : v.map(s => ee.attr.zparse(s, ee.func));
    }                               //\ zobj() creates and fills the o variable
    static zobj(max, min, a, f, p, hasPlug, b, pv, isEnd) {
        let o = Array.from({length:hasPlug ? 5 : 4}, () => ({}));
        const key  = ["max", "min", "addend", "factor", "plug"];
        const plug = [Infinity, -Infinity, , 1, ];
        o.forEach((v, i) => {
            v.key   = key[i];
            v.plug  = plug[i];
            v.value = Easer.zReplace(2, arguments[i], v.plug);
            v.dims  = Prop.dims(v.value);
            v.bools = b ? b.true : b;
        });
        o[2].plug = Prop.toNumber(pv);
        if (hasPlug) {               // zReplace(2) = undefined for addend/plug
            o[4].plug  = pv;
            o[4].bools = b.false;    // plug is the filler, not the meat
        }
        if (o[3].value == 1 && !isEnd)
            o.splice(3, 1);          // if no factor, remove its array element
        return o;
    }
    static zundef(v) {            ////\ zundef() = v.value is or has undefined?
        return v.izF ? v.value.includes(undefined) : !Is.def(v.value);
    }
    static zap(o, xv, li, lo, byElm = undefined, g = undefined) {
        if (o.izF) return o.value;////\ zap() populates factor, addend, plug
                                    //\ g == array of indices into xv: Geaser()
        let b, bi, i, j, v;
        v = Easer.arrayz(li, lo);
        for (i = 0; i < o.bools.length; i++) {
            b  = o.bools[i];
            bi = g ? g[i] : b;
            if (lo) {
              for (j = 0; j < lo; j++)
                v[j][b] = Easer.zval(o, xv[j][bi], b, j, byElm);
            }
            else   v[b] = Easer.zval(o,    xv[bi], b);
        }
        return v;
    }
    static zval(o, xv, b = undefined, j = undefined, byElm = undefined) {
        let v;                    ////\ zval() assigns a value from the correct
        switch (o.dims) {           //\ source, or one of two fallback values.
        case -1:  v = xv;          break;
        case  0:  v = o.value;     break;
        case  1:  v = o.value[b];  break;
        case  2:  v = byElm
                    ? o.value[j][b]
                    : o.value[b][j];
        }
        if (!v && v !== 0)           // double fallback: existing value, plug
            v = (xv || xv === 0 ? xv : o.plug);
        return v;
    }                             ////\ zReplace() handles three processes:
    static zReplace(b, v, z, u = undefined) {
        if (!b)                      //#1. factor = end (versus distance)
            return v;                //#2. replace undefined with "no change"
        if (!Is.A(v)) {              //    and null with undefined = get values
            switch(b) {              //#3. convert existing values to numbers
            case 1:                  //#1. v = factor; z = addend.
                return Is.def(v) ? v - z : v;
            case 2:                  //#2. v = factor, addend, plug, max, or min
                return  Is.def(v) ? (v === null ? undefined : v) : z;
            case 3:                  //#3. v = factor, addend, max, or min;
                return Prop.toNumber(v, z, u);
            }                        // z = Func instance; u = units.
        }
        let l = v.length;
        let a = new Array(l);        // handles arrays recursively
        for (let i = 0; i < l; i++)
            a[i] = Easer.zReplace(b, v[i], Is.A(z) ? z[i] : z);
        return a;
    }
    static izFull(o, d, li, lo = 0, byElm = false) {
        let b, lb;                ////\ izFull() checks the contents of an array
        if (o.bools)                 // if (1D array by elm) bools == undefined
            lb = o.bools.length;     // if (d == 2 && dfap == 1) 1D array by
        if (o.dims == 1)             // sub-value only, by element not allowed.
            Easer.zSpread(o.value, o.bools, li);
        if (o.dims == d) {           // d == 1 or 2, never 0 or -1
            if (d == 1)
                b = Easer.zFu(o.value, lb);
            else if (byElm) {
                b = Easer.zFu(o.value, lb, lo);
                Easer.zSpread(o.value, o.bools, lo, li); }
            else {
                b = Easer.zFu(o.value, lo, lb);
                Easer.zSpread(o.value, o.bools, li, lo); }
        }
        return b;
    }
    static zFu(arr, li, lo = 0) {   //\ zFu() helps izFull()
        let b = Is.A(arr) && arr.filter(v => Is.def(v)).length >= lo ? lo : li;
        if (b && lo) {
            for (let i of arr) {     // if (!Is.A(i)) it's filled by zSpread()
                if (Is.A(i) && arr.filter(v => Is.def(v)).length < li)
                    return false;
            }
        }
        return b;
    }
    static zSpread(arr, bools, lo, li = 0, byElm = false) {
        let i;                    ////\ zSpread() preps an array for processing.
        if (byElm) {                //\ here, li is the optional 2nd dimension,
            arr.length = lo;        //\ elsewhere it's lo. confusing, but true.
            for (i = 0; i < lo; i++) {
                if (Is.A(arr[i]))
                    Easer.zSp(arr[i], bools, li);
                else
                    arr[i] = new Array(li).fill(arr[i]);
            }
        }
        else {
            if (arr.length < lo) {
                if (bools)           // 1D array by sub-value
                    Easer.zSp(arr, bools, lo, li);
                else
                    arr.length = lo; // 1D array by element
            }
            if (li) {                // 2D array, spread inner dimension
                for (i = 0; i < lo; i++) {
                    if (Is.A(arr[i]))
                        arr[i].length = li;
                    else
                        arr[i] = new Array(li).fill(arr[i]);
                }
            }
        }
    }
    static zSp(arr, bools, lo, li = 0) {
        let bi, i;                  //\ zSp() helps zSpread()
        i = arr.length - 1;
        arr.length = lo;
        for (; i >= 0; i--) {
            bi = bools[i];
            if (bi > i) {
                arr[bi] = arr[i];
                arr[i]  = li ? [] : undefined;
            }
        }
    }
    /////////////////////////////////// apply() and compute() //////////////////
    apply(e) {                       // e = easeMe() return value
        let ee = this.easee;
        let ev = ee.evaluate(e);
        if (ev === false)   return;

        let v    = this.compute(ev);
        let isAv = Is.A(v);
        let attr = ee.attr;
        if (ee.easy.byElm) {
            if (Is.def(this.turn)) {
                let tv = this.compute(this.turn);
                if (Is.A(tv))
                    tv = tv[this.idx];
                Prop.set(attr, this.elms[this.idx], tv);
                ee.turn(this);
            }
            Prop.set(attr, this.elms[this.idx], isAv ? v[this.idx] : v);
        }
        else if (isAv)
            this.elms.forEach((elm, i) => {Prop.set(attr, elm, v[i]);});
        else
            this.elms.forEach((elm)    => {Prop.set(attr, elm, v);});

        if (ee.peri)
            ee.peri(this, e);
    }
    compute(ev) {
        switch (this.type) {
        case null:
            return this.vfps(this.vnu(ev));
        case false:
            return this.vfps(this.vnu(this.computer(ev)));
        case true:
            return Array.from({length:this.elms.length}, (_, i) =>
                   this.vfps(this.vnu(this.computer(ev, i), false, i), i));
        case 1:
            return this.vfps(
                   this.varr(this.count, ev, this.plug).join(this.separator));
        case 2:
            return Array.from({length:this.elms.length}, (_, i) =>
                   this.vfps(
                   this.varr(this.count, ev, this.plug[i], i)
                                        .join(this.separator), i));
        }
    }                            ////// "private" instance helpers for compute()
    vfps(v, i = 0) {                 // v   = value
        if (this.func)               // fps = func, prefix, suffix
            v = this.func.apply(v);
        if (this.easee.attr.isTransform)
            return this.prefix[i] + v + this.suffix[i];
        else
            return v;
    }
    varr(c, ev, p, idx = -1) {       // arr = array, for computing value lists
        let bi, v;                   // idx is element index for 2D array
        v = new Array(c);
        if (idx > -1) {
            for (bi of this.bools.true)
                v[bi] = this.vnu(this.computer(ev, bi, idx), false, idx, bi);
            for (bi of this.bools.false)
                v[bi] = this.vnu(p[bi],                      true,  idx, bi);
        }
        else {
            for (bi of this.bools.true)
                v[bi] = this.vnu(this.computer(ev, bi),      false, bi);
            for (bi of this.bools.false)
                v[bi] = this.vnu(p[bi],                      true,  bi);
        }
        return v;
    }
    vnu(v, isP = 0, i = -1, j = -1) {// nu = numbers & units, isP = isPlug
        let isI = (i > -1);
        let isJ = (j > -1);
        if (isP) {                   // plugs are strings, with units
            if      (isJ) this.number[i][j] = Prop.toNumber(v);
            else if (isI) this.number[i]    = Prop.toNumber(v);
            else             this.number       = Prop.toNumber(v);
            return v;
        }
        else {                       // non-plugs are numbers, enforce max/min
            if (isJ) {
                this.number[i][j] = Math.max(this.min[i][j],
                                    Math.min(this.max[i][j], v));
                return this.number[i][j] + this.units;
            }
            else if (isI) {
                this.number[i]    = Math.max(this.min[i],
                                    Math.min(this.max[i], v));
                return this.number[i]    + this.units;
            }
            else {
                this.number       = Math.max(this.min, Math.min(this.max, v));
                return this.number       + this.units;
            }
        }
    }
    /////////////////////////////////// the computers return a single number ///
    computeOne(ev) {                 // ease().value, units
        return this.factor           * ev + this.addend;
    }
    computeSub(ev, sub) {            // ease().value, f/a sub-value index
        return this.factor[sub]      * ev + this.addend[sub];
    }
    computeElm(ev, sub, idx) {       // ease().value, f/a sub index, elm index
        return this.factor[idx][sub] * ev + this.addend[idx][sub];
    }
    addOne(ev)           { return      ev + this.addend;           }
    addSub(ev, sub)      { return      ev + this.addend[sub];      }
    addElm(ev, sub, idx) { return      ev + this.addend[idx][sub]; }
} ///////////////////////////////////// end class Easer ||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */
class Geaser extends Easer {         // Easer for CSS gradients and for the SVG
    constructor(ee, elms) {          // <path d> and <poly* points> attributes.
        let b, bi, c, i, j, k, l, la, lb, lp, m, n1, nb, ne, o, p, s, v, x;
        super(ee);                   // only one arg: creates this and returns
        l  = elms.length;            // if (>1 elms) value structure cannot vary
        x  = ee.attr.getu(elms);     // x = parsed existing values object
        m  = Is.A(ee.mask) ? ee.mask : [ee.mask];
        la = m.length;               // mask = array of indices into x.nums[i][]
        nb = Number(x.numBeg && (m[0] == 0));
        ne = x.numEnd && (m[la-1] == x.nums[0].length - 1);
        c  = la * 2 - (nb && ne) + !(nb || ne);
        lp = c - la;                 // addend/plug are interwoven, every other:
        p  = Easer.arrayz(c, l, ""); // their lengths might differ by 1, and
        b  = {};                     // either one can appear first and/or last.
      //b.bools = Array.from({length:c }, (_, i) => (nb + i) % 2);
        b.true  = Array.from({length:la}, (_, i) => !nb + (i * 2));
        b.false = Array.from({length:lp}, (_, i) =>  nb + (i * 2));
                                     // parse the addend, factor, max, and min
        o = this.constructor.zobj(ee.max, ee.min, ee.addend, ee.factor,
                                  false,  false,  b, ee.attr.plug(), ee.isEnd);
        o.forEach((v) => {           // using numbers, not strings
            v.izF       = Easer.izFull(v, 2, c);
            this[v.key] = Easer.zap(v, x.nums, c, l, ee.byElm, m);
        });
        n1 = nb - 1;                 // parse the plug, using string values
        lb = b.false.length;
        for (i = 0; i < l; i++){
            v = x.vals[i];
            s = x.seps[i];
            for (j = n1; j < lb; j++) {
                bi = b.false[j];     // j can start at -1
                lp = m[j + 1] || v[i].length;
                for (k = (j < 0 ? 0 : m[j] + 1); k < lp; k++)
                    p[i][bi] += s[k] + v[k];
                p[i][bi] += s[k];
            }
        }
        this.type = 2;               // always all 2D arrays
        this.plug = p;       this.bools = b;    this.easee = ee;
        this.elms = elms;    this.count = c;    this.units = "";

        this.number    = this.constructor.arrayz(c, l);
        this.computer  = this.factor ? this.computeElm : this.addElm;
        this.separator = "";
        Object.seal(this);
    }
} ///////////////////////////////////// end class Geaser |||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Teaser {                       // Easer for transforms, wraps 1+ Easers in
    constructor(ee, elms) {          // this.easers by Func instance.
        let a, b, bfc, c, f, fc, fi, fn, func, i, l, m, max, min, p, pre, suf;
        let u, val;
        this.easee  = ee;
        this.elms   = elms;
        this.easers = new Map;     // key = Func, value = Easer
        this.values = new Map;     // multi-easers: previous frame's values
        this.idx    = 0;
        func = ee.func;
        if (!Is.A(func))
            func = [func];
        this.funcs = func;           // one func per writable function
        fc  = func.length;           // func count
        bfc = fc > 1;                // it's an array even if it's only one func
        c   = Array.from({length:fc}, (_, i) => ee.attr.count(func[i]));
        l   = elms.length;           // new Easer() arrays by func by element
        pre = Easer.arrayz(l, fc, "");
        suf = Easer.arrayz(l, fc, "");
        val = Easer.arrayz(l, fc, "");
        if (!ee.set) {              //\ get existing values by element
            let v = ee.attr.get(elms);
            if (v) {
                let felm, j, k, s, z;// this.felms = by elm by func, for apply()
                this.felms = new Array(l);
                                     // loop by element: parse existing values
                for (i = 0; i < l; i++) {
                    if (v[i]) {      // split into duples: func.name, arg(s)
                        felm = new Set;
                        p = "";      // every has prefix, only last has suffix
                        z = -1;      // z tracks last func index for suffix
                        s = v[i].split(E.func);
                        s.length--;  // always an extra trailing array element
                                     // parse one value: maintain func order
                        for (j = 0, k = 0; j < s.length; j++) {
                            fn = s[j++].trim();
                            fi = func.indexOf(FN[fn]);
                            if (fi >= 0) {
                                felm.add(FN[fn]);
                                val[fi][i] = s[j].trim();
                                pre[fi][i] = p;
                                p = "";
                                z = fi;
                                k++;
                            }
                            else
                                p += fn + E.lp + s[j] + E.rp + E.sp;
                        }
                        if (p) {
                            if (k == 0)
                                pre[0][i] = p;
                            else if (z >= 0)
                                suf[z][i] = E.sp + p.trimEnd();
                        }
                        if (k < fc) {// push non-existent funcs to the end
                            for (j of func)
                                felm.add(j);
                        }
                        this.felms[i] = Array.from(felm);
                    }                // end if (v[i])
                    else             // else no existing value for this element
                        this.felms[i] = func;
                }                    // end for (i by element)
            }                        // end if (v): !v same as (ee.set == E.set)
        }                           //\ end if (!ee.set) get existing values
        for (i = 0; i < fc; i++) {  //\ compute the bools and create the Easers
            fi = func[i];
            fn = fi.name;
            if (bfc) {
                f = Prop.ztf(ee.factor, fi, i);  m   = Prop.ztf(ee.mask, fi, i);
                a = Prop.ztf(ee.addend, fi, i);  max = Prop.ztf(ee.max,  fi, i);
                p = Prop.ztf(ee.plug,   fi, i);  min = Prop.ztf(ee.min,  fi, i);
            }
            else {
                f = ee.factor;   p = ee.plug;   max = ee.max;
                a = ee.addend;   m = ee.mask;   min = ee.min;
            }
            if (c[i]) {              // compute b: the bools object for fi
                m = Prop.svgRot(ee.attr.svg, fi, m, l, f, a, p);
                b = Prop.toBools(m, c[i]);
            }
            u = ee.attr.unitz(fi);   // one easer per func
            if (ee.units) {
                if (!Is.A(ee.units))   u = ee.units;
                else if (ee.units[i]) u = ee.units[i];
            }
            this.easers.set(fi, new Easer(ee, elms, fi, u, c[i], val[i], pre[i],
                                          suf[i], f, a, p, max, min, b));
        }
        Object.seal(this);
    }
    /////////////////////////////////// end constructor() //////////////////////
    apply(e) { //////////////////////// apply() maintains func order by element
        let ee, ev, ez, v;
        ee = this.easee;
        ez = ee.eases;
        v  = new Map;
        if (e) {                    //\ compute & store values by Func instance
            if (ez)                  // if (ez) then multiple eases, processed
                return this;         // at the end of easeEm(), using each ez.e
            ev = ee.evaluate(e);     // property, and evaluate(noFalse = true).
            if (ev === false)
                return;              // noop
            this.easers.forEach((er, f) => { v.set(f, er.compute(ev)); });
        }
        else {                       // process multiple eases
            this.easers.forEach((er, f) => {
                e  = ez.get(f).e;
                ev = ee.evaluate(e);
                v.set(f, ev === false || e.status == E.pausing
                       ? this.values.get(f) : er.compute(ev));
            });
            this.values = v;
        }                           //\ apply the values to the elements
        if (ee.easy.byElm) {         // easy.byElm is loop by element
            if (Is.def(this.turn)) { // at the turning point, set values on two
                let tv = new Map;    // elements: current and next//!!easy.break
                this.easers.forEach((er, f) => {
                    tv.set(f, er.compute(this.turn));
                });
                this.applyOne(ee.attr, tv, this.idx);
                ee.turn(this);
            }
            this.applyOne(ee.attr, v, this.idx);
        }
        else {
            for (let i = 0; i < this.elms.length; i++)
                this.applyOne(ee.attr, v, i);
        }
        if (ee.peri)                //\ run the callback
            ee.peri(this, e);
    }
    applyOne(attr, v, i) { ////////// applyOne() helps apply()
        let j, s, vf;
        for (s = "", j = 0; j < this.funcs.length; j++) {
            vf = v.get(this.felms ? this.felms[i][j] : this.funcs[j]);
            s += (Is.A(vf)  ? vf[i] : vf) + E.sp;
        }
        Prop.set(attr, this.elms[i], s.trimEnd());
    }
} ///////////////////////////////////// end class Teaser |||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Easee {                        // Object of: "The easer eases the easee."
    constructor(ez, o) {
        this.set = o.set;    this.attr = o.attr;    this.easy = ez;
        this.min = o.min;    this.mask = o.mask;    this.peri = o.peri;
        this.max = o.max;    this.plug = o.plug;    this.eval = o.eval;
        this.gpu = o.gpu;  this.revert = o.revert;
        // invert the leg value to simplify apply()
        this.leg = o.leg == E.return  ? E.outward
                 : o.leg == E.outward ? E.return  : undefined;

        this.value = Is.def(o.value) ? o.value : (o.eval ? true : undefined);
        this.func  = o.func  || o.attr.func;
        this.units = o.units || o.attr.unitz(this.func);
        this.byElm = o.byElm || o.byElement;
        this.is1m  = o.is1m  || o.oneMinus || o.complement;
        this.isEnd = Number(o.isEnd || Is.def(o.end));
        this.count = o.attr.count(o.func);
        this.isGDP = o.attr.isDPoints || (o.func && o.func.isGradient)
                  || o.set == E.net; // forces Geaser: dx, dy, x, y, rotate are
                                     // optionally unstructured w/<text>,<tspan>
        this.addend = Is.def(o.addend) ? o.addend : o.start;
        this.factor = Is.def(o.factor) ? o.factor
                       : Is.def(o.end) ? o.end : o.distance;
                                     // this syntax gets existing factors (null)
        if (!Is.def(this.factor) && this.is1m && this.addend === 0)
            this.factor = null;
                                     // elms must be processed second-to-last
        this.constructor.elmz(this, o.elm || o.elms || o.element || o.elements);

        this.eases = o.eases || o.easy;
        if (this.eases) {            // multi-ease transforms processed last
            if (Is.A(this.eases)) {  // there must be >1 func, and func is array
                let fez = new Map;   // this.eases ends up as a map Func => Easy
                this.func.forEach((f, i) => {
                    fez.set(f, this.eases[i] || ez);
                    if (this.eases[i])
                        this.eases[i].targets.push(this);
                });
                this.eases = fez;
            }
            else {
                if (!Is.def(this.eases.get)) {
                    let fez = new Map;
                    Object.entries(this.eases).forEach(([fn, easy]) => {
                        fez.set(FN[fn], easy);
                        easy.targets.push(this);
                    });
                    this.eases = fez;
                }
                this.func.forEach((f) => {
                    if (!this.eases.has(f))
                        this.eases.set(f, ez);
                });
            }
        }
        Object.seal(this);
    }
    /////////////////////////////////// for reusing an instance w/alternate elms
    set    elms(elms) { this.constructor.elmz(this, elms); }
    static elmz(ee, elms) {          // kludgy to call setter from constructor
        elms = Prop.elmArray(elms);
        ee.easer = !elms ? elms : (ee.attr.isTransform ? new Teaser(ee, elms)
                                           : (ee.isGDP ? new Geaser(ee, elms)
                                                       : new  Easer(ee, elms)));
    }
    /////////////////////////////////// used by Easer and Teaser.apply() ///////
    evaluate(e) {
        if (this.leg == e.status    // this.leg is reversed: outward vs return
        || (this.leg == E.return && e.status == E.arrived)
        || (this.eval && this.eval(e) !== this.value))
            return false;
        else
            return this.is1m ? 1 - e.value : e.value;
    }
    turn(er) {                       // for loops by element, er = easer
        if (++er.idx == er.elms.length)
            er.idx = 0;
        er.turn = undefined;
    }
} ///////////////////////////////////// end class Easee ||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Easy { /*eslint-disable-line*/ // Outermost in the Easy instance hierarchy
    constructor(zero = 0, time = 0, type = E.in,  pow = 1, start, end, wait = 0,
      /* trip() */  mid, pause = 0, type2= type,  pow2= pow, end2,
      /* looping */  turns = 1, breaK, byElm,
      /* callbacks */  pre, peri, post, reuse,
      /* RAF.test() */  gpu)
    {
        this.zero = zero;   this.type  = type;    this.pow  = pow;  this.e = {};
        this.time = time;   this.type2 = type2;   this.pow2 = pow2; this.now = 0;
        this.wait = wait;   this.byElm = byElm;   this.pre  = pre;  this.reuse = reuse;
        this.dly  = wait;   this.break = breaK;   this.peri = peri; this.pastMid = false;
        this.mid  = mid;    this.turns = turns;   this.post = post;
        this.gpu  = gpu;    this.volte = turns;   this.fois = turns;

        this.targets = [];           // targets is an array of Easee instances
        if (type == E.increment) {
            this.increment = pow;    // fully encapsulating incremental value
            this.base      = 0;      // changes means managing a base value too.
        }
        else if (Is.def(end)) {
            this.start = Is.def(start) ? start : 0;
            this.dist  = end - this.start;
            this.end   = end;
        }
        else {
            this.start = 0;          // if (!Is.def(end)) start is ignored
            this.end   = 1;
        }

        if (mid) {                   // two-leg trip, round-trip or otherwise
            this.func  = this.trip;  // this.trip() calls this.ease()
            this.pause = mid + pause;
            this.time2 = time - this.pause;
            if (Is.def(end2)) {      // return destination fully specified
                this.dist2 = end2 - end;
                this.end2  = end2;
            }
            else if (this.dist) {    // round trip, return to start
                this.dist2 = this.dist * -1;
                this.end2  = this.start;
            }
            else {                   // round trip, but fall back to raw ease()
                this.dist2 = -1;     // return value.
                this.end2  =  0;
            }
        }
        else {                       // one-way, one-leg trip
            this.func  = this.ease;
            this.pause = 0;
        }
    } ///////////////////////////////// this is extensible, not sealed /////////
    static create(o) {  /////////////// create() has named args, flex arg order
        return new Easy(o.zero, o.time,
                        o.increment ? E.increment : o.type,
                        o.increment || o.pow,
                        o.start, o.end,  o.wait, o.mid, o.pause,
                        o.type2, o.pow2, o.end2,
                        o.turns || o.plays || o.repeats + 1 || undefined,
                        o.break,
                        o.byElm || o.byElement,
                        o.pre, o.peri, o.post, o.reuse, o.gpu);
    }
    /////////////////////////////////// recycle() resets the basics for reuse //
    recycle(time = this.time, wait = this.dly) {
        this.time  = time;           // dly = "delay", synonym of "wait"
        this.wait  = wait;           // this.wait gets set to 0 in easeMe()
        this.turns = this.fois;      // .turns and .wait have backup values
        if (!Is.def(this.zero) || this.zero)
            this.zero = 0;           // preserve null and false values
        if (this.increment)
            this.base = 0;
        this.targets.forEach((ee) => { if (ee.revert) ee.is1m = !ee.is1m; });
    }
    /////////////////////////////////// .total & Easy.last() help set this.post
    static last(it) {
        let ez;
        it.forEach((v) => { if (!ez || ez.total <= v.total) ez = v; });
        return ez;
    }
    get total() { return this.wait + this.time; }
    /////////////////////////////////// 4 ways to add a target (class Easee) ///
    add(o) {                         //#1. flex arg order, named args, alt names
        let ee = new Easee(this, o); // ...see Easee.constructor() for alt names
        this.targets.push(ee);
        if (this.byElm && ee.easer) {//    if (!o.elms) ee.easer = undefined
            this.turns = Math.max(this.turns,
                                  this.volte * ee.easer.elms.length);
            this.fois  = this.turns;
        }
        return ee.easer || ee;
    } /* eslint-disable no-unused-vars */
                                     //#2. By: factor is multiplier, distance
    addBy(attr, elms, factor, addend, func, mask, plug, units) {
        return this.constructor.zadd(this,  0, arguments);
    }
                                     //#3. To: end is endpoint, destination
    addTo(attr, elms, end,    start,  func, mask, plug, units) {
        return this.constructor.zadd(this,  1, arguments);
    }
                                     //#4. 1m: 1 - ease().value, the complement
    add1m(attr, elms, factor, addend, func, mask, plug, units) {
        return this.constructor.zadd(this, -1, arguments);
    } /* eslint-enable no-unused-vars*/
    static zadd(ez, type, args) {    // a helper for the addXX() functions
        let o   = {};
        o.isEnd = type > 0;
        o.is1m  = type < 0;   o.factor = args[2];   o.mask  = args[5];
        o.attr  = args[0];    o.addend = args[3];   o.plug  = args[6];
        o.elms  = args[1];    o.func   = args[4];   o.units = args[7];
        return ez.add(o);
    }
    /////////////////////////////////// the animation methods //////////////////
    static easeEm(it, now) {         //\ Easy.easeEm() is the batch easeMe()
        let combo, e, i, v;          //\ Em = 'em = them, it = iterable
        v = { status:E.arrived };    // default return value is safest, simplest
        if (!Is.A(it))               // array, map, set, object, or error
            it = it.values() || Object.values(it);

        combo = new Set;
        for (i of it) {
            if (Is.def(i.zero)) {
                e = i.easeMe(now, combo);
                if (!e.status)       // final value set, stop animating i
                    i.zero = undefined;
                if (e.status > v.status)
                    v = e;           // status value order is end-to-start
            }                        // highest status value == return value
        }
        combo.delete(undefined);     // combined transforms
        combo.forEach((t) => { t.apply(); });

        if (v.status == E.arrived) { // wait until arrival for recycling
            for (i of it) { if (i.reuse) i.recycle(); }
        }
        return v;                    // one e returned, the rest are in it[n].e
    }
    easeMe(now, combo = new Set) {  //\ easeMe() calculates and applies values
        switch (this.zero) {         // this.zero should never be NaN
        case null:                   // undefined is pre-handled by easeEm()
            break;                   // null   = now is already adjusted !!no examples
        case false:                  // false  = run once, set final values
            now = Infinity;          // 0      = set it to now, skip 1st frame,
            break;                   //          because timeStamp was unknown.
        case 0:                      //          ACues.run() does the same.
            this.zero = now;         // truthy = default: use it to adjust now
            if (this.pre && !this.wait)
                this.pre(this);      // does not call ease(), must set this.e
            this.e =     { status:E.outward, value:(this.start || 0) };
            return this.e;
        default:
            now -= this.zero;
            if (this.wait) {         // wait is handled here, not ease()
                if (this.wait > now) {
                    this.now = now;  // for pausing or reusing this Easy
                    this.e = { status:E.waiting, value:(this.start || 0) };
                    return this.e;   // does not call ease(), must set this.e
                }
                if (this.pre)
                    this.pre(this);
                this.zero += this.wait;
                now       -= this.wait;
                this.wait  = 0;      // if block won't run again
            }
        }
        let e = this.func(now);      // runs ease() or trip()
        if (e.status !== E.pausing && !this.noop)
            this.targets.forEach((t) => { combo.add(t.easer.apply(e)); });
        if (this.peri)
            this.peri(this);         // peri() runs every time after apply()
        if (!e.status && this.post)
            this.post(this);
        return e;
    }
    /////////////////////////////////// the easing methods /////////////////////
    // ease(now, duration, type, power, start, distance, end)
    //  now   == elapsed animation time (milliseconds)
    //  time  == animation duration
    //  type  == E.in, E.out, E.increment : E.in = default = 0 = falsy
    //  pow   == power for Math.pow()
    //  start == optional starting point, required if dist specified
    //  dist  == optional distance, required if start specified
    //  end   == optional cached version of start + dist
    //  returns: {value, status}
    //   status: 0 = ending (E.arrived), 4 = running (E.outward)
    ////////////////////////////////////////////////////////////////////
    // trip() goes there and back, it has the same args as ease() plus:
    //  mid   = required end time for go portion
    //  pause = optional wait time between go and return portions
    //  type2, pow2, dist2, end2 are optional return leg values
    //  additional statuses: 3 = E.mid, 2 = E.pausing, 1 = E.return
    //  easeMe() returns the one remaining status val: 5 = E.waiting
    ease(now, time = this.time,  type = this.type, pow = this.pow,
             start = this.start, dist = this.dist, end = this.end,
             is2ndLeg)               // is this the second leg of the trip?
    {
        let e, n, v;
        if (now >= time) {           // now always < time if outward leg of trip
            v = this.increment ? this.base + this.increment : end;
            if (--this.turns > 0) {
                if (this.zero !== false)
                    this.zero += this.time;
                now -= time;         // if (return leg) time != this.time
                if (this.mid) {      // if (return leg) flip direction
                    this.pastMid = false;
                    if (this.increment)
                        this.increment *= -1;
                    else {
                        start = this.start;
                        dist  = this.dist;
                    }
                }
                if (this.byElm)
                    this.targets.forEach((t) => { t.easer.turn = v; });
            }
            else
                e = {status:E.arrived} ;
        }
        if (!e) {
            e = {status:E.outward};
            if (!this.noop) {
                if (this.increment) {
                    this.base += this.increment;
                    v = this.base;   // better than updating easer.addend
                }
                else {
                    n = now / time;
                    v = type ? 1 - Math.pow(1 - n, pow) : Math.pow(n, pow);
                    if (dist)
                        v = start + (dist * v);
                }
            }
        }
        if (!is2ndLeg && now < Infinity)
            this.now = now;          // for pausing or reusing this Easy
        e.value = v;
        this.e  = e;
        return e;
    }
    trip(now) {
        let e;
        if (now < this.mid)          // if (!this.pause) it never arrives at end
            return this.ease(now, this.mid);
        if (now < this.pause) {
            e = {value:(this.increment ? 0 : this.end)};
            if (this.pastMid)
                e.status = E.pausing;
            else {
                e.status = E.mid;
                if (this.increment)
                    this.increment *= -1;
                this.pastMid = true;
            }
            this.e = e;              // does not call ease(), must set this.e
            return e;
        }
        this.now = now;              // set this here instead of ease()
        now -= this.pause;
        e = this.ease(now, this.time2, this.type2, this.pow2, this.end,
                           this.dist2, this.end2, true);
        if (e.status)
            e.status = E.return;
        return e;
    }
} ///////////////////////////////////// end class Easy |||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| RAF classes: ACues, AFrame |||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */ class ACues {   // ACues: a barebones cue list
    constructor(func, post = null, cues = [], times = [], zero = 0) {
        this.func  = func;   this.post = post;   this.cues = cues;
        this.times = times;  this.zero = zero;
        this.index = 0;      this.last = cues.length - 1;
        Object.seal(this);
    }
    push(t, attr, elms, v, set, arg3, arg4, arg5, arg6) {
        let obj = {};
        this.cues .push(obj);
        this.times.push(t);
        this.last++;
        if (attr) {
            obj.args = [elms, v, arg3, arg4, arg5, arg6];
            switch (set) {
                case E.let: obj.func = attr.let; break;
                case E.net: obj.func = attr.net; break;
                default:    obj.func = attr.set;
            }
        }
        return obj;
    }
    run(now) {
        if (this.zero === 0) {
            this.zero = now;         // adjust the times now: faster, simpler
            this.times.forEach((v, i, a) => {a[i] = v + now;});
        }
        if (now >= this.times[this.index]) {
            let cue = this.cues[this.index];
            if (cue.func)
                cue.func(...cue.args);
            else
                this.func(cue, this);
            this.index++;            // must wait until after this.func()
        }
        let val = (this.index <= this.last);
        if (!val && this.post)
            this.post(this);
        return val;
    }
} ///////////////////////////////////// end class ACues ||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */ class AFrame {  // AFrame: the animation frame manager
    constructor() {
        this.frame = undefined;   this.min = undefined;   this.func = undefined;
        this.cues  = undefined;   this.fps = undefined;   this.skip = undefined;
        this.post  = undefined;   this.gpu = undefined;   this.gpuf = undefined;
        this.keepPost = false;    this.paused = false;    this.last = {};
        this.eases = [];          Object.seal(this);
    }
    /////////////////////////////////// 2 types of target: Easy and ACues //////
    add(o) {                         // adds an instance of Easy to this.eases
        return this.push(o.zero, o.time, o.type,  o.pow, o.start, o.end, o.wait,
                         o.mid, o.pause, o.type2, o.pow2,         o.end2,
                         o.turns || o.plays || o.repeats + 1 || undefined,
                         o.break,
                         o.byElm || o.byElement,
                         o.pre, o.peri, o.post, o.reuse, o.gpu);
    } /* eslint-disable */           // push() = raw arguments version of add()
    push(zero, time, type,  pow, start, end, wait,
         mid, pause, type2, pow2,       end2,
         turns, breaK, byElm, pre, peri, post, reuse, gpu)
    { /* eslint-enable */
        let ez = new Easy(...arguments);
        this.eases.push(ez);
        if (Is.def(this.gpu))
            this.constructor.zgpu(ez, this);
        return ez;
    }                                // cue() creates and returns this.cues
    newCues(func, post, cues, times, zero) { // eslint-disable-line no-unused-vars
        this.cues = new ACues(...arguments);
        return this.cues;
    }
    /////////////////////////////////// animation methods //////////////////////
    animate(timeStamp) {             // cues first so they can trigger eases...
        if (this.cues && !this.cues.run(timeStamp))
            this.zend(false);
        if (this.eases.length && !Easy.easeEm(this.eases, timeStamp).status)
            this.zend(true);

        if ((this.func && this.func(this)) || this.cues || this.eases.length)
            this.frame = requestAnimationFrame((t) => this.animate(t));
        else {                       // end of animation
            this.frame = undefined;  // must precede post() to chain animations
            this.zpost();
        }
    }
    cancel(arrive, reset)  {
        if (this.isRunning) {
            cancelAnimationFrame(this.frame);
            this.frame = undefined;
            if (arrive) {
                if (this.cues) {
                    this.cues.index = this.cues.last;
                    this.cues.run(Infinity);
                }
                if (this.eases.length)
                    Easy.easeEm(this.eases, Infinity);
                this.zpost();
            }
            if (reset) {
                if (this.cues)         this.zend(false);
                if (this.eases.length) this.zend(true);
            }
            return true;
        }
    }
    pause() {                        // pause can resume
        this.paused = this.cancel(false, false) || 1;
    }
    start()   {
        if (!this.isRunning) {
            if (this.paused) {       // resume from ez.now
                let n = performance.now();
                this.eases.forEach((ez) => { ez.zero = n - ez.now; });
                this.paused = false;
            }
            this.frame = requestAnimationFrame((t) => this.animate(t));
            return true;
        }
    }                                // test() is an alternative to start()
    test(timeStamp, ez = 0, min = 0, func = 0, skip = 0) {
        if (!timeStamp) {            // use the default (ez.zero = 0), so that
            ez.aframe = this;        // easeMe() starts counting at 0, not 1.
            ez.frames = 0;                       this.min  = min;
            ez.peri   = this.constructor.zpp;    this.gpuf = func;
            ez.post   = this.constructor.zfps;   this.skip = skip;
        }
        this.frame = requestAnimationFrame(
                     (t) => (this.skip-- > 0 ? this.test(t) : this.animate(t)));
    }
    get isRunning() {                // convenience, convention, encapsulation
        return Is.def(this.frame);
    }
    zpost() {                        // consolidates a small bit of code to run
        if (this.post) {             // this.post() upon arrival at destination.
            let post = this.post;    // note: this.post can be set inside post()
            if (!this.keepPost)      // defaults to single-use function
                this.post = undefined;
            post(this);
        }
    }
    zend(isEases) {
        if (isEases) {               // Closure Compiler makes this verbose
            this.last.eases = this.eases;
            this.eases      = [];    // better as .length = 0? may need slice()
        }
        else {
            this.last.cues = this.cues;
            this.cues      = undefined;
        }
    }
    /////////////////////////////////// static helpers /////////////////////////
    static zfps(ez) {                // zfps() computes .fps: frames per second
        let af = ez.aframe;          // sets .gpu to pass/fail: .fps >= minimum
        af.fps = ez.frames / (ez.time / 1000);
        af.gpu = af.fps >= af.min;   // .gpu is a boolean pass|fail
        for (let t of af.eases)
            AFrame.zgpu(t, af);
        if (af.gpuf)
            af.gpuf();
        delete ez.aframe;  delete ez.frames;  delete ez.peri;  delete ez.post;
    }
    static zgpu(ez, af) {            // zgpu() uses 0 == false and 1 == true
        if (Is.def(ez.gpu) && ez.gpu != af.gpu) {
            if (ez.gpu === false || ez.gpu === true)
                ez.zero = false;     // tells easeEm() to do nothing
            else
                ez.noop = true;      // tells easeMe() to do almost nothing
        }
    }
    static zpp(ez) { ez.frames++; }  // zpp() counts frames
} ///////////////////////////////////// end class AFrame |||||||||||||||||||||||
const RAF = new AFrame; /*eslint-disable-line*/// one instance is all you needpause
