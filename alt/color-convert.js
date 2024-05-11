// This module is currently unused. The exported functions are named so that
// you can build the function name as "rgbTo" + camelCase(func.name|this.space).
// The functions are all one-way conversions from RGB to other color spaces.
// They only deal with the 3 main parameters for each space, excluding alpha.
export {rgbToHsl, rgbToHwb, rgbToLab, rgbToOklab, rgbToLch, rgbToOklch,
        rgbToSrgbLinear, rgbToXyz, rgbToXyzD65, rgbToXyzD50, rgbToDisplayP3,
        rgbToA98Rgb, rgbToProphotoRgb, rgbToRec2020};

function rgbToHXX(arr, u) { // converts the hue and max/min/diff
    const R = 0, G = 1, B = 2,
        rgb = arr.map(v => v / 255), // convert 0-255 to 0-1
        obj = minMaxDiff(rgb);

    obj.hxx = new Array(CFunc.A);
    if (!obj.diff)
        obj.hxx[0] = 0;               // H
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
            hue *= Ez[u];    // convert to grad, rad, or turn
        obj.hxx[0] = hue;             // H
    }
    return obj;
}
function rgbToHsl(rgb, u) {
    const obj = rgbToHXX(rgb, u);
    const sum = obj.min + obj.max;
    obj.hxx[2] = sum / 2 * 100;       // L required to calculate S
    obj.hxx[1] = obj.diff ? obj.diff / (hxx[2] < 50 ? sum : 2 - sum) * 100
                          : 0;        // S
    return obj.hxx;
}
function rgbToHwb(rgb, u) {
    const obj = rgbToHXX(rgb, u);
    obj.hxx[1] = 100 * obj.min;       // W
    obj.hxx[2] = 100 * (1 - obj.max); // B
    return obj.hxx;
}

