export {rgbToHXX};

function rgbToHXX(arr, u, isHSL) { // converts array of rgb values to hsl|hwb
    const R = 0, G = 1, B = 2;
    const rgb = arr.slice(0, 3).map(v => v / 255);
    const obj = minMaxDiff(rgb);
    const hxx  = new Array(arr.length);
    if (arr.length > CFunc.A)
        hxx[CFunc.A] = arr[CFunc.A];
    if (obj.diff) {
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
        hxx[0] = hue;                    // H
    }
    else
        hxx[0] = 0;                      // H

    if (isHSL) {
        const sum = obj.min + obj.max;
        hxx[2] = sum / 2 * 100;          // L
        hxx[1] = obj.diff ? obj.diff / (hxx[2] < 50 ? sum : 2 - sum) * 100
                          : 0;           // S
    }
    else {
        hxx[1] = obj.min * 100;          // W
        hxx[2] = Ez.flip(obj.max) * 100; // B
    }
    return hxx;
}
function rgbToHSL(rgb, u) { return rgbToHXX(rgb, u, true); }
function rgbToHWB(rgb, u) { return rgbToHXX(rgb, u);       }

//  see https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F
function toLinearRGB(rgb) {
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
function rgbToXYZ(rgb) {
    const d65 = [
        [0.41239079926595934, 0.357584339383878,   0.1804807884018343 ],
        [0.21263900587151027, 0.715168678767756,   0.07219231536073371],
        [0.01933081871559182, 0.11919477979462598, 0.9505321522496607 ]];
    return matrix(CFunc.toLinearRGB(rgb), d65);
}
function rgbToXYZ_D50(rgb) {
    const d65_to_d50 = [
        [ 1.0479298208405488,   0.022946793341019088, -0.05019222954313557],
        [ 0.029627815688159344, 0.990434484573249,    -0.01707382502938514],
        [-0.009243058152591178, 0.015055144896577895,  0.7518742899580008 ]];
    return matrix(CFunc.rgbToXYZ(rgb), d65_to_d50);
}
//  and https://www.russellcottrell.com/photo/matrixCalculator.htm
//  and https://docs.opencv.org/3.4/de/d25/imgproc_color_conversions.html
function rgbToLab(rgb) {
    const d50   = [0.3457 / 0.3585, 1, (1 - 0.3457 - 0.3585) / 0.3585];
    const e     = 216 / 24389; //  6^3/29^3 = 0.008856 unrounded
    const deg   = 24389 / 27   // 29^3/ 3^3 = 903.3    unrounded
    const xyz   = CFunc.rgbToXYZ_D50(rgb).map((v, i) => v / d50[i]);
    let [x,y,z] = xyz.map(v => v > e ? Math.cbrt(v)
                                     : (deg * v + 16) / 116);
//      const L = xyz[1] > e ? y * 116 - 16
//                           : xyz[1] * deg;
    return [116 * y - 16,
            500 * (x - y),
            200 * (y - z)];
}
//  see https://bottosson.github.io/posts/oklab/
function rgbToOklab(rgb) {
    const m1 = [[0.4122214708, 0.5363325363, 0.0514459929],
                [0.2119034982, 0.6806995451, 0.1073969566],
                [0.0883024619, 0.2817188376, 0.6299787005]];
    const m2 = [[0.2104542553, 0.7936177850,-0.0040720468],
                [1.9779984951,-2.4285922050, 0.4505937099],
                [0.0259040371, 0.7827717662,-0.8086757660]];
    const lms = matrix(CFunc.toLinearRGB(rgb), m1)
                     .map(v => Math.cbrt(v));
    return matrix(lms, m2);
}
function rgbToLCH(rgb) {
    return labToLCH(CFunc.rgbToLab(rgb), rgb);
}
function rgbToOklch(rgb) {
    return labToLCH(CFunc.rgbToOklab(rgb), rgb);
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
function rgbToP3(rgb) {
    const matrix = [
        [ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684 ],
        [-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
        [ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872  ]];
    return toGammaRGB(matrix(CFunc.rgbToXYZ(rgb), matrix));
}
function rgbToA98(rgb) {
    const matrix = [
        [ 2.0415879038107465,   -0.5650069742788596, -0.34473135077832956],
        [-0.9692436362808795,    1.8759675015077202,  0.04155505740717557],
        [ 0.013444280632031142, -0.11836239223101838, 1.0151749943912054 ]];
    const pow = 256 / 563;
    return matrix(CFunc.rgbToXYZ(rgb), matrix)
                .map(v => Math.pow(Math.abs(v), pow) * Math.sign(v));
}
function rgbToProPhoto(rgb) { // no negative numbers converting from RGB
    const matrix = [
        [ 1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
        [-0.5446224939028347,  1.5082327413132781,   0.02053603239147973],
        [ 0,                   0,                    1.2119675456389454 ]];
    const e   = 1 / 512;
    const pow = 1 / 1.8;
    return matrix(CFunc.rgbToXYZ_D50(rgb), matrix)
                .map(v => v > e ? Math.pow(v, pow) : v * 16);
}
function rgbToRec2020(rgb) {  // no negative numbers converting from RGB
    const matrix = [
        [ 1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
        [-0.6666843518324892,    1.6164812366349395,   0.01576854581391113],
        [ 0.017639857445310783, -0.042770613257808524, 0.9421031212354738 ]];
    const beta  = 0.018053968510807;
    const alpha = Math.pow(beta, 0.55) * 10;
    return matrix(CFunc.rgbToXYZ(rgb), matrix)
                .map(v => v > beta ? alpha * Math.pow(v, 0.45) - (alpha - 1)
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
