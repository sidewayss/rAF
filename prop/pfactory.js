export {PFactory, ANGLES, EMPTY_PCT}; // ANGLES, EMPTY_PCT for func.js:CFunc

import {Func, CFunc, ColorFunc, SRFunc} from "./func.js"
import {Prop, Bute, PrAtt, HtmlBute}    from "./prop.js"

import {C, HD, U, E, Ez, F, Fn, P, Pn, Is, Ease, Easy} from "../raf.js";

// PFactory.init() populates the U, F, Fn, P, Pn objects using these arrays:
// C = <color>;  Un = gradients and other "unstructured" functions;
// A = <angle>;  L  = <length> default units:px;
// N = <number>; P  = <percentage>;
// T = transform funcions; Tm = <time> default units:ms;
// F = filter functions;    2 = no abbreviated name created;
// units:
const
LENGTHS   = ["px","em","rem","vw","vh","vmin","vmax","pt","pc","mm","in"],
ANGLES    = ["deg","rad","grad","turn"], // see CFunc.prototype.hueUnits
TIMES     = ["ms","s"],
EMPTY_PCT = ["", "U.pct"],                 // ditto .alphaUnits
// functions:
funcs   = ["url","var","cubic-bezier"],  //!!can any of these be animated??worth having here??
        // color funcs
funcC   = ["rgb","hsl","hwb","lch","oklch","lab","oklab"],
        // isUn funcs
funcUn  = ["color-mix","inset","path","polygon","calc","linear","steps"], //!!calc, linear, steps...
funcGr  = ["linear-gradient","radial-gradient","conic-gradient",
           "repeating-linear-gradient","repeating-radial-gradient",
           "repeating-conic-gradient"],
funcSR  = ["circle", "ellipse"],         // SR = <shape-radius>
        // filter funcs
funcF   = ["brightness","contrast","grayscale","invert","opacity","saturate","sepia"],
funcFA  = ["hue-rotate"],
funcFL  = ["blur","drop-shadow"],
        // transform funcs
funcT   = ["matrix","scale","matrix3d","scale3d"],
funcTA  = ["rotate","rotateX","rotateY","rotateZ","rotate3d"],
funcTA2 = ["skew","skewX","skewY"],
funcTL  = ["perspective","translateZ"],
funcTLP = ["translate","translateX","translateY","translate3d"],
// CSS properties, class Prop:
css   = ["flexFlow","alignItems","alignSelf","justifyContent", //!!any of these animate??
         "fontFamily","fontWeight","overflowX","overflowY",
         "pointerEvents","vectorEffect","textAnchor"],
css2  = ["left","right","top","bottom",  // r = <circle> radius, no abbreviations
         "cursor","display","flex","mask","overflow","position"], //!!not all of these animate
cssUn = ["border","borderImage","clip-path","offset-path","shape-outside"],
cssC  = ["color","backgroundColor","borderColor","borderLeftColor",
         "borderRightColor","borderTopColor","borderBottomColor"],
cssLP = ["transformOrigin","maxHeight","maxWidth","minHeight","minWidth",
         "padding",    "margin",         // border is in cssUn, above
         "paddingTop", "paddingBottom","paddingLeft","paddingRight",
          "marginTop",  "marginBottom", "marginLeft", "marginRight",
          "borderTop",  "borderBottom", "borderLeft", "borderRight",
          "borderWidth","borderTopWidth","borderBottomWidth","borderLeftWidth","borderRightWidth"],
bg    = ["backgroundAttachment","backgroundClip", "backgroundOrigin",
         "backgroundBlendMode", "backgroundRepeat"], //!!none of these animate, maybe repeat...
bgUn  = ["background","backgroundImage","backgroundSize",
         "backgroundPosition","backgroundPositionX","backgroundPositionY"],
