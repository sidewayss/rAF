export {mask};

import {Is}    from "../globals.js";
import {Ez}    from "../ez.js";
import {PBase} from "../prop/pbase.js";
//==============================================================================
// mask() sets o.mask to a dense array of sorted argument indexes.
//        Also processes o.easies, which must align with o.mask.
//        For all user mask types except dense array, o.mask is code-generated.
//        Valid user mask types are:
//         - dense array:  user-generated, validated by PBase.prototype._mask()
//         - sparse array: non-empty slots = masked indexes
//         - o.config:     sequential indexes 0 to array.length - 1
//         - undefined:    sequential indexes 0 to o.r - 1
function mask(o, validEasy) {
    let n;
    const count = o.isNet ? Math.min(...o.cv.map(arr => arr.length))
                          : o.c;
    if (Is.def(o.mask)) {           // user mask: validate/format it
        if (o.prop)
            o.mask = o.prop._mask(o.mask, o.func, count);
        else                        // prop optional for pseudo-animation
            throw new Error("mask requires prop.");
    } //-----------------------------------
    else if (o.dims.some(dim => dim > 0)) {
        const l = [];               // base the mask on longest cfg.param array
        o.config.forEach((cfg, i) => {
            switch (cfg.dim) {      // treats array contents as dense &
            case 0:                 // sequential from 0 to length - 1.
                l[i] = 1; break;    // empty array slots are noops for
            case 1:                 // for calcs, not unmasked args.
                l[i] = cfg.byElm ? 1
                                 : cfg.param.length; break;
            case 2:
                l[i] = cfg.bAbE  ? cfg.param.length
                                 : Math.max(...cfg.param.map(arr => arr.length));
            }
        });
        n = Math.max(...l);
        if (o.r || o.isNet)
            o.mask = PBase._maskAll(Ez.clamp(o.r || 1, n, count));
    }
    else if (o.isNet)               // undefined = mask all required args
        o.mask = PBase._maskAll(count);

    const easies = "easies";        // o.easies cannot be sparse and must be
    if (o[easies])                  // the same length as o.mask.
        o[easies] = Ez.toArray(o[easies], easies, validEasy)

    if (!o.mask) {                  // undefined and/or pseudo without prop
        if (!o.r) {
            if (!n)
                n = 1;
            if (n == 1 && o.easies)
                n = o.easies.length;
            o.r = n;
            o.c = n;
        }
        o.mask = PBase._maskAll(o.r);
    }
    o.lm = o.mask.length;
    if (o.isNet)
        o.c = o.mask.at(-1) + 1;
    else if (o.c == o.lm)
        o.maskAll = true;
    else if (o.isSet && o.lm < o.r)
        throw new Error("{set:E.set} requires that all arguments be masked. "
        + `${o.func?.name ?? o.cjs?.space ?? o.prop.name} requires ${o.r} arguments.`)
    //-------------
    if (o.configCV)
        o.oneArg = (o.c == 1);      // see maskCV()

    if (o[easies]) {
        if (o[easies].length != o.lm)
            Ez._mustBeErr(easies, "the same length as mask");
        //--------------------      // consolidate [Easy] into Map(Easy => [i]):
        o.easy2Mask = new Map;      // i = mask index, index into o.mask
        o[easies].forEach((ez, i) =>
            o.easy2Mask.has(ez)
              ? o.easy2Mask.get(ez).push(i)
              : o.easy2Mask.set(ez, [i])
        );                          // reduce o.easies to unique values:
        o[easies] = Array.from(o.easy2Mask.keys());
        o.lz = o[easies].length;
    }
}