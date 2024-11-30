export {config};

import {E, Is} from "../globals.js";
import {Ez}    from "../ez.js";

import {ECalc} from "../easer/ecalc.js";

const
keys   = ["f",           "a",           "max",      "min"     ],
calcs  = [ ECalc.f,       ECalc.a,       Math.min,   Math.max ],
byElms = ["factorByElm", "addendByElm", "maxByElm", "minByElm"];
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
            cfg = {
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
            o.config.push(cfg);        // spread cfg back around to o:
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