////////////////////////////////////////////////////////////////////////////////
// Func, Prop, and Ez classes defined. Part of rAF.js project, but useful on its
// own for setting property/attribute values without animation.
// Copyright (C) 2023 Sideways S. www.sidewayss.com
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
}           /////////////////////////// end class Func |||||||||||||||||||||||||
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Prop {                         // Prop: CSS property or SVG attribute |||||
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
}           /////////////////////////// end class Prop |||||||||||||||||||||||||
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
}                    ////////////////// end class Ez |||||||||||||||||||||||||||
const EZ  = new Ez;
const POS = {l:PR.left, r:PR.right, t:PR.top, b:PR.bottom};//eslint-disable-line