export {getCV, parseUn, current};

import {cjsTo} from "./color.js";

import {CFunc}      from "../prop/func.js";
import {Ez, Fn, Is} from "../raf.js"
//==============================================================================
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
        let j, l, s;        // squeeze trailing cv & seps into last sep
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
// current() processes cv (user-supplied currentValue or o.original) for !isUn
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
        o.cv = cv.map(v => { // color values might need a default alpha = "1"
            v = o.prop.parse(v, o.func, o.u);
            if (o.prop.isColor && v.length == CFunc.A && o.mask.at(-1) == CFunc.A)
                v.push("1");
            return v;
        });
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