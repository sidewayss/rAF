// Not exported by raf.js, easings is the only export, no imports.
//==============================================================================
// Easing calculators:
// #powIn(), #powOut(), and #bezier() all refer to *this* as a leg object.
// Except for #powIn(), #powOut(), and #bezier(), these methods are based on:
// https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts
//
// https://stackoverflow.com/a/26594370/4941356 says:
//   "As of April 2020, Chrome, Edge and Firefox show less than 1% difference
//    between Math.pow(), sequential multiplication, and ES6 exponentation."
export {easings};
const easings = [                  // easing functions for leg.ease
    [linear, sineIn,  circIn,  expoIn,  backIn,  elasticIn,  bounceIn,
     powIn,  bezier],
    [linear, sineOut, circOut, expoOut, backOut, elasticOut, bounceOut,
     powOut, bezier]
];
const twoPi3  = (2 * Math.PI) / 3; // for #elasticIn() and #elasticOut()

function linear (v) { return v; }
function sineIn (v) { return 1 - Math.cos((v * Math.PI) / 2); }
function sineOut(v) { return     Math.sin((v * Math.PI) / 2); }

function circIn (v) { return 1 - Math.sqrt(1 - Math.pow(v,     2)); }
function circOut(v) { return     Math.sqrt(1 - Math.pow(v - 1, 2)); }

function expoIn (v) { return     Math.pow(2,  10 * v - 10); }
function expoOut(v) { return 1 - Math.pow(2, -10 * v);      }

function backIn(v) {
        const v2 = v * v;
        return 2.70158 * v2 * v
             - 1.70158 * v2;
}
function backOut(v) {
        const v1 = v - 1;
        const v2 = v1 * v1;
        return 2.70158 * v2 * v1
             + 1.70158 * v2
             + 1;
}
function elasticIn(v) {
        if (v) {
            const byTen = v * 10;
            return -Math.pow(2, byTen - 10)
                  * Math.sin((byTen - 10.75) * twoPi3);
        }
        else
            return 0;
}
function elasticOut(v) {
        if (v) {
            const byTen = v * 10;
    		return  Math.pow(2, -byTen)
                  * Math.sin((byTen -  0.75) * twoPi3)
                  + 1;
        }
        else
            return 0;
}
function bounceIn (v) { return 1 - bounceOut(1 - v); }
function bounceOut(v) {
        const n1 = 7.5625;
        const d1 = 2.75;
        if (v < 1 / d1)
            return n1 * v * v;
        else if (v < 2 / d1)
            return n1 * (v -= 1.5   / d1) * v + 0.75;
        else if (v < 2.5 / d1)
            return n1 * (v -= 2.25  / d1) * v + 0.9375;
        else
            return n1 * (v -= 2.625 / d1) * v + 0.984375;
}
// this is a leg object, called as leg.ease()
function powIn (v) { return     Math.pow(v,     this.pow); }
function powOut(v) { return 1 - Math.pow(1 - v, this.pow); }

function bezier(v) { return this.bezier.solve(v, this.time); }