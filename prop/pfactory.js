export {PFactory, ANGLES, EMPTY_PCT}; // ANGLES, EMPTY_PCT for func.js:CFunc

import {Func, CFunc, ColorFunc, SRFunc} from "./func.js"
import {Prop, Bute, PrAtt, Bute2}       from "./prop.js"

import {C, HD, U, E, Ez, F, Fn, P, Pn, Is, Ease, Easy} from "../raf.js";

// PFactory.init() populates the U, F, Fn, P, Pn objects using these arrays:
// C = <color>;  Un = gradients and other "unstructured" functions;
// A = <angle>;  L  = <length> default units:px;
// N = <number>; P  = <percentage>;
// T = transform funcs; Tm = <time> default units:ms;
// 2 = no abbreviated name created;
// units:
const LENGTHS   = ["px","em","rem","vw","vh","vmin","vmax","pt","pc","mm","in"];
const ANGLES    = ["deg","rad","grad","turn"];  // see CFunc.prototype.hueUnits
const TIMES     = ["ms","s"];
const EMPTY_PCT = ["", U.pct];                  // ditto .alphaUnits
//  functions:
const funcs   = ["url","var","cubic-bezier"];
const funcUn  = ["color-mix","inset","path","polygon","calc","linear","steps"];
const funcC   = ["rgb","hsl","hwb","lch","oklch","lab","oklab"];
const funcGr  = ["linear-gradient","radial-gradient","conic-gradient",
                 "repeating-linear-gradient","repeating-radial-gradient",
                 "repeating-conic-gradient"];
const funcSR  = ["circle", "ellipse"]; // SR = <shape-radius>
                //!!filter functions broken out for class Elm
const funcF   = ["brightness","contrast","grayscale","invert","opacity",
                 "saturate","sepia"];
const funcFA  = ["hue-rotate"];
const funcFL  = ["blur","drop-shadow"];
                //!!transform funcs broken out for class Elm
const funcT   = ["matrix","scale","matrix3d","scale3d"];
const funcTA  = ["rotate","rotateX","rotateY","rotateZ","rotate3d"];
const funcTA2 = ["skew","skewX","skewY"];
const funcTL  = ["perspective","translateZ"];
const funcTLP = ["translate","translateX","translateY","translate3d"];
// CSS properties, class Prop:
const css   = ["flexFlow","alignItems","alignSelf","justifyContent",
               "fontFamily","fontWeight","overflowX","overflowY",
               "pointerEvents","vectorEffect","textAnchor"];
const css2  = ["cursor","display","flex","mask","overflow","position",
               "left","right","top","bottom"]; // r is taken, no abbreviations
const cssUn = ["border","clip-path","shape-outside"];
const cssC  = ["color","backgroundColor","borderColor","borderLeftColor",
               "borderRightColor","borderTopColor","borderBottomColor"];
const cssLP = ["transformOrigin",
               "maxHeight","maxWidth","minHeight","minWidth",
               "padding",    "margin",
               "paddingTop", "paddingBottom","paddingLeft","paddingRight",
               "marginTop",  "marginBottom", "marginLeft", "marginRight",
               "borderTop",  "borderBottom", "borderLeft", "borderRight",
               "borderWidth","borderHeight", "borderImage"];
              //++const cssTm = ["transitionDuration"];
const bg    = ["backgroundAttachment","backgroundClip",  "backgroundOrigin",
               "backgroundBlendMode", "backgroundImage", "backgroundRepeat"];
const bgUn  = ["background",          "backgroundSize",  "backgroundPosition",
               "backgroundPositionX", "backgroundPositionY"];
// CSS-SVG property-attributes, class PrAtt:
const csSvg = ["font-style","visibility"];
const csSvC = ["fill","stroke","stop-color"];
const csSvN = ["font-size-adjust"];
const csSvP = ["font-stretch"];
const csSNP = ["opacity","fill-opacity","stroke-opacity","stop-opacity"];
const csSLP = ["x","y","r","cx","cy",
               "height","width","stroke-width","font-size"];
// SVG attributes, class Bute:
const svg   = ["class","href","lengthAdjust","preserveAspectRatio","type"];
const svgUn = ["d","points"]; // CSS.supports("d","path('')")
const svgN  = ["viewBox","baseFrequency","stdDeviation","surfaceScale"];
const svgN2 = ["azimuth","elevation","k1","k2","k3","rotate","scale",
               "seed","values"];
