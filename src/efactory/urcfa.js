export {getFunc, urcfa, optional, faDelete};

import {C, E, Ez, F, Is} from "../raf.js"
//==============================================================================
function getFunc(o, cv) {
    if (!o.prop || o.cjs)
        return;
    if (o.func && !o.func.isFunc)
        Ez._mustBeErr("func", "an instance of Func");
    //-------------
    if (!o.isNet) {                     // o.func determines arg count, etc.
        let idx;
        const names = Array(o.l);
        cv.forEach((v, i) => {          // get cv's function names
            idx = v.indexOf(E.lp);
            names[i] = (idx >= 0) ? v.slice(0, idx) : "";
        });
        if (!o.func)                    // fall back to o.prop.func
            o.func = names[0] ? F[names[0]] : o.prop.func;
        if (!o.func) {
            if (o.prop.needsFunc)       // defaults should prevent this
                throw new Error(`${o.prop.name} requires a func!`);
        }
        else if (!o.isSet
              && !o.func.isCFunc        // CFuncs validated in current()
              && (idx = names.findIndex(v => v && v != o.func.name)) >= 0)
            throw new Error(`elms[${idx}]'s value's function, "${names[idx]}", does not `
                          + `match {func:F.${o.func.name}}. To override use {set:E.set}.`);
        o.isNet |= o.func?.isUn;
    }
    if (o.isNet)                        // get o.cv early for arg count, etc.
        o.prop.getUnToObj(o, cv);

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
        o.r = o.cjs ? C.a           // o.r = required arg count, constant
                    : o.prop.required(o.func);
        o.c = o.cjs ? C.a + 1       // o.c = total arg count, variable
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
}
// fa() helps urcfa() with factor and addend, validating user values and
//      deep-copying any user arrays so that they stay intact for the user.
function fa(o, keys, isAddend) {
    let key, oVal, val,
    idx = keys.findIndex(k => Is.def(o[k]));
    if (idx < 0)              // none defined
        return [,];           // return empty [key, val]

    key  = keys[idx];
    oVal = o[key];            // not0 arg:  "e" for end
    const args = [o, !isAddend && key[0] != "e"];

    if (Is.Arrayish(oVal)) {  // oVal is a sparse array, thus forEach(), map()
        if (Is.A2ish(oVal, true)) {
            val = [];         // 2D elements can be number or array
            oVal.forEach((v, i) =>
                val[i] = Is.Arrayish(v)
                       ? faToArray(v, key, args, isAddend)
                       : faToNumber(v, key, ...args));
        }
        else                  // oVal is a 1D array
            val = faToArray(oVal, key, args, isAddend)
    }
    else {                    // oVal is a number
        val = faToNumber(oVal, key, ...args);
        if (val === 0)
            val = undefined;
    }
    return [key, val];
}
// faToNumber() converts fa values to valid numbers, not0 for distance
function faToNumber(val, key, o, not0) {
    if (val !== E.cV) {                // exclude null
        val = Ez.toNumby(val, o.func, o.u);
        if (!Is.A(val))                // default,  !neg,     ,!float,!undef
            val = Ez.toNumber(val, key, undefined, false, not0, false, false);
    }
    return val;
}
function faToArray(val, key, args, isAddend) {
    const arr = val.map(n => faToNumber(n, key, ...args));
    faDelete(arr, isAddend);
    return arr;
}
function faDelete(arr, isAddend) {
    let i, l;
    const deleted = [];
    for (i = 0, l = arr.length; i < l; i++)
        if (!Is.def(arr[i]) || (isAddend && arr[i] == 0)) {
            delete arr[i];
            deleted.push(i);
        }
    return deleted;
}
//==============================================================================
// optional() sets o.c to the actual number of arguments provided, adjusting it
//            downward if optional arguments are not masked. current() can
//            adjust it back up if current values includes more arguments.
function optional(o) { // not used by o.isNet
    // (count == required || count = mask.length)
    if (o.c == o.r || o.c == o.lm) return;
    //-------------------------------------
    o.c = Math.max(o.r, 1 + (o.mask?.at(-1) ?? 0));
    if (o.c == o.lm)
        o.maskAll = true;
}