import {E, Is} from "./raf.js";

import {fromColor} from "./prop/color-convert.js";

// Ez is a factotem object. Many of its functions are eminently inlineable.
// PFactory.init() adds bitmask & argument array properties, then freezes it.
export const Ez = {
    rad : Math.PI / 180, // non-bitmask values for <angle> to
    grad: 10 / 9,        // convert from degrees to other units.
    turn: 1 / 360,

    // Popular arguments for Ez.toNumber() and Easy.legNumber()
    // See bottom of PFactory.init() for more of these defined dynamically
    defZero: [0, true],         // arguments[2,3]  : >=0, default:0
    grThan0: [   true,  true],  // arguments[  3,4]: > 0
    notNeg : [   true,  false],                   // >=0
    notZero: [   false, true],                    // !=0

    okEmptyUndef: [false, false], // for Ez.toArray()
// =============================================================================
//  is() creates a read-only isName property on obj. Most commonly called in a
//       class constructor as Ez.is(this), to identify the object's class
//       when a super-class calls this, and elsewhere. obj.constructor.name
//       is the sub-class name, so super-classes must define the name arg.
//       It's also used for creating isWhatever properties in PFactory.init().
    is(obj, name = obj.constructor.name) {
        Object.defineProperty(obj, "is" + name, {value:true});
    },
//  readOnly() creates a read-only property: obj.name = val
    readOnly(obj, name, val) {
        Object.defineProperty(obj, name, {value:val});
    },
//  shallowClone() creates a shallow clone of obj, preserves pre-existing clone
    shallowClone(obj, clone = {}) {
        return Object.assign(clone, obj);
    },
//  newArray2D() creates a 2D array of length, filled with arrays of args[0]
//               new Array(undefined) !== new Array(), but ... syntax fixes it
    newArray2D(length, ...args) {
        return Array.from({length}, () => Array(...args));
    },
//  swapDims() swaps 2D array's inner/outer dimensions, no longer used
//             internally, but 2D arrays for Easers must all be the same,
//             bAbE or bEbA, so users can use this to accomplish that.
    swapDims(prm, l2) {
        let i, j;
        const l1   = prm.length;
        const twoD = Ez.newArray2D(l2);

        for (i = 0; i < l1; i++)    // swap sub-array elements, spread sub-value
            if (Is.A(prm[i]))            // swap 'em
                for (j = 0; j < l2; j++) // can iterate past prm[i].length
                    if (Is.def(prm[i][j]))
                        twoD[j][i] = prm[i][j];
            else if (Is.def(prm[i]))     // spread it
                for (j = 0; j < l2; j++)
                    twoD[j][i] = prm[i];

        while (!twoD[--l2].length)  // trim empty outer dim values
            --twoD.length;

        for (i = 0; i <= l2; i++) { // consolidate empty outer dim values
            if (!twoD[i].length)
                delete twoD[i];
        }
        return twoD;
    },
// =============================================================================
//  clamp() clamps val between min and max limits
    clamp(min, val, max) {
        return Math.max(min, Math.min(val, max));
    },
//  comp() complements a unit (number 0-1), returning the complement: 1 - unit
    comp(unit) {
        return 1 - unit;
    },
//  compIf() is a conditional version of comp()
    compIf(b, unit) {
        return b ? this.comp(unit) : unit;
    },
//  unitOutOfBounds() checks to see if any units in an array are out of bounds
    unitOutOfBounds(arr) {
        return arr.some(v => v < 0 || v > 1);
    },
// =============================================================================
//  Until Promise.withResolvers() is more widely supported:
//  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#browser_compatibility
//  Though by extending Promise, this is more concise than .withResolvers()
//  promise() returns a new Promise, extended with resolve & reject
    promise() {
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject  = rej;
        });
        return Object.assign(promise, {resolve, reject});
    },
// =============================================================================
// String case, hyphenation, etc.:
//  initialCap() capitalizes the first letter of a string
    initialCap(str) {
        return str[0].toUpperCase() + str.slice(1)
    },
//  toCamel() joins the arguments into a single camelCase string
    toCamel(...strings) {
        return strings.reduce((acc, cur) => acc + this.initialCap(cur));
    },
//  camelToKebab() converts a camelCase string to kebab-case
    camelToKebab(str) {
        return str.replace(E.caps, cap => "-" + cap.toLowerCase());
    },
//  kebabToCamel() converts a kebab-case string to camelCase
    kebabToCamel(str) {
        return str.replace(/-(.)/g, chars => chars[1].toUpperCase());
    // or:
    //  return this.toCamel(str.split("-"));
    },
