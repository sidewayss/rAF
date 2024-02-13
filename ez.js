import {Is} from "./globals.js";

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

//  promise() returns a new Promise, extended with resolve & reject
    promise() {
    //++Until Promise.withResolvers() is more widely supported:
    //++  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#browser_compatibility
    //++though by extending Promise, this is more concise than Promise.withResolvers()
        let resolve, reject;
        const promise = new Promise((res, rej) => {
            resolve = res;
            reject  = rej;
        });
        return Object.assign(promise, {resolve, reject});
    },
    flip(unit) {
        return 1 - unit; // unit as in "unit increment"
    },
    flipIf(unit, b) {
        return b ? this.flip(unit) : unit;
    },
    defaultToTrue(val) {
        return Is.def(val) ? Boolean(val) : true;
    },
//  toNumby() is soft numeric conversion for property/attribute string values
    toNumby(v, f, u) {
        const n = parseFloat(v);    // To misquote Johnny Cochran:
        return !Number.isNaN(n) ? n // "If it doesn't convert, you must revert."
             : f?.isLD          ? f.fromColor(v, true, u) //!!Low Def color
                                : v;
    },
//  toNumber() is numeric validation/conversion, too many options...
    toNumber(v, name, defaultValue,
             notNeg, notZero, notUndef, notFloat, notNull = true) {
        if (!Is.def(v)) {
            if (notUndef)
                this._mustBeErr(name, "defined");
            return defaultValue;
        } //----------------
        else if (v === null) {
            if (notNull)
                this._cantBeErr(name, "null");
            return v;       // Number(null) = 0, parseFloat(null) = NaN
        } //----------------
    //++else if (v === "")  // Number("") = 0, parseFloat("") = NaN;
    //++    this._cantBeErr(name, "empty string");
        //------------------// Number(boolean) = 0|1, parseFloat(boolean) = NaN
        let err;
        v = parseFloat(v);  //++or should I use Number() here??
        if (Number.isNaN(v) || (notFloat && v % 1))
            err = notFloat ? "an" : "a";
        else if (notNeg  && v < 0)
            err = "a positive";
        else if (notZero && v === 0)
            err = "a non-zero";
        if (err)
            this._mustBeErr(name, err + (notFloat ? " integer" : " number"));
        //-------
        return v;
    },
//  toArray() ensures that v is an array, optionally validating contents
    toArray(v, name, validate, notEmpty = true, notUndef = true) {
        let err, isValid;
        if (Is.def(validate))   // validate the validator...
            validate = this._validFunc(validate, "Ez.toArray(): 3rd argument");
        else                    // ...or everything is valid
            isValid  = true;

        if (!Is.def(v)) {       // if it's not an array, convert it to one
            if (notUndef || notEmpty) {
                err = this._mustBe(name, "defined");
                if (notUndef)
                    throw new Error(err);
            } //----------------
            v = [];             // default value
        }
        else if (!Is.A(v)) {
            if (Is.Arrayish(v)) // iterable or array-like, for Map: values only
                v = Array.from(v.values?.() ?? v);
            else {              // treat everything else as Object
                if (!isValid) { // some validate functions convert
                    v = validate(v, `${name}[0]`);
                    isValid = true;
                }
                v = [v];        // wrap it
            }
        }
        if (!v.length) {        // now it's an Array
            if (notEmpty)
                throw new Error(err ?? this._cantBe(name, "an empty array"));
        } //--------------------
        else if (!isValid)
            for (let i = 0, l = v.length; i < l; i++)
                v[i] = validate(v[i], `${name}[${i}]`);

        return v;
    },
//  toElement() converts v to Element or throws an error
    toElement(v, doc) {
        if (Is.Element(v) || Is.CSSRule(v))
            return v;
        if (Is.String(v)) {
            const elm = doc.getElementById(v);
            if (elm === null)
                throw new Error(`No such element: id="${v}"`);
            return elm;
        }
        else
            this._mustBeErr(`${v} is ${typeof v}:`,
                            "an Element, CSSStyleRule, or String");
    },
//  toElements() returns an array of elements: [Element]. Validation not in,
    toElements(v, doc) {          // but after toArray() because of doc arg.
        v = this.toArray(v, "toElements(): 1st argument", undefined,
                         ...this.okEmptyUndef);
        v.forEach((elm, i) => v[i] = this.toElement(elm, doc));
        return v;
    },
//  toSum() is a callback for Array.prototype.reduce(), reduces to a sum.
    toSum(sum, v) { return sum + v; },

