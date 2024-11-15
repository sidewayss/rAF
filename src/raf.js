// Export the library:
export * from "./globals.js";           // E, Ease, F, Fn, HD, Is, P, Pn, U, Rx
export * from "./ez.js";                // Ez
export * from "./prop/color-names.js";  // C
export * from "./prop/pfactory.js";     // PFactory initializes everything
export * from "./easy/easy.js";         // Easy
export * from "./easy/incremental.js";  // Incremental, subclass of Easy
export * from "./easy/easies.js";       // Easies
export * from "./acues.js";             // ACues
export * from "./aframe.js";            // AFrame
//==============================================================================
// Initialization is required:
import {E, Ease}  from "./globals.js";
import {Ez}       from "./ez.js";
import {Easy}     from "./easy/easy.js";
import {PFactory} from "./prop/pfactory.js";

let isInitialized;

// rAFInit() because rafInit() looks like a local function. It initializes stuff
//           that rAF needs, especially PFactory.init(). The rest is dynamically
//           created properties for E, Ez, and Ease, then a couple of polyfills.
export function rAFInit() {
    if (isInitialized) {
        console.info(Ez._only("rAFInit()", "called once per session"));
        return;
    } //------------
    PFactory.init();

    let arr, key, obj;      // E enumerations
    for (arr of [Easy.status, Easy.type, Easy.io, Easy.jump, Easy.set])
        arr.forEach((v, i) => E[v] = i);

    for (key of Easy.eKey)  // E string constants
        E[key] = key;

    // Popular arguments for Ez.toNumber() and Easy.legNumber():
    // Can't define these inside const Ez because ...Ez.foo is not available
                            // arguments[2, 3, 4]:
    Ez.undefGrThan0 = [, ...Ez.grThan0];            // > 0, undefined ok
    Ez.undefNotZero = [, ...Ez.notZero];            // !=0, undefined ok
                            // arguments[2, 3, 4, 5, 6]:
    Ez.defGrThan0   = [...Ez.undefGrThan0, , true]; // > 0, !undefined
    Ez.defNotNeg    = [    , ...Ez.notNeg, , true]; // >=0, !undefined
                            // arguments   [3, 4, 5]:
    Ez.intGrThan0   = [...Ez.grThan0, true];        // > 0, int or undefined
    Ez.intNotNeg    = [...Ez.notNeg,  true];        // >=0, int or undefined

    // Ease: a collection of preset easy.legs, see globals.js
    let inn, out, pow;      // "in" is a reserved word, thus "inn"
    const eases = [
        ["",1.685], ["quad",2], ["cubic",3], ["quart",4], ["quint",5],
        ...Easy.type.slice(1, 7).map(v => [v,])
    ];
    for ([key, pow] of eases) {
        inn = pow ? {pow:pow} : {type:E[key]};
        out = {...inn, io:E.out};
        inn.io = E.in;      // explicit default value
        arr = [[inn],[out],[inn, out],[out, inn],[inn, {...inn}],[out, {...out}]];
        key ? arr.forEach((v, i) => Ease[key + Ez.initialCap(Easy.io[i])] = v)
             : arr.forEach((v, i) => Ease[Easy.io[i]] = v);
    }
    // Lock 'em up
    for (obj of [E, Ease, Ez])
        Object.freeze(obj);

    // Polyfills
    if (!Array.prototype.at)    // only used with negative indexes
        Array.prototype.at = (i) => this[this.length + i];

    if (!Array.prototype.flat)  // only used with 2D arrays
        Array.prototype.flat = () => [].concat(...this);

    isInitialized = true;
}
//==============================================================================
// General Comments for the library:
// I have chosen to do extensive validation when creating new instances and
// setting properties because debugging an animation call stack can be daunting,
// and there are so many things to validate, so many parameters and
// configurations, so many ways for typos and other oversights to cause errors.
// I also wanted to clarify all the rules. What better place than in the code?
// Invalid parameters throw errors. That might be harsh, but it's also the
// simplest way to handle it.
