export {E, Ease, HD, Is, M, Rx, U};

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
    svgRotA:0,         // SVG rotate() has its own argument order
    svgRotX:1,         // CSS rotate shares arg order with rotate3d(), but it
    svgRotY:2,         // has "unstructured" alternate args and arg order.
                       // string arrays for enums, <option>, <li>, etc.
    eKey  :["value","unit","comp"],
    io    :["in","out","inIn","outIn","inOut","outOut"],
    jump  :["none","start","end","both"],
    status:["arrived","tripped","waiting","inbound","outbound",
            "initial","original","pausing","playing","empty"],
    type  :["linear","sine","circ","expo","back","elastic","bounce",
            "pow","bezier","steps","increment"],
                        // join() joins those string arrays for error messages
    join(arr, start = 0, end = Infinity) {
        return arr.slice(start, end)
                  .map(v => this.prefix + v)
                  .join(", ");
    }
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