// CSS-SVG property-attributes, class PrAtt:
csSvg = ["font-style","visibility"],
csSvC = ["fill","stroke","stop-color"],
csSvN = ["font-size-adjust"],
csSvP = ["font-stretch"],
csSNP = ["opacity","fill-opacity","stroke-opacity","stop-opacity"],
csSLP = ["x","y","r","cx","cy","height","width","stroke-width","font-size"],
// SVG attributes, class Bute:
svg   = ["class","href","lengthAdjust","preserveAspectRatio","type"], //!!any of these animate??
svgUn = ["d","points"], // CSS.supports("d","path('')")
svgN  = ["viewBox","baseFrequency","stdDeviation","surfaceScale"],
svgN2 = ["azimuth","elevation","k1","k2","k3","rotate","scale","seed","values"],
svgLP = ["dx","dy","startOffset","textLength","x1","x2","y1","y2"],
// HTML attributes, class HtmlBute:
html  = ["value"],      // for <input type="range">
// Miscellaneous:
vB = ["x","y","w","h"], // SVG viewBox
presets = [             // for Ease, see globals.js
    ["",1.685], ["Quad",2], ["Cubic",3], ["Quart",4], ["Quint",5],
    ["Sine"], ["Expo"], ["Circ"], ["Back"], ["Elastic"], ["Bounce"]
];
//==============================================================================
const PFactory = {
 // init() populates U, F, Fn, P, Pn, C, HD, Ease, E, Ez, and freezes all but P,
 // Pn. Call it once per session prior to using any of those objects or classes.
    init() {
        if (this.initialized) {
            console.info(Ez._only("PFactory", "initialized once per session"));
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
        add(html,     0, Pn, P, "",    "_noU",      HtmlBute);

        let fp, keys;
        const colorFuncs = [];
        Fn.color   = "color";
        this.funcC = funcC.slice();     // for Ez._invalidErr(, validList)
        ColorFunc.spaces.forEach((id, i) => {
            fp = new ColorFunc("", "_noUPct", id);
            colorFuncs.push(fp);        // a ColorFunc for each color() space
            this.funcC.push(id);
            Ez.readOnly(F, id, fp);
            if (id.includes("-")) {     // aliases out the wazoo:
                Ez.readOnly(F, Ez.kebabToCamel(id), fp);  // standard camelCase
                Ez.readOnly(F, id.replaceAll("-", "_"), fp); // snake_case: Color.js
            }
            if (ColorFunc.aliases[i])   // aliases for Color.js + CSS xyz
                F[ColorFunc.aliases[i]] = fp;

            E[Ez.kebabToCamel(id)] = id;//!!with F[spaceId] are these needed??
        });

        Fn.rgba = Fn.rgb + "a";         // elm.style, getComputedStyle() use it
        F .rgba = F.rgb;
        F .srgb = F.rgb;                // no one uses color(srgb), but...

        // Properties for this, F, P:
        // readOnly() for P because F and this get frozen, but P is extensible.
        // P._pct _len _ang _color help the static global property setters
        // FL, FA, CSSVC for drop-shadow, hue-rotate, stop-color camelCase
        const funcLP = [...funcSR, ...funcTLP];
        const propLP = [...svgLP,  ...cssLP];

        keys = [[...funcLP, ...funcF,  ...funcC],  propLP];
        Ez.readOnly(this, "_pct", [...colorFuncs, ...keys2Objects([F, P], keys)]);

        keys = [[...funcLP, ...funcTL, ...FL], propLP];
        Ez.readOnly(this, "_len", keys2Objects([F, P], keys));

        keys = [[...funcTA, ...funcTA2, ...FA, Fn.hsl, Fn.hwb]];
        Ez.readOnly(this, "_ang", keys2Objects([F], keys));

        keys = [[...cssC, ...CSSVC]];
        Ez.readOnly(this, "_color", keys2Objects([P], keys));
        for (fp of this._color)
            Ez.is(fp, "Color");

        for (fp of [F.lch, F.oklch]) {
            fp.hueIndex = 2;
            fp.hasHue   = true;
        }
        for (fp of [F.hsl, F.hwb]) {
            fp.hueIndex = 0;
            fp.hasHue   = true;
            fp.isHXX    = true;
        }
        for (fp of [F.hsl, F.hwb, F.rgb]);
            fp.isLD = true;             // HD = High Def, LD = Low Def

        F.rgb.isRGB = true;
        F.hsl.isHSL = true;

        Pn.filter    = "filter";        // filter & transform are multi-function
        Pn.transform = "transform";     // transform has CSS and SVG variants
        P .filter    = new Prop(Pn.filter,    "", "_noU", F.saturate,  true);
        P .transform = new Prop(Pn.transform, "", "_noU", F.translate, true);
        P .transSVG  = new Bute(Pn.transform, "", "_noU", F.translate, true);
        for (const p of [...this._color, P.filter, P.transform, P.transSVG])
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
        const RGBC = Array.from(
            {length:len * rgb.length},
            (_, i) => arr[i % len] + rgb[Math.floor(i / len)]
        );
        rgb = rgb.map(v => v.toLowerCase());
        const hsl = ["h","s","l"];      // the rest look better in lower case
        const hwb = [,"w"];
        const lab = ["l","a","b","alpha"];
        const lch = [,"c","h"];
        const xyz = ["x","y","z"];

        arr = ["a","b","c","d"];        // matrix3d() has 16 args
        len = arr.length;
        const abcd = Array.from(
            {length:len * len},
            (_, i) => arr[i % len] + Math.floor(i / len + 1)
        );
        arr.push("e","f");              // SVG matrix()

        let n = 0.5;                    // create the bitmask values up front
        const bits  = Array.from({length:RGBC.length}, () => n *= 2);
        const pairs = [[C,  [RGBC, rgb, hsl, hwb, lab, lch, xyz]],
                       [HD, [lab, lch, xyz]],
                       [Ez, [arr, abcd, vB]]];
        for (const [target, source] of pairs)
            for (arr of source)         // create the bitmask properties
                arr.forEach((v, i) => target[v] = bits[i]);

        Ez.tx = Ez.e;                   // for CSS matrix()
        Ez.ty = Ez.f;
        Ez.w  = Ez.width;               // for convenience, consistency with P
        Ez.h  = Ez.height;
        Ez.z  = Ez.w;                   // for transform3d
        Ez.angle = Ez.h;                // for rotate3d()

        // E object, enumerations and string constants:
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
        for (obj of [C, E, Ease, Ez, F, Fn, HD, U, CFunc._funcs])
            Object.freeze(obj);

        this.initialized = true;
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
        if (Is.A(obj)) {          // LENGTHS, ANGLES, EMPTY_PCT
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
 // set lengthUnits() sets units for Props/Funcs that use <length>
    set lengthUnits(val) {
        val = this._validUnits(val, "lengthUnits", LENGTHS);
        for (obj of this._len)
            obj._u = val;      // backdoor avoids double-validation
    },
 // set angleUnits() sets units for Funcs that use <angle>
    set angleUnits(val) {
        val = this._validUnits(val, "angleUnits", ANGLES);
        for (const obj of this._ang)
            obj._u = val;
    },
 // set percent() toggles U.pct for Props/Funcs that use it
    set percent(b) {
        if (b)
            for (const obj of this._pct)
                obj._u = U.pct;
        else
            for (const obj of this._pct)
                obj._u = obj._lenPct ? U.px : "";
    },
 // set colorFunc() sets the CFunc for all color Props
    set colorFunc(val) {
        if (val?.isCFunc)
            for (const obj of this._color)
                obj.func = val;
        else
            Ez._invalidErr("colorFunc", val?.name ?? val, this.funcC);
    },
 // -----------------------------------
 // These two are for class CFunc only:
    set alphaUnits(val) {
        val = this._validUnits(val, "alphaUnits", EMPTY_PCT);
        for (const f of Object.values(CFunc._funcs))
            f._u[CFunc.A] = val;
    },
    set hueUnits(val) {
        val = this._validUnits(val, "hueUnits", ANGLES);
        for (const f of Object.values(CFunc._funcs))
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