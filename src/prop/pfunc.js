// This module consolidates Prop and Func-related stuff, removing some circular
// import dependencies and the resulting Rollup warnings.
// *copyright disambiguation* For P-Funk see:
//   https://youtu.be/f_R3c2TIV-E?list=OLAK5uy_k5BKg6aR7SkE69hOjKtbSTVMLYr-6AftU
//==============================================================================
import {U, Is} from "../globals.js";
import {Ez}    from "../ez.js";

export const // units by type
LENGTHS   = ["px","em","rem","vw","vh","vmin","vmax","pt","pc","mm","in"],
ANGLES    = ["deg","rad","grad","turn"], // see CFunc.prototype.hueUnits
TIMES     = ["ms","s"],
EMPTY_PCT = ["", "U.pct"],               // ditto .alphaUnits

Fn = {},    // function names
Pn = {},    // property and attribute names
F  = {      // Func, CFunc, ColorFunc, SRFunc instances by name
 // joinCSSpolygon() joins an array of numbers into a CSS polygon() value
    joinCSSpolygon(arr, fillRule, u = U.px) {
        let i, l, str;
        const seps = [E.sp, E.comma]
        str = F.polygon.prefix + (fillRule ? fillRule + E.comma: "");
        for (i = 0, l = arr.length - 1; i < l; i++)
            str += arr[i] + u + seps[i % 2];
        return str + arr[i] + u + E.rp;     // no trailing separator
    },
},
P = {       // Prop, Bute, PrAtt, HtmlBute instances by name
 // visible is useful as a boolean, for one or more elements
    visible(elms, b) {
        const val = b ? "visible" : "hidden";
        for (const elm of Ez.toElements(elms))
            P.visibility.setOne(elm, val);
    },
    isVisible(elm) { // one element at a time
        return P.visibility.getOne(elm) == "visible";
    },
 // displayed does something similar for display
    displayed(elms, b, value) {
        boolNone(Pn.display, elms, b, value);
    },
    isDisplayed(elm) { // one element at a time
        return P.display.getOne(elm) != "none";
    },
 // events does something similar for pointer-events
    events(elms, b, value) {
        boolNone(Pn.pE, elms, b, value);
    },
    hasEvents(elm) {
        return elm.style.pointerEvents != "none";
    },
 // enable() is an inverted pseudo-disabled attribute for SVG and other elements
 //          that don't have a disabled attribute. It sets pointer-events:none
 //          and tabIndex = -1 instead. The name is inverted to avoid confusion.
    enable(elms, b, value, i = b ? 0 : -1) {
        P.events(elms, b, value);
        for (const elm of Ez.toElements(elms))
            elm.tabIndex = i;
    }
},
PFunc = {   // shared Prop and Func stuff, mostly relating to units
 // _validUnits() helps Func and PBase validate units, obj can be an array of
    _validUnits(val, name, obj) { // string values or a Prop or Func instance.
        let arr;
        if (Is.A(obj)) {          // LENGTHS, ANGLES, EMPTY_PCT
            if (!obj.includes(val))
                arr = obj;
        }
        else if (obj._noUPct) {
            if (!EMPTY_PCT.includes(val))
                arr = EMPTY_PCT;
        }
        else if (obj._len) {
            if (!LENGTHS.includes(val))
                arr = LENGTHS;
        }
        else if (obj._lenPct) {
            if (!LENGTHS.includes(val) && val != U.pct)
                arr = [...LENGTHS, U.pct];
        }
        else if (obj._lenPctN) {
            if (!LENGTHS.includes(val) && val != U.pct && val !== "")
                arr = [...LENGTHS, U.pct, ""];
        }
        else if (obj._ang) {
            if (!ANGLES.includes(val))
                arr = ANGLES;
        }
        else if (obj._pct && val != U.pct)
            throw new Error(`${name} units are read-only: ${U.pct}.`);
        else if (obj._noU || obj.isUn) // noUnits or isUnstructured
            throw new Error(`${name} does not use units: val.`);

        if (arr)
            Ez._invalidErr(name, val, arr);

        return val;
    },
 // Setters to globally change units, func:
 // set lengthUnits() sets units for Props/Funcs that use <length>
    set lengthUnits(val) {
        val = this._validUnits(val, "lengthUnits", LENGTHS);
        for (obj of this._len)
            obj._u = val;      // backdoor avoids double-validation
    },
 // set angleUnits() sets units for Funcs that use <angle>
    set angleUnits(val) {
        val = this._validUnits(val, "angleUnits", ANGLES);
        for (const obj of this._ang)
            obj._u = val;
    },
 // set percent() toggles U.pct for Props/Funcs that use it
    set percent(b) {
        if (b)
            for (const obj of this._pct)
                obj._u = U.pct;
        else
            for (const obj of this._pct)
                obj._u = obj._lenPct ? U.px : "";
    },
 // set colorFunc() sets the CFunc for all color Props
    set colorFunc(val) {
        if (val?.isCFunc)
            for (const obj of this._color)
                obj.func = val;
        else
            Ez._invalidErr("colorFunc", val?.key ?? val, this.funcC);
    },
 // These two are only for CFunc, but have the same name as CFunc read-write
 // instance properties; less confusing here than as static class properties.
    set alphaUnits(val) {
        val = this._validUnits(val, "alphaUnits", EMPTY_PCT);
        for (const f of Object.values(CFunc.funcs))
            f._u[C.a] = val;
    },
    set hueUnits(val) {
        val = this._validUnits(val, "hueUnits", ANGLES);
        for (const f of Object.values(CFunc.funcs))
            if (f.hasHue)
                f._u[f.hueIndex] = val;
    }
};
// boolNone helps P.displayed() and P.events()
function boolNone(name, elms, b, value) {
    const val = b ? (value ?? "") : "none";
    for (const elm of Ez.toElements(elms))
        P[name].setOne(elm, val);
}