//  is() creates a read-only isName property on obj, to identify its class
//  when a super-class calls this and elsewhere. obj.constructor.name is the
//  sub-class name, so super-classes must define the name arg.
    is(obj, name = obj.constructor.name) {
        Object.defineProperty(obj, "is" + name, {value:true});
    },
//  readOnly() creates a read-only property: obj.name = val
    readOnly(obj, name, val) {
        Object.defineProperty(obj, name, {value:val});
    },
//  unitOutOfBounds() checks to see if any units in an array are out of bounds
    unitOutOfBounds(arr) {
        return arr.some(v => v < 0 || v > 1);
    },
//  swapDims() swaps 2D array's inner/outer dimensions, no longer used
//             internally, but 2D arrays for Easers must all be the same,
//             bAbE or bEbA, so users can use this to accomplish that.
    swapDims(prm, l2) {
        let i, j;
        const l1   = prm.length;
        const twoD = Array.from({length:l2}, () => []);

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
// "Protected" methods
//  _mustBe() encapsulates a commonly used template phrase
    _mustBe(name, so) { return `${name} must be ${so}.`; },

//  _mustBeErr() throws an error using that phrase
    _mustBeErr(name, so) { throw new Error(this._mustBe(name, so)); },

//  _cantBe() encapsulates the opposite template phrase
    _cantBe(name, so) { return `${name} cannot be ${so}.`; },

//  _cantBeErr() throws an error using a the opposite phrase
    _cantBeErr(name, so) { throw new Error(this._cantBe(name, so)); },

//  _cant() encapsulates a very generalized phrase
    _cant(name, txt) { return `${name} cannot ${txt}.`; },

//  _cantErr() throws an error using a that generalized phrase
    _cantErr(name, txt) { throw new Error(this._cant(name, txt)); },

//  _mustAscendErr() throws an error if array is not sorted ascending
    _mustAscendErr(arr, name, isErr = true) {
        if (arr.some((v, i) => i > 0 && v <= arr[i - 1]))
            if (isErr)
                this._mustBeErr(name, "sorted in ascending order: " + arr);
            else
                return true;
    },
//  _invalidErr() throws an error for invalid values
    _invalidErr(name, val, validList, it = "It") {
        if (Is.A(validList))
            validList = validList.join(", ");
        Ez._mustBeErr(`Invalid ${name} value: ${val}. ${it}`,
                      `one of these: ${validList}`);
    },
//  _isElmy() returns true if v is an Element or convertible to one
    _isElmy(v) {
        return Is.Element(v) || Is.String(v) || Is.CSSRule(v);
    },
//  _validObj() validates that o is an extensible Object
    _validObj(o, name) {
    //!!let b;
        try {
            o._ = 1;
    //!!    b = (o._ === 1);
            delete o._;
            return o;
        } catch {
            if (name)
                this._mustBeErr(name, "an extensible object");
            //-----------
            return false;
    //!!    b = false;
        }
    //!!if (b)
    //!!    return o;
    //!!else
    //!!    this._mustBeErr(name, "an extensible object");
    },
//  _validFunc() validates that a user-defined callback is a function.
    _validFunc(f, name, notUndef) {
        // Uses instanceof, not typeof, because Object and other types that are
        // typeof "function" are not valid here, and I have no problem requiring
        // that the function be in this document. I don't check for async
        // functions, though they will likely not work properly in this context.
        if ((notUndef || Is.def(f)) && !(f instanceof Function))
            this._mustBeErr(name, `a function${notUndef ? "" : " or undefined"}`);
        return f;
    },
//  _join()
    _join(arr, units, separator) {
        const isAu = Is.A(units);
        arr.forEach((v, i) => {
            arr[i] = Ez._appendUnits(v, units, i, isAu)
        });
        if (Is.A(separator)) {
            let str = "";
            separator.forEach((sep, i) => str += arr[i] + sep);
            return str + arr.at(-1);
        }
        return arr.join(separator);
    },
//  _appendUnits() validates excessively as it applies units to numbers
    _appendUnits(v, u, i, isAu = i ?? Is.A(u)) {
        if (Is.Number(v))
            return v + (isAu ? u[i] : u);
        else if (Is.String(v))
            return v;
        else
            Ez._mustBeErr(`Bogus value type: ${typeof v}. Property values`,
                          "string or number");
    },
//  _dims() counts array dimensions up to 2
    _dims(a) {
        return Is.def(a) ? (Is.A(a) ? (a.some(v => Is.A(v)) ? 2 : 1) : 0) : -1;
    }
};