//  see https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F
function rgbToSrgbLinear(rgb) {
    const lin = new Array(CFunc.A);
    for (var i = 0; i < CFunc.A; i++) {
        lin[i] = rgb[i] / 255;
        lin[i] = lin[i] >= 0.04045
               ? Math.pow(((lin[i] + 0.055) / 1.055), 2.4)
               : lin[i] / 12.92;
    }
    return lin;
}
function toGammaRGB(lin) { ////
    let abs;
    const pow = 1 / 2.4;
    const rgb = new Array(CFunc.A);
    for (var i = 0; i < CFunc.A; i++) {
        abs = Math.abs(lin[i]);
        rgb[i] = abs >= 0.0031308
               ? (1.055 * Math.pow(abs, pow) - 0.055) * Math.sign(lin[i])
               : lin[i] * 12.92;
    }
    return rgb;
}
//  see https://gist.github.com/Jakobeha/9e78643e63ea3e32dc3a04412d6f120c
function rgbToXyz(rgb) {
    const d65 = [
        [0.41239079926595934, 0.357584339383878,   0.1804807884018343 ],
        [0.21263900587151027, 0.715168678767756,   0.07219231536073371],
        [0.01933081871559182, 0.11919477979462598, 0.9505321522496607 ]];
    return matrix(rgbToSrgbLinear(rgb), d65);
}
const rgbToXyzD65 = rgbToXyz;
function rgbToXyzD50(rgb) {
    const d65_to_d50 = [
        [ 1.0479298208405488,   0.022946793341019088, -0.05019222954313557],
        [ 0.029627815688159344, 0.990434484573249,    -0.01707382502938514],
        [-0.009243058152591178, 0.015055144896577895,  0.7518742899580008 ]];
    return matrix(rgbToXyz(rgb), d65_to_d50);
}
//  and https://www.russellcottrell.com/photo/matrixCalculator.htm
//  and https://docs.opencv.org/3.4/de/d25/imgproc_color_conversions.html
function rgbToLab(rgb) {
    const X = 0.3457;        // 0.345704 according to cotrell
    const Y = 0.3585;        // 0.35854  ditto
    const d50 = [X / Y, 1, (1 - X - Y) / Y];
    const xyz = rgbToXyzD50(rgb).map((v, i) => v / d50[i]);
    const e   = 216 / 24389; //  6^3/29^3 = 0.008856 unrounded
    const deg = 24389 / 27;  // 29^3/ 3^3 = 903.3    unrounded

    const [x,y,z] = xyz.map(v => v > e ? Math.cbrt(v)
                                       : (deg * v + 16) / 116);
    return [116 * y - 16,
            500 * (x - y),
            200 * (y - z)];
//
//  const L = xyz[1] > e ? y * 116 - 16
//                       : xyz[1] * deg;
}
//  see https://bottosson.github.io/posts/oklab/
function rgbToOklab(rgb) {
    const m1 = [[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]];
    const m2 = [[0.2104542553, 0.7936177850,-0.0040720468],
                [1.9779984951,-2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662,-0.8086757660]];
    const lms = matrix(rgbToSrgbLinear(rgb), m1).map(v => Math.cbrt(v));
    return matrix(lms, m2);
}
function rgbToLch(rgb) {
    return labToLCH(rgbToLab(rgb), rgb);
}
function rgbToOklch(rgb) {
    return labToLCH(rgbToOklab(rgb), rgb);
}
function labToLCH(lab, rgb) { ////
    const [L, a, b] = lab;
    const h = minMaxDiff(rgb).diff
            ? Math.atan2(b, a) / Math.PI * 180
            : 0;
    return [L,
            Math.hypot(a, b),
            constrainAngle(h)];
}
function rgbToDisplayP3(rgb) {
    const matrix = [
        [ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684 ],
        [-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
        [ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872  ]];
    return toGammaRGB(matrix(rgbToXyz(rgb), matrix));
}
function rgbToA98Rgb(rgb) {
    const matrix = [
        [ 2.0415879038107465,   -0.5650069742788596, -0.34473135077832956],
        [-0.9692436362808795,    1.8759675015077202,  0.04155505740717557],
        [ 0.013444280632031142, -0.11836239223101838, 1.0151749943912054 ]];
    const pow = 256 / 563;
    return matrix(rgbToXyz(rgb), matrix).map(v =>
        Math.pow(Math.abs(v), pow) * Math.sign(v));
}
function rgbToProphotoRgb(rgb) { // no negative numbers converting from RGB
    const matrix = [
        [ 1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
        [-0.5446224939028347,  1.5082327413132781,   0.02053603239147973],
        [ 0,                   0,                    1.2119675456389454 ]];
    const e   = 1 / 512;
    const pow = 1 / 1.8;
    return matrix(rgbToXyzD50(rgb), matrix).map(v =>
        v > e ? Math.pow(v, pow)
              : v * 16);
}
function rgbToRec2020(rgb) { // no negative numbers converting from RGB
    const matrix = [
        [ 1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
        [-0.6666843518324892,    1.6164812366349395,   0.01576854581391113],
        [ 0.017639857445310783, -0.042770613257808524, 0.9421031212354738 ]];
    const beta  = 0.018053968510807;
    const alpha = Math.pow(beta, 0.55) * 10;
    return matrix(rgbToXyz(rgb), matrix).map(v =>
        v > beta ? alpha * Math.pow(v, 0.45) - (alpha - 1)
                 : v * 4.5);
}
function matrix(src, matrix) { ////
    return matrix.map((row) =>
        row.reduce((sum, v, i) => sum + v * src[i], 0)
    );
}
function minMaxDiff(rgb) { ////
    const obj = {};
    obj.min  = Math.min(...rgb);
    obj.max  = Math.max(...rgb);
    obj.diff = obj.max - obj.min;
    return obj;
}
//  see https://github.com/LeaVerou/color.js/blob/main/src/angles.js#L1
function constrainAngle(angle) { ////
    return ((angle % 360) + 360) % 360;
}
