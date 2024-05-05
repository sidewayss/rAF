// This module provides minimal color conversion. You can build the exported
// function names as "rgbTo" + camelCase(func.name|this.space). The reason
// for providing HSL/HWB conversion is to counter the way getComputedStyle and
// style convert these color spaces to integer rgba(). I already had tables to
// convert the named colors to HSL/HWB. Note that these functions will never
// be called for gradients, so you must set o.currentValue for HSL/HWB there.
export {fromColor, rgbToHxx, rgbToHsl, rgbToHwb};

import {C, U, E, Ez, Fn} from "../raf.js";

import {CFunc} from "./func.js";
//==============================================================================
// fromColor() converts hex to rgb() and color names to rgb(), hsl(), or hwb().
//             Returns an array of 3 or 4 function arguments, plus optionally
//             the function name, and space for color(). There is no validation
//             that the function names or color spaces for f vs v match.
function fromColor(v, toNum, f, u = f?._u, includeFunc = false) {
    if (f)
        if (!f.isFunc)      // duplicate of error in EFactory.getFunc()
            Ez._mustBeErr("func", "an instance of Func");
        else if(!f.isCFunc)
            Ez._invalidErr("color function", f.name, PFactory.funcC);
    //-------------------
    let arr, name, space;
    if (v.at(-1) == E.rp) { // v = "func(...arguments)"
        arr = v.split(E.sepfunc);
        --arr.length;               // trailing "" array element
        [name, space] = arr.splice(0, 1 + (arr[0] == Fn.color));
        if (arr.length > CFunc.A + 1)
            arr.splice(CFunc.A, 1); // remove "/" separator from array
        if (toNum)
            arr = arr.map(num => parseFloat(num));
    }
    else  {
        if (v[0] == "#") {  // v == hex RGB, RGBA, RRGGBB, RRGGBBAA
            if (f && !f.isRGB && !f.isHXX)
                Ez._onlyErr("Hex colors", "used by rgb(), hsl(), and hwb()");
            //----------------
            const A = CFunc.A;
            v = v.substring(1);
            if (v.length <= A + 1)  // normalize "RGB(A)" to "RRGGBB(AA)"
                v = v.replace(/./g, char => char + char);

            arr = v.match(/../g).map(hex => parseInt(hex, 16));
            if (arr[A])             // convert alpha to 0-1 or %
                arr[A] /= (u[A] == U.pct) ? 2.55 : 255;

            if (f.isHXX)            // replace the first three array elements
                arr.splice(0, CFunc.A, ...rgbToHxx(f, arr, u));
            else                    // convert RGB to % as specified by u
                toPercent(arr, u, true);

            if (includeFunc)
                name = f?.name ?? Fn.rgb;
        }
        else if (C[v]) {    // v == color name
            name = !f || f.isRGB ? Fn.rgb
                       : f.isHSL ? Fn.hsl
                       : f.isHXX ? Fn.hwb
                       : Ez._onlyErr("CSS named colors",
                                     "used by rgb(), hsl(), and hwb()");
            arr = C[v][name];
            if (f) {
                if (f.isRGB)
                    toPercent(arr, u);
                else {      // hue is in degrees
                    const uHue = u[f.hueIndex];
                    if (uHue && uHue != U.deg)
                        arr[f.hueIndex] *= Ez[uHue];
                }
            }
        }
        else                // for o.currentValue, unlikely to be a DOM value
            throw new Error(`Invalid color value: ${v}`);
        //---------
        if (!toNum)
            arr = arr.map((num, i) => num + u[i]);
    }
    if (includeFunc) {
        if (space)
            arr.unshift(space);
        arr.unshift(name);
    }
    return arr;
}
// toPercent() converts RGB to % units as specified by the u (units) argument
function toPercent(arr, u, skipAlpha) {
    let i = 0;
    if (skipAlpha)
        u = u.slice(0, CFunc.A);
    while ((i = u.indexOf(U.pct, i)) >= 0)
        arr[i] /= 2.55;
}
//==============================================================================
// rgbToHxx() makes it easier if you don't know which it is, HSL or HWB
function rgbToHxx(f, rgb, u) {
    (f.isHSL ? rgbToHsl : rgbToHwb)(rgb, u[f.hueIndex]);
}
// rgbToHsl() converts 3 RGB integer values to HSL
function rgbToHsl(rgb, u) {
    const obj = toHxx(rgb, u);
    const sum = obj.min + obj.max;
    const hsl = [obj.hue, , ];
    hsl[2] = sum / 2 * 100;       // L required to calculate S
    hsl[1] = obj.diff ? obj.diff / (hxx[2] < 50 ? sum : 2 - sum) * 100
                      : 0;        // S
    return hsl;
}
// rgbToHwb() converts 3 RGB integer values to HWB
function rgbToHwb(rgb, u) {
    const obj = toHxx(rgb, u);
    const hwb = [obj.hue, , ];
    hwb[1] = 100 * obj.min;       // W
    hwb[2] = 100 * (1 - obj.max); // B
    return hwb;
}
// toHxx() consolidates code for rgbToHsl() and rgbToHwb()
function toHxx(arr, u) { // converts the hue and max/min/diff
    const R = 0, G = 1, B = 2,
    rgb = arr.slice(0, CFunc.A)   // allow alpha or other garbage to be included
             .map(v => v / 255),  // convert 0-255 to 0-1
    obj = minMaxDiff(rgb);        // without arr.slice() this could be a problem

    if (!obj.diff)
        obj.hue = 0;              // H
    else {
        let hue;
        switch (obj.max) {
        case rgb[R]:
            hue = (rgb[G] - rgb[B]) / obj.diff % 6; break;
        case rgb[G]:
            hue = (rgb[B] - rgb[R]) / obj.diff + 2; break;
        case rgb[B]:
            hue = (rgb[R] - rgb[G]) / obj.diff + 4;
        }
        hue = constrainAngle(hue * 60);
        if (u && u != U.deg)
            hue *= Ez[u];         // convert degrees to grad, rad, or turn
        obj.hue = hue;            // H
    }
    return obj;
}
function minMaxDiff(rgb) {
    const obj = {};
    obj.min  = Math.min(...rgb);
    obj.max  = Math.max(...rgb);
    obj.diff = obj.max - obj.min;
    return obj;
}
// see https://github.com/LeaVerou/color.js/blob/main/src/angles.js#L1
function constrainAngle(angle) {
    return ((angle % 360) + 360) % 360;
}
