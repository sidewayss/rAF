// Not exported by raf.js
// This module is its create() function, literally. Everything else is called
// exclusively by create(), so the module is effectively one huge function.
// It is broken out into sub-functions to make it more manageable and readable.
// It could be broken into sub-modules, but the sub-module functions will still
// only be imported into, and called from, here. This way at least you know the
// scope & size of the code in one place, instead of having to dig through
// however many modules it might occupy. Maybe there should be a separate
// easer/ folder and each sub-function of create() could be a module...
export {create};

import {ECalc}               from "./ecalc.js";
import {Easer,  EaserByElm}  from "./easer.js";
import {MEaser, MEaserByElm} from "./measer.js";

import {CFunc} from "../prop/func.js";
import {PBase} from "../prop/pbase.js";

import {E, Ez, F, Fn, Is, Easy} from "../raf.js"

const
    keys   = ["f",           "a",           "max",      "min"     ],
    calcs  = [ ECalc.f,       ECalc.a,       Math.min,   Math.max ],
    byElms = ["factorByElm", "addendByElm", "maxByElm", "minByElm"],
    noop   = {cNN:"_noop"}
;
//==============================================================================
// create() instantiates a subclass of EBase and returns it. Internally, the b
//          arg is always defined and is the initial error check for Easer vs
//          MEaser. The q and cls args are purely for error messaging. b is set
//          to true by default to allow external clients to call create with
//          only the o and set args (or only o) and w/o the error check.
function create(o, set, isEasies) {
    if (Is.def(set) && (isEasies ? !o.easies : Boolean(o.easies))) {
        const arr = isEasies ? ["single", "Easy",   "Easies"]
                             : ["multi",  "Easies", "Easy"  ];
        throw new Error(`For ${arr[0]}-ease targets, use ${arr[1]} not ${arr[2]}`);
    } //---------------------------------------------------------------
    o.elms = Ez.toElements(o.elms ?? o.elm ?? o.elements ?? o.element);
    o.l    = o.elms.length;

    let cv, is1Elm;
    const
    hasElms  = Boolean(o.l),
    isPseudo = Boolean(o.pseudo);   // pseudo-target for pseudo-animation
    if (!hasElms && !isPseudo)      // !isPseudo requires elms requires prop
        ; //!!err                   // isPseudo requires peri
    //-------------------------------------------------
    o.prop  = PBase._validate(o.prop, "prop", hasElms);
    o.peri  = Ez._validFunc  (o.peri, "peri", isPseudo);
    o.isNet = (o.set == E.net) || o.prop?.isUn || o.func?.isUn;
    o.isSet = (o.set == E.set);     // constant
    o.maskAll = o.isSet;            // isNet, maskAll might be set to true later
    if (hasElms) {
        is1Elm  = (o.l == 1);
        o.loopByElm = !is1Elm && (o.loopByElm ?? o.loopByElement);
        o.calcByElm =  is1Elm || o.loopByElm;
    }
    if (o.byElm || o.byElement)     // 1D arrays are by element
        o.byElm = true;
    if (o.bAbE  || o.byArgbyElm)    // 2D arrays are [arg[elm]]
        o.bAbE  = true;

    cv = getCV(o, hasElms);         // gotta get o.cv early for arg count, etc.
    color  (o);                     // o.cjs defined = ignore o.func
    getFunc(o, cv);                 // getFunc() can set o.func
    urcfa  (o);                     // addend, factor, count, required, units
    config (o, hasElms);            // configure addend, factor, max, min
    mask   (o, hasElms);            // parse|create mask, o.c for isNet, !hasElms
    easies (o, hasElms);            // process o.easies for MEaser, o.c is ready
    if (hasElms) {
        if (o.isNet)
            parseUn(o);             // normalize stuff across elements
        else {
            optional(o);            // adjust o.c for unused optional arguments
            current(o, cv);         // process current values
        }
        maskCV(o);                  // for o.configCV (config.param = E.cV)
    }
    endToDist(o);                   // convert end to distance = factor
    plugCV(o, hasElms, is1Elm);     // build squeezed o.value and reset o.mask
                                    // calc functions are the final step:
    let tar;                        // tar for target = the [M]Easer
    const isME = Boolean(o.easies);
    if (o.calcByElm)                // single element or loopByElm
        tar = calcByElm(o, isME);
    else if (hasElms) {             // multi-element
        o.bAbE = true;              // default is bAbE, only one exception:
        o.l2   = o.lm || 1;         //  no 2D arrays and all 1D are byArg
        o.l1   = o.l;
        if (Math.max(...o.dims) == 1) {
            const d1    = o.config.filter(cfg => cfg.dim == 1);
            const byArg = d1.every(cfg => cfg.byArg);
            if (byArg || d1.every(cfg => cfg.byElm)) {
                o.bySame = true;    // see swapDims() and ECalc constructor()
                if (byArg) {        // the one exception
                    delete o.bAbE;  // true or undefined
                    o.l2 = o.l;     // swap 'em
                    o.l1 = o.lm;
                }
            }
        }
        o.twoD = Ez.newArray2D(o.l2, o.l1);
        tar = isME ? calcMEaser(o, hasElms)
                   : calcEaser (o, hasElms);
    }
    else                            // no elements, just calcs and .peri()
        tar = calcNoElms(o, isME);

    set?.add(tar);
    return tar;
}
//==============================================================================
// Everything else is for portioning create() into manageable chunks
function getCV(o, hasElms) {
    let cv = o.currentValue ?? o.cV;
    if (cv) {                             // initial validation/parsing of user
        cv = Ez.toArray(cv, "getCV");     // values, see current() for the rest
        if (cv.length != o.l)
            Ez._mustBeErr("currentValue", "an array the same length as elms");
        //----------------------
        o.cvDims = Ez._dims(cv);
        o.userCV = Is.def(o.currentValue) // acts as boolean and error text
                 ? "currentValue"
                 : "cV";
        if (o.cvDims == 2 || Is.Number(cv[0]))
            if (o.isNet)
                Ez._mustBeErr("currentValue for {set:E.net}",
                              "an array of strings by element");
            else if (o.prop.needsFunc && !o.func && !o.cjs) {
                const txt = (o.cvDims == 2)
                          ? "currentValue 2D arrays can't include functions;"
                          : "if currentValue is an array of Number,";
                throw new Error(`${o.prop.name} requires a function, and ${txt}`
                              + " you must set the func property, e.g {func:F.rgb}");
            }
    } //---------------------------------
    else if (hasElms && !o.dontGetValues) // dGV = obscure efficiency option
        cv = o.prop.getMany(o.elms);      // get the DOM values

    o.original = cv;
    return cv;
}
//==============================================================================
function getFunc(o, cv) {
    if (!o.prop || o.cjs)
        return;
    if (o.func && !o.func.isFunc)
        Ez._mustBeErr("func", "an instance of Func");
    //------
    if (!o.isNet) {             // o.func determines arg count, etc.
        let idx;
        const names = new Array(o.l);
        cv.forEach((v, i) => {                  // get cv's function names
            idx = v.indexOf(E.lp);
            names[i] = (idx >= 0) ? v.slice(0, idx) : "";
        });
        if (!o.func)                            // fall back to o.prop.func
            o.func = names[0] ? F[names[0]] : o.prop.func;
        if (!o.func) {
            if (o.prop.needsFunc)               // defaults should prevent this
                throw new Error(`${o.prop.name} requires a func!`);
        }
        else if (!o.isSet
              && !o.func.isCFunc                  // CFuncs validated in current()
              && (idx = names.findIndex(v => v && v != o.func.name)) >= 0)
            throw new Error(`elms[${idx}]'s value's function, "${names[idx]}", does not `
                          + `match {func:F.${o.func.name}}. To override use {set:E.set}.`);
        o.isNet |= o.func?.isUn;
    }
    if (o.isNet)                // gotta get o.cv early for arg count, etc.
        o.prop.getUnToObj(o, cv);

}
//==============================================================================
// isCjs() validates that val is an instance of Color, but Color is not imported
//         here, so can't use `val instanceof Color`. ditto isCjsSpace().
function isCjs(obj) {
    try   { return obj?.constructor.name == "Color" && "cam16_jmh" in obj; }
    catch { return false; }
}
function isCjsSpace(obj) {  // `in` throws when obj is Number, String
    try { return obj?.constructor.name == "ColorSpace" && "gamutSpace" in obj; }
    catch { return false; }
}
// color() sets o.cjs, the primary Color instance
function color(o) {
    if (o.prop && o.func && o.func.isCFunc != o.prop.isColor)
        Ez._cantErr("You", `use ${o.func.name} with ${o.prop.name}`);
    //-------------
    if (!o.cjs)
        o.cjs = o.colorjs;                   // alt long name for users
    if (o.cjs) {
        if (!isCjs(o.cjs))
            Ez._mustBeErr("colorjs", "an instance of Color");
        else if (o.prop && !o.prop.isColor) //!!until .isNet and gradients/color-mix
            Ez._cantErr("You", `use colorjs with ${o.prop.name}`);
        else if (o.func && (o.func.space ?? o.func.name) != o.cjs.cssId)
            Ez._mustBeErr(`The colorjs space (${o.cjs.cssId})` // rgb !=srgb, but why use colorjs for rgb??
                        + `the same as the func (${o.func.space ?? o.func.name})`);
        //-------------------
        if (o.displaySpace) {
            let ds = o.displaySpace;
            if (!ds.space) {
                if (isCjsSpace(ds))          // it's a ColorSpace
                    ds = ds.id;              // we want the string id as
                o.displaySpace = {space:ds}; // an object property for Color.js
            }
            try {                            // use Color.js to validate it
                o.cjs.display(o.displaySpace);
            }
            catch (err) {
                err.message = "displaySpace property - " + err.message;
                throw err;
             } //---------
        }
        o.space = Ez.kebabToSnake(o.cjs.spaceId);
    } //o.space is used only once, in current(), but it's simpler to set it here
}
//==============================================================================
// urcfa() processes units, required, count, addend, factor
function urcfa(o) {
    let key, val;
    // o.u is user-optional w/default, o.r and o.c are not user-defined
    // o.prop is optional for pseudo-animation
    // o.isNet has no units or required, mask() sets o.c = last mask index
    if (o.prop && !o.isNet) {
        o.u = o.units               // o.u = units, prop provides default
           ?? o.prop._unitz(o.func);
        o.r = o.cjs ? CFunc.A       // o.r = required arg count, constant
                    : o.prop.required(o.func);
        o.c = o.cjs ? CFunc.A + 1   // o.c = total arg count, variable
                    : o.prop.count(o.func);
        o.maxArgs = o.c;            // in case o.c changes
    }
    // factor and addend can be undefined (unused), or null (E.currentValue), or
    // a number, or an array of numbers.
    // At run time, factor calculates first, then addend, then max, min.
    // start    is an alias for addend
    // distance is an alias for factor,
    // end - start = distance, see endToDist().
    // Combining addend with distance or end is not supported.
    // Combining factor with start is not supported.
    // start, distance, end have additional requirements and imply direction.

    // o.f = factor: only end can be zero, factor and distance cannot
    [key, val] = fa(o, ["f","factor","distance","dist","end"]);
    if (key) {
        o.f = val;
        o.isTo  = (key[0] == "e");  //!!validate that start != end?? funky for different dims: a vs f...
        o.isSDE = (key[0] != "f");  // SDE = start/distance/end vs addend/factor
    }
    // o.a = addend: if it's zero, set it to undefined, adding 0 is pointless
    [key, val] = fa(o, ["a","addend","start"], true);
    if (key) {
        o.a = val;
        if (val === E.cV)           // addend is 100% current values
            o.initial = o.original; // only required for loopByElm && plays > 1

        const isS = (key == "start");
        if (!Is.def(o.isSDE))
            o.isSDE = isS;
        else if (o.isSDE != isS)
            throw new Error("start pairs with distance or end, addend pairs with factor.");
    }
//!!// o.a = addend: if it's zero, set it to undefined, adding 0 is pointless
//!![key, val] = fa(o, ["a","addend","start"], true);
//!!if (key) {
//!!    o.a = val;
//!!    o.isSDE = (key == "start"); // SDE = start/distance/end vs addend/factor
//!!}
//!!// o.f = factor: only end can be zero, factor and distance cannot
//!![key, val] = fa(o, ["f","factor","distance","dist","end"]);
//!!if (key) {
//!!    const isF = (key[0] == "f");
//!!    o.isTo    = (key[0] == "e"); //!!validate that start != end?? funky for different dims: a vs f...
//!!    o.f = val;
//!!    if (!o.isSDE) {
//!!        if (!Is.def(o.a))
//!!            o.isSDE = !isF;
//!!        else if (!isF)
//!!            ; // Ez._cantErr()
//!!    }
//!!    else if (isF)
//!!        ; // Ez._cantErr()
//!!}
//!!else if (o.isSDE)
//!!    ; // error: use {addend:} not {start:}
}
// fa() helps urcfa() with factor and addend
function fa(o, keys, isAddend) {
    let key, val;           // exclude undefined values
    const i = keys.findIndex(k => Is.def(o[k]));
    if (i < 0)
        return [,];

    key = keys[i];
    val = o[key];           // "e" for end

    const args = [o, key, isAddend, !isAddend && key[0] != "e"];
    if (!Is.A(val))         // number
        val = afToNumber(val, ...args);
    else {                  // sparse arrays with forEach():
        val.forEach((v, i, a) => {
            if (!Is.A(v))   // 1D array
                a[i] = afToNumber(v, ...args);
            else            // 2D array
                v.forEach((n, j, arr) =>
                    arr[j] = afToNumber(n, ...args)
                );
        });
    }
    return [key, val];
}
// afToNumber() helps fa() convert values to valid numbers
function afToNumber(val, o, key, isAddend, not0) { // not0 for factor, distance
    if (val !== E.cV) {                // exclude null
        val = Ez.toNumby(val, o.func, o.u);
        if (!Is.A(val)) {              // default,  !neg,     ,!float,!undef, !null
            val = Ez.toNumber(val, key, undefined, false, not0, false, false, false);
            if (isAddend && val === 0) // adding 0 is pointless
                val = undefined;
        }
        else if (isAddend)             // string color values convert to [Number]
            val = val.map(v => v === 0 ? undefined : v)
    }
    return val;
}
//==============================================================================
// config() processes factor, addend, max, and min into o.config and o.dims.
//          1D config.param arrays can be byArg (the default) or byElm.
//          Users can set byElm for all 1D arrays or for each separately.
//          There are also obvious cases where byElm can be implied.
function config(o, hasElms) {
    let cfg, hasCV, j, l, prm;
    o.config = [];
    o.dims   = [];
    keys.forEach((key, i) => {
        prm = o[key];
        if (Is.def(prm)) {
            cfg = {                // configure cfg:
                param: prm,
                calc:  calcs[i],
                dim:   Ez._dims(prm)
            };
            if (hasElms) {             // animation applied to element(s)
                switch (cfg.dim) {
                case 0:
                    hasCV = (prm === E.cV);
                    break;
                case 1:                // .byElm and .bAbE are true or undefined
                    l     = prm.length;
                    hasCV = prm.includes(E.cV);
                    if (!o.isNet) {    //!!what's the deal with isNet and byElm/byArg/bAbE/bEbA?
                        if (o.byElm || o[byElms[i]])
                            cfg.byElm = true;
                        else if (o.c == 1) //!!isNet doen't have o.c defined yet!!
                            cfg.byElm = true;
                        else if (l > o.c && l <= o.l) //!!ditto
                            cfg.byElm = true;
                        paramLength(o, l, key, cfg.byElm);
                        if (!cfg.byElm)    // .byArg is duplicative, but useful
                            cfg.byArg = true;
                    }
                    break;
                case 2:
                    cfg.bAbE = o.bAbE; // maskCV() & endToDist() can alter this
                    paramLength(o, l, key, !cfg.bAbE);
                    l     = prm.length;
                    hasCV = false;     // populate cfg with current values?
                    for (j = 0; j < l; j++) {
                        paramLength(o, prm[j].length, key, cfg.bAbE);
                        if (!hasCV)
                            hasCV = !Is.def(prm[j]) || prm[j].includes(E.cV);
                    }
                }
            }
            else if (cfg.dims > 1)     // no elms: cfg.param can't be >1D array
                Ez._cantErr(`The ${key} array`, "have more than 1 dimension");
            //---------------------
            o.config.push(cfg);    // spread cfg back around to o:
            o.dims  .push(cfg.dim);
            if (hasCV) {
                if (o.configCV)
                    o.configCV.push(cfg);
                else
                    o.configCV = [cfg];
            }
        }
    }); // end keys.forEach()
}
// paramLength() helps config() validate cfg.param.length
function paramLength(o, l, key, byElm) {
    const pairs = [[o.l, "elements"], [o.c, "arguments"]],
          pair  = pairs[Number(!byElm)];
    if (l > pair[0])
        throw new Error(`${key} array length exceeds the number of `
                        `${pair[1]}: ${l} > ${pair[0]}`);
}
//==============================================================================
// mask() sets o.mask to a dense array of sorted argument indexes.
//        Valid user mask types are:
//         - dense array:  user-generated, validated by PBase.prototype._mask())
//         - bitmask int:  Ez defines them for specific func/prop arguments
//         - sparse array: non-empty slots = masked indexes
//         - o.config:     sequential indexes 0 to array.length - 1
//         - undefined:    sequential indexes 0 to o.r - 1
//        For all mask types except dense array, o.mask is code-generated.
function mask(o, hasElms) {
    const count = o.isNet ? Math.min(...o.cv.map(arr => arr.length))
                          : o.c;
    if (o.mask) {                   // user mask: validate/format it
        if (o.prop)
            o.mask = o.prop._mask(o.mask, o.func, count);
        else                        // prop optional for pseudo-animation
            throw new Error("mask requires prop.");
    } //-----------------------------------
    else if (o.dims.some(dim => dim > 0)) {
        const l = [];               // the longest cfg.param array is the mask
        o.config.forEach((cfg, i) => {
            switch (cfg.dim) {      // treats array contents as dense &
            case 0:                 // sequential from 0 to length - 1.
                l[i] = 0; break;    // empty array slots are noops for
            case 1:                 // for calcs, not unmasked args.
                l[i] = cfg.byElm ? 0
                                 : cfg.param.length; break;
            case 2:
                l[i] = cfg.bAbE  ? cfg.param.length
                                 : Math.max(...cfg.param.map(arr => arr.length));
            }
        });
        o.mask = PBase._maskAll(Ez.clamp(o.r, Math.max(...l), count));
    }
    else if (o.isNet)               // undefined: mask all required args
        o.mask = PBase._maskAll(count);
    else {                          // ditto
        if (!o.r)                   // pseudo-animation, no prop, see urcfa()
            o.r = 1;
        o.mask = PBase._maskAll(o.r);
        o.c = o.r;
    }

    o.lm = o.mask.length;
    if (!o.isNet && !o.r) {         // pseudo-animation, user or cfg.param mask
        o.r = o.lm;
        o.c = o.r;
    }
    else if (o.isNet)
        o.c = o.mask.at(-1) + 1;
    else if (o.c == o.lm)
        o.maskAll = true;
    else if (o.isSet && o.lm < o.r)
        throw new Error("{set:E.set} requires that all arguments be masked. "
        + `${o.func?.name ?? o.cjs?.space ?? o.prop.name} requires ${o.r} arguments.`)
    //-------------
    if (o.configCV)
        o.oneArg = (o.c == 1);       // see maskCV()
}
//==============================================================================
// easies() processes o.easies for MEasers.
//          Consolidates array of easies into a Map: easy => mask indexes.
//          These are indexes into cfg.param/o.mask, not into prop/func args.
//          o.easies cannot be sparse and must be the same length as o.mask.
function easies(o, hasElms) {
    const easies = "easies";
    if (o[easies]) {
        o[easies] = Ez.toArray(o[easies], easies, Easy._validate)
        if (hasElms && o[easies].length != o.lm)
            Ez._mustBeErr(easies, "the same length as mask");
    }
    else
        return;
    //----------------------------
    o.easy2Mask = new Map;
    o[easies].forEach((ez, i) => {
        if (o.easy2Mask.has(ez))
            o.easy2Mask.get(ez).push(i);
        else
            o.easy2Mask.set(ez, [i]);
    });
    // Reduce o.easies to unique values
    o[easies] = Array.from(o.easy2Mask.keys());
    o.lz = o[easies].length;
}
//==============================================================================
function parseUn(o) {       // o.isNet only
    const lens = o.lens,    // lengths by element
          c    = o.c,
          i    = lens.findIndex(len => len < c);
    if (i >= 0)
        throw new Error(`Your mask has ${c} arguments. elms[${i}] only has ${o.lens[i]}.`);
    //-------------------
    o.lm = o.mask.length;   // normalize .numBeg, o.numEnd, o.cv, o.seps
    o.numBeg = o.numBeg.every(b => b);
    if (Math.max(...lens) > c){
        let j, l, s;            // squeeze trailing cv & seps into last sep
        o.cv.forEach((v, i) => {
            l = lens[i];
            if (l > c) {
                s = o.seps[i];
                for (j = c; j < l;)
                    s[c] += v[j] + s[++j];
                v.length = c;
                s.length = c + 1;
            }
        });
        o.numEnd = false;
    }
    else
        o.numEnd = o.numEnd.every(b => b);
}
//==============================================================================
// optional() sets o.c to the actual number of arguments provided, adjusting it
//            downward if optional arguments are not masked. current() can
//            adjust it back up if current values includes more arguments.
function optional(o) { // not for o.isNet
    // (count == required || count = mask.length)
    if (o.c == o.r || o.c == o.lm) return;
    //-------------------------------------
    o.c = Math.max(o.r, o.mask.at(-1) + 1);
    if (o.c == o.lm)
        o.maskAll = true;
}
//==============================================================================
// current() processes cv (user-supplied currentValue or o.original)
//           it can adjust o.c (argument count) upwards
//           not for o.isNet, shouldn't be for o.maskAll...
function current(o, cv) {
    if (o.userCV) { //--------- o.userCV: o.cv = user-supplied
        // Up-front validation makes the o.currentValue loops more efficient,
        // and is enabled by forcing all values to be of the same type. Mixing
        // types would be unusual, so it's not much of a loss. Values are not
        // validated beyond typeof and isCjs(), except for 1D array of strings.
        const
        name = o.userCV,
        flat = cv.flat(),
        type = typeof flat[0],
        isNumber = (type == "number"),
        isString = (type == "string");

        if (!isString && !isNumber) {
            if (o.cvDims == 2)
                typeError(flat[0], name);
            else if(!isCjs(flat[0]))
                typeError(flat[0], name, true);
            else if (!o.cjs)
                Ez._mustBeErr("The colorjs property", `set to use Color objects in ${name}`);
            else if (flat.some(v => !isCjs(v)))
                Ez._cantErr("You", "mix Color with other types in currentValue");
        }
        else if (flat.some(v => typeof v != type))
            Ez._mustBeErr(`${name} array elements`,
                          `all the same type. You are mixing ${type} and ${typeof v}`);
        //------------------
        if (o.cvDims == 2) { // convert numbers, assume strings = number + units
            o.c = Math.max(o.c, ...validCount(cv, o.r, o.maxArgs, name));
            if (isNumber) {
                const map = Is.A(o.u) ? (v, j) => v + o.u[j]
                                      :  v     => v + o.u;
                o.cv = cv.map(v => v.map(map));
            }
        }
        else if (isString) { // convert or parse values
            if (o.cjs)       // o.cjs for space/conversion only, not coords
                o.cv = cjsTo(o, cv); //!!assumes it's a color property
            else {
                o.cv = cv.map((v, i) => {
                    if (CSS.supports(o.prop.name, v))
                        return o.prop.parse(v, o.func, o.u);
                    else
                        throw new Error(`${o.userCV}[${i}]: ${v} is not valid for ${o.prop.name}`);
                });
            }
            o.c = Math.max(o.c, ...validCount(o.cv, o.r, o.maxArgs, name, true));
        }
        else if (isNumber) {
            if (o.c > 1)
                Ez._cantBeErr("currentValue", `a 1D array of Numbers because ${o.prop.name} requires more than one argument`);
            //--------------------------
            o.cv = cv.map(v => v + o.u);
        }
        else                 // o.cjs is current value, o.space = snake_case
            o.cv = cv.map(v => [...v[o.space], v.alpha]);
    }
    //------------------------ !o.userCV: o.cv = DOM values as strings
    else if (o.cjs) {        // o.cjs is a Color.js instance
        o.cv = cv;
        cjsTo(o, o.cv);      // convert current values to o.cjs's color space
        if (o.func)          // o.cjs has done its job, don't use it at run-time
            delete o.cjs;
    }
    else {                   // parse the DOM values into numeric arrays
        o.cv = cv.map(v => o.prop.parse(v, o.func, o.u));
        o.c  = Math.max(
            o.c,
            Math.max(...o.cv.map((args, i) => {
                if (args[0])
                    return args.length;
                else         // reject empty values
                    throw new Error(`elms[${i}] has no value for ${o.prop.name}, `
                                  + "and you have not provided a currentValue.");
        })));
    }
}
// validCount() helps current() validate user-supplied current value arg counts
function validCount(cv, min, max, name, isString) {
    let c, args;
    return cv.map((v, i) => {
        c = v.length;
        if (isString)
            c -= 1 - (v[0] == Fn.color);
        if (c < min || c > max) {
            args = c < min ? ["fewer", min]
                           : ["more",  max];
            throw new Error(`The ${name}[${i}] array has ${args[0]} than ${args[1]} elements.`);
        } //-----
        return c;
    })
}
// cjsTo() converts CSS color strings to o.cjs's color space, using Color.to().
//         If you set o.currentValue, you can use Color.js serialized space ids.
function cjsTo(o, cv) { // only called if o.cjs is defined and validated
    let cjs;
    const to    = o.cjs.constructor.to;
    const space = o.cjs.space;
    cv.forEach((v, i) => {
        try { cjs = to(v, space); }
        catch (err) { // should never happen for DOM values, only o.currentValue
            throw new Error(`elms[${i}]'s ${o.prop.name} value is an invalid `
                          + `color string: ${v}\n${err}`);
        }
        cv[i] = [...cjs.coords, cjs.alpha];
    });
    return cv;
}
// typeError() helps current() throw an error for invalid type
function typeError(v, name, isColor) {
    const list = ['"number"','"string"'];
    if (isColor)
        list.push("an instance of class Color");
    Ez._mustBeErr(
        `Invalid type "${typeof v}" for ${name}. It`,
        `${list.slice(0, list.length - 1).join(", ")}, or ${list.at(-1)}`
    );
}
//==============================================================================
// maskCV() populates factor/addend with current values as specified by the
//          user via E.currentValue or its shorthand E.cV.
//          Users are not allowed to mix 2D array types, but maskCV() can
//          create byElmByArg arrays in spite of {byArgByElm:true}. o.cv is
//          byElmByArg, so that's how maskCV() operates. Not a problem, but
//          it complicates endToDist() and creates the need for ECalc._c22s().
function maskCV(o) {
    if (!o.configCV) return;
    //-----------------------------------------------------------------
    let allValues, byElmArg, cfg, cv, cvMask, idx, isSame, len, m, prm,
        sameArgs, sameElms;
    const err = "E.currentValue requires elements to have a value in "
               + o.prop.name + " for every masked argument specified.",
    l    = o.l,
    lm   = o.lm,
    mask = o.mask,

    minLen = mask.at(-1) + 1,
    notDim = [],
    hasDim = [],
    // Convert all of o.cv to numbers up front. It makes isSame comparisons
    // more efficient and the code simpler. Yes, it might convert values
    // that are never used as numbers, but converting on demand can convert
    // some values more than once, and these arrays are generally tiny.
    nums = o.cjs
         ? o.cv
         : o.cv.map(arr => arr.map(v => Ez.toNumby(v, o.func, o.u)));

    // cfgs with .dim == 0 must be separated because later filters rely on
    // properties that the next if() modifies: byElm and byArg.
    for (cfg of o.configCV)
        (cfg.dim ? hasDim : notDim).push(cfg);

    if (notDim.length) {    // cfg.dim == 0
        let flat, dim;
        allValues = allMustHaveValues(o);
        if (o.oneArg) {
            flat   = nums.flat();
            cv     = flat[0];
            isSame = flat.every(v => v == cv);
            dim    = isSame ? 0 : 1;
        }
        else {
            sameArgs = isSameByArg(nums, l, mask, lm);
            sameElms = isSameByElm(nums, l, mask, lm);
            dim = sameArgs && sameElms ? 0
                : sameArgs || sameElms ? 1
                                       : 2;
        }
        switch (dim) {
        case 0:
            prm = nums[0][0];
            break;
        case 1:
            if (o.oneArg)         // 1D array byElm
                prm = flat;
            else if (sameArgs) {  // 1D array byArg
                prm = new Array(lm);
                cv  = nums[0];
                minArgs(cv, minLen, err, 0);
                prm = mapMask(mask, cv);
            }
            else {                // 1D array byElm
                m   = mask[0];
                prm = nums.map((v, i) => {
                    mustBeNumber(v[m], err, i, m);
                    return v[m];
                });
            }
            break;
        case 2:
            prm = nums.map((v, i) => {
                minArgs(v, minLen, err, i);
                return mapMask(mask, v);
            })
        }
        for (cfg of notDim) {
            cfg.dim   = dim;
            cfg.param = prm;
            if (dim == 1 && (o.oneArg || sameElms)) {
                cfg.byElm = true;
                delete cfg.byArg;
            }
        }
    }
    if (hasDim.length) {    // cfg.dim > 0
        // 1D byElm
        byElmArg = hasDim.filter(con => con.byElm);
        for (cfg of byElmArg) {
            isSame = sameElms ?? lm == 1;
            cvMask = [];    // the indexes containing E.cV: masked elements
            idx    = 0;
            while ((idx = cfg.param.indexOf(E.cV, idx)) > -1) {
                mustHaveValue(o.cv[idx], err, idx);
                cvMask.push(idx);
            }
            if (!isSame) {
                cv = [];    // nums for the masked elements only
                for (m of cvMask)
                    cv.push(nums[m]);
                isSame = isSameByElm(cv, cv.length, mask, lm);
            }
            if (isSame) {
                prm = cfg.param;
                idx = mask[0];
                m   = cvMask[0]
                minArgs(nums[m], idx + 1, err, m);
                for (m of cvMask)
                    prm[m] = nums[m][idx];
            }
            else {          // creates a 2D byElmByArg array
                prm = cfg.param.map((p, i) => {
                    if (p === E.cV) {
                        minArgs(nums[i], minLen, err, i);
                        return mapMask(mask, nums[i]);
                    }
                    else
                        return new Array(lm).fill(p);
                });
                cfg.param = prm;
                cfg.dim++;
            }
        }
        // 1D byArg
        byElmArg  = hasDim.filter(con => con.byArg);
        if (byElmArg.length) {
            allValues = allMustHaveValues(o, allValues);
            for (cfg of byElmArg) {
                isSame = sameArgs ?? l == 1;
                cvMask = [];      // the indexes containing E.cV
                idx    = 0;
                while ((idx = cfg.param.indexOf(E.cV, idx)) > -1)
                    cvMask.push(idx++);
                if (!isSame)
                    isSame = isSameByArg(nums, l, cvMask,
                                                    cvMask.length);
                len = cvMask.at(-1) + 1;
                if (isSame) {
                    prm = cfg.param;
                    minArgs(nums[0], len, err, 0);
                    for (m of cvMask)
                        prm[m] = nums[0][m];
                }
                else {            // creates a 2D byElmByArg array
                    prm = nums.map((v, i) => {
                        minArgs(v, len, err, i);
                        val = cfg.param.slice();
                        for (m of cvMask)
                            val[m] = v[m];
                        return val;
                    });
                    cfg.param = prm;
                    cfg.dim++;
                }
            }
        }
        // 2D bAbE, byArgByElm: [arg[elm]]
        byElmArg = hasDim.filter(con => con.bAbE);
        for (cfg of byElmArg) {
            if (!allValues && cfg.param.includes(E.cV))
                allValues = allMustHaveValues(o, allValues);
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    prm = nums.map((v, j) => {
                        mustBeNumber(v[i], err, j, i);
                        return v[i];
                    })
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1) {
                        mustHaveValue(o.cv[idx], err, idx);
                        mustBeNumber (nums[idx][i], err, idx, i);
                        p[idx] = nums[idx][i];
                    }
                }
            });
        }
        // 2D bEbA, byElmByArg: [elm[arg]]
        byElmArg = hasDim.filter(con => con.dim == 2 && !con.bAbE);
        for (cfg of byElmArg) {
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    mustHaveValue(o.cv[i], err, i);
                    minArgs(nums[i], minLen, err, i);
                    prm = mapMask(mask, nums[i]);
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    mustHaveValue(o.cv[i], err, i);
                    len = p.lastIndexOf(E.cV);
                    minArgs(nums[i], len, err, i);
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1)
                        p[idx] = nums[i][idx];
                }
            });
        }
    }
    if (o.max && o.min) {
        //!!reorder by dim for minor efficiency gain
        //!!if fa.dim < max or min.dim and max dim <> min dim, etc.
    }
}
// Helpers for maskCV():
// mapMask() maps the sparse mask values from arr to a new array
function mapMask(mask, arr) {
    return mask.map(m => arr[m]);
}
// isSameByArg() - Is every masked arg the same across elms?
function isSameByArg(cv, l, mask, lm) {
    let b, i, j;
    const v = cv[0];
    b = true;
    for (i = 0; b && i < l; i++)
        for (j = 0; b && j < lm; j++)
            b = (cv[i][mask[j]] == v[mask[j]]);
    return b;
}
// isSameByElm() - Is every masked arg within each elm the same?
function isSameByElm(cv, l, mask, lm) {
    let b, i, j;
    const m = mask[0];
    b = true;
    for (i = 0; b && i < l; i++)
        for (j = 0; b && j < lm; j++)
            b = (cv[i][mask[j]] == cv[i][m]);
    return b;
}
// Validation functions for maskCV(): Validation occurs at different levels in
// order to catch errors as early as possible in the code and achieve small
// efficiencies. The highest level prevents empty string in o.cv[n]. The next
// level down is minArgs(), which validates that the o.cv[n] array has enough
// elements, based on o.mask.at(-1). This assumes that a property which uses
// numeric values can leave an argument undefined, but it cannot define an
// argument as a non-numeric value. mustBeNumber() is the bottom level of
// validation, where isNaN() fails for both NaN and undefined.
// allMustHaveValues() throws an error if any element doesn't have a value
function allMustHaveValues(o, alreadyTrue) {
    if (!alreadyTrue && o.cv.some(v => !v))
        throw new Error(err);
    return true;
}
// mustHaveValue() throws an error if an element's property has no value
function mustHaveValue(val, err, i) {
    if (!val)
        throw new Error(`Element ${i}: ` + err);
}
// minArgs() throws an error if cv doesn't have enough arguments
function minArgs(cv, minLen, err, i) {
    if (cv.length < minLen)
        throw new Error(`Element ${i}: ` + err);
}
// mustBeNumber() throws an error if val is not a number
function mustBeNumber(val, err, i1, i2) {
    if (isNaN(val))
        throw new Error(`Element ${i1}, argument ${i2}: ${err}`);
}
//==============================================================================
// endToDist() converts factor from end to distance, if addend is undefined it
//             defaults to zero and end already equals distance.
//             User property is end or distance, run-time factor is distance.
//
//  Every end value must have a corresponding start value in order to calculate
//  distance. There's no way to default to the parent Easy's distance because
//  there can be multiple parent Easys and none are available here.
//  To properly calculate distance, factor.dim must be >= addend.dim.
//  For example, consider a single end value with multiple start values:
//    the result requires as many distances as there are start values
function endToDist(o) {
    if (!o.isTo || !Is.def(o.a)) return;
    //---------------
    let fp, prm, val;
    const
    f  = o.config[0], // factor calculates first, then addend
    a  = o.config[1],
    ap = a.param;     // o.config[n].param is a sparse array
    fp = f.param;     // the source for end = the target for distance

    if (f.dim < a.dim) {
        // Bump up the dimensionality of f.param to match a.param
        if (!f.dim || f.byElm == a.bAbE) {
            if (a.dim - f.dim == 1) {
                if (!f.dim) {         // 0 to 1 dims
                    prm = toDistMap(ap, fp);
                    f.byElm = a.byElm;
                    f.byArg = a.byArg;
                }
                else {                // 1 to 2 dims
                    prm = ap.map(p =>
                            fp.map((q, i) => q - defaultToZero(p[i], i)));
                    f.bAbE = a.bAbE;
                }
            }
            else {                    // 0 to 2 dims
                prm = ap.map(p =>
                        Is.A(p) ? toDistMap(p, fp) : fp - p);
                f.bAbE = a.bAbE;
            }
        }
        else {                        // 1 to 2 dims, swap dimensions
            prm = fp.map((p, i) =>
                    Is.A(ap[i]) ? ap[i].map(q => p - q)
                                : p - defaultToZero(ap[i], i));
            delete f.byElm;
            delete f.byArg;
            f.bAbE = a.bAbE;
        }
        f.dim   = a.dim;
        f.param = prm;
    }
    else {//f.dim >= a.dim
        if (f.dim == a.dim && f.byElm != a.byElm) {
            // mismatched 1D arrays: f.dim must be >= a.dim, so factor to 2D
            prm = Array.from({length:ap.length}, () => fp.slice());
            if (f.byArg)
                delete f.byArg;
            else {
                delete f.byElm;
                f.bAbE = true;  // in spite of !o.bAbE
            }
            f.dim   = 2;
            f.param = prm;
            fp = prm;
        }
        switch (f.dim) {
        case 0:
            f.param -= ap;
            break;
        case 1:
            !a.dim ? toDistVal    (fp, ap)
                   : toDistDefZero(fp, ap);
            break;
        case 2:
            if (!a.dim)
                fp.forEach((p, i) =>
                    Is.A(p) ? toDistVal(p, ap)
                            : p[i] -= ap);
            else if (a.dim == 1) {
                if (f.bAbE == a.byElm)
                    fp.forEach((p, i) =>
                        Is.A(p) ? toDistDefZero(p, ap)
                                : fp[i] = toDistMap(ap, p));
                else // mismatched dims
                    fp.forEach((p, i) => {
                        val = defaultToZero(ap[i], i);
                        Is.A(p) ? toDistVal(p, val)
                                : fp[i] -= val;
                    });
            }
            else if (f.bAbE == a.bAbE) // both f.dim and a.dim == 2
                fp.forEach((p, i) => {
                    prm = ap[i];
                    val = Is.A(prm);
                    if (Is.A(p))
                        p.forEach((_, j) =>
                            p[j] -= defaultToZero(prm, i, j, val));
                    else
                        fp[i] = val ? toDistMap(prm, p)
                                    : fp[i] - prm;
                });
            else // mismatch: maskCV() or mismatched 1D array above
                fp.forEach((p, i) => {
                    if (Is.A(p))
                        p.forEach((_, j) => {
                            prm   = ap[j];
                            p[j] -= defaultToZero(prm, j, i, Is.A(prm));
                        });
                    else
                        fp[i] = ap.map(q =>
                                    Is.def(q[i]) ? p - q[i] : undefined);
                });
        } // end switch (f.dim)
    } // end f.dim >= a.dim
}
function toDistMap(arr, val) { // returns a new array
    return arr.map(v => val - v);
}
function toDistVal(arr, val) { // modifies arr in-place
    arr.forEach((_, i) => arr[i] -= val)
}
function toDistDefZero(arr, val) {
    arr.forEach((_, i) => arr[i] -= defaultToZero(val[i], i));
}
// defaultToZero() is the validation function for for endToDist(). These values
// can come from the DOM or the user, and user values can be almost anything,
// so checking for NaN is necessary. Addend defaults to 0, so defaultToZero()
// returns a value, unlike all the other validators. forEach() loops skip empty
// slots, which precludes the need to verify that a value is defined; these are
// cases where numeric validation is skipped.
function defaultToZero(val, i1, i2, useI2) {
    const err = Ez._mustBe("Every end value's corresponding start value",
                           "a number or undefined (defaults to 0)");
    if (useI2)
        val = val[i2];
    if (!Is.def(val))
        return 0;
    if (!Number.isNaN(val))
        return val;

    let prefix = `No start[${i1}]`;
    if (useI2)
        prefix += `[${i2}]`;
    prefix += ": "
    throw new Error(prefix + err);
}
//==============================================================================
// plugCV() creates o.value[elm[arg]] and plugs it with unmasked current
//          values and separators. Plug contents derive from these two arrays:
//            o.cv   = 2D: current numeric values as strings
//            o.seps = 1D: separators w/units, function text
//                     2D for E.net: all the stuff inbetween the numbers
//          In the process of plugging, we "squeeze" the plug text together so
//          the length of o.value's inner dimension is as short as possible.
function plugCV(o, hasElms, is1Elm) {
    if (!hasElms) return;
    //-------------------
    let i;
    if (o.cjs) {             // colorjs is all numbers, no units or separators
        const                // add alpha as a plug if it varies across elements
        a0 = o.cv[0][CFunc.A],
        l  = o.c + (!is1Elm && o.mask.at(-1) != CFunc.A
                            && o.cv.some(arr => arr[CFunc.A] != a0));

        o.value = Ez.newArray2D(o.l, l);
        if (!o.maskAll) {
            let   start = 0; // plug o.value
            const plugs = [];
            for (i = 0; i < l; i++)
                (o.mask[start] == i) ? ++start : plugs.push(i);
            o.value.forEach((arr, j) => {
                for (i of plugs)
                    arr[i] = o.cv[j][i];
           });
        }
        return;
    } //-----------------------------
    if (!o.seps && !PBase._seps(o)) {
        o.value = Ez.newArray2D(o.l, 1);
        return;
    } //------------------------------------------------------------------
    // nb and ne indicate that o.value[n] starts or ends with a calculated
    // number, not a plugged number as string.
    const nb = o.maskAll ? o.numBeg : o.numBeg && (o.mask[0] == 0);
    const ne = o.maskAll ? o.numEnd : o.numEnd && (o.mask.at(-1) == o.c - 1);
    const lv = o.lm * 2 - (nb && ne) + !(nb || ne);

    // i, m, mi, and p are array indexes (mask values are array indexes)
    //   i  = elm  index: arr[i] = o.value[j][i]
    //   p  = plug index: sep[p] & val[p] (o.seps[j][p] & o.cv[j][p])
    //   m  = mask value: sets boundaries, doesn't get array values
    //   mi = mask index: o.mask[mi]
    let p;
    const izero = Number(nb);        // start for (i) at 0 or 1
    const pzero = Number(o.numBeg);  // ditto for (p) if (!o.maskAll)
    if (o.maskAll) {
        o.value = Ez.newArray2D(o.l, lv);
        for (const arr of o.value)
            for (i = izero, p = 0; i < lv; i += 2, p++)
                arr[i] = o.seps[p];
    }
    else {
        let m, mi, seps, vals;
        if (!o.isNet && o.numEnd && !ne)         // pad the end of o.seps to
            o.seps.forEach(arr => arr.push("")); // simplify the inner for loop

        // pre-filling o.value with "" allows for += in the innermost while loop
        o.value = Array.from({length:o.l}, () => new Array(lv).fill(""));
        o.value.forEach((arr, j) => {
            seps = o.isNet ? o.seps[j] : o.seps;
            vals = o.cv[j];
            if (!vals)
                throw new Error(`elms[${j}] has no value for ${o.prop.name}`);
            //------------------
            if (o.numBeg && !nb)
                arr[0] = vals[0];
            for (i = izero, p = pzero, mi = i; i < lv; i += 2, p++, mi++) {
                m = mi < o.lm ? o.mask[mi] : o.c;
                while (p < m && vals[p])
                    arr[i] += seps[p] + vals[p++];
                arr[i] += seps[p];
            }
        });
    }
    if (o.easies && o.loopByElm) //!!
        o.maskCV = o.mask;       //!!?? unused, but MEaser loopByElm is untested
    i = Number(!nb);
    o.mask = o.mask.map((_, j) => j * 2 + i);

    // maskCV(), endToDist() can modify .dim
    o.dims = o.config.map(cfg => cfg.dim);
}
//==============================================================================
// calc functions convert configs into objects used by class ECalc to run
// the necessary calculations during animation.
// cNN is the naming convention for the ECalc static calculation functions.
// The first N is the input dimensionality, the second N is output.
// vars named cN_ and c_N are input and output dimension count, respectively.
// Some calcs change their output's dimensionality. For example:
//   ECalc._c01() converts a single number to a 1D array of numbers
//==============================================================================
// init_calc() returns a baseline calc object with calc and cNN properties
function init_calc(calc, cN_, c_N) {
    return {calc:calc, cNN:`_c${cN_}${c_N}`};
}
// calcEaser() returns new Easer
function calcEaser(o) {
    const calcs = [];           // the target array of calc objects
    if (o.config.length) {
        let calc, cfg, dim;
        dim = 0;
        o.dims.length = 0;      // re-populated at the bottom of the loop
        for (cfg of o.config) {
            calc = init_calc(cfg.calc, dim, cfg.dim);
            calc.param = cfg.param;
            calcs.push(calc);
            dim = upDim(o, cfg, cfg.param, calc, dim, swapDims(o, cfg, calc));
            o.dims.push(dim);
        }
    }
    o.dmax = Math.max(0, ...o.dims);
    o.dmin = Math.min(0, ...o.dims);
    calcNoDims(o, calcs);
    o.calcs = calcs;
    return new Easer(o);
}
// calcMEaser() returns new MEaser
function calcMEaser(o) {
    let calc;
    const calcs = Ez.newArray2D(o.lz);
    if (o.config.length) {
        let cfg, dim, i, mask, notDimOrByElm, prm, src, swap1D;
        o.dims.length = 0;
        dim = 0;
        for (cfg of o.config) {                 // loop by config:
            src    = init_calc(cfg.calc, dim, cfg.dim);
            swap1D = swapDims(o, cfg, src);

            notDimOrByElm = !cfg.dim || cfg.byElm;  // 0D or 1D byElm
            if (notDimOrByElm)                      //!!no mask??no way...
                prm = cfg.param;
            for (i = 0; i < o.lz; i++) {            // loop by Easy:
                if (!notDimOrByElm) {
                    mask = o.easy2Mask.get(o.easies[i]);
                    if (cfg.dim == 1 || cfg.bAbE)       // 1D byArg or 2D bAbE
                        prm = meParam(cfg.param, mask); // !hasElms runs this
                    else
                        cfg.param.forEach((p, j) =>     // 2D byElmByArg
                            prm[j] = Is.A(p) ? meParam(p, mask) : p
                        );
                }
                calc = Ez.shallowClone(src);        // clone src
                calc.param = prm;
                calcs[i].push(calc);
                dim = upDim(o, cfg, prm, calc, dim, swap1D, true);
            }
            o.dims.push(dim);
        }
        o.dmax = Math.max(...o.dims);
        o.dmin = Math.min(...o.dims);
    }
    else { // no configs, easer uses raw _calc() return value
        o.dmax = 0;
        o.dmin = 0;
    }
    calcNoDims(o, calcs, true);
    o.calcs = calcs;
    return new MEaser(o);
}
// calcByElm() returns new EaserByElm or MEaserByElm
function calcByElm(o, isME) {
    const calcs = Ez.newArray2D(o.l); // if (isME) setCalc() overwrites calcs[i]

    o.oneD = new Array(o.lm);
    if (o.config.length) {            // parse configs into calcs:
        let cfg, i, isUp, notOrByArg, prm, src,
        c_N,                          // c_N = output dim count, part of cNN
        cN_ = 0;                      // cN_ = input  ditto

        for (cfg of o.config) {       // loop byConfig: f, a, max, min
            [c_N, src, isUp] = prepCalc(cfg, isME, cN_);

            notOrByArg = !cfg.dim || cfg.byArg;
            if (notOrByArg)           // 0D or 1D byArg
                prm = cfg.param;
            for (i = 0; i < o.l; i++) {     // loop byElm:
                if (!notOrByArg) {
                    if (!cfg.bAbE)          // 1D byElm or 2D byElmByArg
                        prm = cfg.dim < 2   // prm might be undefined
                            ? cfg.param
                            : cfg.param[i];
                    else {                  // 2D byArgbyElm
                        prm = new Array(cfg.param.length);
                        cfg.param.forEach((p, j) => {
                            if (!Is.A(p))   // single value: fill it
                                prm[j] = p;
                            else {          // array: make a sparse copy
                                prm[j] = [];
                                if (Is.def(p[i]))
                                    prm[j][i] = p[i];
                            }
                        });
                    }
                }
                // cfg.param is always defined, but if (!Is.def(prm)): cfg.param
                // and calcs[] are sparse, and the calc object not created.
                // For MEasers, calcs array is 3D: byElm, byEasy, byConfig.
                if (Is.def(prm))
                    setCalc(o, prm, Ez.shallowClone(src), calcs, isUp, isME, i);
            }
            if (isUp)
                cN_ = c_N;
        }
    }
    else if (isME) {                  // no configs, yes easies
        src = {cNN:"_c01", param:[]};
        for (i = 0; i < o.l; i++) {      // loop byElm:
            calcs[i] = new Array(o.lz);
            o.easies.forEach((ez, j) =>  // byEasy
                calcs[i][j] = [Ez.shallowClone(src, {noop:o.easy2Mask.get(ez)})]
            );                           // .noop only, .param is empty
        }
    }
    if (!isME)                        // maybe configs, no easies
        calcNoDims(o, calcs, true);

    o.calcs = calcs;
    return isME ? new MEaserByElm(o) : new EaserByElm(o);
}
// calcNoElms() returns new (M)Easer for pseudo-target, no elms|prop, yes peri()
function calcNoElms(o, isME) {
    const calcs = isME ? Ez.newArray2D(o.lz) : [];
    o.oneD = new Array(o.c);
    if (o.config.length) {
        let cfg, cN_, c_N, isUp, prm, src;
        cN_ = 0;
        for (cfg of o.config) { // loop by f, a, max, min:
            [c_N, src, isUp, prm] = prepCalc(cfg, isME, cN_);
            setCalc(o, prm, src, calcs, isUp, isME);
            if (isUp)
                cN_ = c_N;
        }
    }
    calcNoDims(o, calcs);
    o.calcs = calcs;
    return isME ? new MEaser(o) : new Easer(o);
}
//==============================================================================
// Calc function helpers:
// calcNoDims() pushes a noop() onto each calc array for 0 => 1D conversion
function calcNoDims(o, arr, is2D) {
    if (!(o.dmax ?? Math.max(0, ...o.dims))) { // only if dmax == 0
        if (is2D)
            for (const a of arr)
                a.push(Ez.shallowClone(noop));
        else
            arr.push(Ez.shallowClone(noop));
    }
}
function prepCalc(cfg, isME, cN_) {
    const
        c_N  = isME ? Math.max(cfg.dim, 1) : cfg.dim,
        src  = init_calc(cfg.calc, cN_, c_N),
        isUp = c_N > cN_,   // this iteration ups the dimensionality
        prm  = cfg.param    // only used by calcNoElms()
    ;
    return [c_N, src, isUp, prm];
}
// setCalc() sets up a calc object or calcs byEasy, and pushes it/them onto arr,
//           helps calcByElm(), calcNoElms().
function setCalc(o, prm, calc, arr, isUp, isME, i) {
    let c, mask;
    if (isUp)                   // calc ups the dimensionality, .noop required
        calc.noop = noop1D(prm, o.lm);

    if (isME) {                 // MEaser
        if (Is.def(i)) {
            if (!arr[i].length) // empty or full of o.lz arrays, not undefined
                arr[i] = Ez.newArray2D(o.lz);
            arr = arr[i];       // i doesn't change inside loop:
        }
        o.easies.forEach((ez, j) => {
            mask = o.easy2Mask.get(ez);
            c    = Ez.shallowClone(calc);
            c.param = meParam(prm, mask);
            c.noop  = calc.noop?.length ? meNoop1D(c.param, mask)
                                        : calc.noop;
            arr[j].push(c);
        });
    }
    else {                      // Easer
        if (Is.def(i))
            arr = arr[i];
        calc.param = prm;
        arr.push(calc);
    }
}
// noop functions populate the calc.noop[] array:
function noop1D(prm, l) {
    const noop = [];//prm is sparse, noop is dense.
    if (Is.A(prm) && (prm.length < l || prm.includes(undefined))) {
        let i;
        for (i = 0; i < l; i++)
            if (!Is.def(prm[i]))
                noop.push(i);
    }
    return noop;
}
function noop2D(prm, noop, i, l1, dim) {
    if (Is.def(prm[i]))      // exclude start, no offset for inner dimension
        noop[i] = noop1D(prm[i], l1);
    else if (dim)            // dim = 1, fill noop with indexes
        noop[i] = PBase._maskAll(l1);
    else                     // dim = 0, undefined is not empty
        noop[i] = undefined; // see ECalc.prototype._c02() and _c02s()
}
// meNoop functions for MEaser, plus meParam()
function meNoop1D(prm, mask) {
    const noop  = [];
    for (const m of mask)
        if (!Is.def(prm[m]))
            noop.push(m);
    return noop;
}
function meNoop2D(prm, noop, i, mask, dim) {
    if (Is.def(prm[i]))
        noop[i] = meNoop1D(prm[i], mask);
    else if (dim)
        noop[i] = mask;
    else
        noop[i] = undefined;
}
function meParam(prm, mask) {
    const p = [];
    if (!Is.A(prm))             // spread single value
        for (const m of mask)
            p[m] = prm;
    else                        // mask and prm are both arrays
        for (const m of mask)
            if (Is.def(prm[m])) // prm is sparse
                p[m] = prm[m];
    return p;
}
// swapDims() sets the "s" suffix on calc.CNN, indicating that the method
//            swaps dimensions. It also handles 1D byArg params when twoD is
//            bAbE, and returns a boolean indicating if that is the case.
function swapDims(o, cfg, calc) {
    const swap1D = (cfg.byArg && !o.bySame);
    if (swap1D || (cfg.dim == 2 && !cfg.bAbE))
        calc.cNN += "s"
    return swap1D;
}
// upDim() handles up-dimensioning a calc, which is when the previous highest
//         cfg.dim value is exceeded by a new high and ECalc._cNN() switches
//         from storing results in thisVal to oneD or twoD or from oneD to twoD.
function upDim(o, cfg, prm, calc, dim, swap1D, isMEaser) {
    if (cfg.dim <= dim && !swap1D) return dim;
    //----------------------------------------
    let func, noop;
    if (cfg.dim == 1) {
        dim  = swap1D ? 2 : 1;
        func = isMEaser ? meNoop1D : noop1D;
        noop = func(prm, cfg.byElm ? o.l : o.lm);
    }
    else {
        const l2 = cfg.bAbE ? o.lm : o.l;
        const l1 = cfg.bAbE ? o.l  : o.lm;
        const undef = prm.length < l2
                   || prm.includes(undefined)
                   || prm.some(p => Is.A(p) && (p.length < l1
                                             || p.includes(undefined)));
        dim  = 2;
        noop = [];
        if (undef) {
            func = isMEaser ? meNoop2D : noop2D;
            for (let i = 0; i < l2; i++)
                func(prm, noop, i, l1, dim);
        }
    }
    calc.noop = noop;
    return dim;
}
// validateParams() validates that all cfg.param values are numeric and
//  forcibly converts them to numbers. It balks at infinite values, as even
//  for max and min they are pointless. For factor, it balks at zero values.
//  Should be called after maskCV(), when all the params are finally set.
//  It would prevent the need to call isNaN() in defaultToZero().
//!!To be evaluated and maybe completed!!
function validateParams(o) {
    let cfg, val;
    for (cfg of o.config) {
        if (!cfg.dim) { // Number() or parseFloat() here? No clear winner.
            val = Number(cfg.param);
            if (!Number.isFinite(val))
                throw new Error("...");
            if (isFactor && !val) // How do I know if it's factor?
                throw new Error("zero factor!");
            cfg.param = val;
        }
    }
}