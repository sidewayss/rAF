export {create};  // not exported by raf.js
// The sum of this directory's modules is one large function: create().
// All the other modules and their exported functions are a just way to break
// it up into manageable chunks for readability/navigation. In run-time order:
import {getCV, parseUn, current}  from "./cv.js";
import {color}                    from "./color.js";
import {getFunc, urcfa, optional} from "./urcfa.js";
import {config}                   from "./config.js";
import {mask}                     from "./mask.js";
import {maskCV}                   from "./maskCV.js";
import {endToDist}                from "./endToDist.js";
import {plugCV}                   from "./plugCV.js";
import {calcEaser, calcMEaser,
        calcByElm, calcNoElms}    from "./calcs.js";

import {PBase}     from "../prop/pbase.js";
import {E, Ez, Is} from "../raf.js"
//==============================================================================
// create() instantiates a bottom-level subclass of EBase and returns it.
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
    cv = getCV(o, hasElms);         // gotta get o.cv early for arg count
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
// validateParams() validates that all cfg.param values are numeric and forcibly
// converts them to numbers. It balks at infinite values, as even for max and
// min they are pointless. For factor, it balks at zero values.
// It should be called after maskCV(), when all the params are finally set.
// It would prevent the need to call isNaN() in defaultToZero().
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