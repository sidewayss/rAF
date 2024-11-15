export {E, Ease, F, Fn, HD, Is, M, P, Pn, Rx, U};

import {Ez} from "./raf.js";

// All the consts objects except Rx and Is are populated in PFactory.init()
const U  = {pct:"%"};   // units, e.g. "px", "deg"
const M  = {};          // enum of arg indexes for matrix() and matrix3d()
const HD = {};          // enum of arg indexes for CSS L4 (UHD) color functions
const E  = {            // Easy-related constants, PFactory.init() adds enums
    cV:null, currentValue:null,
    prefix:"E.",        // prefix for accessing E via string
    lp:'(',  rp:')',    // lp, rp, sp, comma because '(', ')',  ' ', and ','
    sp:' ',  comma:',', // are awkward in code.
    rad :Math.PI / 180, // multipliers to convert from degrees to other units
    grad:10 / 9,
    turn:1 / 360,
    svgRotX: 0,         // SVG rotate() has its own argument order
    svgRotY: 1,         // CSS rotate shares arg order with rotate3d(), but it
    svgRotAngle: 2      // has "unstructured" alternate args and arg order.
};
const Ease = {          // preset easing names/values
    ease:[{bezier:[0.25, 0.1, 0.25, 1.0]}]// I can't think of a better name
};
const Rx = {            // regular expressions
    comsp:/[,\s]+/,
     func:/[\(\)]/,
  sepfunc:/[,\s\(\)]+/g,
     caps:/[A-Z]/g,
     nums: /-?[\d\.]+/g,
   numBeg:/^-?[\d\.]+/,
   numEnd: /-?[\d\.]+$/
};
Object.seal(Rx);

const Is = {            // boolean functions, highly inlineable
    def     (v) { return v !== undefined;  },
    Number  (v) { return typeof v == "number"; },
    String  (v) { return typeof v == "string"; },
    Element (v) { return v?.tagName  !== undefined; },      //??avoiding instanceOf??
    CSSRule (v) { return v?.selectorText !== undefined; },  //??is it worth it??
    SVG     (v) { return v instanceof SVGElement; },
    A       (v) { return Array.isArray(v); },
    A2      (v) { return Array.isArray(v) && v.some(a => Array.isArray(a)); },
    Arrayish(v) {
        try {           // Array.from() converts iterables and "array-like"
            return (Symbol.iterator in v || v.length >= 0)
                && !Is.String(v) && !(v instanceof HTMLSelectElement);
        } catch {       // String and <select> are iterable, but not arrayish
            return false;
        }
    },
    A2ish(v, ish) {     // shorter than Arrayish2D()
      return (ish ?? Is.Arrayish(v)) && v.some(a => Is.Arrayish(a));
    }
};
Object.seal(Is);
//==============================================================================
// The prime targets of PFactory.init():
const Fn = {};         // function names
const Pn = {};         // property and attribute names
const F  = {           // Func, CFunc, ColorFunc, SRFunc instances by name
 // joinCSSpolygon() joins an array of numbers into a CSS polygon() value
    joinCSSpolygon(arr, fillRule, u = U.px) {
        let i, l, str;
        const seps = [E.sp, E.comma]
        str = F.polygon.prefix + (fillRule ? fillRule + E.comma: "");
        for (i = 0, l = arr.length - 1; i < l; i++)
            str += arr[i] + u + seps[i % 2];
        return str + arr[i] + u + E.rp;     // no trailing separator
    },
};
const P  = {           // Prop, Bute, PrAtt, HtmlBute instances by name
 // visible is useful as a boolean, for one or more elements
    visible(elms, b) {
        const val = b ? "visible" : "hidden";
        elms = Ez.toElements(elms);
        for (const elm of elms)
            P.visibility.setOne(elm, val);
    },
    isVisible(elm) { // one element at a time
        return P.visibility.getOne(elm) == "visible";
    },
 // displayed does something similar for display
    displayed(elms, b, value) {
        boolNone(Pn.display, elms, b, value);
    },
    isDisplayed(elm) { // one element at a time
        return P.display.getOne(elm) != "none";
    },
 // events does something similar for pointer-events
    events(elms, b, value) {
        boolNone(Pn.pE, elms, b, value);
    },
    hasEvents(elm) {
        return elm.style.pointerEvents != "none";
    },
 // enable() is an inverted pseudo-disabled attribute for SVG and other elements
 //          that don't have a disabled attribute. It sets pointer-events:none
 //          and tabIndex = -1 instead. The name is inverted to avoid confusion.
    enable(elms, b, value, i = b ? 0 : -1) {
        P.events(elms, b, value);
        for (const elm of Ez.toElements(elms))
            elm.tabIndex = i;
    }
};
// boolNone helps P.displayed() and P.events()
function boolNone(name, elms, b, value) {
    const val = b ? (value ?? "") : "none";
    for (const elm of Ez.toElements(elms))
        P[name].setOne(elm, val);
}