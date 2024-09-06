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

// local imports, in order of use by create()
import {getCV, parseUn, current}  from "./cv.js";
import {color}                    from "./color.js";
import {getFunc, urcfa, optional} from "./urcfa.js";
import {config}                   from "./config.js";
import {mask}                     from "./mask.js";
import {maskCV}                   from "./maskCV.js";
import {endToDist}                from "./endToDist.js";
import {plugCV}                   from "./plugCV.js";
import {calcEaser, calcMEaser, calcByElm, calcNoElms} from "./calcs.js";

import {PBase}     from "../prop/pbase.js";
import {E, Ez, Is} from "../raf.js"
//==============================================================================
// create() instantiates a subclass of EBase and returns it. Internally, the b
//          arg is always defined and is the initial error check for Easer vs
//          MEaser. The q and cls args are purely for error messaging. b is set
//          to true by default to allow external clients to call create with
//          only the o and set args (or only o) and w/o the error check.
function create(o, set, isEasies) { // start by validating o.properties:
    if (Is.def(set) && (isEasies ? !o.easies : Boolean(o.easies))) {
        const arr = isEasies ? ["single", "Easy",   "Easies"]
                             : ["multi",  "Easies", "Easy"  ];
        throw new Error(`For ${arr[0]}-ease targets, use ${arr[1]} not ${arr[2]}`);
    } //---------------------------------------------------------------
    o.elms = Ez.toElements(o.elms ?? o.elm ?? o.elements ?? o.element);
    o.l    = o.elms.length;         // o.lm = mask.length
                                    // o.lz = easies.length
    let cv, is1Elm;
    const
    hasElms  = Boolean(o.l),
    isPseudo = Boolean(o.pseudo);   // pseudo-target for pseudo-animation
    if (!hasElms && !isPseudo)      // !isPseudo requires elms requires prop
        throw new Error("Targets without elements must set {pseudo:true}.");
    //--------------------------------- isPseudo requires peri
    o.peri  = Ez._validFunc  (o.peri, "peri", isPseudo);
    o.prop  = PBase._validate(o.prop, "prop", hasElms);
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
    if (o.bAbE  || o.byArgByElm)    // 2D arrays are [arg[elm]]
        o.bAbE  = true;
                                    // compute and assign values, params, etc.:
    cv = getCV(o, hasElms);         // gotta get o.cv early for arg count, etc.
    color  (o);                     // o.cjs defined = ignore o.func
    getFunc(o, cv);                 // getFunc() can set o.func
    urcfa  (o);                     // addend, factor, count, required, units
    config (o, hasElms);            // configure addend, factor, max, min
    mask   (o);                     // parse|create mask, easies for MEaser,
    if (hasElms) {                  // o.c for isNet, isPseudo.
        if (o.isNet)
            parseUn(o);             // normalize stuff across elements
        else {
            optional(o);            // adjust o.c for unused optional arguments
            current(o, cv);         // process current values
        }
        maskCV(o);                  // for o.configCV (config.param = E.cV)
    }                               // maskCV(), endToDist() can modify cfg.dim
    endToDist(o);                   // convert end to distance = factor
    o.dims = o.config.map(cfg => cfg.dim);
    plugCV(o, hasElms, is1Elm);     // build squeezed o.value and reset o.mask
                                    // build the calcs, instantiate the target:
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
        }                           // o.twoD is the fully calculated data array
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
// Factor is well validated if it passes through endToDist(). Other than that,
// config params are not as well validated, and maybe it could be centralized...
// validateParams() validates that all cfg.param values are numeric and
//  forcibly converts them to numbers. It balks at infinite values, as even
//  for max and min they are pointless. For factor, it balks at zero values.
//  Should be called after maskCV(), when all the params are finally set.
//  It would prevent the need to call isNaN() in defaultToZero().
//!!To be evaluated and maybe completed!!
//!!function validateParams(o) {
//!!    let cfg, val;
//!!    for (cfg of o.config) {
//!!        if (!cfg.dim) { // Number() or parseFloat() here? No clear winner.
//!!            val = Number(cfg.param);
//!!            if (!Number.isFinite(val))
//!!                throw new Error("...");
//!!            if (isFactor && !val) // How do I know if it's factor?
//!!                throw new Error("zero factor!");
//!!            cfg.param = val;
//!!        }
//!!    }
//!!}