const svgLP = ["dx","dy","startOffset","textLength","x1","x2","y1","y2"];
// SVG attributes, class Bute:
const htmlN = ["value"]; // for <input>
//==============================================================================
const vB = ["x","y","w","h"];

const presets = [        // for Ease
    ["",1.685], ["Quad",2], ["Cubic",3], ["Quart",4], ["Quint",5],
    ["Sine"], ["Expo"], ["Circ"], ["Back"], ["Elastic"], ["Bounce"]
];
//==============================================================================
const PFactory = {
 // init() populates U, F, Fn, P, Pn, C, HD, Ease, E, Ez, and freezes all but P,
 // Pn. Call it once per session prior to using any of those objects or classes.
    init() {
        if (this.initialized) {
            console.info("PFactory can only be initialized once per session.");
            return;
        }
        // Fill collections, order is critical: U, Fn, F, Pn, P:
        const FA = [], FL = [], CSSVC = [];

        add(LENGTHS, 99, U); // 99 prevents abbreviated names
        add(ANGLES,  99, U);
        add(TIMES,   99, U);          // noUnits
        add(funcs,    5, Fn, F, "",    "_noU",      Func);
        add(funcUn,   8, Fn, F, "",    "isUn",      Func);
        add(funcGr,   8, Fn, F, "",    "isUn",      Func);
        add(funcC,   99, Fn, F, "",    "_noUPct",  CFunc);
        add(funcSR,  99, Fn, F, U.px,  "_lenPct", SRFunc);
        add(funcF,   99, Fn, F, "",    "_noUPct",   Func);
        add(funcFA,   5, Fn, F, U.deg, "_ang",      Func, undefined, FA);
        add(funcFL,   5, Fn, F, U.px,  "_len",      Func, undefined, FL);
        add(funcT,    5, Fn, F, "",    "_noU",      Func);
        add(funcTA,   5, Fn, F, U.deg, "_ang",      Func);
        add(funcTA2, 99, Fn, F, U.deg, "_ang",      Func);
        add(funcTL,   5, Fn, F, U.px,  "_len",      Func);
        add(funcTLP,  5, Fn, F, U.px,  "_lenPct",   Func);
        add(css,      7, Pn, P, "",    "_noU",      Prop);
        add(css2,    99, Pn, P, "",    "_noU",      Prop);
        add(cssUn,   99, Pn, P, "",    "isUn",      Prop);
        add(cssC,     0, Pn, P, "",    "_noU",      Prop, F.rgb);
        add(cssLP,    0, Pn, P, U.px,  "_lenPct",   Prop);
    //++add(cssTm,    7, Pn, P, U.ms,  "_tm",       Prop);
        add(bg,      99, Pn, P, "",    "_noU",      Prop);
        add(bgUn,    99, Pn, P, "",    "_noU",      Prop);
        add(csSvg,   99, Pn, P, "",    "_noU",      PrAtt);
        add(csSvC,    0, Pn, P, "",    "_noU",      PrAtt, F.rgb, CSSVC);
        add(csSvN,    0, Pn, P, "",    "_noU",      PrAtt);
        add(csSvP,    0, Pn, P, U.pct, "_pct",      PrAtt);
        add(csSNP,    0, Pn, P, "",    "_noUPct",   PrAtt);
        add(csSLP,    0, Pn, P, U.px,  "_lenPct",   PrAtt);
        add(svg,      7, Pn, P, "",    "_noU",      Bute);
        add(svgUn,   99, Pn, P, "",    "isUn",      Bute);
        add(svgN,     7, Pn, P, "",    "_noU",      Bute);
        add(svgN2,   99, Pn, P, "",    "_noU",      Bute);
        add(svgLP,   99, Pn, P, "",    "_lenPctN",  Bute);
        add(htmlN,    0, Pn, P, "",    "_noU",      Bute2);

        Fn.color = "color"; // CSS color() is special
        F .color = new ColorFunc(Fn.color, "", "_noUPct");

        F.rgba = F.rgb;     // elm.style and getComputedStyle(elm) use it

        // Read-only properties for this, F, P, and other objects:
        // P._pct _len _ang _color help the static global property setters
        // FL, FA, CSSVC for drop-shadow, hue-rotate, stop-color camelCase
        let f, keys;
        const funcLP = [...funcSR, ...funcTLP];
        const propLP = [...svgLP,  ...cssLP];

        keys = [[...funcLP, ...funcF,  ...funcC],  propLP];
        Ez.readOnly(P, "_pct", keys2Objects([F, P], keys));

        keys = [[...funcLP, ...funcTL, ...FL], propLP];
        Ez.readOnly(P, "_len", keys2Objects([F, P], keys));

        keys = [[...funcTA, ...funcTA2, ...FA, Fn.hsl, Fn.hwb]];
        Ez.readOnly(P, "_ang", keys2Objects([F], keys));

        keys = [[...cssC, ...CSSVC]];
        Ez.readOnly(P, "_color", keys2Objects([P], keys));

        Ez.readOnly(this, "funcC", [...funcC, Fn.color, "colorMix"]);
        for (f of [...P._color, ...funcC.map(fn => F[fn])])
            Ez.is(f, "Color");

        for (f of [F.lch, F.oklch]) {
            Ez.readOnly(f, "hueIndex", 2);
            Ez.readOnly(f, "hasHue", true);
        }
        for (f of [F.hsl, F.hwb]) {
            Ez.readOnly(f, "hueIndex", 0);
            Ez.readOnly(f, "hasHue", true);
            Ez.is(f, "HXX");
        }
        for (f of [F.hsl, F.hwb, F.rgb]);
            Ez.is(f, "LD")              // HD = High Def, LD = Low Def

        Ez.is(F.rgb, "RGB");
        Ez.is(F.hsl, "HSL");

        Pn.filter    = "filter";        // filter & transform are multi-function
        Pn.transform = "transform";     // transform has CSS and SVG variants
        P .filter    = new Prop(Pn.filter,    "", "_noU", F.saturate,  true);
        P .transform = new Prop(Pn.transform, "", "_noU", F.translate, true);
        P .transSVG  = new Bute(Pn.transform, "", "_noU", F.translate, true);
        for (const p of [...P._color, P.filter, P.transform, P.transSVG])
            Ez.readOnly(p, "needsFunc", true);

        U.percent      = U.pct;         // units aliases, long names
        U.milliseconds = U.ms;
        U.seconds      = U.s;

        Pn.xhref = "xlink:href";        // deprecated
        P.xhref  = new Prop(Pn.xhref, false);

        let caps, full, short, long;    // background abbreviations are special
        bg.unshift(Pn.backgroundColor); // bgC = bgColor not bgClip
        for (full of bg) {
            short = "bg";
            long  = "";
            while (caps = E.caps.exec(full)) {
                if (!long) {
                    long = short + full.substring(caps.index);
                    Pn[long] = full;    // long abbreviation, e.g. bgColor
                    P [long] = P[full];
                }
                short += caps[0];
            }
            Pn[short] = full;           // short abbreviation, e.g. bgC
            P [short] = P[full];
        }

        // Bitmasks, color functions first:
        let   arr  = ["R","G","B","A","C"];
        let   len  = arr.length;        // feColorMatrix has the most args at 20
        let   rgb  = arr.slice(0, len - 1);
        const RGBC = Array.from({length:len * rgb.length},
                                (_, i) => arr[i % len] + rgb[Math.floor(i / len)]);
        rgb = rgb.map(v => v.toLowerCase());
        const hsl = ["h","s","l"];      // the rest look better in lower case
        const hwb = [,"w"];
        const lab = ["l","a","b","alpha"];
        const lch = [,"c","h"];
        const xyz = ["x","y","z"];

        arr = ["a","b","c","d"];        // matrix3d() has 16 args
        len = arr.length;
        const abcd = Array.from({length:len * len},
                                (_, i) => arr[i % len] + Math.floor(i / len + 1));
        arr.push("e","f");              // SVG matrix()

        let n = 0.5;                    // create the bitmask values up front
        const bits  = Array.from({length:RGBC.length}, () => n *= 2);
        const pairs = [[C,  [RGBC, rgb, hsl, hwb, lab, lch, xyz]],
                       [HD, [lab, lch, xyz]],
                       [Ez, [arr, abcd, vB]]];
        for (const [target, source] of pairs)
            for (arr of source)
                arr.forEach((v, i) => target[v] = bits[i]);

        Ez.tx = Ez.e;                   // for CSS matrix()
        Ez.ty = Ez.f;
        Ez.w  = Ez.width;               // for convenience, consistency w/P
        Ez.h  = Ez.height;
        Ez.z  = Ez.w;                   // for transform3d
        Ez.angle = Ez.h;                // for rotate3d()

        // E object, enumerations and eKey constants:
        let j, key;
        for (keys of [vB, Easy.status, Easy.type, Easy.io, Easy.jump, Easy.set]) {
            j = 0;
            for (key of keys)
                E[key] = j++;
        }
        for (key of Easy.eKey)
            E[key] = key;

        // Popular arguments for Ez.toNumber() and Easy.legNumber():
        // Can't define these inside const Ez because ...Ez.xYZ not ready yet//!!??
                           // arguments[2, 3, 4]:
        Ez.undefGrThan0 = [undefined, ...Ez.grThan0];   // > 0, undefined ok
        Ez.undefNotZero = [undefined, ...Ez.notZero];   // !=0, undefined ok
                           // arguments[2, 3, 4, 5]:
        Ez.defGrThan0   = [...Ez.undefGrThan0, true];   // > 0, !undefined
        Ez.defNotNeg    = [null, ...Ez.notNeg, true];   // >=0, !undefined
                           // arguments[   3, 4, 5, 6]:
        Ez.intGrThan0   = [...Ez.grThan0, false, true]; // > 0, int or undefined
        Ez.intNotNeg    = [...Ez.notNeg,  false, true]; // >=0, int or undefined

        // Ease: a collection of preset easy.legs
        let inn, obj, out;              // "in" is a reserved word, thus "inn"
        for (const [name, pow] of presets) {
            inn = pow ? {pow:pow} : {type:E[name.toLowerCase()]};
            out = {...inn, io:E.out};
            inn.io = E.in;              // explicit default value
            [[inn],[out],[inn, out],[out, inn],[inn, {...inn}],[out, {...out}]]
                .forEach((v, i) => Ease[Easy.io[i] + name] = v);
        }

        // Lock up as much as is plausible, P and Pn are extensible
        for (obj of [F, P])
            Object.values(obj).forEach(o => Object.seal(o));
        for (obj of [C, E, Ease, Ez, F, Fn, HD, U])
            Object.freeze(obj);

        Ez.readOnly(this, "initialized", true);
        Object.freeze(this);
    },
 // ----------------------------------------------------------------------------
 // addAttributes() creates user-defined attributes in P and Pn.
 //    It adds the "data-" prefix and does not create abbreviated names.
 //    The actual browser rules re: "data-*" attribute names are not quite as
 //    advertised, and both setAttribute() and dataset[] can fail to set the
 //    value without throwing an error. So this method enforces rules that are
 //    based on what fails in practice, plus the restrictions on JavaScript
 //    property names: only lower case alpha, numbers, '-', and '_';
 //                    no '--' or '-N' where N is a number.
    addAttributes(attrs) {
        attrs = Ez.toArray(attrs, "Custom attributes", (val, name) => {
            let err;
            if (!Is.String(val))
                err = name + " must be strings: ";
            else if (/[^a-z-_0-9]/.test(val))
                err = name + " must contain only lower-case letters, numbers,"
                           + " hyphen aka dash ('-'), and underscore ('_'): ";
            else if (/^\d/.test(val))
                err = name + " cannot begin with a number: ";
            else if (/--|-\d/.test(val))
                err = name + " cannot contain '--', or '-' followed by a number: ";
            if (err)
                throw new Error(err + val);
            return val;
        });
        attrs.forEach((v, i) => attrs[i] = "data-" + v);
        add(attrs, 99, Pn, P, "", "_noU", Bute);
    },
 // --------------------------------------------------------------------------
 // _validUnits() helps Func and PBase validate units, obj can be an array of
    _validUnits(val, name, obj) { // string values or a Prop or Func instance.
        let arr;
        if (Is.A(obj)) {
            if (!obj.includes(val))
                arr = obj;
        }
        else if (obj._noUPct) {
            if (!EMPTY_PCT.includes(val))
                arr = EMPTY_PCT;
        }
        else if (obj._len) {
            if (!LENGTHS.includes(val))
                arr = LENGTHS;
        }
        else if (obj._lenPct) {
            if (!LENGTHS.includes(val) && val != U.pct)
                arr = [...LENGTHS, U.pct];
        }
        else if (obj._lenPctN) {
            if (!LENGTHS.includes(val) && val != U.pct && val !== "")
                arr = [...LENGTHS, U.pct, ""];
        }
        else if (obj._ang) {
            if (!ANGLES.includes(val))
                arr = ANGLES;
        }
        else if (obj._pct && val != U.pct)
            throw new Error(`${name} units are read-only: ${U.pct}.`);
        else if (obj._noU || obj.isUn) // noUnits or isUnstructured
            throw new Error(`${name} does not use units: val.`);

        if (arr)
            Ez._invalidErr(name, val, arr);

        return val;
    },
 // ----------------------------------------------------------------
 // Setters to globally change units, func:
 // set lengthUnits() sets the units for all Props that use <length>
    set lengthUnits(val) {
        val = this._validUnits(val, "lengthUnits", LENGTHS);
        for (obj of this._len)
            obj._u = val;      // backdoor avoids double-validation
    },
 // set angleUnits() sets the units for all the Props that use <angle>
    set angleUnits(val) {     // <angle>
        val = this._validUnits(val, "angleUnits", ANGLES);
        for (const obj of this._ang) // they're all funcs
            obj._u = val;
    },
 // set percent() toggles U.pct for Props that use it
    set percent(b) {
        if (b)
            for (const obj of this._pct)
                obj._u = U.pct;
        else
            for (const obj of this._pct)
                obj._u = obj._lenPct ? U.px : "";
    },
 // set colorFunc() sets the CFunc for all color properties
    set colorFunc(val) {
        if (val?.isColor)
            for (const obj of this._color)
                obj.func = val;
        else
            Ez._invalidErr("colorFunc", val?.name ?? val, this.funcC);
    },
 // -----------------------------------
 // These two are for class CFunc only:
    set alphaUnits(val) {
        val = this._validUnits(val, "alphaUnits", EMPTY_PCT);
        for (const f of CFunc._funcs)
            f._u[CFunc.A] = val;
    },
    set hueUnits(val) {
        val = this._validUnits(val, "hueUnits", ANGLES);
        for (const f of CFunc._funcs)
            if (f.hasHue)
                f._u[f.hueIndex] = val;
    }
}
//==============================================================================
// Helpers for init()
function keys2Objects(objs, keys) {
    let i, obj;
    const l   = keys.length;
    const arr = new Array(l);
    for (i = 0; i < l; i++) {
        obj = objs[i]
        arr[i] = keys[i].map(k => obj[k])
    }
    return l > 1 ? arr.flat() : arr[0];
}
// add() adds items to F, Fn, P, Pn, U
// required arguments:
//   vals    - array of function, property, or unit strings (original names)
//   minLen  - min name length for creating a short name
//   strings - Fn, Pn, or U: collection of strings
// optional:
//   fp    - F or P
//   units - string containing default units for the prop or func
//   utype - string containing units type property or isUn(structured)
//   cls   - the class to instantiate
//   func  - the Prop's func
//   names - an array for storing names
function add(vals, minLen, strings, fp, units, utype, cls, func, names) {
    let i, ln, sn, setShort;         // ln = long name, sn = short name
    for (const v of vals) {
        if (v.length >= minLen)
            sn = v[0];
        if (v.includes("-")) {       // convert kebab-case to camelCase
            let cap, i;              // function names are kebab-case only
            const arr = v.split("-");
            ln = arr[0];
            for (i = 1; i < arr.length; i++) {
                cap = arr[i][0].toUpperCase();
                ln += cap + arr[i].substring(1);
                if (sn)
                    sn += cap;
            }
        }
        else {                       // v is one word or camelCase
            ln = v;                  // property names are all camelCase here
            if (sn) {                // non-CSS SVG attributes are all camelCase
                const m = v.match(/[A-Z]|\d/g);
                if (m)               // match caps or number
                    for (i of m)     // i is one uppercase or numeric char
                        sn += i;
            }
        }
        setShort = sn && !strings[sn];
        Ez.readOnly(strings, ln, v); // these are read-only properties
        if (setShort)
            Ez.readOnly(strings, sn, v);
        if (fp) {
            Ez.readOnly(fp, ln, new cls(v, units, utype, func));
            if (setShort)
                Ez.readOnly(fp, sn, fp[ln]);
        }
        names?.push(ln);
    }
}