//  kebabToSnake() converts kebab-case string to snake_case, required for
//                 converting color1.spaceId to color2.prop_name for alt coords.
//                 Doesn't do a lot, but the function name is informative.
    kebabToSnake(str) {
        return str.replaceAll("-", "_");
    },
// =============================================================================
// Conversion functions:
//  toSum() is a callback for Array.prototype.reduce(), reduces to a sum.
    toSum(sum, v) {
        return sum + v;
    },
//  toNumby() is soft numeric conversion for property/attribute string values
//            like Johnny Cochran: "If it doesn't convert, you must revert."
//            parseFloat() allows unit suffix and rejects, thus preserves, null
//            color strings are a special case, as they always are
    toNumby(v, f, u) {
        const n = parseFloat(v);
        return !Number.isNaN(n) ? n : f?.isCFunc ? fromColor(v, true, f, u)
                                                 : v;
    },
//  toNumber() is numeric validation/conversion, too many options...
    toNumber(v, name, defaultValue,
             notNeg, notZero, notFloat, notUndef, notNull = true) {
        if (!Is.def(v)) {
            if (notUndef)
                this._mustBeErr(name, "defined");
            return defaultValue;
        } //--------------------
        else if (v === null) {
            if (notNull)
                this._cantBeErr(name, "null");
            return v;            // EFactory ucrfa() relies on returning null
        } //--------------------
        let err;                 // Number()     forgives boolean, empty string
        const n = parseFloat(v); // parseFloat() forgives suffixes, like units
        if (Number.isNaN(n) || (notFloat && n % 1))
            err = notFloat ? "an" : "a";
        else if (notNeg  && n < 0)
            err = "a positive";
        else if (notZero && n === 0)
            err = "a non-zero";
        if (err)
            this._mustBeErr(`${name}:${v}\n${name}`,
                            `${err} ${notFloat ? "integer" : "number"}`);
        //-------
        return n;
    },
//  toArray() ensures that v is an array, optionally validating contents,
//            returns a shallow clone of any original array, wraps non-arrays
//            in an array, returns empty array for undefined. The cloning is
//            necessary for 95% of the callers, inexpensive for the rest.
    toArray(val, name, validate, notEmpty = true, notUndef = true) {
        let args, arr, err, isValid;
        if (Is.def(validate)) {         // validate the validator...
            if (!Is.A(validate))
                args = [];              // args are optional
            else {
                args = validate.splice(1);
                validate = validate[0];
            }
            validate = this._validFunc(validate, "Ez.toArray(): 3rd argument");
        }
        else                            // ...or don't validate
            isValid  = true;

        if (Is.def(val)) {              // if it's not an array, convert it to one:
            if (Is.A(val))              // it's an array
                arr = isValid ? val.slice()
                              : val.map((v, i) => validate(v, `${name}[${i}]`, ...args));
            else if (Is.Arrayish(val))  // if (Map) use values only
                arr = Array.from(val.values?.() ?? val);
            else if (isValid)
                arr = [val];            // wrap it
            else
                arr = [validate(val, `${name}[0]`), ...args];
        }
        else {
            if (notUndef || notEmpty) {
                err = this._mustBe(name, "defined");
                if (notUndef)
                    throw new Error(err);
            } //-----
            arr = [];                   // default value
        }

        if (notEmpty && !arr.length)    // now it's definitely an array
            throw new Error(err ?? this._cantBe(name, "an empty array"));
        //---------
        return arr;
    },
//  toElement() converts v to Element or throws an error
    toElement(v, noRules, doc = document) {
        let str;
        if (Is.Element(v))
            return v;
        if (Is.CSSRule(v)) {
            if (noRules)
                str = ", CSSStyleRule,";
            else
                return v;
        }
        if (Is.String(v)) {
            const elm = doc.getElementById(v);
            if (elm === null)
                throw new Error(`No such element: id="${v}"`);
            return elm;
        }
        else
            str = "";
        this._mustBeErr(`${v} is ${typeof v}:`, `an Element${str} or String`);
    },
//  toElements() returns an array of elements: [Element]. Validation not in,
    toElements(v, noRules, doc) { // but after toArray() because of doc arg.
        v = this.toArray(v, "toElements(): 1st argument", undefined,
                         ...this.okEmptyUndef);
        v.forEach((elm, i) => v[i] = this.toElement(elm, noRules, doc));
        return v;
    },
//  defaultToTrue() converts undefined to true and everything else to boolean
    defaultToTrue(val) {
        return Is.def(val) ? Boolean(val) : true;
    },
