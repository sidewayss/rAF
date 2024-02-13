export {E, Ease, F, Fn, HD, Is, P, Pn, U};

// All consts, except Is, are fully or partially populated by PFactory.init():
const U  = {pct:"%"};  // units, e.g. "px", "deg"
const HD = {};         // bitmasks for CSS L4 (UHD) color functions
const E  = {           // global constants, PFactory.init() adds enums
    comsp:/[,\s]+/,    currentValue:null,   value:"value", // value, unit, comp
     func:/[\(\)]/,              cV:null,   unit :"unit",  // are for easy.e
  sepfunc:/[,\s\(\)]+/g,         lp:'(',    comp :"comp",  // access via string.
     caps:/[A-Z]/g,              rp:')',  // lp, rp, sp, comma because '(', ')',
     nums: /-?[\d\.]+/g,         sp:' ',  // ' ', and ',' are awkward in code.
   numBeg:/^-?[\d\.]+/ ,      comma:',',
   numEnd: /-?[\d\.]+$/,     prefix:"E."  // prefix for accessing E via string
};
const Ease = {         // preset easing names/values
    ease:[{bezier:[0.25, 0.1, 0.25, 1.0]}]// I can't think of a better name
};
const Is = {           // boolean functions wrapped in a const, very inlineable
  def     (v) { return v !== undefined;  },
  Number  (v) { return typeof v == "number"; }, //++return "toFixed" in Object(v);
  String  (v) { return typeof v == "string"; },
  Element (v) { return v?.tagName  !== undefined; },
  CSSRule (v) { return v?.styleMap !== undefined; },
  SVG     (v) { return v instanceof SVGElement; },
  A       (v) { return Array.isArray(v); },
  A2      (v) { return Array.isArray(v) && v.some(a => Array.isArray(a)); },
  Arrayish(v) {
      try {            // Array.from() converts iterables and "array-like"
          return (Symbol.iterator in v || v.length >= 0) && !Is.String(v);
      } catch {
          return false;
      }
  }
}
Object.freeze(Is);     // not populated by PFactory.init()
//==============================================================================
const Fn = {};         // function names
const Pn = {};         // property and attribute names
const F  = {           // Func, CFunc, ColorFunc, SRFunc instances by name
 // joinCSSpolygon() joins an array of numbers into a CSS polygon() value
    joinCSSpolygon(arr, fillRule, u = U.px) {
        let i, l, str;
        const seps = [E.sp, E.comma]
        str = this.polygon.prefix + (fillRule ? fillRule + E.comma: "");
        for (i = 0, l = arr.length - 1; i < l; i++)
            str += arr[i] + u + seps[i % 2];
        return str + arr[i] + u + E.rp;     // no trailing separator
    },
};
const P  = {           // Prop, Bute, PrAtt, Bute2 instances by name
 // visible is useful as a boolean, for one element at a time
    visible(elm, b) {
        this.visibility.setOne(elm, b ? "visible" : "hidden");
    },
    isVisible(elm) {
        return elm.style.visibility == "visible";
    },
 // displayed does the same for display:"none" and ""
    displayed(elm, b = true, value="") {
        this.display.setOne(elm, b ? value : "none");
    },
    isDisplayed(elm) {
        return elm.style.display != "none";
    }
};