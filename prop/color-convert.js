// This module provides minimal color conversion. You can build the exported
// function names as "rgbTo" + camelCase(func.name|this.space). The reason
// for providing HSL/HWB conversion is to counter the way getComputedStyle and
// style convert these color spaces to integer rgba(). I already had tables to
// convert the named colors to HSL/HWB. Note that these functions will never
// be called for gradients, so you must set o.currentValue for HSL/HWB there.
export {fromColor, rgbToHxx, rgbToHsl, rgbToHwb};

import {C, U, E, Ez, F, Fn} from "../raf.js";

import {CFunc} from "./func.js";
//==============================================================================
// fromColor() parses a DOM value, converts hex to rgb() and color names to
//             rgb(), hsl(), or hwb(), returns an array of 3 or 4 function
//             arguments, plus optionally: the function name, and for color()
//             the space. There is no validation that the function names or
//             color spaces for f vs v match.
//                 v == "func(p1 p2 p3 / alpha)" or "rgba(r, g, b, a)"
function fromColor(v, toNum, f = F.rgb, u = f._u) {
    if (!f.isFunc)          // duplicate of error in EFactory.getFunc()...
        Ez._mustBeErr("func", "an instance of Func");
    else if(!f.isCFunc)
        Ez._invalidErr("color function", f.name, PFactory.funcC);
    //-------------------
    let arr, canConvert;
    const A = CFunc.A;

    if (v.at(-1) == E.rp) {     // v == function string
        arr = v.split(E.sepfunc);
        arr.length--;           // trailing "" array element

        let err;
        const name = arr.splice(0, 1)[0];
        canConvert = name.startsWith(Fn.rgb) && (f.isRGB || f.isHXX);
        if (!canConvert && name != f.name)
            err = [name, f.name];
        else {
            let space;
            if (f.space)
                space = arr.splice(0, 1)[0];
            if (space != f.space)
                err = [space, f.space];
        }
        if (err)
            Ez._onlyErr(`${err[0]} to ${err[1]} conversion`,
                        "done via Color.js objects");
        //---------------------
        if (arr.length > A + 1)
            arr.splice(A, 1);   // remove "/" separator from array
        if (toNum)
            arr.forEach((v, i) => arr[i] = parseFloat(v));

        if (canConvert && f.isHXX) { // convert rgb to hsl or hwb
            arr = rgbToHxx(f, arr, o.u);
            if (!toNum)
                arr.forEach((v, i) => arr[i] = v + u[i]);
        }
    }
    else {                      // v == hex or name
        const txt  = "used with rgb(), hsl(), or hwb()";
        canConvert = f.isRGB || f.isHXX;
        if (v[0] == "#") {      // v == hex RGB, RGBA, RRGGBB, RRGGBBAA
            if (!canConvert)
                Ez._onlyErr("Hex color values", txt);
            //-------------
            v = v.slice(1);     // normalize "RGB(A)" to "RRGGBB(AA)"
            if (v.length <= A + 1)
                v = v.replace(/./g, char => char + char);

            arr = v.match(/../g).map(hex => parseInt(hex, 16));
            if (arr[A])         // convert alpha to 0-1 or %
                arr[A] /= (u[A] == U.pct) ? 2.55 : 255;

            if (f.isRGB)        // convert RGB to % as specified by u
                toPercent(arr, u, true);
            else                // replace the first three array elements
                arr.splice(0, A, ...rgbToHxx(f, arr, u));
        }
        else if (C[v]) {        // v == color name
            if (!canConvert)
                Ez._onlyErr("CSS named colors", txt);
            //-----------------
            arr = C[v][f.name]; // no alpha, always 3 args
            if (f.isRGB)        // convert RGB to % as specified by u
                toPercent(arr, u);
            else {              // hue is in degrees
                const uHue = u[f.hueIndex];
                if (uHue && uHue != U.deg)
                    arr[f.hueIndex] *= Ez[uHue];
            }
        }
        else                    // v is probably a user value (vs. a DOM value)
            Ez._invalidErr("color", v, ["a color function with arguments",
                                        "a hex color #RRGGB(AA)",
                                        "a CSS named color"]);
        //---------
        if (!toNum)
            arr.forEach((n, i) => arr[i] = n + u[i]);
    }
//!!if (arr.length == A)            //!!until there's a way to handle missing
//!!    arr.push(toNum ? 1 : "1");  //!!optional params that don't default to 0.
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
    const
    obj = toHxx(rgb, u),
    sum = obj.min + obj.max,
    hsl = [obj.hue, , ];

    hsl[2] = sum / 2 * 100;       // L required to calculate S
    hsl[1] = obj.diff ? obj.diff / (hxx[2] < 50 ? sum : 2 - sum) * 100
                      : 0;        // S
    return hsl;
}
// rgbToHwb() converts 3 RGB integer values to HWB
function rgbToHwb(rgb, u) {
    const
    obj = toHxx(rgb, u),
    hwb = [obj.hue, , ];

    hwb[1] = 100 * obj.min;       // W
    hwb[2] = 100 * (1 - obj.max); // B

    return hwb;
}
// toHxx() helps rgbToHsl() and rgbToHwb() convert hue and max/min/diff
function toHxx(arr, u) {
    const R = 0, G = 1, B = 2,    // arr can contain numeric strings w/o units
    rgb = arr.slice(0, CFunc.A)   // strip alpha
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