//  noneToZero() converts null to zero for a Color.js color coordinates array.
//               null is the numeric representation of CSS "none". The CSS rules
//               animating "none" are defined, but not fully implemented  in the
//               browsers, and there are different interpretations of the rules.
//               Regardless, for purposes of animation, null = 0.
    noneToZero(coords) {
        return coords.map(n => n === null ? 0 : n);
    },
// =============================================================================
// "Protected" functions:
//  _mustBe() encapsulates a commonly used template phrase
    _mustBe(name, so) { return `${name} must be ${so}.`; },

//  _mustBeErr() throws an error using _mustBe() for the message
    _mustBeErr(name, so, options) {
        throw new Error(this._mustBe(name, so), options);
    },

//  _cantBe() encapsulates the opposite template phrase
    _cantBe(name, so) { return `${name} cannot be ${so}.`; },

//  _cantBeErr() throws an error using _cantBe() for the message
    _cantBeErr(name, so, options) {
        throw new Error(this._cantBe(name, so), options);
    },

//  _cant() encapsulates a generalized phrase
    _cant(name, txt) { return `${name} cannot ${txt}.`; },

//  _cantErr() throws an error using _cant() for the message
    _cantErr(name, txt, options) {
        throw new Error(this._cant(name, txt), options);
    },

//  _only() encapsulates a generalized phrase
    _only(name, txt) { return `${name} can only be ${txt}.`; },

//  _onlyErr() throws an error using _only() for the message
    _onlyErr(name, txt, options) {
        throw new Error(this._only(name, txt), options);
    },

//  _mustAscendErr() throws an error if an array is not sorted ascending
    _mustAscendErr(arr, name, isErr = true, options) {
        if (arr.some((v, i) => i > 0 && v <= arr[i - 1]))
            if (isErr)
                this._mustBeErr(name, `sorted in ascending order: ${arr}`, options);
            else
                return true;
    },
//  _invalidErr() throws an error for values declared invalid by the caller
    _invalidErr(name, val, validList, it = "It", options) {
        if (Is.A(validList))
            validList = validList.join(", ");

        this._mustBeErr(`Invalid ${name} value: ${val}. ${it}`,
                        `one of: ${validList}`,
                        options);
    },
// =============================================================================
//  _isElmy() returns true if v is an Element or convertible to one
    _isElmy(v) {
        return Is.Element(v) || Is.String(v) || Is.CSSRule(v);
    },
//  _validObj() validates that o is an extensible Object, if not then if (name)
//              it throws an error using name, else it returns false.
    _validObj(o, name) {
        let b;
        try {
            o._ = true;     // strings and numbers don't throw here,
            b   = o._;      // but the property doesn't get set either.
            delete o._;
        } catch {
            b = false;
        }
        if (b === true)
            return o;
        else if (name)
            this._mustBeErr(name, "an extensible object");
        else
            return false;
    },
//  _validFunc() validates that a user-defined callback is a function.
    _validFunc(f, name, notUndef) {
        if ((notUndef || Is.def(f)) && !(f instanceof Function))
            this._mustBeErr(name, `a function${notUndef ? "" : " or undefined"}`);
        return f;
        // Uses instanceof, not typeof, because Object and other types that are
        // typeof "function" are not valid here, and I have no problem requiring
        // that the function be in this document. I don't check for async
        // functions, though they will likely not work properly in this context.
    },
// =============================================================================
//  _join() helps Func/Prop.prototype.join(), arr.map() prevents _appendUnits()
//          from modifying the user array.
    _join(arr, units, seps) {
        const isAu = Is.A(units);
        arr = arr.map((v, i) => this._appendUnits(v, units, i, isAu));
        if (Is.A(seps)) {
            let str = "";
            if (seps.length >= arr.length)
                seps = seps.slice(0, arr.length - 1)

            seps.forEach((sep, i) => str += arr[i] + sep);
            return str + arr.at(-1);
        }
        return arr.join(seps);
    },
//  _appendUnits() validates excessively as it applies units to numbers. If it's
//                 a number or string that ends with a number, append the units;
//                 else if it's a string, leave it alone; else throw an error.
    _appendUnits(v, u, i, isAu = i ?? Is.A(u)) {
        const isString = Is.String(v);
        if (Is.Number(v) || (isString && /\d/.test(v.at(-1))))
            return v + (isAu ? u[i] : u);
        else if (isString)
            return v;
        else
            this._mustBeErr(`Bogus value type: ${typeof v}. Property values`,
                            "Number or String");
    },
//  _dims() counts array dimensions up to 2, non-array = 0, undefined = -1
//          returns max 2 even if array has >2 dimensions
    _dims(a) {
        return Is.def(a) ? (Is.A(a) ? (a.some(v => Is.A(v)) ? 2 : 1) : 0) : -1;
    }
};