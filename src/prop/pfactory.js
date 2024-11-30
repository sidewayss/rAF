import {LENGTHS, ANGLES, TIMES, F, Fn, P, Pn} from "./pfunc.js"
import {Func, CFunc, ColorFunc, SRFunc}       from "./func.js"
import {Prop, Bute, PrAtt, HtmlBute}          from "./prop.js"

import {C} from "./color-names.js"

import {HD, M, U, Is, Rx} from "../globals.js";
import {Ez}               from "../ez.js";
//==============================================================================
export const PFactory = {
 // init() populates U, F, Fn, P, Pn, C, HD, and freezes all but P, Pn.
 //        Call it once per session prior to using any of those objects.
    init() {
        if (this.initialized) {
            console.info(Ez._only("PFactory", "initialized once per session"));
            return;
        } //-------------------------------
        const FA = [], FL = [], CSSVC = [],

        // functions, properties, attributes by category:
        // C = <color>;  Un = gradients and other "unstructured" functions;
        // A = <angle>;  L  = <length> default units:px;
        // N = <number>; P  = <percentage>;
        // T = transform funcions; Tm = <time> default units:ms;
        // F = filter functions;    2 = no abbreviated name created;
        //
        // Functions
        funcs   = ["url","var","cubic-bezier"],  //!!can any of these be animated??worth having here??
                  // color funcs
        funcC   = CFunc.funcNames,
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

        // CSS properties, class Prop
        css   = ["flex-flow","align-items","align-self","justify-content", //!!do any of these animate??
                 "font-family","font-weight","overflow-x","overflow-y",
                 "pointer-events","vector-effect","text-anchor"],
        css2  = ["left","right","top","bottom",  // r = <circle> radius, no abbreviations
                 "cursor","display","flex","mask","overflow","position"], //!!not all of these animate
        cssUn = ["border","border-image","box-shadow","clip-path","offset-path","shape-outside"],
        cssC  = ["color","accent-color","background-color","border-color","border-left-color",
                 "border-right-color","border-top-color","border-bottom-color"],
        cssLP = ["transform-origin","max-height","max-width","min-height","min-width",
                 "padding","margin",             // border is in cssUn, above
                 "padding-top", "padding-bottom","padding-left","padding-right",
                  "margin-top",  "margin-bottom", "margin-left", "margin-right",
                  "border-top",  "border-bottom", "border-left", "border-right", "border-radius",
                  "border-width","border-top-width","border-bottom-width","border-left-width","border-right-width"],
        bg    = ["background-attachment","background-origin",  //!!none of these animate, maybe repeat...
                 "background-blend-mode","background-repeat"], //!!background-clip removed because bgC = bgColor!!
        bgUn  = ["background","background-image","background-size",
                 "background-position","background-position-x","background-position-y"],

        // CSS-SVG property-attributes, class PrAtt
        csSvg = ["font-style","visibility"],
        csSvC = ["fill","stroke","stop-color"],
        csSvN = ["font-size-adjust"],
        csSvP = ["font-stretch"],
        csSNP = ["opacity","fill-opacity","stroke-opacity","stop-opacity"],
        csSLP = ["x","y","r","cx","cy","height","width","stroke-width","font-size"],

        // SVG attributes, class Bute
        svg   = ["class","href","lengthAdjust","preserveAspectRatio","type"], //!!any of these animate??
        svgUn = ["d","points"], // CSS.supports("d","path('')")
        svgN  = ["viewBox","baseFrequency","stdDeviation","surfaceScale"],
        svgN2 = ["azimuth","elevation","k1","k2","k3","rotate","scale","seed","values"],
        svgLP = ["dx","dy","startOffset","textLength","x1","x2","y1","y2"],

        // HTML attributes, class HtmlBute
        html = ["value"],       // for <input type="range">

        // Miscellaneous
        _ang = "_ang",    isUn = "isUn",
        _len = "_len",    _lenPct  = "_lenPct",
        _pct = "_pct",    _lenPctN = "_lenPctN",
        _noU = "_noU",    _noUPct  = "_noUPct";
        //----------------------------------------------------------------------
        // Enumerations for argument indexes for masks, must precede collections
        let arr, obj,
        keys = ["R","G","B","A","C"],   // feColorMatrix has 20 args: RR - CA
        len  = keys.length;
        const RGBC = Array.from(
            {length:len * (len - 1)},
            (_, i) => keys[i % len] + keys[Math.floor(i / len)]
        ),
        rgb = keys.slice(0, -1).map(v => v.toLowerCase()),
        hsl = ["h","s","l"],            // color functions have 3 args + alpha
        hwb = [,"w"],
        lab = ["l","a","b","alpha"],
        lch = [,"c","h"],
        xyz = ["x","y","z"];

        keys = ["a","b","c","d"];       // matrix3d() has 16 args
        len  = keys.length;             // a1 - d4
        const m3d = Array.from(
            {length:len * len},
            (_, i) => keys[i % len] + Math.floor(i / len + 1)
        );
        keys.push("e","f");             // for SVG matrix() - 2D has 6 args

        const pairs = [                 // create the properties and aliases
            [C,  [RGBC, rgb, hsl, hwb]],
            [HD, [lab, lch, xyz]],
            [M,  [keys, m3d]]
        ];
        for ([obj, arr] of pairs)
            for (keys of arr)           // forEach() excludes empty, includes i
                keys.forEach((v, i) => obj[v] = i);

        M.tx = M.e;                     // for CSS matrix()
        M.ty = M.f;
        C.alpha  = C.a;                 // a more readable alias, aligns with HD
        //----------------------------------------------------------------------
        // Fill collections, order is critical: U, Fn, F, Pn, P:
        add(LENGTHS, 99, U);    // 99 prevents abbreviated names
        add(ANGLES,  99, U);
        add(TIMES,   99, U);          // noUnits
        add(funcs,    5, Fn, F, "",    _noU,      Func);
        add(funcUn,   8, Fn, F, "",    isUn,      Func);
        add(funcGr,   8, Fn, F, "",    isUn,      Func);
        add(funcC,   99, Fn, F, "",    _noUPct,  CFunc);
        add(funcSR,  99, Fn, F, U.px,  _lenPct, SRFunc);
        add(funcF,   99, Fn, F, "",    _noUPct,   Func);
        add(funcFA,   5, Fn, F, U.deg, _ang,      Func, undefined, FA);
        add(funcFL,   5, Fn, F, U.px,  _len,      Func, undefined, FL);
        add(funcT,    5, Fn, F, "",    _noU,      Func);
        add(funcTA,   5, Fn, F, U.deg, _ang,      Func);
        add(funcTA2, 99, Fn, F, U.deg, _ang,      Func);
        add(funcTL,   5, Fn, F, U.px,  _len,      Func);
        add(funcTLP,  5, Fn, F, U.px,  _lenPct,   Func);
        add(css,      7, Pn, P, "",    _noU,      Prop);
        add(css2,    99, Pn, P, "",    _noU,      Prop);
        add(cssUn,   99, Pn, P, "",    isUn,      Prop);
        add(cssC,     0, Pn, P, "",    _noU,      Prop, F.rgb);
        add(cssLP,    0, Pn, P, U.px,  _lenPct,   Prop);
        add(bg,      99, Pn, P, "",    _noU,      Prop);
        add(bgUn,    99, Pn, P, "",    _noU,      Prop);
        add(csSvg,   99, Pn, P, "",    _noU,      PrAtt);
        add(csSvC,    0, Pn, P, "",    _noU,      PrAtt, F.rgb, CSSVC);
        add(csSvN,    0, Pn, P, "",    _noU,      PrAtt);
        add(csSvP,    0, Pn, P, U.pct, _pct,      PrAtt);
        add(csSNP,    0, Pn, P, "",    _noUPct,   PrAtt);
        add(csSLP,    0, Pn, P, U.px,  _lenPct,   PrAtt);
        add(svg,      7, Pn, P, "",    _noU,      Bute);
        add(svgUn,   99, Pn, P, "",    isUn,      Bute);
        add(svgN,     7, Pn, P, "",    _noU,      Bute);
        add(svgN2,   99, Pn, P, "",    _noU,      Bute);
        add(svgLP,   99, Pn, P, "",    _lenPctN,  Bute);
        add(html,     0, Pn, P, "",    _noU,      HtmlBute);

        let fp, isKebab, key;
        const colorFuncs = [];
        Ez.readOnly(Fn, "color", "color");
        this.funcC = funcC.slice();     // for Ez._invalidErr(, validList)
        ColorFunc.spaces.forEach((id, i) => {
            isKebab = id.includes("-");
            key = isKebab ? Ez.kebabToCamel(id) : id;
            fp  = new ColorFunc(id, key, "", _noUPct);
            colorFuncs.push(fp);        // a ColorFunc for each color() space
            this.funcC.push(id);
            Ez.readOnly(F, id, fp);
            if (isKebab) {              // camelCase, snake_case aliases
                Ez.readOnly(F, key, fp);                 // standard js
                Ez.readOnly(F, Ez.kebabToSnake(id), fp); // for Color.js
            }
            if (ColorFunc.aliases[i])   // aliases for Color.js + CSS xyz
                Ez.readOnly(F, ColorFunc.aliases[i], fp);

            Ez.readOnly(Fn, Ez.kebabToCamel(id), id);
        });
        const rgba = Fn.rgb + "a";      // elm.style, getComputedStyle() use it
        Ez.readOnly(F,  rgba, F.rgb);
        Ez.readOnly(Fn, rgba, rgba);
        //----------------------------------------------------------------------
        // Properties for this, F, P:
        // readOnly() for P because F and this get frozen, but P is extensible.
        // P._pct _len _ang _color help the static global property setters
        // FL, FA, CSSVC for drop-shadow, hue-rotate, stop-color camelCase
        const
        funcLP = [...funcSR, ...funcTLP],
        propLP = [...svgLP,  ...cssLP];

        keys = [[...funcLP, ...funcF,  ...funcC],  propLP];
        Ez.readOnly(this, _pct, [...colorFuncs, ...keys2Objects([F, P], keys)]);

        keys = [[...funcLP, ...funcTL, ...FL], propLP];
        Ez.readOnly(this, _len, keys2Objects([F, P], keys));

        keys = [[...funcTA, ...funcTA2, ...FA, Fn.hsl, Fn.hwb]];
        Ez.readOnly(this, _ang, keys2Objects([F], keys));

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
        P .filter    = new Prop(Pn.filter,    "", _noU, F.saturate,  true);
        P .transform = new Prop(Pn.transform, "", _noU, F.translate, true);
        P .transSVG  = new Bute(Pn.transform, "", _noU, F.translate, true);
        for (const p of [...this._color, P.filter, P.transform, P.transSVG])
            Ez.readOnly(p, "needsFunc", true);

        U.percent      = U.pct;         // units aliases, long names
        U.milliseconds = U.ms;
        U.seconds      = U.s;

        Pn.xhref = "xlink:href";        // deprecated
        P.xhref  = new Prop(Pn.xhref, false);

        let full, short, long;          // background abbreviations are special
        len = Pn.background.length + 1;
        bg.push(Pn.backgroundColor);    // color properties grouped elsewhere
        bgUn.shift();                   // "background" is the one without a "-"
        P .bg = P .background;
        Pn.bg = Pn.background;
        for (full of [...bg, ...bgUn]) {
            short = "bg";
            long  = short + Ez.initialCap(Ez.kebabToCamel(full.slice(len)));
            Pn[long] = full;            // long abbreviation, e.g. bgColor
            P [long] = P[full];

            short += long.match(Rx.caps).join("");
            Pn[short] = full;           // short abbreviation, e.g. bgC
            P [short] = P[full];
        }
        //---------------------------------------------------------
        // Lock up as much as is plausible, P and Pn are extensible
        for (obj of [F, P])
            Object.values(obj).forEach(o => Object.seal(o));
        for (obj of [C, F, Fn, HD, U, CFunc.funcs])
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
        add(attrs, 99, Pn, P, "", _noU, Bute);
    }
 }
//==============================================================================
// Helpers for init()
function keys2Objects(objs, keys) {
    let i, obj;
    const l   = keys.length;
    const arr = Array(l);
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
    let i, isKebab, ln, sn, setShort; // ln = long name, sn = short name
    for (const v of vals) {
        if (v.length >= minLen)
            sn = v[0];
        isKebab = v.includes("-");
        if (isKebab) {                // convert kebab-case to camelCase
            let cap, i;               // function names are kebab-case only
            const arr = v.split("-");
            ln = arr[0];
            for (i = 1; i < arr.length; i++) {
                cap = arr[i][0].toUpperCase();
                ln += cap + arr[i].substring(1);
                if (sn)
                    sn += cap;
            }
        }
        else {                        // v is one word or camelCase
            ln = v;
            if (sn) {
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
            Ez.readOnly(fp, ln, new cls(v, ln, units, utype, func));
            if (isKebab)
                Ez.readOnly(fp, v,  fp[ln]);
            if (setShort)
                Ez.readOnly(fp, sn, fp[ln]);
        }
        names?.push(ln);
    }
}