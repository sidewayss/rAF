////////////////////////////////////////////////////////////////////////////////
// rAF stands for requestAnimationFrame().  It is a JavaScript animation library
// for CSS and SVG. Copyright (C) 2023 Sideways S, www.sidewayss.com
////////////////////////////////////////////////////////////////////////////////
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details: <https://www.gnu.org/licenses/>
////////////////////////////////////////////////////////////////////////////////
"use strict";
// These consts are populated by Ez.init() in this order:
const U  = {pct:"%"};   // units, e.g. "px", "deg"
const F  = {};          // function names
const P  = {};          // property and attribute names
const HD = {};          // bitmasks for CSS L4 (UHD) color functions
const C = {             // PFactory.init() adds bitmasks for argument indexes
    aliceblue           :{rgb:[240,248,255], hsl:[208.0,100.0, 97.1], hwb:[208.0, 94.1,  0.0]},
    antiquewhite        :{rgb:[250,235,215], hsl:[ 34.3, 77.8, 91.2], hwb:[ 34.3, 84.3,  2.0]},
    aqua                :{rgb:[  0,255,255], hsl:[180.0,100.0, 50.0], hwb:[180.0,  0.0,  0.0]},
    aquamarine          :{rgb:[127,255,212], hsl:[159.8,100.0, 74.9], hwb:[159.8, 49.8,  0.0]},
    azure               :{rgb:[240,255,255], hsl:[180.0,100.0, 97.1], hwb:[180.0, 94.1,  0.0]},
    beige               :{rgb:[245,245,220], hsl:[ 60.0, 55.6, 91.2], hwb:[ 60.0, 86.3,  3.9]},
    bisque              :{rgb:[255,228,196], hsl:[ 32.5,100.0, 88.4], hwb:[ 32.5, 76.9,  0.0]},
    black               :{rgb:[  0,  0,  0], hsl:[  0.0,  0.0,  0.0], hwb:[  0.0,  0.0,100.0]},
    blanchedalmond      :{rgb:[255,235,205], hsl:[ 36.0,100.0, 90.2], hwb:[ 36.0, 80.4,  0.0]},
    blue                :{rgb:[  0,  0,255], hsl:[240.0,100.0, 50.0], hwb:[240.0,  0.0,  0.0]},
    blueviolet          :{rgb:[138, 43,226], hsl:[271.1, 75.9, 52.7], hwb:[271.1, 16.9, 11.4]},
    brown               :{rgb:[165, 42, 42], hsl:[  0.0, 59.4, 40.6], hwb:[  0.0, 16.5, 35.3]},
    burlywood           :{rgb:[222,184,135], hsl:[ 33.8, 56.9, 70.0], hwb:[ 33.8, 52.9, 12.9]},
    cadetblue           :{rgb:[ 95,158,160], hsl:[181.8, 25.5, 50.0], hwb:[181.8, 37.3, 37.3]},
    chartreuse          :{rgb:[127,255,  0], hsl:[ 90.1,100.0, 50.0], hwb:[ 90.1,  0.0,  0.0]},
    chocolate           :{rgb:[210,105, 30], hsl:[ 25.0, 75.0, 47.1], hwb:[ 25.0, 11.8, 17.6]},
    coral               :{rgb:[255,127, 80], hsl:[ 16.1,100.0, 65.7], hwb:[ 16.1, 31.4,  0.0]},
    cornflowerblue      :{rgb:[100,149,237], hsl:[218.5, 79.2, 66.1], hwb:[218.5, 39.2,  7.1]},
    cornsilk            :{rgb:[255,248,220], hsl:[ 48.0,100.0, 93.1], hwb:[ 48.0, 86.3,  0.0]},
    crimson             :{rgb:[220, 20, 60], hsl:[348.0, 83.3, 47.1], hwb:[348.0,  7.8, 13.7]},
    cyan                :{rgb:[  0,255,255], hsl:[180.0,100.0, 50.0], hwb:[180.0,  0.0,  0.0]},
    darkblue            :{rgb:[  0,  0,139], hsl:[240.0,100.0, 27.3], hwb:[240.0,  0.0, 45.5]},
    darkcyan            :{rgb:[  0,139,139], hsl:[180.0,100.0, 27.3], hwb:[180.0,  0.0, 45.5]},
    darkgoldenrod       :{rgb:[184,134, 11], hsl:[ 42.7, 88.7, 38.2], hwb:[ 42.7,  4.3, 27.8]},
    darkgray            :{rgb:[169,169,169], hsl:[  0.0,  0.0, 66.3], hwb:[  0.0, 66.3, 33.7]},
    darkgreen           :{rgb:[  0,100,  0], hsl:[120.0,100.0, 19.6], hwb:[120.0,  0.0, 60.8]},
    darkgrey            :{rgb:[169,169,169], hsl:[  0.0,  0.0, 66.3], hwb:[  0.0, 66.3, 33.7]},
    darkkhaki           :{rgb:[189,183,107], hsl:[ 55.6, 38.3, 58.0], hwb:[ 55.6, 42.0, 25.9]},
    darkmagenta         :{rgb:[139,  0,139], hsl:[300.0,100.0, 27.3], hwb:[300.0,  0.0, 45.5]},
    darkolivegreen      :{rgb:[ 85,107, 47], hsl:[ 82.0, 39.0, 30.2], hwb:[ 82.0, 18.4, 58.0]},
    darkorange          :{rgb:[255,140,  0], hsl:[ 32.9,100.0, 50.0], hwb:[ 32.9,  0.0,  0.0]},
    darkorchid          :{rgb:[153, 50,204], hsl:[280.1, 60.6, 49.8], hwb:[280.1, 19.6, 20.0]},
    darkred             :{rgb:[139,  0,  0], hsl:[  0.0,100.0, 27.3], hwb:[  0.0,  0.0, 45.5]},
    darksalmon          :{rgb:[233,150,122], hsl:[ 15.1, 71.6, 69.6], hwb:[ 15.1, 47.8,  8.6]},
    darkseagreen        :{rgb:[143,188,143], hsl:[120.0, 25.1, 64.9], hwb:[120.0, 56.1, 26.3]},
    darkslateblue       :{rgb:[ 72, 61,139], hsl:[248.5, 39.0, 39.2], hwb:[248.5, 23.9, 45.5]},
    darkslategray       :{rgb:[ 47, 79, 79], hsl:[180.0, 25.4, 24.7], hwb:[180.0, 18.4, 69.0]},
    darkslategrey       :{rgb:[ 47, 79, 79], hsl:[180.0, 25.4, 24.7], hwb:[180.0, 18.4, 69.0]},
    darkturquoise       :{rgb:[  0,206,209], hsl:[180.9,100.0, 41.0], hwb:[180.9,  0.0, 18.0]},
    darkviolet          :{rgb:[148,  0,211], hsl:[282.1,100.0, 41.4], hwb:[282.1,  0.0, 17.3]},
    deeppink            :{rgb:[255, 20,147], hsl:[327.6,100.0, 53.9], hwb:[327.6,  7.8,  0.0]},
    deepskyblue         :{rgb:[  0,191,255], hsl:[195.1,100.0, 50.0], hwb:[195.1,  0.0,  0.0]},
    dimgray             :{rgb:[105,105,105], hsl:[  0.0,  0.0, 41.2], hwb:[  0.0, 41.2, 58.8]},
    dimgrey             :{rgb:[105,105,105], hsl:[  0.0,  0.0, 41.2], hwb:[  0.0, 41.2, 58.8]},
    dodgerblue          :{rgb:[ 30,144,255], hsl:[209.6,100.0, 55.9], hwb:[209.6, 11.8,  0.0]},
    firebrick           :{rgb:[178, 34, 34], hsl:[  0.0, 67.9, 41.6], hwb:[  0.0, 13.3, 30.2]},
    floralwhite         :{rgb:[255,250,240], hsl:[ 40.0,100.0, 97.1], hwb:[ 40.0, 94.1,  0.0]},
    forestgreen         :{rgb:[ 34,139, 34], hsl:[120.0, 60.7, 33.9], hwb:[120.0, 13.3, 45.5]},
    fuchsia             :{rgb:[255,  0,255], hsl:[300.0,100.0, 50.0], hwb:[300.0,  0.0,  0.0]},
    gainsboro           :{rgb:[220,220,220], hsl:[  0.0,  0.0, 86.3], hwb:[  0.0, 86.3, 13.7]},
    ghostwhite          :{rgb:[248,248,255], hsl:[240.0,100.0, 98.6], hwb:[240.0, 97.3,  0.0]},
    gold                :{rgb:[255,215,  0], hsl:[ 50.6,100.0, 50.0], hwb:[ 50.6,  0.0,  0.0]},
    goldenrod           :{rgb:[218,165, 32], hsl:[ 42.9, 74.4, 49.0], hwb:[ 42.9, 12.5, 14.5]},
    gray                :{rgb:[128,128,128], hsl:[  0.0,  0.0, 50.2], hwb:[  0.0, 50.2, 49.8]},
    green               :{rgb:[  0,128,  0], hsl:[120.0,100.0, 25.1], hwb:[120.0,  0.0, 49.8]},
    greenyellow         :{rgb:[173,255, 47], hsl:[ 83.7,100.0, 59.2], hwb:[ 83.7, 18.4,  0.0]},
    grey                :{rgb:[128,128,128], hsl:[  0.0,  0.0, 50.2], hwb:[  0.0, 50.2, 49.8]},
    honeydew            :{rgb:[240,255,240], hsl:[120.0,100.0, 97.1], hwb:[120.0, 94.1,  0.0]},
    hotpink             :{rgb:[255,105,180], hsl:[330.0,100.0, 70.6], hwb:[330.0, 41.2,  0.0]},
    indianred           :{rgb:[205, 92, 92], hsl:[  0.0, 53.1, 58.2], hwb:[  0.0, 36.1, 19.6]},
    indigo              :{rgb:[ 75,  0,130], hsl:[274.6,100.0, 25.5], hwb:[274.6,  0.0, 49.0]},
    ivory               :{rgb:[255,255,240], hsl:[ 60.0,100.0, 97.1], hwb:[ 60.0, 94.1,  0.0]},
    khaki               :{rgb:[240,230,140], hsl:[ 54.0, 76.9, 74.5], hwb:[ 54.0, 54.9,  5.9]},
    lavender            :{rgb:[230,230,250], hsl:[240.0, 66.7, 94.1], hwb:[240.0, 90.2,  2.0]},
    lavenderblush       :{rgb:[255,240,245], hsl:[340.0,100.0, 97.1], hwb:[340.0, 94.1,  0.0]},
    lawngreen           :{rgb:[124,252,  0], hsl:[ 90.5,100.0, 49.4], hwb:[ 90.5,  0.0,  1.2]},
    lemonchiffon        :{rgb:[255,250,205], hsl:[ 54.0,100.0, 90.2], hwb:[ 54.0, 80.4,  0.0]},
    lightblue           :{rgb:[173,216,230], hsl:[194.7, 53.3, 79.0], hwb:[194.7, 67.8,  9.8]},
    lightcoral          :{rgb:[240,128,128], hsl:[  0.0, 78.9, 72.2], hwb:[  0.0, 50.2,  5.9]},
    lightcyan           :{rgb:[224,255,255], hsl:[180.0,100.0, 93.9], hwb:[180.0, 87.8,  0.0]},
    lightgoldenrodyellow:{rgb:[250,250,210], hsl:[ 60.0, 80.0, 90.2], hwb:[ 60.0, 82.4,  2.0]},
    lightgray           :{rgb:[211,211,211], hsl:[  0.0,  0.0, 82.7], hwb:[  0.0, 82.7, 17.3]},
    lightgreen          :{rgb:[144,238,144], hsl:[120.0, 73.4, 74.9], hwb:[120.0, 56.5,  6.7]},
    lightgrey           :{rgb:[211,211,211], hsl:[  0.0,  0.0, 82.7], hwb:[  0.0, 82.7, 17.3]},
    lightpink           :{rgb:[255,182,193], hsl:[351.0,100.0, 85.7], hwb:[351.0, 71.4,  0.0]},
    lightsalmon         :{rgb:[255,160,122], hsl:[ 17.1,100.0, 73.9], hwb:[ 17.1, 47.8,  0.0]},
    lightseagreen       :{rgb:[ 32,178,170], hsl:[176.7, 69.5, 41.2], hwb:[176.7, 12.5, 30.2]},
    lightskyblue        :{rgb:[135,206,250], hsl:[203.0, 92.0, 75.5], hwb:[203.0, 52.9,  2.0]},
    lightslategray      :{rgb:[119,136,153], hsl:[210.0, 14.3, 53.3], hwb:[210.0, 46.7, 40.0]},
    lightslategrey      :{rgb:[119,136,153], hsl:[210.0, 14.3, 53.3], hwb:[210.0, 46.7, 40.0]},
    lightsteelblue      :{rgb:[176,196,222], hsl:[213.9, 41.1, 78.0], hwb:[213.9, 69.0, 12.9]},
    lightyellow         :{rgb:[255,255,224], hsl:[ 60.0,100.0, 93.9], hwb:[ 60.0, 87.8,  0.0]},
    lime                :{rgb:[  0,255,  0], hsl:[120.0,100.0, 50.0], hwb:[120.0,  0.0,  0.0]},
    limegreen           :{rgb:[ 50,205, 50], hsl:[120.0, 60.8, 50.0], hwb:[120.0, 19.6, 19.6]},
    linen               :{rgb:[250,240,230], hsl:[ 30.0, 66.7, 94.1], hwb:[ 30.0, 90.2,  2.0]},
    magenta             :{rgb:[255,  0,255], hsl:[300.0,100.0, 50.0], hwb:[300.0,  0.0,  0.0]},
    maroon              :{rgb:[128,  0,  0], hsl:[  0.0,100.0, 25.1], hwb:[  0.0,  0.0, 49.8]},
    mediumaquamarine    :{rgb:[102,205,170], hsl:[159.6, 50.7, 60.2], hwb:[159.6, 40.0, 19.6]},
    mediumblue          :{rgb:[  0,  0,205], hsl:[240.0,100.0, 40.2], hwb:[240.0,  0.0, 19.6]},
    mediumorchid        :{rgb:[186, 85,211], hsl:[288.1, 58.9, 58.0], hwb:[288.1, 33.3, 17.3]},
    mediumpurple        :{rgb:[147,112,219], hsl:[259.6, 59.8, 64.9], hwb:[259.6, 43.9, 14.1]},
    mediumseagreen      :{rgb:[ 60,179,113], hsl:[146.7, 49.8, 46.9], hwb:[146.7, 23.5, 29.8]},
    mediumslateblue     :{rgb:[123,104,238], hsl:[248.5, 79.8, 67.1], hwb:[248.5, 40.8,  6.7]},
    mediumspringgreen   :{rgb:[  0,250,154], hsl:[157.0,100.0, 49.0], hwb:[157.0,  0.0,  2.0]},
    mediumturquoise     :{rgb:[ 72,209,204], hsl:[177.8, 59.8, 55.1], hwb:[177.8, 28.2, 18.0]},
    mediumvioletred     :{rgb:[199, 21,133], hsl:[322.2, 80.9, 43.1], hwb:[322.2,  8.2, 22.0]},
    midnightblue        :{rgb:[ 25, 25,112], hsl:[240.0, 63.5, 26.9], hwb:[240.0,  9.8, 56.1]},
    mintcream           :{rgb:[245,255,250], hsl:[150.0,100.0, 98.0], hwb:[150.0, 96.1,  0.0]},
    mistyrose           :{rgb:[255,228,225], hsl:[  6.0,100.0, 94.1], hwb:[  6.0, 88.2,  0.0]},
    moccasin            :{rgb:[255,228,181], hsl:[ 38.1,100.0, 85.5], hwb:[ 38.1, 71.0,  0.0]},
    navajowhite         :{rgb:[255,222,173], hsl:[ 35.9,100.0, 83.9], hwb:[ 35.9, 67.8,  0.0]},
    navy                :{rgb:[  0,  0,128], hsl:[240.0,100.0, 25.1], hwb:[240.0,  0.0, 49.8]},
    oldlace             :{rgb:[253,245,230], hsl:[ 39.1, 85.2, 94.7], hwb:[ 39.1, 90.2,  0.8]},
    olive               :{rgb:[128,128,  0], hsl:[ 60.0,100.0, 25.1], hwb:[ 60.0,  0.0, 49.8]},
    olivedrab           :{rgb:[107,142, 35], hsl:[ 79.6, 60.5, 34.7], hwb:[ 79.6, 13.7, 44.3]},
    orange              :{rgb:[255,165,  0], hsl:[ 38.8,100.0, 50.0], hwb:[ 38.8,  0.0,  0.0]},
    orangered           :{rgb:[255, 69,  0], hsl:[ 16.2,100.0, 50.0], hwb:[ 16.2,  0.0,  0.0]},
    orchid              :{rgb:[218,112,214], hsl:[302.3, 58.9, 64.7], hwb:[302.3, 43.9, 14.5]},
    palegoldenrod       :{rgb:[238,232,170], hsl:[ 54.7, 66.7, 80.0], hwb:[ 54.7, 66.7,  6.7]},
    palegreen           :{rgb:[152,251,152], hsl:[120.0, 92.5, 79.0], hwb:[120.0, 59.6,  1.6]},
    paleturquoise       :{rgb:[175,238,238], hsl:[180.0, 64.9, 81.0], hwb:[180.0, 68.6,  6.7]},
    palevioletred       :{rgb:[219,112,147], hsl:[340.4, 59.8, 64.9], hwb:[340.4, 43.9, 14.1]},
    papayawhip          :{rgb:[255,239,213], hsl:[ 37.1,100.0, 91.8], hwb:[ 37.1, 83.5,  0.0]},
    peachpuff           :{rgb:[255,218,185], hsl:[ 28.3,100.0, 86.3], hwb:[ 28.3, 72.5,  0.0]},
    peru                :{rgb:[205,133, 63], hsl:[ 29.6, 58.7, 52.5], hwb:[ 29.6, 24.7, 19.6]},
    pink                :{rgb:[255,192,203], hsl:[349.5,100.0, 87.6], hwb:[349.5, 75.3,  0.0]},
    plum                :{rgb:[221,160,221], hsl:[300.0, 47.3, 74.7], hwb:[300.0, 62.7, 13.3]},
    powderblue          :{rgb:[176,224,230], hsl:[186.7, 51.9, 79.6], hwb:[186.7, 69.0,  9.8]},
    purple              :{rgb:[128,  0,128], hsl:[300.0,100.0, 25.1], hwb:[300.0,  0.0, 49.8]},
    rebeccapurple       :{rgb:[102, 51,153], hsl:[270.0, 50.0, 40.0], hwb:[270.0, 20.0, 40.0]},
    red                 :{rgb:[255,  0,  0], hsl:[  0.0,100.0, 50.0], hwb:[  0.0,  0.0,  0.0]},
    rosybrown           :{rgb:[188,143,143], hsl:[  0.0, 25.1, 64.9], hwb:[  0.0, 56.1, 26.3]},
    royalblue           :{rgb:[ 65,105,225], hsl:[225.0, 72.7, 56.9], hwb:[225.0, 25.5, 11.8]},
    saddlebrown         :{rgb:[139, 69, 19], hsl:[ 25.0, 75.9, 31.0], hwb:[ 25.0,  7.5, 45.5]},
    salmon              :{rgb:[250,128,114], hsl:[  6.2, 93.2, 71.4], hwb:[  6.2, 44.7,  2.0]},
    sandybrown          :{rgb:[244,164, 96], hsl:[ 27.6, 87.1, 66.7], hwb:[ 27.6, 37.6,  4.3]},
    seagreen            :{rgb:[ 46,139, 87], hsl:[146.5, 50.3, 36.3], hwb:[146.5, 18.0, 45.5]},
    seashell            :{rgb:[255,245,238], hsl:[ 24.7,100.0, 96.7], hwb:[ 24.7, 93.3,  0.0]},
    sienna              :{rgb:[160, 82, 45], hsl:[ 19.3, 56.1, 40.2], hwb:[ 19.3, 17.6, 37.3]},
    silver              :{rgb:[192,192,192], hsl:[  0.0,  0.0, 75.3], hwb:[  0.0, 75.3, 24.7]},
    skyblue             :{rgb:[135,206,235], hsl:[197.4, 71.4, 72.5], hwb:[197.4, 52.9,  7.8]},
    slateblue           :{rgb:[106, 90,205], hsl:[248.3, 53.5, 57.8], hwb:[248.3, 35.3, 19.6]},
    slategray           :{rgb:[112,128,144], hsl:[210.0, 12.6, 50.2], hwb:[210.0, 43.9, 43.5]},
    slategrey           :{rgb:[112,128,144], hsl:[210.0, 12.6, 50.2], hwb:[210.0, 43.9, 43.5]},
    snow                :{rgb:[255,250,250], hsl:[  0.0,100.0, 99.0], hwb:[  0.0, 98.0,  0.0]},
    springgreen         :{rgb:[  0,255,127], hsl:[149.9,100.0, 50.0], hwb:[149.9,  0.0,  0.0]},
    steelblue           :{rgb:[ 70,130,180], hsl:[207.3, 44.0, 49.0], hwb:[207.3, 27.5, 29.4]},
    tan                 :{rgb:[210,180,140], hsl:[ 34.3, 43.8, 68.6], hwb:[ 34.3, 54.9, 17.6]},
    teal                :{rgb:[  0,128,128], hsl:[180.0,100.0, 25.1], hwb:[180.0,  0.0, 49.8]},
    thistle             :{rgb:[216,191,216], hsl:[300.0, 24.3, 79.8], hwb:[300.0, 74.9, 15.3]},
    tomato              :{rgb:[255, 99, 71], hsl:[  9.1,100.0, 63.9], hwb:[  9.1, 27.8,  0.0]},
    turquoise           :{rgb:[ 64,224,208], hsl:[174.0, 72.1, 56.5], hwb:[174.0, 25.1, 12.2]},
    violet              :{rgb:[238,130,238], hsl:[300.0, 76.1, 72.2], hwb:[300.0, 51.0,  6.7]},
    wheat               :{rgb:[245,222,179], hsl:[ 39.1, 76.7, 83.1], hwb:[ 39.1, 70.2,  3.9]},
    white               :{rgb:[255,255,255], hsl:[  0.0,  0.0,100.0], hwb:[  0.0,100.0,  0.0]},
    whitesmoke          :{rgb:[245,245,245], hsl:[  0.0,  0.0, 96.1], hwb:[  0.0, 96.1,  3.9]},
    yellow              :{rgb:[255,255,  0], hsl:[ 60.0,100.0, 50.0], hwb:[ 60.0,  0.0,  0.0]},
    yellowgreen         :{rgb:[154,205, 50], hsl:[ 79.7, 60.8, 50.0], hwb:[ 79.7, 19.6, 19.6]}
};
const E  = {          // PFactory.init() adds enums
      comsp:/[,\s]+/,     currentValue:null,   value:"value", unit:"unit",
       func:/[\(\)]/,               cV:null,                  comp:"comp",
    sepfunc:/[,\s\(\)]+/g,          lp:'(', // lp, rp, sp, comma:
       caps:/[A-Z]/g,               rp:')', // because '(', ')', ' ', and ','
       nums: /-?[\d\.]+/g,          sp:' ', // in code can be confusing.
     numBeg:/^-?[\d\.]+/ ,       comma:',',
     numEnd: /-?[\d\.]+$/,      prefix:"E." // for accessing E via strings
};
const Ease = {        // collection of preset easing names/values, see Ez.init()
    ease:[{bezier:[0.25, 0.1, 0.25, 1.0]}] // I can't think of a better name
};

// Helpful boolean functions wrapped-up in a const Object, eminently inlineable
const Is = {
    def     (v) { return v !== undefined;  },
    Number  (v) { return typeof v == "number"; }, //++return "toFixed" in Object(v);
    String  (v) { return typeof v == "string"; },
    Element (v) { return v?.tagName  !== undefined; },
    CSSRule (v) { return v?.styleMap !== undefined; },
    SVG     (v) { return v instanceof SVGElement; },
    A       (v) { return Array.isArray(v); },
    A2      (v) { return Array.isArray(v) && v.some(a => Array.isArray(a)); },
    Arrayish(v) {
        try {   // Array.from() converts iterables and "array-like"
            return (Symbol.iterator in v || v.length >= 0)
               && !(typeof v == "string"); // exclude strings
        } catch {
            return false;
        }
    }
}
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| Prop classes: Func, Prop, Ez |||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
class Func {                     //\ Func: CSS or SVG function
    #units; #separator;           // c = count, r = required, s = separator
    constructor(name, units, utype, c, r, s = E.comma) {
        Ez.readOnly(this, "name", name);
        Ez.readOnly(this, utype,  true);
        if (!Is.def(c)) {         // else called from sub-class constructor
            switch (name) {
            case F.dS:            // units = px
                units = [units, units, units, ""];
                Ez.is(this, "DropShadow");
                s = E.sp;
                c = 4; r = 2; break;
            case F.cubicBezier:   // no units
                c = 4; r = 4; break;
            case F.skew:          // units = "" for transforms
            case F.scale: case F.translate:
                c = 2; r = 1; break;
            case F.rotate:        // values for CSS rotate()
                c = 1; r = 1; break;
            case F.matrix:
                c = 6; r = 6; break;
            case F.scale3d: case F.translate3d:
                c = 3; r = 3; break;
            case F.rotate3d:      // 4th arg is <angle>
                c = 4; r = 4;
                units = ["", "", "", units];
                Ez.is(this, "Rotate3d");
                break;
            case F.matrix3d:
                c = 16; r = 16; break
            default:              // 1 arg or N args, N args = isUn
                const n = Number(!this.IsUn);
                c = n;            // isUn never uses count/required internally,
                r = n;            // but 0 is a better value than 1.
            }
        }
        Ez.readOnly(this, "count",    c); // count    = total    argument count
        Ez.readOnly(this, "required", r); // required = required argument count
        this.#units = units;
        this.#separator = s;
        Ez.is(this, "Func"); // doubles with isCFunc, isColorFunc, isSRFunc
    }
    get units()  {
        return !Is.A(this.#units) ? this.#units
             : this.isRotate3d    ? this.#units[3]
                                  : this.#units[0];
    }
    set units(val) { // units arrays are a necessary hassle
        val = Ez._validUnits(val, this.name, this);
        if (this.isCFunc) {
            if (this.hasHue) {
                if (this.isHXX)
                    this.#units[0] = val;
                else // lch, oklch
                    this.#units.fill(val, 0, CFunc.A - 1);
            }
            else
                this.#units.fill(val, 0, CFunc.A);
        }
        else
            this.isSRFunc     ? this.#units.fill(val)
          : this.isDropShadow ? this.#units.fill(val, 0, 3)
          : this.isRotate3d   ? this.#units[3] = val
                              : this.#units    = val;
    }
// Backdoors for CFunc, assume previous validation of val:
    get _alphaU()    { return this.#units[CFunc.A]; }
    set _alphaU(val) { this.#units[CFunc.A] = val; }

    get _hueU()    { return this.#units[this.isHXX ? 0 : 2]; }
    set _hueU(val) { this.#units[this.isHXX ? 0 : 2] = val;  }

// this._u opens the backdoor to #units. PBase has it too, but write-only.
    get _u()  { return this.#units; }
    set _u(u) { this.#units = u;    }

// this.prefix helps apply(), ColorFunc.prototype overrides it
    get prefix() {
        return this.name + E.lp;
    }
//  apply()
    apply(val) {
        return this.prefix + val + E.rp;
    }
//  join()
    join(arr, u = this.#units) {
        Ez._join(arr, u, this.#separator);
    }

//  _seps() sets o.seps to a dense array of concatenated units + separators,
//   bookended as ["func(", ..., "u)"]. Leaves o.numBeg & o.numEnd booleans
//   undefined. Returns a value as a convenience for Easy.#plugCV().
//   c = arg count, u = units, s = seps, us = combined units + seps
    _seps(o) {
        const c  = o.c;              // normalize u to array:
        const u  = Is.A(o.u) ? o.u : new Array(c).fill(o.u);
        const us = new Array(c + 1); // the target array of units + separators

        o.numBeg = false;
        o.numEnd = false;
        us[0] = this.prefix;         // the bookends
        us[c] = u[c - 1] + E.rp;
        if (c > 1) {                 // 1-arg func has no separators
            let i, s;
            s = this.#separator;     // s = separator
            if (!Is.A(s))            // normalize s to array
                s = new Array(c - 1).fill(s);
            for (i = 1, j = 0; i < c; i++, j++)
                us[i] = u[j] + s[j];
        }
        o.seps = us;
        return us;
    }
} // end class Func ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
class CFunc extends Func { ///////////\ CFunc: CSS color functions
    static _funcs = [];              // see static set alphaUnits()
    static A = 3;                    // alpha value index into arguments[]
    constructor(name, units, utype) {
        const u = (name[0] == "h")
                ? [units, U.pct, U.pct, units]  // units = ""
                : [units, units, units, units]; // alpha units set separately

        super(name, u, utype, CFunc.A + 1, CFunc.A, [E.sp, E.sp, " / "]);

        CFunc._funcs.push(this);
        Ez.is(this);
    }

    get alphaUnits() { return this._alphaU; }
    get hueUnits()   { return this.hasHue ? this._hueU : undefined; }

    set alphaUnits(val) {
        this._alphaU = Ez._validUnits(val, "alphaUnits", PFactory._emptyPct);
    }
    set hueUnits(val) {
        this._hueU   = Ez._validUnits(val, "hueUnits", PFactory._angles);
    }

    static set alphaUnits(val) {
        val = Ez._validUnits(val, "alphaUnits", PFactory._emptyPct);
        for (const f of this._funcs)
            f._alphaU = val;
    }
    static set hueUnits(val) {
        val = Ez._validUnits(val, "hueUnits", PFactory._angles);
        for (const f of this._funcs)
            if (f.hasHue)
                f._hueU = val;
    }
    /////////////////////////////////// color conversion for rgb, hsl, hwb /////
    // fromColor() converts hex, color name, or color function value to an array
    //             of 3 or 4 color function arguments.
    fromColor(v, toNum = true, u = this._u) {
        let n, toHXX;                // n = array of numeric values
        if (v.at(-1) == E.rp) {      // v = func(...arguments)
            n = v.split(E.sepfunc).slice(1, -1);
            if (n.length > this.count) {
                if (this.space)            // color() function = ColorFunc
                    n.splice(0, 1);
                if (n.length > this.count) // remove "/" separator from array
                    n.splice(CFunc.A, 1);
            }
            toHXX = this.isHXX && v.substring(0, F.rgb.length) == F.rgb;
            if (toNum || toHXX)
                n = n.map(m => parseFloat(m));
        }
        else  {
            if (C[v])                // v == color name
                n = this.isRGB ? C[v].rgb
                  : this.isHSL ? C[v].hsl
                               : C[v].hwb;
            else if (v[0] == "#") {  // v == hex RGB, RGBA, RRGGBB, RRGGBBAA
                let bxx, d, pct, rx;  // pct for final result as rgb only, else
                v   = v.substring(1); // converted later to hsl|hwb.
                bxx = v.length > 4;   // bxx = RR versus R, 6 or 8 versus 3 or 4
                rx  = new RegExp(`.{${bxx + 1}}`, "g");
                pct = this.isRGB && u[0] == U.pct;
                d   = pct ? 2.55 : 1;
                n   = v.match(rx).map(s => parseInt(bxx ? s : s + s, 16) / d);
                if (n.length == 4) {  // convert alpha value to correct units
                    let ap = (u[CFunc.A] == U.pct);
                    n[CFunc.A] /= pct ? (ap ? 1 : 100) : (ap ? 2.55 : 255);
                }
                toHXX = this.isHXX;
            }
        }
        if (n) {
            if (toHXX)
                n = CFunc.#toHXX(n, this.isHSL, u[0]);
            if (!toNum)
                n = n.map((num, i) => num + u[i]);
            return n;
        }
        return v;
    }
    static #toHXX(arr, u, isHSL) { // converts array of rgb values to hsl|hwb
        const R = 0, G = 1, B = 2;
        const rgb = arr.slice(0, 3).map(v => v / 255);
        const obj = CFunc.#minMaxDiff(rgb);
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
            hue = CFunc.#constrainAngle(hue * 60);
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
    static rgbToHSL(rgb, u) { return CFunc.#toHXX(rgb, u, true); }
    static rgbToHWB(rgb, u) { return CFunc.#toHXX(rgb, u);       }

//  see https://bottosson.github.io/posts/colorwrong/#what-can-we-do%3F
    static toLinearRGB(rgb) {
        const lin = new Array(CFunc.A);
        for (var i = 0; i < CFunc.A; i++) {
            lin[i] = rgb[i] / 255;
            lin[i] = lin[i] >= 0.04045
                   ? Math.pow(((lin[i] + 0.055) / 1.055), 2.4)
                   : lin[i] / 12.92;
        }
        return lin;
    }
    static #toGammaRGB(lin) {
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
    static rgbToXYZ(rgb) {
        const d65 = [
            [0.41239079926595934, 0.357584339383878,   0.1804807884018343 ],
            [0.21263900587151027, 0.715168678767756,   0.07219231536073371],
            [0.01933081871559182, 0.11919477979462598, 0.9505321522496607 ]];
        return CFunc.#matrix(CFunc.toLinearRGB(rgb), d65);
    }
    static rgbToXYZ_D50(rgb) {
        const d65_to_d50 = [
            [ 1.0479298208405488,   0.022946793341019088, -0.05019222954313557],
            [ 0.029627815688159344, 0.990434484573249,    -0.01707382502938514],
            [-0.009243058152591178, 0.015055144896577895,  0.7518742899580008 ]];
        return CFunc.#matrix(CFunc.rgbToXYZ(rgb), d65_to_d50);
    }
//  and https://www.russellcottrell.com/photo/matrixCalculator.htm
//  and https://docs.opencv.org/3.4/de/d25/imgproc_color_conversions.html
    static rgbToLab(rgb) {
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
    static rgbToOklab(rgb) {
        const m1 = [[0.4122214708, 0.5363325363, 0.0514459929],
                    [0.2119034982, 0.6806995451, 0.1073969566],
                    [0.0883024619, 0.2817188376, 0.6299787005]];
        const m2 = [[0.2104542553, 0.7936177850,-0.0040720468],
                    [1.9779984951,-2.4285922050, 0.4505937099],
                    [0.0259040371, 0.7827717662,-0.8086757660]];
        const lms = CFunc.#matrix(CFunc.toLinearRGB(rgb), m1)
                         .map(v => Math.cbrt(v));
        return CFunc.#matrix(lms, m2);
    }
    static rgbToLCH(rgb) {
        return CFunc.#labToLCH(CFunc.rgbToLab(rgb), rgb);
    }
    static rgbToOklch(rgb) {
        return CFunc.#labToLCH(CFunc.rgbToOklab(rgb), rgb);
    }
    static #labToLCH(lab, rgb) {
        const [L, a, b] = lab;
        const h = CFunc.#minMaxDiff(rgb).diff
                ? Math.atan2(b, a) / Math.PI * 180
                : 0;
        return [L,
                Math.hypot(a, b),
                CFunc.#constrainAngle(h)];
    }
    static rgbToP3(rgb) {
        const matrix = [
            [ 2.493496911941425,   -0.9313836179191239, -0.40271078445071684 ],
            [-0.8294889695615747,   1.7626640603183463,  0.023624685841943577],
            [ 0.03584583024378447, -0.07617238926804182, 0.9568845240076872  ]];
        return CFunc.#toGammaRGB(CFunc.#matrix(CFunc.rgbToXYZ(rgb), matrix));
    }
    static rgbToA98(rgb) {
        const matrix = [
            [ 2.0415879038107465,   -0.5650069742788596, -0.34473135077832956],
            [-0.9692436362808795,    1.8759675015077202,  0.04155505740717557],
            [ 0.013444280632031142, -0.11836239223101838, 1.0151749943912054 ]];
        const pow = 256 / 563;
        return CFunc.#matrix(CFunc.rgbToXYZ(rgb), matrix)
                    .map(v => Math.pow(Math.abs(v), pow) * Math.sign(v));
    }
    static rgbToProPhoto(rgb) { // no negative numbers converting from RGB
        const matrix = [
            [ 1.3457989731028281, -0.25558010007997534, -0.05110628506753401],
            [-0.5446224939028347,  1.5082327413132781,   0.02053603239147973],
            [ 0,                   0,                    1.2119675456389454 ]];
        const e   = 1 / 512;
        const pow = 1 / 1.8;
        return CFunc.#matrix(CFunc.rgbToXYZ_D50(rgb), matrix)
                    .map(v => v > e ? Math.pow(v, pow) : v * 16);
    }
    static rgbToRec2020(rgb) {  // no negative numbers converting from RGB
        const matrix = [
            [ 1.7166511879712674,   -0.35567078377639233, -0.25336628137365974],
            [-0.6666843518324892,    1.6164812366349395,   0.01576854581391113],
            [ 0.017639857445310783, -0.042770613257808524, 0.9421031212354738 ]];
        const beta  = 0.018053968510807;
        const alpha = Math.pow(beta, 0.55) * 10;
        return CFunc.#matrix(CFunc.rgbToXYZ(rgb), matrix)
                    .map(v => v > beta ? alpha * Math.pow(v, 0.45) - (alpha - 1)
                                       : v * 4.5);
    }
    static #matrix(src, matrix) {
        return matrix.map((row) =>
            row.reduce((sum, v, i) => sum + v * src[i], 0)
        );
    }
    static #minMaxDiff(rgb) {
        const obj = {};
        obj.min  = Math.min(...rgb);
        obj.max  = Math.max(...rgb);
        obj.diff = obj.max - obj.min;
        return obj;
    }
//  see https://github.com/LeaVerou/color.js/blob/main/src/angles.js#L1
    static #constrainAngle(angle) {
        return ((angle % 360) + 360) % 360;
    }
} // end class CFunc ///////////////////////////////////////////////////////////
class ColorFunc extends CFunc {     //\ Only for color(), only one instance
    // colorspace is the first argument, and the raison d'être for this class
    static #spaces = ["srgb","srgb-linear","a98-rgb","prophoto-rgb",
                      "display-p3","rec2020","xyz","xyz-d50","xyz-d65"];
    static #spaces_ex = [...this.#spaces,"a98rgb-linear","acescc","acescg",
        "hsv","ictcp","jzczhz","jzazbz","lab-d65","p3-linear","prophoto-linear",
        "rec2020-linear","rec2100hlg","rec2100pq","xyz-abs-d65",]
    #space = ColorFunc.#spaces[0];
    #isEx  = false;
    constructor() { super(...arguments); }

    get space()    { return this.#space; }
    set space(val) {
        if (ColorFunc.#spaces_ex.includes(val)) {
            this.#space = val;
            this.#isEx  = !ColorFunc.#spaces.includes(val);
        }
        else
            Ez._invalidErr("space", val, ColorFunc.#spaces_ex);
    }
    get prefix() { return `${this.name}(${this.space} `; }
}
//!!color-mix() currently set to "unstructured", obviating the need for CMixFunc.
//!!class CMixFunc extends CFunc {     //\ Only for color-mix(), only one instance
//!!    // colorspace is the first argument, hue-interpolation-method is the second
//!!    static #spaces = ["srgb","srgb-linear","lab","oklab","xyz","xyz-d50","xyz-d65",
//!!                      "hsl","hwb","lch","oklch"];
//!!    static #hues   = ["shorter","longer","increasing","decreasing"];
//!!    #space = CMixFunc.#spaces[0];
//!!    #hue   = CMixFunc.#hues  [0];
//!!
//!!    constructor() { super(...arguments); }
//!!
//!!    get space()    { return this.#space; }
//!!    set space(val) {
//!!        if (CMixFunc.#spaces.includes(val))
//!!            this.#space = val;
//!!        else
//!!            Ez._invalidErr("space", val, CMixFunc.#spaces);
//!!    }
//!!    get hue()    { return this.#space; }
//!!    set hue(val) {
//!!        if (CMixFunc.#hues.includes(val))
//!!            this.#hue = val;
//!!        else
//!!            Ez._invalidErr("hue", val, CMixFunc.#hues);
//!!    }
//!!    get prefix() {
//!!        const hue = (this.#hue == CMixFunc.#hues[0])
//!!                  ? "" // shorter is the default and ignored by the browsers
//!!                  : ` ${this.#hue} hue`;
//!!
//!!        return `${this.name}(in ${this.space}${hue}, `;
//!!    }
//!!}
class SRFunc extends Func {         //\ SR = <shape-radius>: circle(), ellipse()
    constructor(name, units, utype) {
        let c, r, s, u;
        const at = " at ";
        if (name == F.circle) {
            u = [units, units, units];
            c = 3;
            r = 1;
            s = [at, E.sp];
        }
        else { // ellipse
            u = [units, units, units, units];
            r = 2;
            c = 4;
            s = [E.sp, at, E.sp];
        }
        super(name, u, utype, c, r, s);
        Ez.is(this);
    }
} // end Func classes ||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
///|||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//    PBase: It should be PABase, but PBase is easier to pronounce, like P-Bass
class PBase {
    // Only font-family separates w/comma, and it's non-numeric, no value arrays
    static #separator = E.sp;
    #func; #units;
    constructor(name, units, utype, func, multiFunc) {
        Ez.readOnly(this, "name", name);
        this.#units = units;
        this.#func  = func;
        if (multiFunc)                // filter & transform, see PFactory.init()
            Ez.is(this, "MultiFunc");

        this.remove = this.cut;       // for pseudo-compatibility

        // utype = isUn | _noU | _noUPct | _len | _lenPct | _lenPctN | _ang
        Ez.readOnly(this, utype, true);
        Ez.is(this, "PBase");
    }
//  static _validate() validates PBase instances and converts from String
    static _validate(val, name, notUndef) {
        if (val?.isPBase)
            return val;
        if (Is.String(val)) {
            if (Prop[val])
                return Prop[val];
            else
                throw new Error(val + " is not a supported property or attribute.");
        }
        if (!Is.def(val)) {
            if (notUndef)
                Ez._mustBeErr(name, "defined");
            else
                return val;
        }
        Ez._mustBeErr(name, "a String or an instance of Prop: " + val);
    }
    get func() { return this.#func; }
    set func(val) {
        if (Is.def(val) || this.needsFunc) {
            if (!val?.isFunc)
                Ez._mustBeErr(
                    `${this.name}.func`,
                    `an instance of Func ${this.needsFunc ? "" : " or undefined"}`
                );
            else if (this.isColor && !val?.isColor)
                Ez._invalidErr("func", val?.name ?? val, PFactory.funcC,
                               `${this.name}.func`);
        }
        this.#func = val;
    }

    get units()    { return this.#units; }
    set units(val) { this.#units = Ez._validUnits(val, this.name, this); }
    set _u   (u)   { this.#units = u; } // the backdoor, Func has one too

//  _unitz() gets the active units, which might be the func's units
    _unitz(f = this.func) { return f?.units ?? this.units; }


//  join() joins an array of sub-values using the appropriate separators
    join(arr, f = this.func, u = this._unitz(f)) {
        return (f?.join ?? Ez._join)(arr, u, PBase.#separator);
    }
    static joinUn(o) { //!!o.nums and o.seps are 2D byElm!!
        let i, str;
        const l = o.nums.length;

        for (i = 0, str = ""; i < l; i++)
            str += o.seps[i] + o.nums[i];

        return str + (o.seps[l] ?? "");
    }
//  static _seps() sets o.seps to a dense array of concatenated units +
//          separators or leaves it undefined. Also sets the o.numBeg & o.numEnd
//          booleans. Returns a value as a convenience for Easy.#plugCV().
    static _seps(o) {
        if (o.func)
            return o.func._seps(o);
        //--------------
        o.numBeg = true;
        o.numEnd = !o.u;             // o.u is string, but can be empty
        if (o.c == 1 && o.numEnd)
            return;                  // 1 arg, no units, o.seps stays undefined
        //-------
        let c, i;
        c = o.c - o.numEnd;          // c  = arg count
        const us = new Array(c--);   // us = combined units + separators
        for (i = 0; i < c; i++)
            us[i] = o.u + this.#separator;
        if (o.u)
            us[c] = o.u;
        o.seps = us;
        return us;
    }
//  _mask() returns an argument mask as a dense array of argument indexes.
//   The m argument can be a dense or sparse array, or an integer bitmask. If
//   it is a dense array, _mask() validates the contents to prevent obscure
//   errors later. Otherwise it auto-generates the mask from the m argument,
//   ensuring that the returned mask is correctly formatted.
//   0 is not a valid bitmask value. {mask:0} is ignored and calculate() will
//   spread the eased value across arguments. If you want to mask only the
//   first arg of a prop|func that has no Ez.bitmask values, use {mask:[0]}.
    _mask(m, f = this.func, c = this.count(f)) {
        let   name = "mask";
        const isAm = Is.A(m);
        if (!isAm)
            try {
                m = Ez.toNumber(m, name, ...Ez.defGrThan0, true);
            } catch {
                Ez._mustBeErr(name, "a positive integer or an Array");
            }
        //-------
        let mask;
        if (isAm && !m.includes(undefined)) { // m is a dense array
            mask = Ez.toArray(m, name, (val, nm) => {
                return Ez.toNumber(val, nm, ...Ez.defNotNeg, true);
            });
            name += " values";
            Ez._mustAscendErr(mask, name);
            if (new Set(mask).size != mask.length)
                Ez._mustBeErr(name, `unique, no duplicates: ${mask}`);
            else if (mask.at(-1) >= c)
                Ez._mustBeErr(name, `< ${c}, the max number of arguments for `
                                  + `${this.name}: ${mask}`);
        }
        else {                                // generate the dense array
            let i;
            mask = [];
            if (isAm) {                       // m is a sparse array
                for (i = 0; i < c; i++)
                    if (Is.def(m[i]))
                        mask.push(i);
            }
            else {                            // m is a bitmask
                if (this === Prop.transSVG && f === Func.r) {
                    if (m & Ez.y)     m += Ez.y; // SVG rotate() is funky
                    if (m & Ez.x)     m += Ez.x;
                    if (m & Ez.angle) m -= Ez.angle - 1;
                }
                let j;
                for (i = 0, j = 1; i < c && j <= m; i++, j *= 2)
                    if (m & j)
                        mask.push(i);
            }
        }
        return mask;
    }
//  static _maskAll() returns a full, sequential mask, masking all arguments
    static _maskAll(l) { return Array.from({length:l}, (_, i) => i); }
////////////////////////////////////////////////////////////////////////////////
//  The get functions:
//  get() is the most generic. elms can be an Element or any kind of collection
//  of Elements. It returns String or [String] by element.
    get(elms, getComputed) {
        return Ez._isElmy(elms) ? this.getOne (Ez.toElement (elms), getComputed)
                                : this.getMany(Ez.toElements(elms), getComputed);
    }
//  getMany() gets an array of values for multiple elements
    getMany(elms, getComputed) { // elms must be pre-validated as [Element]
        let i;
        const l = elms.length;
        const a = new Array(l);
        for (i = 0; i < l; i++)
            a[i] = this.getOne(elms[i], getComputed);
        return a;
    }
//  getn() wraps get() to return Number or [Number] instead of String.
    getn(elms, f, u) {
        let v = this.get(elms);
        return Is.A(v) ? this.#a2N(v, f, u) : this._2Num(v, f, u);
    }
//  _2Num() parses a string into a Number or an array of Number (and/or String
//          because toNumby() returns the original value instead of NaN). Uses
//          parseFloat(), not Number(), because it's better at parsing strings.
    _2Num(v, f, u = this._unitz(f)) {
        const arr = this.parse(v, f);
        return arr.length < 2
             ? Ez.toNumby(arr[0], f, u)
             : arr.map(n => Ez.toNumby(n, f, u));
    }
//  #a2N() is an array-based wrapper for _2Num()
    #a2N(a, f, u) { return a.map(v => this._2Num(v, f, u)); }

//  getUn() is for "unstructured" props & funcs, though it can be used with any
//  prop or func, ideally one that has numeric parameters.
    getUn(elms, getComputed) {
        let v, vals = this.get(elms, getComputed);
        const isAVals = Is.A(vals);
        if (!isAVals)
            vals = [vals];

        const arr = Array.from({length:vals.length}, (_, i) => {
            v = vals[i];
            return v ? { seps:   v.split(E.nums),         // string separators
                         vals:   v.match(E.nums) ?? [""], // numbers as strings
                         numBeg: E.numBeg.test(v),        // begins with number
                         numEnd: E.numEnd.test(v) }       // ends   with number
                     : v;
         });
        return isAVals ? arr : arr[0];
    }
//  getUnObj() is getUn() reconfigured for EFactory.#createBasic()
//!!they should be more alike, array by element of objects,
//!!.cv is not a great name outside of EFactory
    getUnToObj(o) { //!!o.cv can already have been retrieved and parsed
        o.cv     = new Array(o.l);  // 2D [elm[arg]] numeric values as strings
        o.seps   = new Array(o.l);  // 2D [elm[arg]] non-numeric separators
        o.lens   = new Array(o.l);  // 1D by elm: [o.cv[elm].length]
        o.numBeg = new Array(o.l);  // 1D begins with number (vs separator)
        o.numEnd = new Array(o.l);  // 1D ends   with number (vs separator)
        this.getMany(o.elms).forEach((v, i) => { // 1D array of strings by elm
            if (v) {
                v = v.replace(/\s\s+/g, E.sp);   // consolidate whitespace
                o.cv[i] = v.match(E.nums);
                if (!o.cv[i])
                    throw new Error(`Prop.${this.name}.getUnToObj(o): o.elms[${i}] `
                                + `contains no numbers: ${v}`);
                //--------------------------
                o.seps[i] = v.split(E.nums);
                o.lens[i] = o.cv[i].length;
                o.numBeg[i] = E.numBeg.test(v);
                o.numEnd[i] = E.numEnd.test(v);
            }
        });
    }
//  computed() wraps getComputedStyle() for one or more elements
    computed(elms) {
        if (this.isBute) return;
        //-------------------
        if (Ez._isElmy(elms))
            return getComputedStyle(Ez.toElement(elms))[this.name];
        else {
            elms = Ez.toElements(elms);
            const vals = new Array(l);
            for (let i = 0, l = elms.length, name = this.name; i < l; i++)
                vals[i] = getComputedStyle(elms[i])[name];
            return vals;
        }
    }
//  parse() parses one element's value into an array, not for multi-function
    parse(v, f = this.func) {
        if (f?.isColor)
            return f.fromColor(v, false);
        else if (f?.isColor) {
            if (v.at(-1) != E.rp || v.substring)
            ;
        }
        else if (v.at(-1) == E.rp)
            return v.split(E.sepfunc).slice(1, -1);
        else
            return v.split(E.comsp);
    }
//////////////////////////////////////////////////////////////////////////////
//  The set() functions:
//  set() validates elms and determines if it's 1 or >1 elements
//!!It should probably validate units, v gets validated in Ez._appendUnits()
//!!I never validate func here, only in animation classes
    set(elms, v, f, u) {
        return Ez._isElmy(elms)
             ? this.setOne (Ez.toElement (elms), v, f, u)
             : this.setMany(Ez.toElements(elms), v, f, u);
    }
//  setOne() elm must be Element, v must be Number, String, or Array
    setOne(elm, v, f = this.func, u = this._unitz(f)) {
        v = Is.A(v) ? this.join(v, f) //!!inconsistent validation of u and v!!
                    : Ez._appendUnits(v, u);

        this.setIt(elm, f?.apply(v) ?? v);
    }
//  setMany() elms must be [Element]
    setMany(elms, v, f, u) {
        if (!Is.A(v))        // handle it here or inside the loop
            v = new Array(elms.length).fill(v);
        elms.forEach((elm, i) => this.setOne(elm, v[i], f, u));
    }
//  setIt() and setEm() are for when you need no validation or conversion
    setIt(elm,  val) { elm.style[this.name] = val; }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i].style[name] = arr[i];
    }
//  setOneUn()
    setOneUn(elm, obj) {
        if (obj.numBeg)           // loop starts with seps, ensure seps
            obj.seps.unshift(""); // and vals are the same length.
        if (!obj.numEnd)
            obj.vals.push("");

        let i, l, str;
        for (i = 0, l = obj.vals.length, str = ""; i < l; i++)
            str += obj.seps[i] + obj.vals[i];

        this.setIt(elm, str);
    }
    ////////////////////////////////\ let() net() vet() set sub-values only
    // let(): masked argument array, applies this.units and #separator.
    let(elms, v, m, f = this.func, u = this._unitz(f)) {
        if (this.isUn || f?.isUn)
            return; //!!
        //--------------------
        let c = this.count(f);
        elms  = Ez.toElements(elms);
        if (c == 1) {
            this.setMany(elms, v, f, u);
            return;
        } //-------------------------------------------------------
        let b, be, bmft, cv, fs, i, j, k, l, p, s, tf, tp, vmft, z;
        const isAv   = Is.A(v);
        const noFunc = !f;

        if (Is.A(f))                 //!!multiFunc masks??
            bmft = true;             // multi-func transform
        else {
            if (m)
                m = this._mask(m, f, c);
            else if (isAv) {
                m = this._mask(v, f, c);      // sparse array of values as mask
                v = v.filter(v => Is.def(v)); // densifies array, allows for 0
            }
            else if (this.required(f) == 1) { // no mask, single value
                this.setMany(elms, v, f, u);
                return;
            }
            else
                ; //!!throw some kind of error, let() doesn't spread values
            // -----------------------
            be = PBase.#isByElm(v, c);
            f  = f ? [f] : [];       // simpler if it's always an array
        }
        z  = v;
        cv = this.get(elms);         // cv for "current values", 1D array by elm
        for (i = 0; i < cv.length; i++) {
            if (be)
                z = v[i];            // if (c) z is an array
            if (cv[i]) {
                p = cv[i];           // p for "plug", current value for one elm
                if (p.at(-1) == E.rp) {    // it's a function(), parse it
                    b = !noFunc && f[0] !== Func[p[0]];
                    p = p.split(E.func);
                    if (p.length % 2)      // trim trailing empty element
                        p.length--;        //!!always??remove if??
                    if (this.multiFunc && (p.length > 2 || bmft || b)) {
                        l  = p.length / 2;
                        fs = new Set;      // combined current + user funcs
                        tf = new Array(l);
                        tp = new Array(l);
                        for (j = 0, k = 0; j < l; j++) {
                            tf[j] = p[k++].trim(); //!!.trimStart??
                            tp[j] = p[k++].trim(); //!!don't trim??
                            fs.add(Func[tf[j]]);
                        }                  // let() maintains current func order
                        f.forEach(func => fs.add(func));
                        s  = "";
                        Array.from(fs).forEach((func, fi) => {
                            j = f.indexOf(func);
                            if (j >= 0) {
                                c = this.count(func);
                                if (bmft) {
                                    vmft = PBase._mft(v, func, j);
                                    z    = PBase.#isByElm(v, c) ? vmft[i] : vmft;
                                }
                                s += this.#let1(z, func, u, c, m, tp[fi]) + E.sp;
                            }
                            else
                                s += Func[tf[fi]].apply(tp[fi]) + E.sp;
                        });
                        this.setIt(elms[i], s.trimEnd());
                        continue;    // already called set(), skip to next i
                    }
                    else {           // only transform & CSS filter have >1 func
                        if (noFunc)  // if only one current func, f is optional
                            f = [Func[p[0]]];
                        p = p[1];
                    }
                }
                this.setIt(elms[i], this.#let1(z, f[0], u, c, m, p));
            }
            else                     // if (!cv[i]) fall back to this.set()
                this.set(elms[i], z, f[0], u);
        }
    } ////////////////////////////////\ private helpers for let()
    #let1(v, f, u, c, m, p) {
        const isAu = Is.A(u);
        let   isAv = Is.A(v);
        if (!isAv && (c == 1 || this.required(f) == 1)) // single value
            v = Ez._appendUnits(v, u);
        else {                       // list of values, complete or incomplete
            if (f?.isCFunc && !isAv) {
                v = f.fromColor(v);
                isAv = Is.A(v);
            }
            p = p.split(E.comsp); // the array needs plugging
            let j = 0;
            for (const i of m)
                p[i] = Ez._appendUnits(v[j++], u, i, isAu);
            v = this.join(p, f);
        }
        return f ? f.apply(v) : v;
    }
    static #isByElm(v, c) {
        return Ez._dims(v) == (c > 1 ? 2 : 1);
    }
    //////////////////////////////////\ net() vet(): array based on current value
    net(elms, v, m, f = this.func) {//\ net() replaces only numbers
        this.#netvet(elms, v, m, f);//\ leaves units intact
    }
    vet(elms, v, m) {               //\ vet(): values include keywords, text !!never used, no examples, missing in ACues.push()
        this.#netvet(elms, v, m);
    }                               //\ #netvet() consolidates net() and vet()
    #netvet(elms, v, m, f = undefined) {
        let b2, cv, i, isN, j, l, pv, seps, vals;
        elms = Ez.toElements(elms);
        isN  = Is.def(f)
        if (isN)
            cv = this.getUn({}, elms, f); // cv = current values;
        else {
            cv = this.get(elms);
            if (!Is.A(cv))
                cv = [cv];
        }
        if (!Is.A(m))                // m = mask = array of indexes into cv[elm]
            m = [m];
        if (!Is.A(v))
            v = [v];
        else if (Is.A(v[0]))
            b2 = true;               // v is a 2D array

        for (i = 0; i < cv.length; i++) {
            if ((isN && cv.nums[i][0]) || (!isN && cv[i])) {
                vals = isN ? cv.nums[i] : cv[i].split(E.sepfunc);
                seps = isN ? cv.seps[i] : cv[i].match(E.sepfunc);
                for (j = 0; j < m.length; j++)
                    vals[m[j]] = b2 ? v[i][j] : v[j];
                pv = "";             // pv = attribute value, rebuild it.
                l  = vals.length;    // vals can be different lengths, so long
                if (seps.length < l) // as the minimum length > m.at(-1).
                    seps.push("");   // simplifies the next loop
                for (i = 0; i < l; i++)
                    pv += vals[i] + seps[i];
                this.setIt(elms[i], pv);
            }                        // if no current value, no way to plug it
        }
    }

    static _mft(v, f, i) {          //\ _mft() gets a multi-func transform value
        if (!v || Is.Number(v) || Is.String(v))
            return v;                // falsy, number, or string
        if (Is.def(v.length))
            return v[i];             // array or "array-like"
        if (Is.def(v.get))
            return v.get(f);         // map or set
        if (f && Is.def(v[f.name]))
            return v[f.name];        // object w/string keys
    }
}
////////////////////////////////////////////////////////////////////////////////
class Prop extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
//  static visible is useful as a boolean, for one element at a time
    static visible(elm, b) {
        this.visibility.setOne(elm, b ? "visible" : "hidden");
    }
    static isVisible(elm) { return elm.style.visibility == "visible"; }

//  static show does the same for display:"none" and ""
    static show(elm, b = true, value="") {
        this.display.setOne(elm, b ? value : "none");
    }
//  static hide makes a convenient pair with show
    static hide(elm) {
        this.display.setOne(elm, "none");
    }
    static isDisplayed(elm) { return elm.style.display != "none"; }

//  count() returns argument count
    count(f = this.func) {
        if (f)
            return f.count;
        //-------------
        switch (this) {
        case Prop.tO:
            return 3;
        case Prop.m: case Prop.p:
            return 4;
        default:
            return this.isUn ? 0 : 1;
        }
    }
//  required() returns required arg count
    required(f = this.func) { return f?.required ?? 1; }

// join()

//  cut() aka remove() removes this property from one or more elements.
//  removeProperty() requires a snake-case name.
    cut(elms) {
        const name = this.name.replace(E.caps, cap => {
                        return "-" + cap.toLowerCase()
                     });
        for (const elm of Ez.toElements(elms))
            elm.style.removeProperty(name);
    }
//  getOne() gets a single element's string value more efficiently than get()
    getOne(elm, getComputed = true) { // elm must be pre-validated as an Element
        const name  = this.name;
        let   value = elm.style[name];
        if (!value && getComputed)
            value = getComputedStyle(elm)[name];
        return value.trim();
    }
////////////////////////////////////////////////////////////////////////////////
//  Static methods:
//  static joinCSSpolygon() joins an array of numbers into a CSS polygon() value
    static joinCSSpolygon(arr, fillRule, u = U.px) {
        let i, l, str;
        const seps = [E.sp, E.comma]
        str = Func.polygon.prefix + (fillRule ? fillRule + E.comma: "");
        for (i = 0, l = arr.length - 1; i < l; i++)
            str += arr[i] + u + seps[i % 2];

        return str + arr[i] + u + E.rp; // no trailing separator
    }
//  Methods to globally change units, func:
//  static set lengthUnits() sets the units for all Props that use <length>
    static set lengthUnits(val) {
        val = Ez._validUnits(val, "lengthUnits", PFactory._lengths);
        for (obj of this._len)
            obj._u = val;            // backdoor avoids double-validation
    }
//  static set angleUnits() sets the units for all the Props that use <angle>
    static set angleUnits(val) {     // <angle>
        val = Ez._validUnits(val, "angleUnits", PFactory._angles);
        for (const obj of this._ang) // they're all funcs
            obj._u = val;
    }
//  static set percent() toggles U.pct for Props that use it
    static set percent(b) {
        if (b)
            for (const obj of this._pct)
                obj._u = U.pct;
        else
            for (const obj of this._pct)
                obj._u = obj._lenPct ? U.px : "";
    }
//  static set colorFunc() sets the Func for all color properties
    static set colorFunc(val) {
        for (const obj of this._col)
            obj.func = val;          // no backdoor: .isFunc is only validation
    }
}
////////////////////////////////////////////////////////////////////////////////
// Assumes that no numeric attributes use units. True for the attributes
// supported at this time. The name Attr is already taken:
// https://developer.mozilla.org/en-US/docs/Web/API/Attr
class Bute extends PBase {
    constructor() {
        super(...arguments);
        Ez.is(this);
    }

//  count() returns argument count
    count(f = this.func) {
        if (f)                       //$$ the price of supporting SVG rotate()
            return f === Func.r ? 3 : f.count;
        //-----------------
        switch (this) {
        case Prop.bF:                // baseFrequency
            return  2;
        case Prop.vB:                // viewBox
            return  4;
        case Prop.values:            // <feColorMatrix>type="matrix"
            return 20;
        default:
            return this.isUn ? 0 : 1;
        }
    }
//  required() returns required arg count
    required(f = this.func) {
        return f?.required ?? (this === Prop.vB ? 4 : 1);
    }
//  cut() aka remove() removes this attribute from one or more elements.
//  An element can have a value in both the style.property and the element
//  attribute. This class sets the attribute only.
    cut(elms) {
        const name = this.name;
        for (const elm of Ez.toElements(elms))
            elm.removeAttribute(name);
    }
//  getOne() gets a single element's value. Returns "" instead of null
//  because it's friendlier to always return a string. The spec allows for
//  some property/attribute values to have leading or trailing whitespace.
//  If not trimmed, parse(v) or v.split() return leading/trailing array
//  elements containing "".
    getOne(elm) {
        return elm.getAttribute(this.name)?.trim() ?? "";
    }
//  setIt() and setEm() override PBase
    setIt(elm,  str) { elm.setAttribute(this.name, str); }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i].setAttribute(name, arr[i]);
    }
//  _unitz() overrides PBase because SVG transforms don't use units
    _unitz() { return this.units; }

//  isDef() exists because this.getOne() changes null to ""
    isDef(elm)  { return elm.getAttribute(this.name) !== null; }
}
class PrAtt extends PBase { // the hybrid property-attributes
    constructor() {
        super(...arguments);
        Ez.is(this);
    }
//  count() and required() are the simplest for PrAtt
    count   (f = this.func) { return f?.count    ?? 1; }
    required(f = this.func) { return f?.required ?? 1; }

//  cut() aka remove() removes this property from one or more elements.
//  An element can have a value in both the style.property and the element
//  attribute. The both argument allows you to remove both at once.
//  removeProperty() and removeAttribute() both require a snake-case name.
    cut(elms, both) {
        const name = this.name.replace(E.caps, cap => {
                        return "-" + cap.toLowerCase()
                     });
        for (const elm of Ez.toElements(elms)) {
            elm.style.removeProperty(name);
            if (both)
                elm.removeAttribute?.(name); // elm can be a CSSStyleRule
        }
    }
//  getOne() gets a single element's string value more efficiently than get()
    getOne(elm, getComputed = true) { // elm must be pre-validated as Element
        const name  = this.name;
        let   value = elm.style[name];
        if (!value) {
            value = elm.getAttribute(name);
            if (!value && getComputed)
                value = getComputedStyle(elm)[name];
        }
        return value?.trim() ?? "";
    }
}
class Bute2 extends PBase {
// For animation only, you'd never write Prop.value.set(elm, val)
// when you can write elm.value = val.
// currently only <input>.value, needs a better name than Bute2. Is it an
// attribute or a property? "value" is both, attribute for initial value,
// property for any other value the user or code might set, but it's not a
// styleable property, it's a direct property on the object.
constructor() {
        super(...arguments);
        Ez.is(this);
    }
    count()    { return 1; }
    required() { return 1; }

    getOne(elm) { return elm[this.name]; }

    setIt(elm, val) { elm[this.name] = val; }
    setEm(elms, arr, l = elms.length) {
        for (var i = 0, name = this.name; i < l; i++)
            elms[i][name] = arr[i];
    }
}
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
/** @unrestricted */ const Ez = {
    rad : Math.PI / 180, // non-bitmask values for <angle> to
    grad: 10 / 9,        // convert from degrees to other units.
    turn: 1 / 360,

    // Popular arguments for Ez.toNumber() and Easy.legNumber()
    // See bottom of Ez.init() for more of these defined dynamically
    defZero: [0, true],         // arguments[2,3]  : >=0, default:0
    grThan0: [   true,  true],  // arguments[  3,4]: > 0
    notNeg : [   true,  false],                   // >=0
    notZero: [   false, true],                    // !=0

    okEmptyUndef: [false, false], // for Ez.toArray()

//  promise() returns a new Promise, extended with resolve & reject
    promise() {
    //++Until Promise.withResolvers() is more widely supported:
    //++  https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise/withResolvers#browser_compatibility
    //++though by extending Promise, this is cleaner than Promise.withResolvers()
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
//  _listE() returns a comma+space-separated list of E.xxx values
    _listE(name, start = 0, end = Infinity) {
        return PFactory[name].slice(start, end)
                             .map(v => E.prefix + v)
                             .join(", ");
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
//  _validUnits() helps Func and PBase validate units, obj can be an array of
    _validUnits(val, name, obj) { // string values or a Prop or Func instance.
        let arr;
        if (Is.A(obj)) {
            if (!obj.includes(val))
                arr = obj;
        }
        else if (obj._noUPct) {
            if (!PFactory._emptyPct.includes(val))
                arr = PFactory._emptyPct;
        }
        else if (obj._len) {
            if (!PFactory._lengths.includes(val))
                arr = PFactory._lengths;
        }
        else if (obj._lenPct) {
            if (!PFactory._lengths.includes(val) && val != U.pct)
                arr = [...PFactory._lengths, U.pct];
        }
        else if (obj._lenPctN) {
            if (!PFactory._lengths.includes(val) && val != U.pct && val !== "")
                arr = [...PFactory._lengths, U.pct, ""];
        }
        else if (obj._ang) {
            if (!PFactory._angles.includes(val))
                arr = PFactory._angles;
        }
        else if (obj._pct && val != U.pct)
            throw new Error(`${name} units are read-only: ${U.pct}.`);
        else if (obj._noU || obj.isUn) // noUnits or isUnstructured
            throw new Error(`${name} does not use units: val.`);

        if (arr)
            Ez._invalidErr(name, val, arr);

        return val;
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
class PFactory {
// [Yes, it could be a const object, but classes have private fields]
// PFactory.init() populates the U, F, and P objects, and the Func and Prop
// classes using these arrays:
// C = <color>;  Un = gradients and other "unstructured" functions;
// A = <angle>;  L  = <length> default units:px;
// N = <number>; P  = <percentage>;
// T = transform funcs; Tm = <time> default units:ms;
// 2 = no abbreviated name created;
// units
    static _lengths  = ["px","em","rem","vw","vh","vmin","vmax","pt","pc","mm","in"];
    static _angles   = ["deg","rad","grad","turn"];
    static _times    = ["ms","s"];
    static _emptyPct = ["", U.pct];
// functions
    static #funcs   = ["url","var","cubic-bezier"];
    static #funcUn  = ["color-mix","inset","path","polygon","calc","linear","steps"];
    static #funcC   = ["rgb","hsl","hwb","lch","oklch","lab","oklab"];
    static #funcGr  = ["linear-gradient","radial-gradient","conic-gradient",
                       "repeating-linear-gradient","repeating-radial-gradient",
                       "repeating-conic-gradient"];
    static #funcSR  = ["circle", "ellipse"]; // SR = <shape-radius>
    // filter functions broken out for class Elm
    static #funcF   = ["brightness","contrast","grayscale","invert","opacity",
                       "saturate","sepia"];
    static #funcFA  = ["hue-rotate"];
    static #funcFL  = ["blur","drop-shadow"];
    // transform funcs broken out for class Elm
    static #funcT   = ["matrix","scale","matrix3d","scale3d"];
    static #funcTA  = ["rotate","rotateX","rotateY","rotateZ","rotate3d"];
    static #funcTA2 = ["skew","skewX","skewY"];
    static #funcTL  = ["perspective","translateZ"];
    static #funcTLP = ["translate","translateX","translateY","translate3d"];
// CSS properties, class Prop
    static #css   = ["flexFlow","alignItems","alignSelf","justifyContent",
                     "fontFamily","fontWeight","overflowX","overflowY",
                     "pointerEvents","vectorEffect","textAnchor"];
    static #css2  = ["cursor","display","flex","mask","overflow","position",
                     "left","right","top","bottom"]; // r is taken, no abbreviations
    static #cssUn = ["border","clip-path","shape-outside"];
    static #cssC  = ["color","backgroundColor","borderColor","borderLeftColor",
                     "borderRightColor","borderTopColor","borderBottomColor"];
    static #cssLP = ["transformOrigin",
                     "maxHeight","maxWidth","minHeight","minWidth",
                     "padding",    "margin",
                     "paddingTop", "paddingBottom","paddingLeft","paddingRight",
                     "marginTop",  "marginBottom", "marginLeft", "marginRight",
                     "borderTop",  "borderBottom", "borderLeft", "borderRight",
                     "borderWidth","borderHeight", "borderImage"];
  //static #cssTm = ["transitionDuration"];
    static #bg    = ["backgroundAttachment","backgroundClip",  "backgroundOrigin",
                     "backgroundBlendMode", "backgroundImage", "backgroundRepeat"];
    static #bgUn  = ["background",          "backgroundSize",  "backgroundPosition",
                     "backgroundPositionX", "backgroundPositionY"];
// CSS-SVG property-attributes, class PrAtt
    static #csSvg = ["font-style","visibility"];
    static #csSvC = ["fill","stroke","stop-color"];
    static #csSvN = ["font-size-adjust"];
    static #csSvP = ["font-stretch"];
    static #csSNP = ["opacity","fill-opacity","stroke-opacity","stop-opacity"];
    static #csSLP = ["x","y","r","cx","cy",
                     "height","width","stroke-width","font-size"];
// SVG attributes, class Bute
    static #svg   = ["class","href","lengthAdjust","preserveAspectRatio","type"];
    static #svgUn = ["d","points"]; // CSS.supports("d","path('')")
    static #svgN  = ["viewBox","baseFrequency","stdDeviation","surfaceScale"];
    static #svgN2 = ["azimuth","elevation","k1","k2","k3","rotate","scale",
                     "seed","values"];
    static #svgLP = ["dx","dy","startOffset","textLength","x1","x2","y1","y2"];
// SVG attributes, class Bute
    static #htmlN = ["value"]; // for <input>
////////////////////////////////////////////////////////////////////////////////
// Lists for enums and <select><option> or other list display
    static status = ["arrived","tripped","waiting","inbound","outbound",
                     "initial","original","pausing","running","empty"];
    static type   = ["linear","sine","circ","expo","back","elastic","bounce",
                     "pow","bezier","steps","increment"];
    static io     = ["in","out","inIn","outIn","inOut","outOut"];
    static set    = ["let","set","net"];
    static jump   = ["none","start","end","both"];
    static eKey   = ["value","unit","comp"];
    static vB     = ["x","y","w","h"];
    ////////////////////////////////////////////////////////////////////////////
    static #presets = [  // for Easy
        ["",1.685], ["Quad",2], ["Cubic",3], ["Quart",4], ["Quint",5],
        ["Sine"], ["Expo"], ["Circ"], ["Back"], ["Elastic"], ["Bounce"]
    ];
    static #initialized; // prevents extra initializations
////////////////////////////////////////////////////////////////////////////////
//  static addAttributes() creates user-defined attributes in P and Prop.
//         It adds the "data-" prefix and does not created abbreviated names.
//         The actual browser rules re: "data-*" attribute names are not quite
//         as advertised, and both setAttribute() and dataset[] can fail to set
//         the value without throwing error. So this method enforces rules that
//         are based on what fails in practice, plus the restrictions on JS
//         property names: only lower case alpha, numbers, '-', and '_'
//                         no '--' or '-N' where N is a number
    static addAttributes(attrs) {
        attrs = Ez.toArray(attrs, "Custom attributes", (val, name) => {
            let err;
            if (!Is.String(val))
                err = name + " must be strings: ";
            else if (/[^a-z-_0-9]/.test(val))
                err = name + " must contain only lower-case letters, numbers,"
                           + " hyphen aka dash ('-'), and underscore ('_'): ";
            else if (/^\d/.test(val))
                err = name + " cannot begin with a number: ";
            else if (/--|-\d/.test(val))
                err = name + " cannot contain '--', or '-' followed by a number: ";
            if (err)
                throw new Error(err + val);
            return val;
        });
        attrs.forEach((v, i) => attrs[i] = "data-" + v);
        this.#add(attrs, 99, P, Prop, "", "_noU", Bute);
    }
    static addToDataset(props) {
        const keys = [];
        attrs = Ez.toArray(attrs, "HTMLElement.dataset properties", (val, name) => {
            let err;
            if (!Is.String(val))
                err = name + " must be strings: ";
            else if (/[^\w]/.test(val))
                err = name + " must contain only letters, numbers, and"
                           + " underscore ('_'): ";
            else if (/^\d/.test(val))
                err = name + " cannot begin with a number: ";
            if (err)
                throw new Error(err + val);
            return val;
        });
    }
////////////////////////////////////////////////////////////////////////////////
//  static init() populates the U, F, and P constants, and Func and Prop. Call
//         it once per session prior to using any of those objects or classes.
    static init() {
        if (this.#initialized) {
            console.log("Ez can only be initialized once per session.");
            return;
        }
        const funcFA = [], funcFL = [], csSvC = [];

        // Fill collections, order is critical: U, F, Func, P, Prop:
        this.#add(this._lengths, 99, U); // 99 prevents abbreviated names
        this.#add(this._angles,  99, U);
        this.#add(this._times,   99, U);            // noUnits
        this.#add(this.#funcs,    5, F, Func, "",    "_noU",      Func);
        this.#add(this.#funcUn,   8, F, Func, "",    "isUn",      Func);
        this.#add(this.#funcGr,   8, F, Func, "",    "isUn",      Func);
        this.#add(this.#funcC,   99, F, Func, "",    "_noUPct",  CFunc);
        this.#add(this.#funcSR,  99, F, Func, U.px,  "_lenPct", SRFunc);
        this.#add(this.#funcF,   99, F, Func, "",    "_noUPct",   Func);
        this.#add(this.#funcFA,   5, F, Func, U.deg, "_ang",      Func, funcFA);
        this.#add(this.#funcFL,   5, F, Func, U.px,  "_len",      Func, funcFL);
        this.#add(this.#funcT,    5, F, Func, "",    "_noU",      Func);
        this.#add(this.#funcTA,   5, F, Func, U.deg, "_ang",      Func);
        this.#add(this.#funcTA2, 99, F, Func, U.deg, "_ang",      Func);
        this.#add(this.#funcTL,   5, F, Func, U.px,  "_len",      Func);
        this.#add(this.#funcTLP,  5, F, Func, U.px,  "_lenPct",   Func);
        this.#add(this.#css,      7, P, Prop, "",    "_noU",      Prop);
        this.#add(this.#css2,    99, P, Prop, "",    "_noU",      Prop);
        this.#add(this.#cssUn,   99, P, Prop, "",    "isUn",      Prop);
        this.#add(this.#cssC,     0, P, Prop, "",    "_noU",      Prop, Func.rgb);
        this.#add(this.#cssLP,    0, P, Prop, U.px,  "_lenPct",   Prop);
    //++this.#add(this.#cssTm,    7, P, Prop, U.ms,  "_tm",       Prop);
        this.#add(this.#bg,      99, P, Prop, "",    "_noU",      Prop);
        this.#add(this.#bgUn,    99, P, Prop, "",    "_noU",      Prop);
        this.#add(this.#csSvg,   99, P, Prop, "",    "_noU",      PrAtt);
        this.#add(this.#csSvC,    0, P, Prop, "",    "_noU",      PrAtt, Func.rgb);
        this.#add(this.#csSvN,    0, P, Prop, "",    "_noU",      PrAtt);
        this.#add(this.#csSvP,    0, P, Prop, U.pct, "_pct",      PrAtt);
        this.#add(this.#csSNP,    0, P, Prop, "",    "_noUPct",   PrAtt);
        this.#add(this.#csSLP,    0, P, Prop, U.px,  "_lenPct",   PrAtt);
        this.#add(this.#svg,      7, P, Prop, "",    "_noU",      Bute);
        this.#add(this.#svgUn,   99, P, Prop, "",    "isUn",      Bute);
        this.#add(this.#svgN,     7, P, Prop, "",    "_noU",      Bute);
        this.#add(this.#svgN2,   99, P, Prop, "",    "_noU",      Bute);
        this.#add(this.#svgLP,   99, P, Prop, "",    "_lenPctN",  Bute);
        this.#add(this.#htmlN,    0, P, Prop, "",    "_noU",      Bute2);

        F.color = "color";     // CSS color() is special
        Func.color = new ColorFunc(F.color, "", "_noUPct");

        Func.rgba = Func.rgb;  // elm.style and getComputedStyle(elm) use it

        // Read-only properties for this, Func, Prop, and other objects:
        // Prop._pct _len _ang _col help the static global property setters
        const funcLP = [...this.#funcSR, ...this.#funcTLP];
        const propLP = [...this.#svgLP,  ...this.#cssLP];

        let keys = [[...funcLP, ...this.#funcF,  ...this.#funcC],  propLP];
        Ez.readOnly(Prop, "_pct", this.#keys2Objects([Func, Prop], keys));

        // drop-shadow and hue-rotate require camelCasing, thus funcFL & funcFA
        keys = [[...funcLP, ...this.#funcTL, ...funcFL], propLP];
        Ez.readOnly(Prop, "_len", this.#keys2Objects([Func, Prop], keys));

        keys = [[...this.#funcTA, ...this.#funcTA2, ...funcFA, F.hsl, F.hwb]];
        Ez.readOnly(Prop, "_ang", this.#keys2Objects([Func], keys));

        keys = [[...this.#cssC, ...csSvC]]; // csSvC = camelCase for stop-color
        Ez.readOnly(Prop, "_col", this.#keys2Objects([Prop], keys));

        Ez.readOnly(this, "funcC", [...this.#funcC, F.color, "colorMix"]);
        for (const c of [...Prop._col, ...this.#funcC.map(fn => Func[fn])])
            Ez.is(c, "Color");

        Ez.readOnly(this, "funcF", [...this.#funcF, ...funcFA, ...funcFL]
                                   .sort());
        for (const name of this.funcF)
            Ez.is(Func[name], "Filter");

        let f;
        const hxx = [Func.hsl, Func.hwb];
        Ez.is(Func.rgb, "RGB");
        Ez.is(Func.hsl, "HSL");
        for (f of [...hxx, Func.rgb]);
            Ez.is(f, "LD")              // HD = High Def, LD = Low Def
        for (f of [...hxx, Func.lch, Func.oklch]);
            Ez.readOnly(f, "hasHue", true);
        for (f of [...hxx])
            Ez.is(f, "HXX");

        P.filter     = "filter";        // filter & transform are multi-function
        P.transform  = "transform";     // transform has CSS and SVG variants
        Prop.filter    = new Prop(P.filter,    "", "_noU", Func.saturate,  true);
        Prop.transform = new Prop(P.transform, "", "_noU", Func.translate, true);
        Prop.transSVG  = new Bute(P.transform, "", "_noU", Func.translate, true);
        for (const p of [...Prop._col, Prop.filter, Prop.transform, Prop.transSVG])
            Ez.readOnly(p, "needsFunc", true);


        U.percent      = U.pct;         // units aliases, long names
        U.milliseconds = U.ms;
        U.seconds      = U.s;

        P.xhref    = "xlink:href";      // deprecated
        Prop.xhref = new Prop(P.xhref, false);

        let caps, short, long;          // background abbreviations are special
        this.#bg.unshift(P.backgroundColor);
        for (const bg of this.#bg) {    // bgC = bgColor not bgClip
            short = "bg";
            long  = "";
            while (caps = E.caps.exec(bg)) {
                if (!long) {
                    long = short + bg.substring(caps.index);
                    P   [long] = bg;    // long abbreviation, e.g. bgColor
                    Prop[long] = Prop[bg];
                }
                short += caps[0];
            }
            P   [short] = bg;           // short abbreviation, e.g. bgC
            Prop[short] = Prop[bg];
        }

        // Bitmasks, color functions first:
        let   arr  = ["R","G","B","A","C"];
        let   len  = arr.length;        // feColorMatrix has the most args at 20
        let   rgb  = arr.slice(0, len - 1);
        const RGBC = Array.from({length:len * rgb.length},
                                (_, i) => arr[i % len] + rgb[Math.floor(i / len)]);
        rgb = rgb.map(v => v.toLowerCase());
        const hsl = ["h","s","l"];      // the rest look better in lower case
        const hwb = [,"w"];
        const lab = ["l","a","b","alpha"];
        const lch = [,"c","h"];
        const xyz = ["x","y","z"];

        const vB = ["x","y","w","h"];   // viewBox++

        arr = ["a","b","c","d"];        // matrix3d() has 16 args
        len = arr.length;
        const abcd = Array.from({length:len * len},
                                (_, i) => arr[i % len] + Math.floor(i / len + 1));
        arr.push("e","f");              // SVG matrix()

        const pairs = [[C,  [RGBC, rgb, hsl, hwb, lab, lch, xyz]],
                       [HD, [lab, lch, xyz]],
                       [Ez, [arr, abcd, vB]]];
        let val  = 0.5;                 // create the bitmask values up front...
        let vals = Array.from({length:RGBC.length}, () => val *= 2);
        for (const [target, source] of pairs)
            for (arr of source)         // ...then assign them to properties
                arr.forEach((v, i) => target[v] = vals[i]);

        Ez.tx = Ez.e;                   // for CSS matrix()
        Ez.ty = Ez.f;
        Ez.w  = Ez.width;               // for convenience, consistency w/Prop
        Ez.h  = Ez.height;
        Ez.z  = Ez.w;                   // for transform3d
        Ez.angle = Ez.h;                // for rotate3d()

        // Enumerations:
        let j;
        for (vals of [this.type, this.io, this.status,
                      this.jump, this.vB, this.set]) {
            j = 0;
            for (val of vals)
                E[val] = j++;
        }
        for (val of this.eKey)
            E[val] = val;

        // Popular arguments for Ez.toNumber() and Easy.legNumber():
        // Can't define these inside class Ez because ...Ez.xYZ not ready yet
                           // arguments[2, 3, 4]:
        Ez.undefGrThan0 = [undefined, ...Ez.grThan0];   // > 0, undefined ok
        Ez.undefNotZero = [undefined, ...Ez.notZero];   // !=0, undefined ok
                           // arguments[2, 3, 4, 5]:
        Ez.defGrThan0   = [...Ez.undefGrThan0, true];   // > 0, !undefined
        Ez.defNotNeg    = [null, ...Ez.notNeg, true];   // >=0, !undefined
                           // arguments[   3, 4, 5, 6]:
        Ez.intGrThan0   = [...Ez.grThan0, false, true]; // > 0, int or undefined
        Ez.intNotNeg    = [...Ez.notNeg,  false, true]; // >=0, int or undefined

        // Ease: a collection of preset easy.legs
        let inn, obj, out;              // "in" is a reserved word, thus "inn"
        for (const [name, pow] of this.#presets) {
            inn = pow ? {pow:pow} : {type:E[name.toLowerCase()]};
            out = {...inn, io:E.out};
            inn.io = E.in;              // explicit default value
            [[inn],[out],[inn, out],[out, inn],[inn, {...inn}],[out, {...out}]]
                .forEach((v, i) => Ease[this.io[i] + name] = v);
        }

        // Lock up as much as is plausible, P and Prop are extensible
        for (obj of [Func, Prop])
            Object.values(obj).forEach(o => Object.seal(o));
        for (obj of [C, E, Ease, Ez, F, Func, HD, U])
            Object.freeze(obj);

        this.#initialized = true;
        Object.freeze(this);
    }

    static #keys2Objects(parents, keys) {
        let i, par;
        const l   = keys.length;
        const arr = new Array(l);
        for (i = 0; i < l; i++) {
            par = parents[i]
            arr[i] = keys[i].map(k => par[k])
        }
        return l > 1 ? arr.flat() : arr[0];
    }
    static #names(val, minLen) {
        let i, ln, sn;               // ln = long name, sn = short name
        if (val.length >= minLen)
            sn = val[0];
        if (val.includes("-")) {     // name is snake-case, convert to camelCase
            let cap, i;              // function names are snake-case only
            const arr = val.split("-");
            ln = arr[0];
            for (i = 1; i < arr.length; i++) {
                cap = arr[i][0].toUpperCase();
                ln += cap + arr[i].substring(1);
                if (sn)
                    sn += cap;
            }
        }
        else {                       // name is one word or camelCase
            ln = val;                // property names are all camelCase here
            if (sn) {                // non-CSS SVG attributes are all camelCase
                const m = val.match(/[A-Z]|\d/g);
                if (m)               // match caps or number
                    for (i of m)     // i is one uppercase or numeric char
                        sn += i;
            }
        }
        return {long:ln, short:sn};
    }
    // #add() adds items to U, F, P, Func, Prop
    // required arguments:
    //   vals    - array of function, property, or unit strings (original names)
    //   minLen  - min name length for creating a short name
    //   fpu     - F, P, or U: collection of strings
    // optional:
    //   fnpr    - Func or Prop
    //   units   - string containing default units for the prop or func
    //   utype   - string containing units type property or isUn(structured)
    //   cls     - the class to instantiate
    //   func    - the Prop's func, only used by color functions
    static #add(vals, minLen, fpu, fnpr, units, utype, cls, names_func) {
        let func, name, names, setShort;
        if (names_func) {
            if (names_func.isFunc)
                func  = names_func;
            else // if (Is.A(names_func))
                names =  names_func;
        }
        for (const v of vals) {
            name     = this.#names(v, minLen);
            setShort = name.short && !fpu[name.short];
            Ez.readOnly(fpu, name.long, v); // these are read-only properties
            if (setShort)
                Ez.readOnly(fpu, name.short, v);
            if (fnpr) {
                Ez.readOnly(fnpr, name.long, new cls(v, units, utype, func));
                if (setShort)
                    Ez.readOnly(fnpr, name.short, fnpr[name.long]);
            }
            if (names)
                names.push(name.long);  // camelCase name for kebab-case item
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
class EBase {
    #assign; #autoTrip; #cElms; #eKey; #elms; #evaluate; #iElm; #loopByElm; #mask;
    #oneD; #peri; #plays; #prop; #restore; #twoD; #value;
    _autoTripping;  // the active autoTrip value during an animation

    constructor(o) {
        if (o.calcByElm) {
            this.#oneD = o.oneD;
            this.#iElm = 0;
            this.#loopByElm = o.loopByElm;
        }
        else {
            this.#assign = o.bAbE
                         ? EBase.#assignByArgByElm
                         : EBase.#assignByElmByArg;
        }
        if (o.easies) {             // o.easies validated by EFactory.#easies()
            this.#eKey     = new Array(o.lz);
            this.#plays    = new Array(o.lz);
            this.#autoTrip = new Array(o.lz);
            Ez.is(this, "Measer");  // do it here so setters can use it below
        }
        // Use setters for values that have not yet been validated
        this.#prop = o.prop;    this.#cElms   = o.l;
        this.#elms = o.elms;    this.#value   = o.value;
        this.#mask = o.mask;    this.#restore = o.cvRaw;
        this.#peri = o.peri;    this.autoTrip = o.autoTrip;
        this.#twoD = o.twoD;    this.plays    = o.plays;
        this.eKey  = o.eKey;    this.evaluate = o.evaluate;
        Ez.is(this, "Easer");
    }
//  static _validate() validates that obj is an instance an Easer class
    static _validate(obj, err) {
        if (!obj?.isEaser || obj.isMEaser)
            Ez._mustBeErr(err, "an instance of an Easer class");
        return obj;
    }
//  Getters and setters:
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

    get elmIndex()  { return this.#iElm;  } // used by sub-classes in _apply()
    get elmCount()  { return this.#cElms; } // unused internally
    get loopByElm() { return this.#loopByElm; }

    set loopByElm(val) { this.#loopByElm = Boolean(val); }

// this.autoTrip, this.plays, and this.eKeys are arrays byEasy for Measers
    get autoTrip()  {
        return this.isMeaser
             ? this.#autoTrip.slice()
             : this.#autoTrip;
    }
    get plays()    {
        return this.isMeaser
             ? this.#plays.slice()
             : this.#plays;
    }
    get eKey()    {
        return this.isMeaser
             ? this.#eKey.slice()
             : this.#eKey;
    }

    set autoTrip(val) { // 3 states: true, false, undefined
        const validate = EBase.#validTrip;
        this.#autoTrip = this.isMeaser
                       ? this.#tripPlays(val, "autoTrip", this.#autoTrip, validate)
                       : validate(val);
    }
    set plays(val) {    // a positive integer or undefined
        const validate = EBase.#validPlays;
        this.#plays    = this.isMeaser
                       ? this.#tripPlays(val, "plays", this.#plays, validate)
                       : validate(val);
    }
    #tripPlays(val, name, cv, validate) {
        const arr = Ez.toArray(val, name, validate, ...Ez.okEmptyUndef);
        if (!arr.length || (arr.length == 1 && arr[0] == val)) {
            arr.length = cv.length;
            arr.fill(arr[0]);
        }
        return arr;
    }
    set eKey(val) {
        if (!this.isMeaser)
            this.#eKey = EBase.#validEKey(val);
        else if (!Is.Arrayish(val))
            this.#eKey.fill(EBase.#validEKey(val));
        else {
            const eKey = Ez.toArray(val, "eKey", EBase.#validEKey);
            const lNew = eKey.length;
            const lOld = this.#eKey.length;
            if (lNew != lOld)
                Ez._mustBeErr("eKey.length", "the same as easies.length: "
                                            + `${lNew} != ${lOld}`);
            //----------------
            this.#eKey = eKey;
        }
    }

    meTrip(i, val) {
        this.#autoTrip[i] = this.#meOne(val, "meTrip", EBase.#validTrip);
    }
    mePlays(i, val) {
        this.#plays[i] = this.#meOne(val, "mePlays", EBase.#validPlays);
    }
    meKey(i, val) {
        this.#eKey[i] = this.#meOne(val, "mePlays", EBase.#validEKey);
    }
    #meOne(val, name, validate) {
        if (this.isMeaser)
            return validate(val);
        else
            console.log(name + "() is only for Measers.");
    }

    static #validTrip(val) {
        return Is.def(val) ? Boolean(val) : val;
    }
    static #validPlays(val) {
        return Ez.toNumber(val, "plays", undefined, ...Ez.intGrThan0);
    }
    static #validEKey(val, name = "eKey") {
        if (!Is.def(val))
            return E.value;         // hard default
        else if (PFactory.eKey.includes(val))
            return val;
        else
            Ez._invalidErr(name, val, Ez._listE(name));
    }

    get evaluate()    { return this.#evaluate; }
    set evaluate(val) { this.#evaluate = Ez._validFunc(val,  "evaluate"); }

    eVal(e, i)   {
        return this.#evaluate?.(e, i) ?? (this.isMeaser ? e[this.#eKey[i]]
                                                        : e[this.#eKey]);
    }
//  "Protected" functions:
    _zero(ez, dontSetIt) { // dontSetIt is used by MEBase().prototype._zero()
        if (!dontSetIt)
            this._autoTripping = this._autoTrippy(ez, this.#autoTrip);
        if (this.#loopByElm)
            this.#iElm = 0;
    }
    _autoTrippy(ez, autoTrip) { return autoTrip ?? ez.autoTrip ?? false; }

//  _restore() reverts to the values from when this instance was created
    _restore() {
        if (this.#restore)
            this.#elms.forEach((elm, i) =>
                this.#prop.setIt(elm, this.#restore[i])
            );
        else
            Ez._cantErr("You", "restore because you set noRestore:true");
    }

    _nextElm(plugCV = this.isMeaser) { // plugCV for Measer w/loopByElm
        if (plugCV)      // only necessary first time, not when looping
            this.#twoD[this.#iElm] = this.#oneD.slice();
        if (++this.#iElm == this.#cElms)
            this.#iElm = 0;
        if (plugCV)
            this.#twoD[this.#iElm].forEach((v, i) => this.#oneD[i] = v);
        return this.#iElm;
    }
////////////////////////////////////////////////////////////////////////
//  The two set functions set the property value on one or more elements
    _setElm(e) { // e is undefined for MEaser
        const elm  = this.#elms [this.#iElm];
        const val  = this.#value[this.#iElm]; //++for non-isUn, this.#value could be 1D, all plugs the same
        const oneD = this.#oneD;
        this.#mask.forEach((m, i) => val[m] = oneD[i]);
        this.#prop.setIt(elm, val.join(""));
        this.#peri?.(oneD, e, elm);
    //!!console.log(val.join(""));
    //!!console.log(oneD.map(v => v.toFixed(2)));
    }
    _set(e) {
        const prop = this.#prop
        const val  = this.#value;
        this.#assign(this.#twoD, this.#mask, this.#value);
        this.#elms.forEach((elm, i) => prop.setIt(elm, val[i].join("")));
        this.#peri?.(this.#twoD, e);
    //!!console.log(val.map(v => v.toFixed(2)));
    }
//  The static assign methods. forEach() is nice here because of the multiple
//  callback arguments. If the performance becomes an issue, you can switch to
//  the //++ commented-out versions that use basic for loops.
    static #assignByArgByElm(twoD, mask, val) {
        mask.forEach((m, i) =>
            twoD[i].forEach((v, j) => val[j][m] = v)
        );
    }
    static #assignByElmByArg(twoD, mask, val) {
        twoD.forEach((arr, i) =>
            mask.forEach((m, j) => val[i][m] = arr[j])
        );
    }
//++set(e) {
//++    const elms = this.#elms, prop = this.#prop, val = this.#value;
//++    for (var i = 0, l = this.#cElms; i < l; i++)
//++        prop.setIt(elms[i], val[i].join(""));
//++}
//++static #assignByArgByElm(twoD, mask, val) {
//++    let i, j; // if it comes to this, test declaring this inside the loops
//++    const lm = mask.length;
//++    const lt = twoD[0].length;
//++    for (i = 0; i < lm; i++)
//++        for (j = 0; j < lt; j++)
//++            val[j][mask[i]] = twoD[i][j];
//++}
//++static #assignByElmByArg(twoD, mask, val) {
//++    let i, j;
//++    const lm = mask.length;
//++    const lt = twoD.length;
//++    for (i = 0; i < lt; i++)
//++        for (j = 0; j < lm; j++)
//++            val[i][mask[j]] = twoD[i][j];
//++}
//++static #assignToElm(oneD, mask, val) {
//++    let i;
//++    const lm = mask.length;
//++    for (i = 0; i < lm; i++)
//++        val[mask[i]] = oneD[i];
//++}
}
////////////////////////////////////////////////////////////////////////////////
class Easer extends EBase {      // basic Easer
    #calc;
    constructor(o) {
        super(o);
        this.#calc = new ECalc(o);
        Object.seal(this);
    }
    _apply(e) {
        this.#calc.calculate(this.eVal(e));
        this._set(e);
    }
}
////////////////////////////////////////////////////////////////////////////////
class EaserByElm extends EBase {
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l},
                                 (_, i) => new ECalc(o, o.calcs[i]));
        Object.seal(this);
    }
    _apply(e) {
        this.#calcs[this.elmIndex].calculate(this.eVal(e));
        this._setElm(e);
    }
}
////////////////////////////////////////////////////////////////////////////////
class EaserMulti extends EBase {    // multi-calc Easer
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.multiFunc.length},
                                 (_, i) => new ECalc(o.multiFunc[i]));
        Object.seal(this);
    }
    _apply(e) {
        const ev = this.eVal(e);
        for (const c of this.#calcs)
            c.calculate(ev);
        this._set(e);
    }
}
////////////////////////////////////////////////////////////////////////////////
class EaserMultiByElm extends EBase {
    #calcs;
    constructor(o) {
        const mf = o.multiFunc;
        super(o);
        this.#calcs = Array.from({length:o.l}, (_, i) =>
                            Array.from({length:mf.length}, (_, j) =>
                                  new ECalc(mf[j], mf[j].calcs[i])));
        Object.seal(this);
    }
    _apply(e) {
        let ev = this.eVal(e);
        for (const c of this.#calcs[this.elmIndex])
            c.calculate(ev);
        this._setElm(e);
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEBase extends EBase { // M = multi E = Easer, the multi-ease base class
    #easies; #loopEasy;
    constructor(o) {
        super(o);
        this.#easies = o.easies;      // validated in EFactory.#easies()
        this._autoTripping = Array.from({length:o.lz}, () => undefined);
        if (this.loopByElm) {
            const easies = o.easies;
            let   time   = easies[0].loopTime;
            if (easies.some(ez => ez.loopTime != time))
                Ez._mustBeErr("MEaser loopByElm: easy.loopTime",
                              "the same for all easies");
            //-------
            let p, v;
            const plays = this.plays; // #plays is not available here
            p = 0;
            time  = Math.max(...easies.map(ez => ez.firstTime));
            easies.forEach((ez, i) => {
                if (time - ez.firstTime - ez.loopWait > 0) //!!needs testing!!
                    Ez._cantErr("MEaser loopByElm:", "align easies' loops");
                //-------------------------
                if (ez.firstTime == time) {
                    v = plays[i] || ez.plays;
                    if (v > p) {
                        this.#loopEasy = ez;
                        p = v;
                    }
                }
            });
        }
    }
//  static _validate() validates that obj is an instance a MEaser class
    static _validate(obj, name) {
        if (!obj?.isMEaser)
            Ez._mustBeErr(name, "an instance of a MEaser class");
        return obj;
    }

// this.easies is a shallow copy
    get easies()   { return this.#easies.slice(); }
    get loopEasy() { return this.#loopEasy; } // see Easies.prototype._next()

    _zero() {
        let i, l;
        const aT = this.autoTrip; // #autoTrip not available here
        super._zero(null, true);  // resets #iElm
        for (i = 0, l = this.#easies.length; i < l; i++) {
            this._autoTripping[i] = this._autoTrippy(this.#easies[i], aT[i]);
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaser extends MEBase {        //\ Multi-ease Easer
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.lz},
                                 (_, i) => new ECalc(o, o.calcs[i]));
        Object.seal(this);
    }
    _apply(val) {
        console.log("val:", val);
        val.forEach((v, i) => this.#calcs[i].calculate(v));
        this._set(); //!!no easy.e or collection thereof
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaserByElm extends MEBase {
    #calcs;
    constructor(o) {
        super(o);
        this.#calcs = Array.from({length:o.l}, (_, i) =>
                            Array.from({length:o.lz}, (_, j) =>
                                  new ECalc(o, o.calcs[i][j])));
        Object.seal(this);
    }
    _apply(val) {
        const calcs = this.#calcs[this.elmIndex];
        val.forEach((v, i) => calcs[i].calculate(v));
        this._setElm();
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaserMulti extends MEBase {
    #calcs;
    constructor(o, lmf) { // lmf = o.multFunc.length
        let ez, i, lm, mask, obj;
        const calcs  = [];
        const easies = [];
        const masks  = Array.from({length:lmf}, () => []);
        // Consolidate easies and calcs across funcs
        lm = 0;
        o.multiFunc.forEach((obj, j) => {
            mask = obj.easy2Mask.get(ez);
            for (i = 0; i < mask.length; i++)
                mask[i] += lm; // offset each func's mask to be across funcs
            lm += obj.lm;
        });
        for (obj of o.multiFunc) {
            for (ez of obj.easies) {
                mask = obj.easy2Mask.get(ez);
                for (i = 0; i < mask.length; i++)
                    mask[i] += lm; // offse
                lm += obj.lm;
                // #calcs is byEasyByFunc, these loops are byFuncByEasy
                i = easies.indexOf(ez);
                if (i > -1)
                    calcs[i].push(new ECalc(obj))
                else {
                    calcs .push([new ECalc(obj)]);
                    easies.push(ez);
                }
            }
        }
        o.easies = easies;
        super(o);
        this.#calcs = calcs;
        Object.seal(this);
    }
    _apply(val) {
        let c;
        val.forEach((v, i) => {
            for (c of this.#calcs[i])
                c.calculate(v);
        });
        this._set();
    }
}
////////////////////////////////////////////////////////////////////////////////
class MEaserMultiByElm extends MEBase {
    #calcs;
    constructor(o) {
        let ez, i, j, k, obj;
        const easies = [];           // first consolidate easies
        for (obj of o.multiFunc)
            for (ez of obj.easies)
                if (easies.indexOf(ez) < 0)
                    easies.push(ez);
                                     // then consolidate calcs
        const calcs = Array.from({length:o.l}, () =>
                            Array.from({length:lz}, () => []));
        for (i = 0; i < o.l; i++) {
            for (obj of o.multiFunc) {
                for (j = 0; j < obj.lz; j++) {
                    k = easies.indexOf(obj.easies[j]);
                    calcs[i][k].push(new ECalc(obj, obj.calcs[i][j]));
                }
            }
        }
        o.easies = easies;
        super(o);
        this.#calcs = calcs;
        Object.seal(this);
    }
    _apply(val) {
        let c;
        const calcs = this.#calcs[this.elmIndex];
        val.forEach((v, i) => {
            for (c of calcs[i])
                c.calculate(v);
        });
        this._setElm(es);
    }
}
////////////////////////////////////////////////////////////////////////////////
class ECalc {
    #calcs; #oneD; #twoD; #value;
    constructor(o, calcs = o.calcs) {
        for (const c of calcs)
            c.cNN = ECalc[c.cNN]; // convert string to static function
        this.#calcs = calcs;
        this.#value = undefined;
        if (o.calcByElm)
            this.#oneD = o.oneD;
        else {
            this.#twoD = o.twoD;
            if (o.dmin < 2) {
                this.#oneD = new Array(o.l1);
                if (!o.dmax || o.bySame) {
                    if (o.easies) {
                        let ez, m;
                        for (ez of o.easies)
                            for (m of o.easy2Mask.get(ez))
                                this.#twoD[m] = this.#oneD;
                    }
                    else if (o.multiFunc)
                        this.#twoD.fill(this.#oneD, o.start, o.end);
                    else          // non-multiFunc .start &.end are for distance
                        this.#twoD.fill(this.#oneD);
                }
            }
        }
        Object.seal(this);
    }
    ///////////////////////////////////////////
    static f(a, b) { return a * b; } // factor
    static a(a, b) { return a + b; } // addend
    ///////////////////////////////////////////
    calculate(ev) {
        this.#value = ev;
        for (const c of this.#calcs)
            this.#value = c.cNN(c, c.calc, this.#value, this.#oneD, this.#twoD);
    }
    // The cNN functions. calculate() cycles through these cNN functions, up to
    // four of them, for factor, addend, max, and/or min. The first N is the
    // number of array dimensions for the cached value: #value, #oneD, #twoD.
    // The second N is the number of dimensions for c.param. The "s" suffix
    // indicates "swap" dimensions. #c11() & #c22() don't use .noop because the
    // .noop array slots are already populated and .param doesn't touch them.
    // These functions use forEach because it excludes empty array elements and
    // c.param is sparse. forEach is also convenient and compact where there are
    // >1 callback arguments. If the performance is deemed problematic, then you
    // can convert to for loops, but the c.param loops will have to explicitly
    // exclude undefined elements. c.noop, twoD, and oneD are dense.
    // 2D callback arguments: a is for argument index, e is for element index
    static _c00(c, calc, thisVal) {  // the only one that returns a value
        return calc(c.param, thisVal);
    }
    static _c01(c, calc, thisVal, oneD) {
        c.param.forEach((p, i) =>    // iterate c.param because it's sparse
            oneD[i] = calc(p, thisVal)
        );
        for (const n of c.noop)
            oneD[n] = thisVal;
    }
    static _c01s(c, calc, thisVal, _, twoD) {
        c.param.forEach((p, a) =>
            twoD[a].fill(calc(p, thisVal))
        );
        for (const n of c.noop)
            twoD[n].fill(thisVal);
    }
    static _c02(c, calc, thisVal, _, twoD) {
        let n
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p.forEach((q, e) => twoD[a][e] = calc(q, thisVal));
            else
                twoD[a].fill(calc(p, thisVal));
        });
        c.noop.forEach((p, a) => {   // c.noop = 2D, sparse outer, dense inner
            if (p)                   // p = array or undefined
                for (n of p)
                    twoD[a][n] = thisVal;
            else
                twoD[a].fill(thisVal);
        });
    }
    static _c02s(c, calc, thisVal, _, twoD) {
        let arr, n;
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, thisVal));
            else                     // twoD is empty until now
                for (arr of twoD)
                    arr[e] = calc(p, thisVal);
        });
        c.noop.forEach((p, e) => {
            if (p)
                for (n of p)
                    twoD[n][e] = thisVal;
            else                     // twoD is still sparse
                for (arr of twoD)
                    arr[e] = thisVal;
        });
    }
    static _c10(c, calc, _, oneD) {
        oneD   .forEach((v, i) => oneD[i] = calc(c.param, v));
    }
    static _c11(c, calc, _, oneD) {
        c.param.forEach((p, i) => oneD[i] = calc(p, oneD[i]));
    }
    static _c11s(c, calc, _, oneD, twoD) {
        let n;                       // param byArg, oneD byElm
        c.param.forEach((p, a) =>
            oneD.forEach((v, e) => twoD[a][e] = calc(p, v))
        );
        for (n of c.noop)
            oneD.forEach((v, e) => twoD[n][e] = v);
    }
    static _c12(c, calc, _, oneD, twoD) {
        let n;
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p   .forEach((q, e) => twoD[a][e] = calc(q, oneD[e]));
            else
                oneD.forEach((v, e) => twoD[a][e] = calc(p, v));
        });
        c.noop.forEach((p, a) => {   // p = array, never undefined
            for (n of p)
                twoD[a][n] = oneD[n];
        });
    }
    static _c12s(c, calc, _, oneD, twoD) {
        let arr, n;                  // param byElmbyArg, oneD byElm
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, oneD[e]));
            else                     // twoD is empty until now
                for (arr of twoD)
                    arr[e] = calc(p, oneD[e]);
        });
        c.noop.forEach((p, e) => {
            for (n of p)
                twoD[n][e] = oneD[e];
        });
    }
    static _c20(c, calc, _, __, twoD) {
        for (const arr of twoD)
            arr.forEach((v, e) => arr[e] = calc(c.param, v));
    }
    static _c21(c, calc, _, __, twoD) {
        let arr;
        c.param.forEach((p, e) => {
            for (arr of twoD)
                arr[e] = calc(p, arr[e]);
        });
    }
    static _c21s(c, calc, _, __, twoD) {
        c.param.forEach((p, a) =>
            twoD[a].forEach((v, e, arr) => arr[e] = calc(p, v))
        );
    }
    static _c22(c, calc, _, __, twoD) {
        c.param.forEach((p, a) => {
            if (Is.A(p))
                p.forEach((q, e) => twoD[a][e] = calc(q, twoD[a][e]));
            else
                twoD[a].forEach(
                         (v, e, arr) => arr[e] = calc(p, v));
        });
    }
    static _c22s(c, calc, _, __, twoD) {
        let arr;
        c.param.forEach((p, e) => {
            if (Is.A(p))
                p.forEach((q, a) => twoD[a][e] = calc(q, twoD[a][e]));
            else
                for (arr of twoD)
                    arr[e] = calc(p, arr[e]);
        });
    }
    // #noop() works for 1D & 2D setups because twoD is already filled with oneD
    static _noop(_, __, thisVal, oneD) { oneD.fill(thisVal); }

//++static newCalc(calc, cN_, c_N, swapEm, param, noop) {
//++    let cNN;
//++    switch (cN_) {
//++    case -1:
//++        cNN = this.#noop;
//++    case 0:
//++        if (!c_N)
//++            cNN = this.#c00;
//++        else if (c_N == 1)
//++            cNN = swapEm ? this.#c01s : this.#c01;
//++        else
//++            cNN = swapEm ? this.#c02s : this.#c02;
//++        break;
//++    case 1:
//++        if (!c_N)
//++            cNN = this.#c10;
//++        else if (c_N == 1)
//++            swapEm ? this.#c11s : this.#c11;
//++        else
//++            cNN = swapEm ? this.#c12s : this.#c12;
//++        break;
//++    case 2:
//++        if (!c_N)
//++            cNN = this.#c20;
//++        else if (c_N == 1)
//++            swapEm ? this.#c21s : this.#c21;
//++        else
//++            cNN = swapEm ? this.#c22s : this.#c22;
//++    }
//++    this.#calcs.push({calc:calc, cNN:cNN, param:param, noop:noop});
//++    return this.#calcs.at(-1);
//++}
}
////////////////////////////////////////////////////////////////////////////////
class EFactory { // static Class, not const Object, for private members feature
    static #keys   = ["f",           "a",           "max",      "min"     ];
    static #calcs  = [ECalc.f,       ECalc.a,       Math.min,   Math.max  ];
    static #byElms = ["factorByElm", "addendByElm", "maxByElm", "minByElm"];
    static #noop   = {cNN:"_noop"};

    // create() is the one public method
    static create(o) {
        o.prop = PBase._validate(o.prop, "prop", true);
        o.func = o.func || o.prop.func;
        o.peri = Ez._validFunc(o.peri, "peri");

        if (o.func && !o.func.isFunc)
            Ez._mustBeErr("func", "an instance of Func or undefined");
        if (o.prop.isUn || o.func?.isUn)
            o.set = E.net;              // just force it

        o.isNet = (o.set == E.net);
        if (o.isNet && o.multiFunc)
            Ez._cantBeErr("You", "use .multiFunc for "
                               + o.func ? o.func.name : o.prop.name);

        o.elms = Ez.toElements(o.elms || o.elm || o.elements || o.element);
        o.l    = o.elms.length;
//??    if (!o.l)
//??        throw new Error("Every target must have elements.");
//??    //--------------------------------
        o.loopByElm = o.l > 1 && (o.loopByElm ?? o.loopByElement);
        o.calcByElm = o.loopByElm || o.l == 1;

        if (o.isNet)
            o.prop.getUnToObj(o);
        else if (!o.noRestore)       // an obscure option, might as well...
            this.#getCV(o);          // for restore()

        if (o.byElm || o.byElement)
            o.byElm = true;          // 1D arrays are by element
        if (o.bAbE  || o.byArgbyElm)
            o.bAbE = true;           // 2D arrays are [arg[elm]]

        return o.multiFunc ? this.#createMultiFunc(o)
                           : this.#createBasic(o);
    }
    // #createBasic() creates a basic Easer, no func or single func
    static #createBasic(o) {
        this.#afcru (o);
        this.#config(o);
        this.#mask  (o);
        this.#easies(o);
        if (!o.isNet)
            this.#optional(o);
        else {
            let l;
            const c    = o.mask.at(-1) + 1;
            const lens = o.lens;
            for (l of lens)
                if (l < c)
                    throw new Error("Element's current value has fewer than "
                                    + c + "numbers in it.");
            //-----------------------------------------------------------
            // normalize .numBeg, .numEnd, .cv, and .seps across elements
            o.c  = c;
            o.lm = o.mask.length;
            if (o.numBeg.every(b => b)) {
                //!!o.numBeg.forEach((_, i) => o.seps[i].shift()); // leading ""
                o.numBeg = true;
            }
            else
                o.numBeg = false;

            if (Math.max(...lens) > c){
                let j, s;               // squeeze trailing cv & seps into last sep
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
        this.#maskCV   (o, o.l, o.mask, o.lm);
        this.#endToDist(o);
        this.#plugCV   (o); //!!careful with E.net and getUn() here!!
        this.#resetDims(o, o.dims);

        if (o.calcByElm)
            return this.#createByElm(o);
        //----------------------------------
        o.bAbE = true;           // default is bAbE, only one exception:
        o.l2   = o.lm;           //  no 2D arrays and all 1D are byArg
        o.l1   = o.l;            // #bySame() handles the exception
        this.#bySame(o);
        return this.#createOne(o);
    }
    // #createMultiFunc() creates a multi-func Easer
    static #createMultiFunc(o) {
        if (!o.prop.isMultiFunc)
            throw new Error(o.prop.name + " does not support multiple functions.");
        //-------------------------------------------------------------
        let calc, count, cv, getCV, i, index, isMC, k, l, mf, obj, val;
        const values = [];
        const multiF = o.multiFunc;
        const lmf    = multiF.length;

        val   = 0;
        o.lm  = 0;
        getCV = (o.set != E.set);
        if (getCV)
            l = lmf;
        for (obj of multiF) {
            obj.l = o.l;    // each multiFunc object is a mini-o
            obj.isMultiFunc= true;
            this.#afcru (obj);
            this.#config(obj);
            this.#mask  (obj);
            val  += this.#easies(obj);
            o.lm += obj.lm;
            obj.noCV = !obj.configCV && obj.set == E.set;
            if (getCV && obj.noCV)
                --l;
        }
        if (val == lmf)
            o.hasEasies = true;
        else if (val)
            throw new Error("easy/easies is all or none. You have defined "
                          + "them for some but not all of your functions.");
        ////////////////////////////////////////////////////////////////////
        // Validation of current values is in #maskCV() and #plugCV()
        if (getCV && l) {
            cv = o.prop.getMany(o.elms);
            for (obj of multiF)
                if (!obj.noCV)
                    obj.cv = new Array(o.l);
            for (i = 0; i < o.l; i++) {
                if (!cv[i]) continue;
                /////////////////////
                mf = this.#splitMultiFunc(cv[i]);
                for (obj of multiF) {
                    if (obj.noCV) continue;
                    ///////////////////////
                    index = mf.names.indexOf(obj.func.name);
                    if (index > -1)
                        obj.cv[i] = mf.args[index].split(E.comsp);
                }
            }
        }
        for (obj of multiF) {
            this.#optional (obj);
            this.#maskCV   (obj, obj.l, obj.mask, obj.lm);
            this.#endToDist(obj);
            this.#plugCV   (obj);
            this.#resetDims(obj, obj.dims);
            if (!o.loopByElm)
                this.#bySame(obj);
            values.push(obj.value); // array of plugged values for next loop
        }
        o.value = Array.from({length:o.l}, () => []);
        for (i = 0; i < o.l; i++) { // fill in o.value, squeezing once more
            val = o.value[i];
            val.push(...values[0])
            for (i = 1; i < lmf; i++) {
                val[val.length - 1] += values[i][0];
                val.push(...values[i].slice(1));
            }
        }
        // Each o.value[n] begins with "func(" and ends with ")"
        // val.length is an odd number and o.mask[0] == 1
        o.mask = Array.from({length:o.lm}, (_, j) => (j * 2) + 1);

        // If all the multiFunc config objects can be concatenated into one, we
        // can use a plain Easer instead of EaserMulti, which is more efficient.
        // Concatenated cfg.param arrays must be byArg for the outer dimension,
        // otherwise it's too complex because the elements are the same across
        // functions while the arguments are specific to each function.
        // 1D byElm arrays must be converted to 2D byArgByElm. On the one hand,
        // that reduces the efficiency gained. On the other hand, and it allows
        // for concatenating 1D byElm arrays with 2D arrays; and the conversion
        // code overlaps with another case, so it's as much code to exclude
        // them as it is to include them. 2D arrays can swap dims easily enough,
        // so cfg.bAbE is ignored and mismatches are allowed.
        // The use of obj as a callback argument breaks my overlapping variable
        // name rule, but it keeps the multiFunc loop variable names consistent.
        if (multiF.some(obj => obj.config.length)) {
            l  = this.#calcs.length;
            mf = Array.from({length:l}, () => new Array(lmf));
            count = new Array(l).fill(0);
            index = new Array(l);
            for (i = 0; i < l && !isMC; i++) {
                calc = this.#calcs[i];
                multiF.forEach((obj, j) => {
                    k = obj.config.findIndex(cfg => cfg.calc === calc);
                    if (k > -1) {
                        val = obj.config[k];
                        mf[i][j] = val;
                        index[i] = k;
                        count[i]++;
                    }
                });
                if (!mf[i].every(cfg => cfg.dim   == val.dim
                                     && cfg.byElm == val.byElm)
                 && !mf[i].every(cfg => (cfg.byElm && val.dim == 2)
                                     || (val.byElm && cfg.dim == 2)))
                    isMC = true;
            }
        }
        if (isMC) {
            for (obj of multiF)
                if (obj.bySameByArg)   // see ECalc constructor, must be .byElm
                    delete obj.bySame;

            if (!o.calcByElm) {              // byElm only goes up to 1D
                o.twoD = Array.from({length:o.lm}, () => new Array(o.l));
                o.bAbE = true;
            }
            if (o.hasEasies) {
                if (multiF.every(obj => obj.easy)) {
                    // 1 easy per func aligns to makes things simpler and use
                    // the MEaser classes instead of the MEaserMulti classes. If
                    // there are >2 funcs, o.easies can contain duplicates, but
                    // it's not a problem. The simplicity gained far outweighs
                    // the negigible efficiency that might be lost.
                    o.easies = multiF.map(obj => obj.easy);
                    o.lz     = lmf;
                    if (o.calcByElm) {
                        o.calcs = Array.from({length:o.l}, () => []);
                        for (obj of multiF) {
                            this.#calcByElm(obj);
                            for (i = 0; i < o.lm; i++)
                                o.calcs[i].push(obj.calcs[i]);
                        }
                        return new MEaserByElm(o);
                    } ////////////////////////////
                    o.calcs = [];
                    for (obj of multiF) {
                        this.#calc(obj);
                        o.calcs.push(obj.calcs);
                    }
                    return new MEaser(o);
                } ////////////////////////////////
                if (o.calcByElm) {
                    o.twoD = Array.from({length:o.l}, () => new Array(o.lm));
                    for (obj of multiF) {
                        this.#calcByElm(obj);
                        this.#calcMEaserByElm(obj, obj.calcs);
                    }
                    return MEaserMultiByElm(o);
                } ////////////////////////////////
                for (obj of multiF)
                    this.#calcMEaser(obj);
                return new MEaserMulti(o, lmf);
            } ////////////////////////////////////
            if (o.calcByElm) {
                for (obj of multiF)
                    this.#calcByElm(obj);
                return new EaserMultiByElm(o);
            } ////////////////////////////////////
            val = 0;
            for (obj of multiF) { // create the offsets for each obj
                obj.start = val;
                val      += obj.lm;
                obj.end   = val;
                this.#calc(obj);
            }
            return new EaserMulti(o);
        } ////////////////////////////////////////
        let a, arr, b, cfg, lm, plus1, prm;
        o.config = [];
        for (i = 0; i < l; i++) {
            if (!count[i]) continue;
            ////////////////////////
            arr = mf[i];
            val = arr[index[i]];
            cfg = { calc:val.calc, dim:val.dim };
            if (!cfg.dim && (count[i] == 1
                          || arr.every(v => v.param == val.param)))
                cfg.param = val.param; // all params are the same number
            else {
                k = 0;
                prm = new Array(o.lm);
                plus1 = false;
                for (i = 0; i < lmf; i++) {
                    lm  = multiF[i].lm;
                    obj = arr[i]
                    if (Is.def(obj)) {
                        if (!obj.dim || obj.byElm) {
                            prm.fill(obj.param, k, k + lm);
                            plus1 = true;
                        }
                        else if (obj.dim == 1 || obj.bAbE)
                            obj.param.forEach((p, j) => prm[k + j] = p);
                        else if (Is.A(obj.param))
                            obj.param.forEach((p, j) =>
                                p.forEach((q, n) => prm[k + n][j] = q)
                            );
                        else {
                            a = k;
                            b = k + lm;
                            while (a < b)
                                prm[a++][i] = obj.param;
                        }
                    }
                    k += lm;
                }
                cfg.param = prm;
                if (plus1)
                    cfg.dim++;
                if (cfg.dim == 2)
                    cfg.bAbE = true;
            }
            o.config.push(cfg);
        }
        if (o.calcByElm)
            return this.#createByElm(o);
        ////////////////////////////////////
        if (multiF.every(obj => obj.bySameByArg)) {
            o.l2 = o.l;
            o.l1 = o.lm;
            delete o.bAbE;
            o.bySame = true;
        }
        else {
            o.l2 = o.lm;
            o.l1 = o.l;
            o.bAbE = true;
            o.bySame = multiF.every(obj => obj.bySame);
        }
        return this.#createOne(o);
    }
    static #createOne(o) {
        o.twoD = Array.from({length:o.l2}, () => new Array(o.l1));
        if (o.easies) {
            this.#calcMEaser(o);
            return new MEaser(o);
        }
        this.#calc(o);
        return new Easer(o);
    }
    static #createByElm(o) {
        this.#calcByElm(o);
        if (o.easies) {
        //!!this.#calcMEaserByElm(o, o.calcs);
            return new MEaserByElm(o);
        }
        return new EaserByElm(o);
    }
    static #splitMultiFunc(cv) { // split cv into func names and values
        let args  = [];          // if cv == "", returns an empty array
        let names = [];
        let split = cv.split(E.func);
        split.length--;          // always an extra trailing array element = ""
        split.forEach((v, i) => (i % 2 ? args : names).push(v.trimStart()));
        return { args:args, names:names };
    }
    ////////////////////////////////////////////////////////////////////////////
    /////////////////////////////////// Helpers for #addOne() #addMultiFunc() //
    static #afcru(o) {
        //    okNull is because E.cV === null === legit value for o.a and o.f
        const okNull = [undefined, false, false, false, false, false];

        // addend and factor can be undefined (unused) or null (E.currentValue)
        // if defined, o.start is addend and o.end is factor
        o.start = Ez.toNumber(o.start, "start", ...okNull);
        o.end   = Ez.toNumber(o.end,   "end",   ...okNull);

        // o.a = addend: if it's zero, set it undefined, adding 0 is pointless
        o.a = o.start ?? Ez.toNumber(o.addend, "addend", ...okNull);
        if (o.a === 0)
            o.a = undefined;

        // o.f = factor: can only be 0 if it's o.end, else multiply by 0
        o.isTo = Is.def(o.end); // o.f = end instead of distance
        if (o.isTo) {
            if (o.end === o.a)  // more validation in #endToDist()
                Ez._cantBeErr("start and end values", "the same");
            //----------
            o.f = o.end;
        }
        else {                  // more alt names for factor
            const name = Is.def(o.factor)   ? "factor"
                       : Is.def(o.distance) ? "distance"
                       : Is.def(o.dist)     ? "dist"
                                            : "";
            okNull[2] = true    // factor can't be zero
            o.f = name ? Ez.toNumber(o[name], name, ...okNull)
                       : undefined;
        }

        // o.c and o.r are not user-defined, o.u is user-optional w/default
        if (!o.isNet) {                    // isNet = (o.set == E.net);
            o.c = o.prop.count(o.func);    // c = arg count
            o.r = o.prop.required(o.func); // r = required arg count
            o.u = o.units                  // u = units, Prop provides default
               ?? o.prop._unitz(o.func);
        }
    }
    // #config() processes factor, addend, max, and min into o.config.
    // 1D config.param arrays can be byArg (the default) or byElm. Users can
    // explicitly set byElm for all 1D arrays or for each one separately.
    // There are also obvious cases where byElm can be implied.
    static #config(o) {
        let cfg, hasCV, j, l, prm;

        Object.assign(o, {config:[], dims:[]});
        this.#keys.forEach((key, i) => {
            prm = o[key];
            if (Is.def(prm)) {
                cfg = { param: prm,
                        calc:  this.#calcs[i],
                        dim:   Ez._dims(prm)   };

                switch (cfg.dim) {
                case 0:
                    hasCV = (prm === E.cV);
                    break;
                case 1:                // .byElm and .bAbE are true or undefined
                    l     = prm.length;
                    hasCV = prm.includes(E.cV);
                    if (o.byElm || Object.hasOwn(o, this.#byElms[i]))
                        cfg.byElm = true;
                    else if (o.c == 1)
                        cfg.byElm = true;
                    else if (l > o.c && l <= o.l)
                        cfg.byElm = true;
                    this.#paramLength(l, key, cfg.byElm);
                    if (!cfg.byElm)    // .byArg is duplicative, but useful
                        cfg.byArg = true;
                    break;
                case 2:
                    cfg.bAbE = o.bAbE; // maskCV() & endToDist() can alter this
                    this.#paramLength(l, key, !cfg.bAbE);
                    l     = prm.length;
                    hasCV = false;
                    for (j = 0; j < l; j++) {
                        this.#paramLength(prm[j].length, key, cfg.bAbE);
                        if (!hasCV)
                            hasCV = !Is.def(prm[j]) || prm[j].includes(E.cV);
                    }
                }
                o.config.push(cfg);
                o.dims  .push(cfg.dim);
                if (hasCV) {
                    if (!o.configCV)
                        o.configCV = [cfg];
                    else
                        o.configCV.push(cfg);
                }
            }
        });
        if (o.configCV)
            o.oneArg = (o.c == 1);     // see #maskCV()
    }
    static #paramLength(l, key, byElm) {
        const elmArg = [[o.l, "elements"], [o.c, "arguments"]]
                       [!byElm];
        if (l > elmArg[0])
            throw new Error(`${key} array length exceeds the number of `
                            `${elmArg[1]}: ${l} > ${elmArg[0]}`);
    }
    // mask() sets o.mask to a dense array of sorted argument indexes.
    // Valid user mask types are:
    //  - dense array of arg indexes (pre-formatted by user)
    //  - bitmask int:  Ez defines them for specific func/prop arguments
    //  - sparse array: non-empty slots = masked indexes
    //  - o.config:     sequential indexes 0 to array.length - 1
    //  - undefined:    sequential indexes 0 to o.r - 1
    // For all mask types except the first one, o.mask is code-generated.
    // PBase.prototype._mask() validates the first type to prevent errors later.
    static #mask(o) {
        const count = o.isNet ? Math.min(...o.cv.map(arr => arr.length))
                              : o.c;
        if (o.mask)                      // user mask: validate/format it
            o.mask = o.prop._mask(o.mask, o.func, count);
        else if (o.dims.some(dim => dim > 0)) {
            const l = [];                // the longest cfg.param array is mask:
            o.config.forEach((cfg, i) => { // treats array contents as dense &
                switch (cfg.dim) {         // sequential from 0 to length - 1.
                case 2:                    // empty array slots are noops for
                    l[i] = cfg.bAbE        // for calcs, not unmasked args.
                         ? cfg.param.length
                         : Math.max(...cfg.param.map(arr => arr.length));
                    break;
                case 1:
                    l[i] = cfg.byElm ? 0 : cfg.param.length;
                    break;
                case 0:
                    l[i] = 0;
                }
            });
            o.mask = PBase._maskAll(Math.min(count, Math.max(...l)));
        }
        else if (o.isNet)                // undefined: mask all required args
            o.mask = PBase._maskAll(count);
        else {                           // ditto
            o.mask = PBase._maskAll(o.r);
            o.c = o.r;
        }
        o.lm = o.mask.length;
        if (!o.isNet && o.lm == o.c)
            o.set = E.set;
    }
    // #easies() processes o.easies or multiFunc.easy for MEasers.
    // Consolidates array of easies into a Map: easy => mask indexes.
    // These are indexes into cfg.param/o.mask, not into prop/func args.
    // o.easies cannot be sparse and must be the same length as o.mask.
    static #easies(o) {
        const easies = "easies";
        const easy   = "easy";
        if (o[easies]) {
            o[easies] = Ez.toArray(o[easies], easies, Easy._validate)
            if (o[easies].length != o.lm)
                Ez._mustBeErr(easies, "the same length as mask");
        }
        else if (o.isMultiFunc && o[easy])
            Easy._validate(o[easy], easy);
        else
            return 0;          // #createMultiFunc() uses the return value
        //--------------------
        o.easy2Mask = new Map;
        if (o[easy])           // multiFunc-only, lm often == 1
            o.easy2Mask.set(o[easy], PBase._maskAll(o.lm));
        else {
            o[easies].forEach((ez, i) => {
                if (o.easy2Mask.has(ez))
                    o.easy2Mask.get(ez).push(i);
                else
                    o.easy2Mask.set(ez, [i]);
            });
            // Reduce o.easies to unique values
            o[easies] = Array.from(o.easy2Mask.keys());
            o.lz = o[easies].length;
        }
        return 1;
    }
    // #getCV() gets current values and parses them into a 2D array of strings
    // by element by argument: [elm[arg]]
    static #getCV(o) {
        o.cvRaw = o.prop.getMany(o.elms);
        o.cv    = o.cvRaw.map(v => o.prop.parse(v, o.func));
    }
    static #optional(o) {           // adjust o.c downward if possible
        if (o.r == o.c || o.lm == o.c)
            return;
        ///////////
        let l = o.mask.at(-1) + 1;
        if (l == o.c)
            return;
        ///////////
        let c;
        if(o.set == E.set)          // sets c < o.c
            c = Math.max(o.r, l);
        else {                      // sets c <= o.c
            if (!Is.def(o.cv))      // if multiFunc, o.cv can = "", otherwise
                this.#getCV(o); // it's an array or not yet defined.
            c = o.cv ? Math.max(...o.cv.map(v => v.length)) : 0;
            c = Math.max(o.r, l, c);
        }
        if (c < o.c) {
            if (c == l)
                o.set = E.set;
            o.c = c;
        }
    }
    // #maskCV() populates factor/addend with current values as specified by
    // the user via E.currentValue or its shorthand E.cV.
    // Users are not allowed to mix 2D array types, but #maskCV() can create
    // byElmByArg arrays in spite of {byArgByElm:true}. o.cv is byElmByArg, so
    // that's how #maskCV() operates. This is not a problem, but it complicates
    // #endToDist() and creates the need for ECalc.#c22s().
    static #maskCV(o, l, mask, lm) {
        if (!o.configCV) return;
        ////////////////////////
        let allValues, byDim, cfg, cv, idx, isSame, len, m, maskCV, prm,
            sameArgs,  sameElms;
        if (!Is.def(o.cv))
            this.#getCV(o);
        // Convert all of o.cv to numbers up front. It makes isSame comparisons
        // more efficient and the code simpler. Yes, it might convert values
        // that are never used as numbers, but converting on demand can convert
        // some values more than once, so neither method is perfect. Optimizing
        // beyond that is not worth it, and these arrays are small.
        const cvNum  = o.cv.map(cv => cv.map(v => Ez.toNumby(v, o.func, o.u)));
        const minLen = mask.at(-1) + 1;
        const err    = "E.currentValue requires elements to have a value in "
                     + o.prop.name + " for every masked argument specified.";

        // Process by cfg.dim, 0 is the most diverse
        byDim = o.configCV.filter(cfg => !cfg.dim);
        if (byDim.length) {
            let cvFlat, dim;
            allValues = this.#allMustHaveValues(o);
            if (o.oneArg) {
                cvFlat = cvNum.flat();
                cv     = cvFlat[0];
                isSame = cvFlat.every(v => v == cv);
                dim    = isSame ? 0 : 1;
            }
            else {
                sameArgs = this.#isSameByArg(cvNum, l, mask, lm);
                sameElms = this.#isSameByElm(cvNum, l, mask, lm);
                dim = sameArgs && sameElms ? 0
                    : sameArgs || sameElms ? 1
                                           : 2;
            }
            switch (dim) {
            case 0:
                prm = cvNum[0][0];
                break;
            case 1:
                if (o.oneArg)         // 1D array byElm
                    prm = cvFlat;
                else if (sameArgs) {  // 1D array byArg
                    prm = new Array(lm);
                    cv  = cvNum[0];
                    this.#minArgs(cv, minLen, err, 0);
                    mask.forEach((w, j) => prm[j] = cv[w]);
                }
                else {                // 1D array byElm
                    prm = new Array(l);
                    m   = mask[0];
                    cvNum.forEach((v, i) => {
                        this.#mustBeNumber(v[m], err, i, m);
                        prm[i] = v[m];
                    });
                }
                break;
            case 2:
                prm = Array.from({length:l}, () => new Array(lm));
                cvNum.forEach((v, i) => {
                    this.#minArgs(v, minLen, err, i);
                    mask.forEach((w, j) =>  prm[i][j] = v[w]);
                });
            }
            for (cfg of byDim) {
                cfg.dim   = dim;
                cfg.param = prm;
                if (dim == 1 && (o.oneArg || sameElms)) {
                    cfg.byElm = true;
                    delete cfg.byArg;
                }
            }
        }
        // 1D byElm
        byDim = o.configCV.filter(cfg => cfg.byElm);
        if (byDim.length) {
            for (cfg of byDim) {
                isSame = sameElms ?? lm == 1;
                maskCV = [];    // the indexes containing E.cV: masked elements
                idx    = 0;
                while ((idx = cfg.param.indexOf(E.cV, idx)) > -1) {
                    this.#mustHaveValue(o.cv[idx], err, idx);
                    maskCV.push(idx);
                }
                if (!isSame) {
                    cv = [];    // cvNum for the masked elements only
                    for (m of maskCV)
                        cv.push(cvNum[m]);
                    isSame = this.#isSameByElm(cv, cv.length, mask, lm);
                }
                if (isSame) {
                    prm = cfg.param;
                    idx = mask[0];
                    m   = maskCV[0]
                    this.#minArgs(cvNum[m], idx + 1, err, m);
                    for (m of maskCV)
                        prm[m] = cvNum[m][idx];
                }
                else {          // creates a 2D byElmByArg array
                    prm = new Array.from({length:cfg.param.length},
                                         () => new Array(lm));
                    cfg.param.forEach((p, i) => {
                        if (p === E.cV) {
                            this.#minArgs(cvNum[i], minLen, err, i);
                            mask.forEach((w, j) => prm[i][j] = cvNum[i][w]);
                        }
                        else
                            prm[i].fill(p);
                    });
                    cfg.param = prm;
                    cfg.dim++;
                }
            }
        }
        // 1D byArg
        byDim  = o.configCV.filter(cfg => cfg.byArg);
        if (byDim.length) {
            allValues = this.#allMustHaveValues(o, allValues);
            for (cfg of byDim) {
                isSame = sameArgs ?? l == 1;
                maskCV = [];      // the indexes containing E.cV
                idx    = 0;
                while ((idx = cfg.param.indexOf(E.cV, idx)) > -1)
                    maskCV.push(idx);
                if (!isSame)
                    isSame = this.#isSameByArg(cvNum, l, maskCV,
                                                   maskCV.length);
                len = maskCV.at(-1) + 1;
                if (isSame) {
                    prm = cfg.param;
                    this.#minArgs(cvNum[0], len, err, 0);
                    for (m of maskCV)
                        prm[m] = cvNum[0][m];
                }
                else {            // creates a 2D byElmByArg array
                    prm = new Array.from({length:l}, () => [...cfg.param]);
                    cvNum.forEach((v, i) => {
                        this.#minArgs(v, len, err, i);
                        for (m of maskCV)
                            prm[i][m] = v[m];
                    });
                    cfg.param = prm;
                    cfg.dim++;
                }
            }
        }
        // 2D bAbE, byArgByElm: [arg[elm]]
        byDim = o.configCV.filter(cfg => cfg.bAbE);
        for (cfg of byDim) {
            if (!allValues && cfg.param.includes(E.cV))
                allValues = this.#allMustHaveValues(o, allValues);
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    prm = new Array(l);
                    cvNum.forEach((v, j) => {
                        this.#mustBeNumber(v[i], err, j, i);
                        prm[j] = v[i];
                    });
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1) {
                        this.#mustHaveValue(o.cv[idx], err, idx);
                        this.#mustBeNumber (cvNum[idx][i], err, idx, i);
                        p[idx] = cvNum[idx][i];
                    }
                }
            });
        }
        // 2D bEbA, byElmByArg: [elm[arg]]
        byDim = o.configCV.filter(cfg => cfg.dim == 2 && !cfg.bAbE);
        for (cfg of byDim) {
            cfg.param.forEach((p, i) => {
                if (p === E.cV) {
                    this.#mustHaveValue(o.cv[i], err, i);
                    this.#minArgs(cvNum[i], minLen, err, i);
                    prm = new Array(lm);
                    mask.forEach((w, j) => prm[j] = cvNum[i][w]);
                    cfg.param[i] = prm;
                }
                else if (Is.A(p)) {
                    this.#mustHaveValue(o.cv[i], err, i);
                    len = p.lastIndexOf(E.cV);
                    this.#minArgs(cvNum[i], len, err, i);
                    idx = 0;
                    while ((idx = p.indexOf(E.cV, idx)) > -1)
                        p[idx] = cvNum[i][idx];
                }
            });
        }
        if (o.max && o.min) {
            //!!reorder by dim for minor efficiency gain
            //!!if fa.dim < max or min.dim and max dim <> min dim, etc.
        }
    }
    // Helpers for #maskCV():
    // #isSameByArg() - Is every masked arg the same across elms?
    static #isSameByArg(cv, l, mask, lm) {
        let b, i, j;
        const v = cv[0];
        b = true;
        for (i = 0; b && i < l; i++)
            for (j = 0; b && j < lm; j++)
                b = (cv[i][mask[j]] == v[mask[j]]);
        return b;
    }
    // #isSameByElm() - Is every masked arg within each elm the same?
    static #isSameByElm(cv, l, mask, lm) {
        let b, i, j;
        const m = mask[0];
        b = true;
        for (i = 0; b && i < l; i++)
            for (j = 0; b && j < lm; j++)
                b = (cv[i][mask[j]] == cv[i][m]);
        return b;
    }
//  Validation functions for #maskCV(): Validation occurs at different levels in
//  order to catch errors as early as possible in the code and achieve small
//  efficiencies. The highest level prevents empty string in o.cv[n]. The next
//  level down is #minArgs(), which validates that the o.cv[n] array has enough
//  elements, based on o.mask.at(-1). This assumes that a property which uses
//  numeric values can leave an argument undefined, but it cannot define an
//  argument as a non-numeric value. #mustBeNumber() is the bottom level of
//  validation, where isNaN() fails for both NaN and undefined.
//  static #allMustHaveValues() throws an error if any element doesn't have a value
    static #allMustHaveValues(o, alreadyTrue) {
        if (!alreadyTrue && o.cv.some(v => !v))
            throw new Error(err);
        return true;
    }
//  static #mustHaveValue() throws an error if an element's property has no value
    static #mustHaveValue(val, err, i) {
        if (!val)
            throw new Error(`Element ${i}: ` + err);
    }
//  static #minArgs() throws an error if cv doesn't have enough arguments
    static #minArgs(cv, minLen, err, i) {
        if (cv.length < minLen)
            throw new Error(`Element ${i}: ` + err);
    }
//  static #mustBeNumber() throws an error if val is not a number
    static #mustBeNumber(val, err, i1, i2) {
        if (isNaN(val))
            throw new Error(`Element ${i1}, argument ${i2}: ${err}`);
    }
//  static #endToDist() converts factor from end to distance. If addend is
//          undefined, it defaults to zero and no conversion is necessary.
//          User factor can be end or distance; run-time factor is distance.
    static #endToDist(o) {
        if (!o.isTo || !Is.def(o.a)) return;
        //-----------
        let prm, val;
        const f  = o.config[0];
        const a  = o.config[1];
        const fp = f.param;
        const ap = a.param;
        const la = ap.length;
        // Every factor value must have a corresponding addend value, but I
        // default addend to 0 at the top level, so I do the same here.
        // Addends without factors are sketchy, but I let it slide because
        // you can have a start point without a distance, but not vice-versa.
        // You need both start and end to calculate distance.
        const err = Ez._mustBe("Every end value's corresponding start value",
                               "number or undefined (defaults to 0)");
        // To properly calculate distance, factor.dim must be >= addend.dim.
        // For example, consider a single end value with multiple start values,
        // the result requires as many distances as there are start values.
        // These are sparse arrays, which somewhat complicates the code below.
        if (f.dim < a.dim) {
            if (!f.dim || f.byElm == a.bAbE) {
                if (a.dim - f.dim == 1) {
                    if (!f.dim) {         // 0 to 1 dims
                        prm = new Array(la);
                        ap.forEach((p, i) => prm[i] = fp - p);
                        f.byElm = a.byElm;
                        f.byArg = a.byArg;
                    }
                    else {                // 1 to 2 dims
                        prm = Array.from({length:la}, () => new Array(fp.length));
                        ap.forEach((p, i) =>
                            fp.forEach((q, j) =>
                                prm[i][j] = q - this.#defaultToZero(p[j], err, j)
                            )
                        );
                        f.bAbE = a.bAbE;
                    }
                }
                else {                    // 0 to 2 dims
                    prm = Array.from({length:la}, () => []);
                    ap.forEach((p, i) => {
                        if (Is.A(p))
                            p.forEach((q, j) => prm[i][j] = fp - q);
                        else
                            prm[i] = fp - p;
                    });
                    f.bAbE = a.bAbE;
                }
            }
            else {                        // 1 to 2 dims, swap dimensions
                prm = Array.from({length:fp.length}, () => []);
                fp.forEach((p, i) => {
                    if (Is.A(ap[i]))
                        ap[i].forEach((q, j) => prm[i][j] = p - q);
                    else
                        prm[i] = p - this.#defaultToZero(ap[i], err, i);
                });
                delete f.byElm;
                delete f.byArg;
                f.bAbE = a.bAbE;
            }
            f.dim   = a.dim;
            f.param = prm;
        }
        else {
            if (f.dim == a.dim && f.byElm != a.byElm) {
                // mismatched 1D arrays: f.dim must be >= a.dim, so factor to 2D
                prm = new Array(la);
                ap.forEach((_, i) => prm[i] = fp);
                if (f.byArg)
                    delete f.byArg;
                else {
                    delete f.byElm;
                    f.bAbE = true;  // in spite of !o.bAbE
                }
                f.dim    = 2;
                fp.param = prm;
                fp       = prm;
            }
            switch (f.dim) {
            case 0:
                f.param -= ap;
                break;
            case 1:
                if (a.dim == 0)
                    fp.forEach((_, i) => fp[i] -= ap);
                else
                    fp.forEach((_, i) =>
                        fp[i] -= this.#defaultToZero(ap[i], err, i)
                    );
                break;
            case 2:
                if (!a.dim)
                    fp.forEach((p, i) => {
                        if (Is.A(p))
                            p.forEach((_, j) => p[j] -= ap);
                        else
                            p[i] -= ap;
                    });
                else if (a.dim == 1) {
                    if (f.bAbE == a.byElm)
                        fp.forEach((p, i) => {
                            if (Is.A(p))
                                p.forEach((_, j) =>
                                    p[j] -= this.#defaultToZero(ap[j], err, j)
                                );
                            else {
                                prm = new Array(la);
                                ap.forEach((q, j) => prm[j] = p - q);
                                fp[i] = prm;
                            }
                        });
                    else // mismatched dims
                        fp.forEach((p, i) => {
                            prm = ap[i];
                            val = this.#defaultToZero(prm, err, i);
                            if (Is.A(p))
                                p.forEach((_, j) => p[j] -= val);
                            else
                                fp[i] -= val;
                        });
                }
                else {   // both f.dim and a.dim == 2
                    if (f.bAbE == a.bAbE)
                        fp.forEach((p, i) => {
                            prm = ap[i];
                            if (Is.A(p)) {
                                if (Is.A(prm))
                                    p.forEach((_, j) =>
                                        p[j] -= this.#defaultToZero(prm[j], err, i, j)
                                    );
                                else
                                    p.forEach((_, j) =>
                                        p[j] -= this.#defaultToZero(prm, err, i)
                                    );
                            }
                            else {
                                if (Is.A(prm)) {
                                    fp[i] = new Array(prm.length);
                                    prm.forEach((q, j) => fp[i][j] = p - q[j]);
                                }
                                else
                                    fp[i] -= prm;
                            }
                        });
                    else // mismatch: #maskCV() or mismatched 1D array above
                        fp.forEach((p, i) => {
                            if (Is.A(p))
                                p.forEach((_, j) => {
                                    prm = ap[j];
                                    if (Is.A(prm))
                                        p[j] -= this.#defaultToZero(prm[i], err, j, i);
                                    else
                                        p[j] -= this.#defaultToZero(prm, err, j);
                                });
                            else {
                                prm = new Array(la);
                                ap.forEach((q, j) => {
                                    if (Is.def(q[i]))
                                        prm[j] = p - q[i];
                                });
                                fp[i] = prm;
                            }
                        });
                }
            }
        }
    }
    // #defaultToZero is the validation function for for #endToDist(). These
    // values can come from the DOM or the user, and the user values can be
    // almost anything, so checking for NaN is necessary. Addend defaults to 0,
    // so #defaultToZero() returns a value, unlike all the other validators.
    // forEach loops skip empty slots, which precludes the need to verify that
    // a value is defined; these are cases where numeric validation is skipped.
    static #defaultToZero(val, err, i1, i2) {
        if (!Is.def(val))
            return 0;
        if (Number.IsNaN(val)) {
            let prefix = `No start[${i1}]`;
            if (Is.def(i2))
                prefix += `[${i2}]`;
            prefix += ": "
            throw new Error(prefix + err);
        }
        return val;
    }
    // #plugCV() creates o.value[elm[arg]] and plugs it with unmasked current
    // values and separators. Plug contents derive from these two arrays:
    //   o.cv   = 2D: current numeric values as strings
    //   o.seps = 1D: separators w/units, function text
    //            2D for E.net: all the stuff inbetween the numbers
    // In the process of plugging, we "squeeze" the plug text together so
    // that the length of o.value's inner dimension is as short as possible.
    // Pre-filling o.value with "" allows for += in innermost while loop.
    // Padding the end of o.seps with "" affects only 25% of the cases and
    // simplifies the inner for loop.
    static #plugCV(o) {
        if (!o.seps && !PBase._seps(o)) {
            o.value = Array.from({length:o.l}, () => new Array(1));
            return;
        } //---------------------------
//        let izero, i, lp, p;
//        const l = o.l;
//        if (o.set == E.set) {
//            lp = o.lm * 2 - (o.numBeg && o.numEnd) + !(o.numBeg || o.numEnd);
//            izero = Number(o.numBeg);  // start the for loop at 0 or 1
//            o.value = Array.from({length:l}, () => new Array(lp));
//            o.value.forEach((arr) => {
//                for (i = izero, p = 0; i < lp; i += 2, p++)
//                    arr[i] = o.seps[p];
//            });
//        }
//        else {
//            let m, mi, mzero, mlast, nb, ne, pzero, val;
//            if (o.set != E.net) {
//                o.numBeg = new Array(l).fill(o.numBeg); // normalize to arrays
//                o.numEnd = new Array(l).fill(o.numEnd);
//                o.seps   = new Array(l).fill(o.seps);   // 2D array
//                if (!Is.def(o.cv))
//                    this.#getCV(o);
//            }
//            // nb and ne indicate that o.value[n] starts or ends with
//            // a calculated number, not a plugged number as string.
//            nb    = new Array(l);
//            ne    = new Array(l);
//            lp    = new Array(l);
//            izero = new Array(l);
//            pzero = new Array(l);
//            mzero = (o.mask[0] == 0);
//            mlast = (o.mask.at(-1) == o.c - 1);
//            for (i = 0; i < l; i++) {
//                nb[i] = o.numBeg[i] && mzero;
//                ne[i] = o.numEnd[i] && mlast;
//                lp[i] = o.lm * 2 - (nb[i] && ne[i]) + !(nb[i] || ne[i]);
//                izero[i] = Number(nb[i]);       // start for (i, p) loop at 0 or 1
//                pzero[i] = Number(o.numBeg[i]); // ditto
//                if (o.numEnd[i] && !ne[i])
//                    o.seps[i].push("");         // force a trailing separator
//            }
//            // i, m, mi, and p are array indexes (mask values are array indexes)
//            //   i  = elm  index: arr[i] = o.value[j][i]
//            //   m  = mask value: sets boundaries, doesn't get array values
//            //   mi = mask index: o.mask[mi]
//            //   p  = plug index: sep[p] & val[p] (o.seps[j][p] & o.cv[j][p])
//            const prop   = o.prop.name;
//            const maxLen = Math.max(...lp);
//            o.value = Array.from({length:l}, () => new Array(maxLen).fill(""));
//            o.value.forEach((arr, j) => {
//                val = o.cv[j];
//                if (!val)
//                    throw new Error(`Element ${j} has no value for ${prop}`);
//                //------------------
//                if (o.numBeg[j] && !nb[j])
//                    arr[0] = val[0];
//                for (i = izero[j], p = pzero[j], mi = i;
//                     i < lp[j];
//                     i += 2, p++, mi++)
//                {
//                    m = mi < o.lm ? o.mask[mi] : o.c;
//                    while (p < m) {
//                        if (!val[p])
//                            throw new Error(`element ${j}: ${prop} requires ${o.c} arguments`);
//                        //--------------------------------
//                        arr[i] += o.seps[j][p] + val[p++];
//                    }
//                    arr[i] += o.seps[j][p]; // trailing separator enforced above
//                }
//            });
//        }
        // nb and ne indicate that o.value[n] starts or ends with
        // a calculated number, not a plugged number as string.
        const isSet = (o.set == E.set);
        const nb    = isSet ? o.numBeg : o.numBeg && (o.mask[0] == 0);
        const ne    = isSet ? o.numEnd : o.numEnd && (o.mask.at(-1) == o.c - 1);
        const izero = Number(nb);        // start for (i, p) loop at 0 or 1
        const pzero = Number(o.numBeg);  // ditto
        const lp    = o.lm * 2 - (nb && ne) + !(nb || ne);

        // i, m, mi, and p are array indexes (mask values are array indexes)
        //   i  = elm  index: arr[i] = o.value[j][i]
        //   m  = mask value: sets boundaries, doesn't get array values
        //   mi = mask index: o.mask[mi]
        //   p  = plug index: sep[p] & val[p] (o.seps[j][p] & o.cv[j][p])
        let i, p;
        if (isSet) {
            o.value = Array.from({length:o.l}, () => new Array(lp));
            o.value.forEach((arr) => {
                for (i = izero, p = 0; i < lp; i += 2, p++)
                    arr[i] = o.seps[p];
            });
        }
        else {
            let m, mi, seps, vals;
            const prop = o.prop.name;
            if (!o.isNet) {
                if (!Is.def(o.cv))
                    this.#getCV(o);
                if (o.numEnd && !ne)
                    o.seps.forEach(arr => arr.push(""));
            }
            o.value = Array.from({length:o.l}, () => new Array(lp).fill(""));
            o.value.forEach((arr, j) => {
                seps = o.isNet ? o.seps[j] : o.seps;
                vals = o.cv[j];
                if (!vals)
                    throw new Error(`Element ${j} has no value for ${prop}`);
                //------------------
                if (o.numBeg && !nb)
                    arr[0] = vals[0];
                for (i = izero, p = pzero, mi = i; i < lp; i += 2, p++, mi++) {
                    m = mi < o.lm ? o.mask[mi] : o.c;
                    while (p < m) {
                        if (!vals[p])
                            throw new Error(`element ${j}: ${prop} requires ${o.c} arguments`);
                        //--------------------------
                        arr[i] += seps[p] + vals[p++];
                    }
                    arr[i] += seps[p];
                }
            });
        }
        if (!o.isMultiFunc) {
            i = Number(!nb);
            if (o.easies && o.loopByElm)
                o.maskCV = o.mask;
            o.mask = o.mask.map((_, j) => j * 2 + i);
        }
    }
    static #plugOne(one) {

    }
    // #resetDims rebuilds o.dims after potential alterations to
    // dimensionality by #maskCV() and #endToDist()
    static #resetDims(o, dims) {
        o.config.forEach((cfg, i) => dims[i] = cfg.dim);
    }
    // #bySame() - ECalc.#twoD is byArgByElm except in the one case where config
    // has no 2D arrays and all 1D arrays are byArg. o.bySame gets set for all
    // 1D are byElm too, see #calc() and new ECalc. bySamebyArg is for helping
    // createMultiFunc() set bySame across funcs.
    static #bySame(o) {
        if (Math.max(...o.dims) == 1) {
            const d1 = o.config.filter(cfg => cfg.dim == 1);
            if (d1.every(cfg => cfg.byElm))
                o.bySame = true;
            else if (d1.every(cfg => cfg.byArg)) {
                o.bySame = true;
                delete o.bAbE;    // true or undefined
                if (o.isMultiFunc)
                    o.bySameByArg = true;
                else {
                    o.l2 = o.l;
                    o.l1 = o.lm;
                }
            }
        }
    }
////////////////////////////////////////////////////////////////////////////////
//  #calc functions convert configs into objects used by class ECalc to run
//  the necessary calculations during animation:
//  static #init_calc() returns a baseline calc object with calc and cNN props
//          cN_ and c_N args are input and output dimension count, respectively
//          It is the naming convention for the ECalc static functions too.
//          Some calcs change their output's dimensionality. For example:
//            ECalc._c01() converts a number to a 1D array of numbers
    static #init_calc(calc, cN_, c_N) {
        return {calc:calc, cNN:`_c${cN_}${c_N}`};
    }
    static #calc(o) {
        o.calcs = [];               // the target array of calc objects
        if (o.config.length) {
            let calc, cfg, dim, prm;
            dim = 0;
            o.dims.length = 0;      // re-populated at the bottom of the loop
            for (cfg of o.config) {
                calc = this.#init_calc(cfg.calc, dim, cfg.dim);
                prm  = cfg.param;
                calc.param = prm;
                dim = this.#upDim(o, cfg, prm, calc, dim,
                   this.#swapDims(o, cfg, calc));
                this.#offsetParam(o, cfg, prm);
                o.calcs.push(calc);
                o.dims. push(dim);
            }
        }
        o.dmax = Math.max(0, ...o.dims);
        o.dmin = Math.min(0, ...o.dims);
        if (o.dmax == 0)
            o.calcs.push(Object.assign({}, this.#noop));
    }
    static #calcByElm(o) {
        const byElm = Array.from({length:o.l}, () => []);
        const isME  = Boolean(o.easies);
        const ez2M  = o.easy2Mask;

        o.oneD = new Array(o.lm);
        if (o.config.length) {//c_N is the output dim count
            let c, calc, cfg, cN_, c_N, i, mask, notOrByArg, prm, src;
            cN_ = 0;    // cN_ is the input dim count
            for (cfg of o.config) {         //>loop by f, a, max, min:
                c_N = isME ? Math.max(cfg.dim, 1) : cfg.dim;
                src = this.#init_calc(cfg.calc, cN_, c_N);

                notOrByArg = !cfg.dim || cfg.byArg;
                if (notOrByArg)                // 0D or 1D byArg
                    prm = cfg.param;
                for (i = 0; i < o.l; i++) {    //>loop byElm:
                    if (!notOrByArg) {
                        if (!cfg.bAbE)            // 1D byElm or 2D byElmByArg
                            prm = cfg.dim < 2     // -prm might be undefined-
                                ? cfg.param
                                : cfg.param[i];
                        else {                    // 2D byArgbyElm
                            prm = new Array(cfg.param.length);
                            cfg.param.forEach((p, j) => {
                                if (!Is.A(p))     // single value: fill it
                                    prm[j] = p;
                                else {            // array: make a sparse copy
                                    prm[j] = [];
                                    if (Is.def(p[i]))
                                        prm[j][i] = p[i];
                                }
                            });
                        }
                    }
                    // cfg.param always defined, but if !Is.def(prm): cfg.param
                    // and byElm[] are sparse, and the calc object not created.
                    if (Is.def(prm)) {
                        calc = Object.assign({}, src);
                        if (c_N > cN_) {          // we're up-dimensioning
                            calc.noop = this.#noop1D(prm, o.lm);
                            cN_ = c_N;            // .noop fills the gaps in prm
                        }
                        if (isME) {               // convert byElm to 3D:
                            if (!byElm[i].length) //   byElm byEasy byConfig
                                byElm[i] = Array.from({length:o.lz}, () => []);

                            o.easies.forEach((ez, j) => {
                                mask = ez2M.get(ez);
                                c = Object.assign({}, calc);
                                c.param = this.#meParam(mask, prm);
                                c.noop  = calc.noop?.length
                                        ? this.#meNoop1D(c.param, mask, o)
                                        : calc.noop; // empty array or undefined
                                byElm[i][j].push(c);
                            });
                        }
                        else {
                            this.#offsetParam(o, cfg, prm); // multiFunc only
                            calc.param = prm;
                            byElm[i].push(calc);  // 2D byElm byConfig
                        }
                    }
                }
            }
        }
        else if (isME) {
            src = {cNN:"_c01", param:[]};
            for (i = 0; i < o.l; i++) {       // byElm
                byElm[i] = new Array(o.lz);
                o.easies.forEach((ez, j) =>   // byEasy
                    byElm[i][j] = [Object.assign({noop:ez2M.get(ez)}, src)]
                );                            // .noop only, .param is empty
            }
        }

        if (!isME && Math.max(0, ...o.dims) == 0)
            for (let i = 0; i < o.l; i++)
                byElm[i].push(Object.assign({}, this.#noop));

        o.calcs = byElm;
    }
    static #calcMEaser(o) {
        let calc;
        const calcs = Array.from({length:o.lz}, () => []);
        if (o.config.length) {
            let cfg, dim, i, mask, notOrByElm, prm, src, swap1D;
            o.dims.length = 0;
            dim = 0;
            for (cfg of o.config) {
                src    = this.#init_calc(cfg.calc, dim, cfg.dim);
                swap1D = this.#swapDims(o, cfg, src);

                notOrByElm = !cfg.dim || cfg.byElm;       // 0D or 1D byElm
                if (notOrByElm)                           //!!no mask??no way...
                    prm = cfg.param;
                for (i = 0; i < o.lz; i++) {              // loop byEasy:
                    if (!notOrByElm) {
                        mask = o.easy2Mask.get(o.easies[i]);
                        if (cfg.dim == 1 || cfg.bAbE)     // 1D byArg or 2D bAbE
                            prm = this.#meParam(mask, cfg.param);
                        else                              // 2D byElmByArg
                            cfg.param.forEach((p, j) =>
                                prm[j] = Is.A(p) ? this.#meParam(mask, p)
                                                 : p
                            );
                    }
                    calc = Object.assign({}, src);
                    dim  = this.#upDim(o, cfg, prm, calc, dim, swap1D, true);
                    this.#offsetParam(o, cfg, prm);
                    calc.param = prm;
                    calcs[i].push(calc);
                }
                o.dims.push(dim);
            }
            o.dmax = Math.max(...o.dims);
            o.dmin = Math.min(...o.dims);
        }
        else { // no configs, easer uses raw #run() return value
            o.dmax = 0;
            o.dmin = 0;
        }

        if (o.dmax == 0)
            for (calc of calcs)
                calc.push(Object.assign({}, this.#noop));

        o.calcs = calcs;
    }
    static #calcMEaserByElm(o, calcs) {
        let c, i, j;
        const ez2M = o.easy2Mask;
        const mask = Array.from(ez2M.values());

        calcs = Array.from({length:o.l}, () =>
                      Array.from({length:o.lz}, () => []));
        if (o.config.length) {
            let calc, cfg, prm;
            for (i = 0; i < o.l; i++) {       // byElm
                for (j = 0; j < o.lz; j++) {  // byEasy
                    calc = calcs[i][j];
                    for (cfg of o.config) {   // byConfig
                        c = Object.assign({}, calc);
                        c.calc  = src.calc;
                        c.cNN   = src.cNN;
                        c.param = Is.A(src.param)
                                ? this.#meParam(mask[j], src.param)
                                : src.param;
                        if (src.noop)
                            c.noop = src.noop.length
                                   ? this.#meNoop1D(c.param, mask[j], o)
                                   : src.noop;
                    }
                }
                calcs[i] = calc;
            }
        }

        if (o.loopByElm) {
            if (o.isMultiFunc) {
                //!!
            }
            else {
                o.twoD = Array.from({length:o.l}, () => new Array(o.lm));
                for (i = 0; i < o.l; i++)
                    for (j = 0; j < o.lm; j++)
                        o.twoD[i][j] = o.cv[i][o.maskCV[j]];
            }
        }
    }
    // #noop functions populate the calc.noop[] array.
    static #noop1D(prm, l, start = 0) {
        const noop = [];//prm is sparse, noop is dense.
        if (Is.A(prm) && (prm.length < l || prm.includes(undefined))) {
            let i;
            for (i = 0; i < l; i++)
                if (!Is.def(prm[i]))
                    noop.push(i + start);
        }
        return noop;
    }
    static #noop2D(prm, noop, i, l1, dim, start = 0) {
        const n = i + start;
        if (Is.def(prm[i]))      // exclude start, no offset for inner dimension
            noop[n] = this.#noop1D(prm[i], l1);
        else if (dim)            // dim = 1, fill noop with indexes
            noop[n] = PBase._maskAll(l1);
        else                     // dim = 0, undefined is not empty
            noop[n] = undefined; // see ECalc.prototype.#c02() and #c02s()
    }
    // #me functions for MEaser, with Param as well as Noop
    static #meNoop1D(prm, mask, start = 0) {
        const noop  = [];
        for (const m of mask)
            if (!Is.def(prm[m]))
                noop.push(m + start);
        return noop;
    }
    static #meNoop2D(prm, noop, i, mask, dim, start = 0) {
        const n = i + start;
        if (Is.def(prm[i]))
            noop[n] = this.#meNoop1D(prm[i], mask);
        else if (dim)
            noop[n] = mask;
        else
            noop[n] = undefined;
    }
    static #meParam(mask, param) {
        const p = [];
        if (!Is.A(param))             // spread single value
            for (const m of mask)
                p[m] = param;
        else                          // mask and param are both arrays
            for (const m of mask)
                if (Is.def(param[m])) // prm is sparse
                    p[m] = param[m];
        return p;
    }
//  static #offsetParam() aligns multiFunc params with the encompassing oneD or twoD
//          array. Each .multiFunc object has the arguments for one function. This
//          offsets the param indexes to fit in the full property's argument list.
//          Only for byArg and byArgByElm. Args are by func, elms span funcs.
    static #offsetParam(o, cfg, prm, calc, mask) {
        if (this.#hasOffset(o, cfg)) {
            let i;
            const l = prm.length; // pre-offset length
            const s = o.start;
            prm.forEach((_, j) => { prm[j + s] = prm[j]; });
            for (i = Math.min(l, s); i > 0;)
                delete prm[--i];
        }
    }
    static #hasOffset(o, cfg) {
        return o.isMultiFunc && (cfg.byArg || cfg.bAbE);
    }
    // #swapDims() sets the "s" suffix on calc.CNN, indicating that the method
    // swaps dimensions. It also handles 1D byArg params when twoD is bAbE, and
    // returns a boolean indicating if that is the case.
    static #swapDims(o, cfg, calc) {
        const swap1D = (cfg.byArg && !o.bySame);
        if (swap1D || (cfg.dim == 2 && !cfg.bAbE))
            calc.cNN += "s"
        return swap1D;
    }
    // #upDim() handles the up-dimensioning a calc, which is when the previous
    // highest cfg.dim value is exceeded by a new high and ECalc.#cNN() switches
    // from storing results in thisVal to oneD or twoD, or from oneD to twoD.
    static #upDim(o, cfg, prm, calc, dim, swap1D, isMEaser) {
        if (!swap1D && cfg.dim <= dim) return dim;
        //////////////////////////////////////////
        let noop;
        const start  = this.#hasOffset(o, cfg) ? o.start : 0;
        const noop1D = isMEaser ? this.#meNoop1D : this.#noop1D;
        const noop2D = isMEaser ? this.#meNoop2D : this.#noop2D;
        if (cfg.dim == 1) {
            dim  = swap1D ? 2 : 1;
            noop = noop1D(prm, cfg.byElm ? o.l : o.lm, start);
        }
        else {
            // 2D runs offsetParam() first then noop2D() because we offset the
            // outer dimension in both prm and noop.
            const l2 = cfg.bAbE ? o.lm : o.l;  // conciseness over efficiency
            const l1 = cfg.bAbE ? o.l  : o.lm;
            const undef = prm.length < l2
                       || prm.includes(undefined)
                       || prm.some(p => p.length < l1
                                     || p.includes(undefined));
            dim  = 2;
            noop = [];
            if (undef) {
                let i;
                for (i = 0; i < l2; i++)
                    noop2D(prm, noop, i, l1, dim, start);
            }
        }
        calc.noop = noop;
        return dim;
    }
    // #validateParams() validates that all cfg.param values are numeric and
    // forcibly converts them to numbers. It balks at infinite values, as even
    // for max and min they are pointless. For factor, it balks at zero values.
    // Should be called after #maskCV(), when all the params are finally set.
    // It would prevent the need to call isNaN() in #defaultToZero().
    //!!To be evaluated and maybe completed!!
    static #validateParams(o) {
        let cfg, val;
        for (cfg of o.config) {
            if (!cfg.dim) { // Number() or parseFloat() here? No clear winner.
                val = Number(cfg.param);
                if (!Number.isFinite(val))
                    throw new Error("...");
                if (isFactor && !val) // How do I know if it's factor?
                    throw new Error("zero factor!");
                cfg.param = val;
            }
        }
    }
}
////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////////////////////////////////////////
class Easy {
    #autoTrip; #base; #count; #dist; #e; #end; #firstLeg; #flipTrip; #inbound;
    #isInc; #lastLeg; #leg; #legsWait; #loopWait; #now; #onArrival; #onLoop;
    #peri; #plays; #post; #pre; #reversed; #roundTrip; #run; #start; #targets;
    #time; #tripWait; #value; #wait; #zero;

    static #twoPi3  = (2 * Math.PI) / 3; // for #elasticIn() and #elasticOut()
    static #easings = [                  // easing functions for leg.ease
        [this.#linear,  this.#sineIn,     this.#circIn,    this.#expoIn,
         this.#backIn,  this.#elasticIn,  this.#bounceIn,  this.#powIn,
         this.#bezier],
        [this.#linear,  this.#sineOut,    this.#circOut,   this.#expoOut,
         this.#backOut, this.#elasticOut, this.#bounceOut, this.#powOut,
         this.#bezier]
    ];

    constructor(obj) {
        Ez._validObj(obj, "Easy constructor's only argument");
        const c = "count", e = "end", s = "start", t = "time", w = "wait";
        const o = structuredClone(obj); // so we can set properties safely

        this.pre  = o.pre;          // use setters for validation
        this.peri = o.peri;
        this.post = o.post;
        this.loop = o.loop;
        this.onArrival = o.onArrival;
        Ez.is(this);                // required before the end of constructor

        if (Is.def(o.legs))         // format\validate user-defined legs
            o.legs = Ez.toArray(o.legs, "legs", Ez._validObj);

        const type = Easy.#type(o); // must follow o.legs = Ez.toArray()
        const io   = Easy.#io(o.io);

        o[t] = Ez.toNumber(o[t], t, ...Ez.undefGrThan0);
        if (!o.legs) {              // create default legs
            const ios = Easy.splitIO(io);
            const leg = {type, io:ios[0]};
            o.legs = [leg];
            if (ios.length == 2) {
                const split = Ez.toNumber(o.split, "split", o[t] / 2, ...Ez.grThan0);
                const gap   = Ez.toNumber(o.gap,   "gap", ...Ez.defZero);
                const wait  = gap || undefined;  // merely a preference
                leg.time = split;
                leg.end  = Ez.toNumber(o.mid, "mid");
                o.legs.push({wait, time:o[t] - split - gap, type, io:ios[1]});
            }
        }
        const last = o.legs.length - 1;

        // #firstLeg and #lastLeg are starting points for two linked lists of
        // leg objects. The outbound list starts with #firstLeg. The inbound
        // list is made up of clones of the outbound list's legs, starting with
        // a clone of #lastLeg ?? #firstLeg. #firstLeg is always defined.
        // #lastLeg is only defined if/when #roundTrip == true. It would be
        // convenient fallback to #lastLeg = #firstLeg, and always define
        // #lastLeg, but it would be prone to misunderstanding. Both properties
        // can be overwritten by #stepsToLegs(), #lastLeg by #reverseMe() too.
        this.#firstLeg = o.legs[0];
        if (last)
            this.#lastLeg = o.legs[last];

        // E.increment is the exception to many rules, and because it will be
        // used infrequently, its syntax is restricted to avoid convoluting
        // logic here, in Easy.#type(), and elsewhere.
        // Like .type and .io, there is no #increment property, only #isInc.
        // #increment() is the increment function called as #run() in _easeMe().
        this.#isInc = (type == E.increment);

        // o[e] is subject to further change in #stepsToLegs()
        // #firstLeg shares .start and .wait with this, #lastLeg shares .end
        Easy.#override(s, this.#firstLeg, o, "the first");
        Easy.#override(e, this.#lastLeg ?? this.#firstLeg, o, "the last");
        o[s] = Ez.toNumber(o[s], s, 0);
        o[e] = Ez.toNumber(o[e], e, this.#isInc ? undefined : 1);
        if (o[s] == o[e]) {
            if (o.legs.length == 1      // it goes nowhere
            || !o.legs.some(leg => (Is.def(leg[s]) && leg[s] != o[s])
                                || (Is.def(leg[e]) && leg[e] != o[e])))
                throw new Error(`start and end are the same: ${o[s]} = ${o[e]}`);
        } //-------------------
        let down = o[e] < o[s];
        const defUnit = down ? 1 : 0;

        this.#wait = Ez.toNumber(o[w], w, ...Ez.defZero);
        this.#legsWait = 0;

        if (this.#isInc && !o[t])
            o[c] = Ez.toNumber(o[c], c, ...Ez.undefGrThan0)
        const tc = !o[c] ? t : c;               // "time" or "count"

        this.#prepLegs(o, type, s, e, w, tc);   // iterate over legs twice
        this.#isInc ? this.#finishInc (o, s, e, t, c, o[t] || o[c] ? tc : "")
                    : this.#finishLegs(o, s, e, t, io, last, down);

        this.#start = o[s];
        this.#end   = o[e];                     // must follow #stepsToLegs()
        if (!o[c]) this.#time  = o[t];
        else       this.#count = o[c];

        // Dummy #firstLeg.prev simplifies #ease(), must precede #reverseMe()
        // #lastLeg's dummy .prev is set on the cloned leg in #reverseLeg()
        // if (#isInc) unit is ignored
        this.#firstLeg.prev = {unit:defUnit, end:this.#start, wait:0};
        this.targets = o.targets;               // the Easers that apply values

        //  #plays is only used as a default for targets that don't define it
        this.plays  = o.plays || o.repeats + 1 || undefined;
        this.#loopWait  = Ez.toNumber(o.loopWait, "loopWait", ...Ez.defZero);
        this.#roundTrip = Boolean(o.roundTrip); // autoTrip, flipTrip default to true
        this.#autoTrip  = Ez.defaultToTrue(o.autoTrip);
        this.#flipTrip  = Ez.defaultToTrue(o.flipTrip);
        if (this.#roundTrip)
            this.#reverseMe(o.tripWait);
        else
            this.tripWait = o.tripWait;         // in case it's defined

        this.#legsWait -= this.#wait;           // subtract first leg's wait

        this.#leg = this.#firstLeg;             // start off on the right foot
        if (this.#isInc)                        // set initial animation values
            this.#value = this.#start;
        else
            this.#base  = down ? this.#end : this.#start;

        // this.e is stores the current state. The range for status is E.arrived
        // to E.original. value is the current eased value. unit is the unit
        // interval for that value, range 0-1 inclusive. comp is the complement
        // of unit: 1 - unit. value and unit are the same if start/end are 0/1.
        // this.e2 helps with looping and round-tripping.
        this.#e = {value:this.#start, unit:defUnit, comp:Ez.flip(defUnit)};
        this.e  = {waitNow:undefined};
        this.e2 = {};
        this.#init_e(E.original);
        Object.freeze(this.#e);
        Object.seal(this.e);
        Object.seal(this.e2);
        Object.seal(this);
    }
//  static _validate() is a validation function for Ez.toArray()
    static _validate(obj, err) {
        if (!obj?.isEasy)
            Ez._mustBeErr(err, "an instance of Easy");
        return obj;
    }
////////////////////////////////////////////////////////////////////////////
// Three private functions that break out blocks of code from constructor().
// They are only called once, but they make constructor() more readable.
// Leg times/counts can be portioned evenly or by the user, and E.steps
// generates new legs. Thus we iterate over o.legs twice. #prepLegs() is the
// first iteration. It collects legsTotal and o.emptyLegs for spreading
// #time or #count across legs, and sets #wait, #legsWait, and #time or
// #count. The second iteration is in #finishLegs() and #finishInc().
//  #prepLegs()
    #prepLegs(o, type, s, e, w, tc) {   // tc is "time" or "count"
        let legsTotal = 0;
        o.emptyLegs   = [];
        o.legs.forEach((leg, i) => {
            leg.prev = o.legs[i - 1];   // overwritten by #stepsToLegs()
            leg.next = o.legs[i + 1];   // ditto
            Easy.#legNumber(leg, s, i); // all non-incremental legs define
            Easy.#legNumber(leg, e, i); // start and end.
            Easy.#legNumber(leg, w, i, ...Ez.defZero);
            this.#legsWait += leg[w];
                                        // time and count require extra effort
            Easy.#legNumber(leg, tc, i, ...Ez.undefGrThan0);
            this.#legType(o, leg, i, type);
            if (leg.type == E.steps)
                Easy.#steps(o, leg);    // leg.timing can set leg.time
            if (leg[tc])
                legsTotal += leg[tc];   // accumulate leg.time|count
            else
                o.emptyLegs.push(leg);  // will receive o.spread
        });
        o.cEmpties = o.emptyLegs.length;
        if (!this.#isInc)
            legsTotal += this.#legsWait;
        if (o[tc]) {
            o.leftover = o[tc] - legsTotal;
            if (o.cEmpties) {
                if (o.leftover <= 0)
                    throw new Error(`${o.cEmpties} legs with ${tc} undefined `
                                  + "and nothing left over to assign to them.");
                //---------------------------------
                o.spread = o.leftover / o.cEmpties;
            }
            else                        // override o[tc] with legsTotal...
                Easy.#override(tc, undefined, o, "every", legsTotal);
        }
        else if (!o.cEmpties)            // ...for time and count setters
            o[tc] = legsTotal;
        else if (!this.#isInc)          // see finishInc()
            throw new Error("You must define a non-zero value for "
                          + `obj.${tc} or for every leg.${tc}.`);
        //--------------------------------------------
        if (!Is.def(this.#firstLeg[s])) // see #finishLegs()
            this.#firstLeg[s] = o[s];
        if (!this.#lastLeg) {
            if (!Is.def(this.#firstLeg[e]))
                this.#firstLeg[e] = o[e];
        }
        else if (!Is.def(this.#lastLeg[e]))
            this.#lastLeg[e] = o[e];
    }
//  #finishLegs() is the !E.increment 2nd iteration over legs by constructor().
//   If legs go up & down, this.#dist is less than the total distance traveled;
//   leg.dist can be greater than this.#dist, and leg.start/leg.end can be
//   outside the bounds of this.#start/this.#end. That means e.unit can be >1.
    #finishLegs(o, s, e, t, io, last, down) {
        this.#run  = this.#ease;
        this.#dist = Math.abs(o[e] - o[s]);
        for (const leg of o.emptyLegs)     // must precede #stepsToLegs()
            Easy.#spreadToEmpties(leg, t, o.spread);

        // leg default distance is linearly proportional
        const defDist = this.#dist / o.legs.length * (down ? -1 : 1);
        o.legs.forEach((leg, i) => {
            // Ensure that every leg.start and leg.end are defined. #prepLegs()
            // defaults #firstLeg.start and #lastLeg.end to o.start|end, which
            // default to 0|1 or 1|0. The semi-circular logic here does the rest.
            if (!Is.def(leg[s]))
                leg[s] = leg.prev[e];
            if (!Is.def(leg[e]))
                leg[e] = leg.next[s] ?? leg[s] + defDist;

            leg.unit = this.#legUnit(leg, o[s], down);
            leg.dist = Math.abs(leg[e] - leg[s]);
            leg.down = leg[e] < leg[s];
            if (leg.type == E.steps)
                this.#stepsToLegs(o, leg, i, last);
            else {
                leg.part = leg.dist / this.#dist; // leg's part of the whole
                leg.io   = Easy.#io(leg.io, io);
                leg.ease = Easy.#easings[leg.io][leg.type];
            }
        });
    }
//  #finishInc() is more complex than #finishLegs(), largely because it allows
//   for leg.increment, leg.end, and leg.start to remain undefined. #increment()
//   can compute these properties at run-time, which allows for mixing time-
//   based and end-based incremental legs.
    #finishInc(o, s, e, t, c, tc) {
        let err, hasCount, hasEnd, hasInc, hasTime;
        const spreads = []
        const flag    = !tc ? 0 : tc == t ? -1 : 1;
        const isTime  = flag <= 0;   // time = -1, count = 1, neither = 0
        const isCount = flag >= 0;
        const inc  = "increment";
        const errT = " defines time but not increment.";
        const errC = " defines count but not increment or end.";
        const err2 = " must define two of three: increment, end, count.";

        this.#run = this.#increment;
        o[inc]  = Ez.toNumber(o[inc], inc, ...Ez.undefNotZero);
        o.legs.forEach((leg, i) => {
            hasInc = Is.def(Easy.#legNumber(leg, inc, i, o[inc], ...Ez.notZero));
            if (!flag || !leg[tc]) {
                hasEnd = Is.def(Easy.#legNumber(leg, e, i));
                if (isTime)
                    hasTime  = Is.def(Easy.#legNumber(leg, t, i, ...Ez.undefNotZero));
                if (isCount)
                    hasCount = Is.def(Easy.#legNumber(leg, c, i, ...Ez.undefNotZero));
            }
            switch (flag) {
            case -1:                 // tc == "time"
                if (!leg[tc]) {      // o.emptyLegs.includes(leg) == true
                    if (hasInc) {
                        if (!hasEnd) {
                            if (hasCount)              // try to set end
                                this.#computeOne(leg, hasInc);
                            else {                     // set time
                                Easy.#spreadToEmpties(leg, tc, o.spread);
                                spreads.push(leg);
                            }
                        }                              // else if (hasEnd) noop;
                    }
                    else if (hasCount && hasEnd)       // try to set increment
                        this.#computeOne(leg, hasInc);
                    else
                        err = err2;
                }
                if (leg[tc] && !hasInc)
                    err = errT;
                break;
            case 1:                  // tc == "count"
                if (!leg[tc]) {      // o.emptyLegs.includes(leg) == true
                    if (!hasInc && (hasTime || !hasEnd))
                        err = hasTime ? errT : errC;
                    else if (!hasTime) {
                        Easy.#spreadToEmpties(leg, tc, o.spread);
                        spreads.push(leg);             // set count
                        this.#computeOne(leg, hasInc); // try to set inc or end
                    }
                }
                if (leg[tc])
                    this.#computeOne(leg, hasInc);     // try to set inc or end
                break;
            default:                 // tc == ""
                if (!hasInc && (hasTime || (!hasEnd || !hasCount)))
                    err = hasTime ? errT : err2;
                if (!hasTime) {
                    if (hasInc + hasEnd + hasCount < 2)
                        err = err2;
                    else if (!hasInc || !hasEnd)
                        this.#computeOne(leg, hasInc); // try to set inc or end
                }
            }
            if (err)
                throw new Error(Easy.#legText(leg, i, tc), err);
        });
        if (!spreads.length) {  // validate the spread allocation
            if (o.spread)
                throw new Error("There is surplus " + tc
                              + ", and no legs able to accept it.");
        }
        else if (spreads.length < o.cEmpties) {
            const v = o.leftover / spreads.length;   // spread is wrong, do over
            for (const leg of spreads) {
                Easy.#spreadToEmpties(leg, tc, v)
                if (leg[c])
                    this.#computeOne(leg, leg[inc]); // re-compute inc or end
            }
        }
    }
    #computeOne(leg, hasInc) {
        if (!Is.def(leg.start))
            leg.start = leg.prev.end;
        if (Is.def(leg.start))
            (hasInc ? this.#computeEnd : this.#computeInc)(leg, leg.start);
    }
    #computeInc(leg, start) {
        leg.increment = (leg.end - start) / leg.count;
    }
    #computeEnd(leg, start) {
        leg.end = leg.increment * leg.count + start;
    }
//  static #spreadToEmpties() allocates time|count to legs without time|count
    static #spreadToEmpties(leg, tc, v) {
        do { leg[tc] = v; } while((leg = leg.next));
    }
//  static #steps() consolidates code in #prepLegs()
//          Each step becomes a leg to make processing simpler during animation.
//          leg.steps  is Number or Array-ish. leg.easy eases leg.steps.
//          leg.timing is Array-ish, Easy, or undefined.
//          If leg.timing is Array-ish, leg.steps can be undefined, otherwise
//          the legs.steps or leg.steps.length must match leg.timing.length.
    static #steps(o, leg) {
        const s = "steps";  // inside this function they aren't "time" & "start"
        const t = "timing";
        let stepsIsN = Is.Number(leg[s]);
        let stepsIsA = Is.def(leg[s]) && !stepsIsN;
        let c, l;
        if (stepsIsA) {                     // validate/convert leg[s]
            const n = Is.A(leg[s]) ? NaN : parseFloat(leg[s]);
            try {
                if (Number.isNaN(n)) {
                    leg[s] = Easy.#toNumberArray(leg[s], s);
                    leg.stepsReady = true;  // it's an array of numbers
                }
                else {
                    leg[s] = n;             // it was converted to a number
                    stepsIsA = false;
                    stepsIsN = true;
                }
            } catch {
                Ez._mustBeErr(s, "a Number, an Array [Number], or convertible "
                               + "to Number or Array [Number]")
            }
        }
        else if (!Is.def(leg.easy))
            leg.easy = o.easy;

        if (!Is.def(leg[t]))                // validate/convert leg.timing
            leg[t] = o[t];
        if (Is.def(leg[t]) && !leg[t].isEasy) {
            try {                           // it's an array of numbers or error
                leg[t] = Easy.#toNumberArray(leg[t], t);
            } catch {
                Ez._mustBeErr(t, "an Easy, an Array [Number], convertible "
                               + "to Array [Number], or undefined")
            }
            Ez._mustAscendErr(leg[t], `${t} array`);
            l = leg[t].length;
            if (stepsIsN && leg[s] != l)
                Ez._mustBeErr(`${s}`,
                              `the same as ${t}.length: ${leg[s]} != ${l}`);
            if (stepsIsA && leg[s].length != l)
                Ez._mustBeErr(`${s} and ${t} arrays`,
                              `the same length: ${leg[s].length} != ${l}`);
            //-------------------------
            const last = leg[t].at(-1);
            if (!Is.def(leg.time) || last > leg.time) {
                if (last > leg.time)
                    console.warn("Your timing array extends past the total"
                               + "leg.time, and has overriden leg.time: "
                               + `${last} > ${leg.time}`);
                leg.time = last;        // avoids spreadToEmpties() and errors
            }
            leg.timingReady = true;
        }
        else {                          // auto-generate linear waits based
            const j    = "jump";        // on steps/ends and jump.
            let   jump = leg[j] ?? o[j] ?? E.end; // enumerated integer
            if (!PFactory.jump[jump])   // E.end is the CSS steps() default
                Ez._invalidErr(j, jump, Ez._listE(j));
            //------------------
            jump = Number(jump);        // not necessary, but safe & correct
            if (stepsIsA) {
                l = leg[s].length;      // formula for c/l is the opposite here
                c = l - Number(jump == E.both)
                      + Number(jump == E.none);
                if (!c)
                    throw new Error(`${s}.length = 1, ${j}:E.both = zero ${s}.`);
            }
            else {
                c = Ez.toNumber(leg[s], s, 1, ...Ez.intGrThan0);
                l = c + Number(jump == E.both)
                      - Number(jump == E.none);
                if (!l)
                    throw new Error(`{${s}:1, ${j}:E.none} = zero ${s}.`);
            } //--------------------------
            const offset = jump & E.start ? 0 : 1;
            leg.waits = Array.from({length:l}, (_, i) => (i + offset) / c);
        }
    }
//  #stepsToLegs() helps #finishLegs() turn 1 leg into >1 legs for #ease()
    #stepsToLegs(o, leg, idx, last) {
        let ends, waits;
        if (leg.timingReady)        // leg.timing is an array of wait times
            waits = leg.timing;
        else if (leg.timing)        // leg.timing is an Easy instance
            waits = Easy.#easeSteps(leg.timing, leg.waits, 1, 0, leg.time,
                                    false, "timing");
        else                        // leg.timing is undefined
            waits = leg.waits.map(v => v * leg.time);

        let l = waits.length;
        if (leg.stepsReady)         // leg.steps is an array of step values
            ends = leg.steps;
        else if (leg.easy)          // auto-generate eased steps
            ends = Easy.#easeSteps(leg.easy, waits, leg.time, leg.start,
                                   leg.dist, leg.down, "easy");
        else {                      // auto-generate linear step values
            const j = leg.dist / l;
            ends    = leg.down
                    ? Array.from({length:l}, (_, i) => leg.start - ((i + 1) * j))
                    : Array.from({length:l}, (_, i) => (i + 1) * j + leg.start);
        }

        const legs = Array.from({length:l}, () => new Object);
        legs.forEach((obj, i) => {
            obj.type = E.steps;
            obj.io   = E.in;        // must be defined
            obj.end  = ends[i];     // step value is applied as .end
            obj.unit = this.#legUnit(obj, o.start, leg.down);
            obj.prev = legs[i - 1];
            obj.next = legs[i + 1];
            obj.time = 0;           // steps don't have a duration
            obj.wait = waits[i] - (i ? waits[i - 1] : 0);
        });
        if (leg.wait)
            legs[0].wait += leg.wait;

        if (idx == 0)
            this.#firstLeg = legs[0];
        else {
            legs[0].prev  = leg.prev;
            leg.prev.next = legs[0];
        }
        --l;
        const leftover   = leg.time - waits[l];
        legs[l].leftover = leftover;
        if (idx == last) {
            o.end   = legs[l].end;
            o.time -= leftover;
            if (l || this.#lastLeg)
                this.#lastLeg = legs[l];
        }
        else {
            legs[l].next   = leg.next;
            leg.next.prev  = legs[l];
            leg.next.wait += leftover;
        }
    }
//  static #easeSteps() helps #stepsToLegs() use an Easy to set the timing or
//          values for E.steps. ez cannot be E.increment here because it has
//          either no end, or no duration; and it cannot be E.steps to avoid
//          infinite #easeSteps loops and because not-eased is linear or fixed
//          values, which is pointless. Static because ez !== this.
    static #easeSteps(ez, nows, time, start, dist, isDown, name) {
        let leg;
        Easy._validate(ez, name);               // phases one of validation
        if (ez.#isInc)                          // phase two
            Ez._cantBeErr(name, "type:E.increment");
        //-----------------------------------
        const ezDown   = ez.#end < ez.#start;
        const isTiming = (name[0] == "t");
        leg = ez.#firstLeg;
        do {
            if (leg.type == E.steps)            // phase three
                Ez._cantBeErr(name, "type:E.steps");
            if (isTiming                        // phase four
             && (leg.down != ezDown
              || (leg.type >= E.back   && leg.type <= E.bounce)
              || (leg.type == E.bezier && Ez.unitOutOfBounds(leg.bezier.array))))
                Ez._cantBeErr(name, "an Easy that changes direction. "
                                  + "Time only moves in one direction");
        } while ((leg = leg.next));
        //---------------
        time /= ez.#time;                       // validation complete
        ez._zero(0);
        const prop = ezDown ? E.comp : E.unit;  // vals always ascends
        const vals = nows.map(v => {
                        ez._easeMe(v / time);
                        return ez.e[prop] * dist;
                     });
        return isDown ? vals.map(v => start - v)
                      : vals.map(v => start + v);
    }
////////////////////////////////////////////////////////////////////////////
// Getters and setters:
    get start()    { return this.#start; }
    get end()      { return this.#end;   }
    get distance() { return this.#dist;  }

    get pre()     { return this.#pre;  }
    get peri()    { return this.#peri; }
    get post()    { return this.#post; }
    set pre(val)  { this.#pre  = Ez._validFunc(val,  "pre");  }
    set peri(val) { this.#peri = Ez._validFunc(val,  "peri"); }
    set post(val) { this.#post = Ez._validFunc(val,  "post"); }

    get onLoop()    { return this.#onLoop; } // callback called upon looping
    set onLoop(val) { this.#onLoop = Ez._validFunc(val,  "loop"); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) {  // Easy has an extra legit status for round-trip
        this.#onArrival = (sts !== E.tripped)
                        ? Easy._validArrival(sts, "Easy")
                        : sts;
    }
//  static _validArrival() enforces the 4 legit statuses for arrival
    static _validArrival(sts, name, noErr) {
        switch (sts) {
        case undefined:
        case E.arrived: case E.original: case E.initial: case E.empty:
            return sts;
        default:
            if (noErr) return false;
            //----------------------
            const txt = (name == "Easy") ? " E.tripped," : "";
            Ez._mustBeErr(name + ".prototype.onArrival is a status value and",
                 `set to E.original, E.initial, E.empty,${txt} or E.arrived`);
        }
    }
    get plays()    { return this.#plays; }
    set plays(val) {
        this.#plays = Ez.toNumber(val, "plays", 1, ...Ez.intGrThan0);
    }

    get roundTrip()    { return this.#roundTrip; }
    set roundTrip(val) {
        this.#roundTrip = Boolean(val);
        if (val && !this.#reversed)
            this.#reverseMe(this.#tripWait);
    }
    get autoTrip()    { return this.#autoTrip; }
    set autoTrip(val) {
        this.#autoTrip = Ez.defaultToTrue(val);
        if (val && this.#onArrival == E.tripped)
            this.onArrival = undefined;
    }
    get flipTrip()    { return this.#flipTrip; }
    set flipTrip(val) {
        if (this.#isInc) return; //!!error?? log?? warn??
        //-----------------
        val = Ez.defaultToTrue(val);
        if (val != this.#flipTrip) {
            this.#flipTrip = val;
            if (this.#reversed) {
                let leg = this.#lastLeg;
                do {
                    this.#flipTripLeg(leg);
                } while((leg = leg.next));
            }
        }
    }

    get tripWait()    { return this.#tripWait; }
    set tripWait(val) { this.#tripWait = this.#setWait(val, "tripWait");
    }
    get loopWait()    { return this.#loopWait; }
    set loopWait(val) { this.#loopWait = this.#setWait(val, "loopWait");
    }
    get wait()        { return this.#wait; }
    set wait(val)     { this.#wait     = this.#setWait(val, "wait");
    }
    #setWait(val, name) { return Ez.toNumber(val, name, ...Ez.defZero); }

// this.time: setter is simpler than I expected, but should it apply to leg.wait
//            as well as leg.time?? currently only modifies leg.time because
//            leg.wait is always explicitly set, whereas time can be allocated.
//            Also note: set time() for E.steps doesn't separate #firstLeg.wait
//                       or #lastLeg.wait from #wait and #tripWait respectively.
//                       Certainly fixable...
    get time()    { return this.#time; }
    set time(val) {
        if (this.#count)
            Ez._cantErr("You", "set time for count-based incremental");
        //-------------------------------------------------------------
        this.#time = this.#setTimeCount(val, this.#time, "time", true);
    }

// this.loopTime and this.firstTime are used by new Measer
    get loopTime()  { return this.#firstLoop(this.#loopWait); }
    get firstTime() { return this.#firstLoop(this.#wait); }
    #firstLoop(wait) {
        let val = wait + this.#time;
        if (this.#roundTrip && this.#autoTrip) // #autoTrip in case anything else uses it
            val += this.#tripWait + this.#time;
        return val;
    }

// this.count
    get count()    { return this.#count; }
    set count(val) {
        if (this.#count)
            this.#count = this.#setTimeCount(val, this.#count, "count");
        else
            Ez._cantErr("You", "set count for time-based incremental");
    }

//  #setTimeCount() consolidates code for time and count setters
    #setTimeCount(val, cv, tc, isTime) { // val = new value, cv = current value
        val = Ez.toNumber(val, tc, ...Ez.defGrThan0);
        if (val == (isTime ? this.#time : this.#count))
            return val; // no change
        //------------------------------------------------------------
        const factor = (val - this.#legsWait) / (cv - this.#legsWait);
        Easy.#spreadLegTimeCount(this.#firstLeg, tc, factor);
        if (this.#reversed)
            Easy.#spreadLegTimeCount(this.#lastLeg, tc, factor);
        return val;
    }
//  static #spreadLegTimeCount() consolidates code for #setTimeCount()
    static #spreadLegTimeCount(leg, tc, f) {
        do {
            if (leg.type == E.steps) // E.steps uses .wait as duration
                leg.wait *= f;
            else
                leg[tc]  *= f;
        } while((leg = leg.next));
}
////////////////////////////////////////////////////////////////////////////////
// Target-related public properties and methods:
// this.targets Returns a shallow copy and sets a clone to ensure users don't
//      modify it outside of these methods. #targets is never undefined, but it
//      can be an empty Set.
    get targets() { return new Set(this.#targets); }
    set targets(val) {
        this.#targets = new Set(Ez.toArray(val, "targets", EBase._validate,
                                           ...Ez.okEmptyUndef));
    }
//!!if easy is incremental, targets can't ask for units or flipped units!!
//  newTarget() creates an instance of a MEaser class and adds it to #targets
    newTarget(o) {
        if (o.easies || o.multiFunc?.some(obj => obj.easies || obj.easy))
            throw new Error("For multi-ease targets you must use "
                          + "Easies.prototype.newTarget().");
        // ---------------------------------
        const t = EFactory.create(o);
        this.#targets.add(t);
        return t;
    }
//  addTarget() validates t and adds it to #targets
    addTarget(t) {
        this.#targets.add(EBase._validate(t, "addTarget(arg): arg"));
    }
//  cutTarget() removes t from #targets, if it can find it.
    cutTarget(t) { return this.#targets.delete(t); }

//  clearTargets() clears #targets
    clearTargets() { this.#targets.clear(); }
////////////////////////////////////////////////////////////////////////////
//  this.type(2), .io, .pow(2), .bezier, .mid, .split, and .gap are for
//  convenience and efficiency.
//  They are all write-only and only apply to one and two-legged easies.
//  They could all be eliminated by forcing users to call new Easy() instead...
    set type (val) {
        this.#type12(val, this.#firstLeg);
        if (this.#reversed)
            this.#type12(val, this.#lastLeg.next ?? this.#lastLeg);
    }
    set type2(val) {
        this.#twoLeggedOnly("type2");
        this.#type12(val, this.#firstLeg.next);
        if (this.#reversed)
            this.#type12(val, this.#lastLeg);
    }
    #type12(val, leg) {
        if (!leg) return;
        //---------------
        val = Easy.#type(undefined, undefined, val);
        if (val < E.steps) {
            leg.type = val;
            leg.ease = Easy.#easings[leg.io][leg.type];
            if (val == E.pow && !leg.pow)
                leg.pow = 1;
            else if (val == E.bezier && !leg.bezier)
                leg.bezier = Easy.#toBezier([0, 0, 0, 0]); //!!maybe < E.bezier, not E.steps
        }
        else
            this.#typeIOLog("type");
    }
    #typeIOLog(name) {
        console.log(`The ${name} property only supports these types: `
                  + Ez._listE(name, 0, E.steps));
    }
    set io(val) {
        let leg  = this.#firstLeg;
        if (leg.type >= E.steps) {
            this.#typeIOLog("io");
            return;
        }
        Easy.#io(val);
        const io   = Easy.splitIO(val);
        const legs = [leg];
        leg.io = io[0];
        leg = leg.next;
        if (leg) {
            leg.io = io[1];
            legs.push(leg);
        }
        if (this.#reversed) {
            val = io[leg ? 1 : 0] // io[1] is undefined if val <= E.end
            this.#lastLeg.io = this.#flipTrip ? Number(!val) : val;
            legs.push(this.#lastLeg);
            if (leg) {
                this.#lastLeg.next.io = this.#flipTrip ? Number(!io[0]) : io[0];
                legs.push(this.#lastLeg.next);
            }
        }
        for (leg of legs)
            leg.ease = Easy.#easings[leg.io][leg.type];
    }
    set pow(val) {
        val = Ez.toNumber(val, "pow", ...Ez.defGrThan0);
        this.#firstLeg.pow = val;
        if (this.#reversed) {
            if (this.#lastLeg.next)
                this.#lastLeg.next.pow = val;
            else
                this.#lastLeg.pow = val;
        }
    }
    set pow2(val) {
        this.#twoLeggedOnly("pow2");
        val = Ez.toNumber(val, "pow2", ...Ez.defGrThan0);
        this.#firstLeg.next.pow = val;
        if (this.#reversed)
            this.#lastLeg.pow = val;
    }
    set bezier(val) {
        val = Easy.#toBezier(val);
        this.#firstLeg.bezier = val;
        if (this.#reversed)
            this.#lastLeg.bezier = this.#flipTrip ? val.reversed : val;
    }
// this.mid sets the value mid-point for two-legged easies
    set mid(val) {
        this.#twoLeggedOnly("mid");
        const leg1 = this.#firstLeg;
        const leg2 = leg1.next;
        if (leg1.type >= E.steps || leg2.type >= E.steps)
            throw new Error("mid is incompatible with E.steps and E.increment");
        //----------------------------
        val = Ez.toNumber(val, "mid");
        let leg;
        const start = leg1.start; // same as this.#start
        const end   = leg2.end;   // same as this.#end

        leg1.end   = val;
        leg1.unit  = this.#legUnit(leg1, start, end < start);
        leg1.dist  = Math.abs(val - start);
        leg2.start = val;
        leg2.dist  = Math.abs(end - val);
        for (leg of [leg1, leg2])
            leg.part = leg.dist / this.#dist;

        if (this.#reversed) {
            leg = this.#lastLeg;
            leg.end  = val;
            leg.unit = leg1.unit;
            leg.dist = leg2.dist;
            leg.part = leg2.part;
            leg = leg.next;
            leg.start = val;
            leg.dist  = leg1.dist;
            leg.part  = leg1.part;
        }
    }
// this.split sets the time split-point for two-legged easies
    set split(val) {
        this.#twoLeggedOnly("split");
        const leg = this.#firstLeg;
        if (leg.type == E.increment && !this.#time)
            Ez._cantBeErr("split", "used by a count-based incremental easy");
        //------------------------------------------------
        val = Ez.toNumber(val, "split", ...Ez.defGrThan0);
        if (val >= this.#time)
            Ez._mustBeErr(`Invalid split value: ${val}. It`,
                          `less than time: ${this.#time}`);
        //-------------
        val -= leg.time;
        leg.time += val;
        leg.next.time -= val;
        if (this.#reversed) {
            this.#lastLeg.time = leg.next.time;
            this.#lastLeg.next.time += val;
        }
    }
// this.gap sets the 2nd leg.wait for two-legged easies
    set gap(val) {
        this.#twoLeggedOnly("gap");
        const leg = this.#firstLeg.next;

        val  = Ez.toNumber(val, "gap", ...Ez.defNotNeg);
        val -= leg.wait;
        leg.wait += val;
        leg.time -= val;
        this.#legsWait += val;
        if (this.#reversed) {
            this.#lastLeg.time = leg.time;
            this.#lastLeg.next.wait += val;
        }
    }
    #twoLeggedOnly(name) {
        if (!this.#firstLeg.next || this.#firstLeg.next.next)
            throw new Error(name + " is for two-legged easies only.");
    }
////////////////////////////////////////////////////////////////////////////
//  static splitIO() splits two-legged io values into a 2 element array
//                   first leg = in:0, out:1, second leg = _in:2, _out:4
    static splitIO(io, fillTwo) {
        return io > E.out ? [io % 2, (io & 4) / 4] // 4 = _out = 2nd leg E.out
               : fillTwo  ? [io, io]
                          : [io];
    }
//////////////////////////////////////////////////////////////////////////////////
// The rest of the public methods:
//  arrive()
    arrive() {
        let apply;
        if (this.e.status > E.tripped) {
            apply = (e) => {
                while (this.#leg.next)
                    this.#leg = this.#leg.next;
                this.#set_e(e, this.#leg.end ?? this.#value, this.#leg.unit);
                for (const t of this.#targets)
                    t._apply(e);
            };
        }
        this.#setup(E.arrived, apply);
    }
//  restore()
    restore() {
        this.#setup(E.original, () => {
            for (const t of this.#targets)
                t._restore();
        });
    }
//  init()
    init(applyIt = true) {
        this.#setup(E.initial, applyIt ? this.#initOrTrip : null);
    }
//  initRoundTrip() sets up for starting the inbound trip
    initRoundTrip() {
        if (!this.#roundTrip)
            this.roundTrip = true;
        this.#setup(E.tripped, this.#initOrTrip, true);
    }
//  #setup() does the work for arrive(), restore(), init(), and initRoundTrip()
    #setup(sts, apply, isRT) {
        const e = this.e
        if (sts && sts == e.status) return; // let E.arrived fall through
        //-------------------------------
        if (sts || e.status != E.tripped)
            this.#leg = isRT ? this.#lastLeg : this.#firstLeg;
        if (!isRT) {
            if (this.#isInc)
                this.#value = this.#start;
        }
        else if (this.#isInc) {
            if (this.#end)
                this.#value = this.#end;
            else
                apply = null;
        }
        this.#inbound = isRT;
        apply?.bind(this)(e);
        this.#init_e(sts);
    }
    #initOrTrip(e) {
        let peri
        if (this.#isInc)
            e.value = this.#value;
        else
            this.#set_e(e, this.#leg.prev.end, this.#leg.prev.unit);

        for (const t of this.#targets) {
            peri   = t.peri;    // don't want to run target.peri() if it exists
            t.peri = undefined;
            if (t.loopByElm)
                do {
                    t._apply(e);
                } while (t._nextElm());
            else
                t._apply(e);
            t.peri = peri;
        }
    }
    #init_e(status) {
        Object.assign(this.e,  this.#e);
        this.e.status = status;
        Object.assign(this.e2, this.#e);
    }
    #set_e(e, value, unit) {
        e.value = value;
        e.unit  = unit;
        e.comp  = Ez.flip(unit);
    }
////////////////////////////////////////////////////////////////////////////////
// "Protected" members:
//  _zero() and _resume() help AFrame.prototype.play() via Easies
    _zero(now) {
        if (this.e.status == E.tripped) {
            this.#zero    = now + this.#lastLeg.wait + this.#tripWait;
            this.e.status = E.inbound;
        }
        else {
            this.#zero    = now + this.#firstLeg.wait + this.#wait;
            this.e.status = E.outbound;
        }
        for (const t of this.#targets)
            t._zero(this);
    }
    _resume(now) {
        if (this.e.status) // E.arrived == 0
            this.#zero = now - this.#now;
    }
//  _reset() helps AFrame.prototype.#cancel() via Easies
    _reset(sts) {
        switch (sts) {
        case E.arrived:
            this.arrive();  break;
        case E.original:
            this.restore(); break;
        case E.initial:
            this.init();    break;
        case E.tripped:
            this.initRoundTrip();
        default: // undefined or E.empty == noop
        }
    }
////////////////////////////////////////////////////////////////////////////////
// Animation methods:
//  _easeMe() calculates & applies values during animation.
//   Called by Easies.prototype._next(). this.e.status is never E.arrived prior
//   to calling #run() because Easies temporarily deletes this from #easies.
    _easeMe(timeStamp) {
        const e    = this.e;
        timeStamp -= this.#zero;
        this.#now  = timeStamp;
        if (timeStamp >= 0) {
            if (e.status == E.waiting) // it just stopped waiting
                e.status = this.#inbound ? E.inbound : E.outbound;
            this.#run(timeStamp, this.#leg, e);
            this.#peri?.(this);
        }
        return e.status;
    }
//  #ease() and #increment() are called by _easeMe() as #run()
//  #ease() calculates an eased value
    #ease(now, leg, e) {
        if (now >= leg.time) {
            leg = this.#nextLeg(leg, e);  // sets this.#leg and e.status
            const hasNext = e.status > E.tripped;
            const waitNow = e.waitNow;
            if (!hasNext || waitNow) {    // E.arrived, E.tripped, or waiting
                if (hasNext)
                    leg = leg.prev;
                this.#set_e(e, leg.end, leg.unit);
                if (hasNext || (!e.status && leg.type == E.steps))
                    return;               // waiting or steps = E.arrived
                //---------               //!!loopbyelm + steps must continue!!
                this.#leg = this.#inbound ? this.#lastLeg : this.#firstLeg;
                e = this.e2;              // for looping, autoTrip steps no wait
                if (leg.type == E.steps) {
                    if (!waitNow)
                        this.#set_e(e, leg.end, leg.unit);
                    return;               // steps = E.tripped
                } //------------
                leg = this.#leg;
            }
            now = this.#now;              // #nextLeg modified it
        }
        const val  = leg.ease(now / leg.time) * leg.part;
        const unit = leg.prev.unit + (leg.down ? -val : val);
        this.#set_e(e, unit * this.#dist + this.#base, unit);
    //  now     = leg.ease(now / leg.time) * leg.part;
    //  e.unit  = leg.prev.unit + (leg.down ? -now : now);
    //  e.comp  = Ez.flip(e.unit);             //^^not always needed, could be iffed out if it's worth it
    //  e.value = e.unit * this.#dist + this.#base; //^^also not always needed or dist is 1 and base is 0
  //^^  now     = leg.ease(now / leg.time);
  //^^  e.value = (leg.down  ? Ez.flip(now) : now) * leg.dist + leg.start;
  //^^  now     = Math.abs(e.value - this.#start) / this.#dist;
  //^^  e.unit  = leg.down ? Ez.flip(now) : now;
  //^^  e.comp  = Ez.flip(e).unit;
    }
//  #increment() increments e.value until the time is up or end is reached
    #increment(now, leg, e) {
        if (leg.time) { // time-based
            if (now >= leg.time) {           // leg is always this.#leg
                leg = this.#nextLeg(leg, e); // sets this.#leg
                if (e.status) {
                    if (!leg.time)
                        this.#nextInc(leg);
                    if (!Is.def(leg.start))
                        this.#incrementLeg(leg, e);
                }
            }
            else
                this.#incrementLeg(leg, e);
        }
        else {          // count-based (or end-based)
            this.#incrementLeg(leg, e);
            const end = leg.end;
            if (e.value >= end) {
                let wait;
                if (leg.next) {
                    leg = leg.next;
                    if (leg.time) {
                        this.#now = 0;
                        this._zero(now);
                    }
                    this.#nextInc(leg, true);
                    this.#leg = leg;
                    wait      = leg.wait;
                    e.value   = end;
                    if (wait)
                        e.waitNow = true;
                }
                else { //!!need to set #zero and #leg here!!
                    this.#trip(e);
                    if (this.#inbound) {
                        e.value = end;
                        wait = this.#tripWait;
                    }
                    else if (e.status) {
                        wait = this.#loopWait;
                        if (!wait)
                            e.value = this.#start;
                    }
                }
            }
        }
    }
//  The rest of the animation methods help #ease() and #increment():
//  #incrementLeg() helps #increment()
    #incrementLeg(leg, e) {
        this.#value += leg.increment;
        e.value      = this.#value;
    }
//  #nextInc() helps #increment()
    #nextInc(leg, checkWait) {
        if (checkWait && leg.wait) {
            if (leg.prev.end)
                this.#value = leg.prev.end;
        }
        else if (Is.def(leg.start))
            this.#value = leg.start;
        if (!leg.increment)             // it's undefined
            this.#computeInc(leg, this.#value);
        else if (!Is.def(leg.end))      // can be any number
            this.#computeEnd(leg, this.#value);
    }
//  #nextLeg helps #ease() and #increment() get time-based next leg
    #nextLeg(leg, e) {
        let wait;
        let next   = leg.next;
        let time   = leg.time;
        this.#now -= time;
        //!!Is there a way to condense this logic?? some identical repitition...
        if (next) {             // proceed to the next leg
            this.#leg = next;   // skipping a leg happens, especially with
            wait = next.wait;   // eased steps.
            while (next && this.#now >= time + wait) {
                time += wait + next.time;
                next = next.next
                this.#now -= time;
                if (next) {
                    this.#leg = next;
                    wait = next.wait;
                }
                else
                    wait = 0;
            }
        }
        if (!next) {            // trip, loop, or arrive
            this.#trip(e);
            if (this.#inbound)
                wait = this.#lastLeg.wait  * (this.#autoTrip  ? 2 : 1)
                     + this.#tripWait;
            else
                wait = this.#firstLeg.wait * (this.#roundTrip ? 2 : 1)
                     + this.#loopWait;
        }
        this.#zero += time + wait;
        e.waitNow   = this.#now < wait //!! && !(!this.#now && !wait);
        return this.#leg;
    }
//  #trip() handles both ends of the trip
    #trip(e) {
        if (this.#roundTrip)
            this.#inbound = !this.#inbound;
        e.status = this.#inbound ? E.tripped : E.arrived;
    }
////////////////////////////////////////////////////////////////////////////////
// Easing calculators:
// Except for #powIn(), #powOut(), and #bezier(), these methods are based on:
// https://github.com/ai/easings.net/blob/master/src/easings/easingsFunctions.ts
/////////////////////////////////////////////////////
// https://stackoverflow.com/a/26594370/4941356 says:
//   "As of April 2020, Chrome, Edge and Firefox show less than 1% difference
//    between Math.pow(), sequential multiplication, and ES6 exponentation."
////////////////////////////////////////////////////////////////////////////////
    static #linear (v) { return v; }
    static #sineIn (v) { return 1 - Math.cos((v * Math.PI) / 2); }
    static #sineOut(v) { return     Math.sin((v * Math.PI) / 2); }

    static #circIn (v) { return 1 - Math.sqrt(1 - Math.pow(v,     2)); }
    static #circOut(v) { return     Math.sqrt(1 - Math.pow(v - 1, 2)); }

    static #expoIn (v) { return     Math.pow(2,  10 * v - 10); }
    static #expoOut(v) { return 1 - Math.pow(2, -10 * v);      }
    static #backIn (v) {
        const v2 = v * v;
        return 2.70158 * v2 * v
             - 1.70158 * v2;
    }
    static #backOut(v) {
        const v1 = v - 1;
        const v2 = v1 * v1;
        return 2.70158 * v2 * v1
             + 1.70158 * v2
             + 1;
    }
    static #elasticIn(v) {
        if (!v) return 0;
        //-------------------
        const byTen = v * 10;
		return -Math.pow(2, byTen - 10)
              * Math.sin((byTen - 10.75) * Easy.#twoPi3);
    }
    static #elasticOut(v) {
        if (!v) return 0;
        //-------------------
        const byTen = v * 10;
		return  Math.pow(2, -byTen)
              * Math.sin((byTen -  0.75) * Easy.#twoPi3)
              + 1;
    }
    static #bounceIn (v) { return 1 - Easy.#bounceOut(1 - v); }
    static #bounceOut(v) {
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
    };
    // this is a leg object, called as leg.ease()
    static #powIn (v) { return     Math.pow(v,     this.pow); }
    static #powOut(v) { return 1 - Math.pow(1 - v, this.pow); }

    static #bezier(v) { return this.bezier.solve(v, this.time); }
////////////////////////////////////////////////////////////////////////////////
//  Private helpers for constructor(), a whole bunch of 'em:
//  #reverseMe() creates a new linked list of legs that starts with a reversed
//   clone of #lastLeg and ends with a reversed clone of #firstLeg.
    #reverseMe(tripWait = 0) {
        let leg, next, orig, prev;  // prev is a clone or a dummy

        orig = this.#lastLeg;       // orig and next are outbound legs
        next = orig?.prev;
        prev = {end:this.#end, unit:Number(!this.#firstLeg.prev.unit)};

        this.tripWait = tripWait;   // setter validates and handles undefined
        this.#lastLeg = this.#reverseLeg(orig ?? this.#firstLeg, prev, {wait:0});
        prev = this.#lastLeg;       // the first clone in new inbound linked list
        while (next && next.prev) { // (&& next.prev) avoids #firstLeg.prev
            leg = this.#reverseLeg(next, prev, orig);
            prev.next = leg;
            prev = leg;
            orig = next;
            next = next.prev;
        }
        this.#reversed = true;      // for set roundTrip() and other setters
    }
//  #reverseLeg() helps #reverseMe() create a new inbound leg for round-trip.
    #reverseLeg(leg, prev, orig) {
        const clone = {...leg}; //??which properties don't change?? type, time, count...
        if (!this.#isInc) {     //!!round-trip incremental w/undefined stuff!!
            clone.end   = leg.start ?? leg.prev.end; // E.steps legs have no start
            clone.start = leg.end;
            clone.down  = !leg.down;
            if (this.#flipTrip)
                this.#flipTripLeg(clone);
        }
        else if (clone.increment)    // not #isInc because .increment can
            clone.increment *= -1;   // be undefined, see #nextInc().

        clone.unit = leg.prev.unit;
        clone.prev = prev;
        clone.next = undefined;
        clone.wait = orig.wait + (leg.leftover ?? 0);
        this.#legsWait += orig.wait;
        return clone;
    }
    #legUnit(leg, start, down) { // unit increment end value for a leg
        const val = Math.abs(leg.end - start) / this.#dist;
        return Ez.flipIf(val, down);
    }
    #flipTripLeg(leg) {
        if (leg.type >= E.steps) return;
        //-----------------------
        leg.io = Number(!leg.io); // doesn't apply to E.bezier or E.linear, but
        if (leg.type == E.bezier) // necessary if user changes type.
            leg.bezier = leg.bezier.reversed;
        else {
            leg.ease = Easy.#easings[leg.io][leg.type];
        }
    }
//  static #override() overrides o vs leg for start, end, wait, time|count
//                   prop is a string property name, not a Prop instance
    static #override(prop, leg, o, name, legVal = leg[prop], oVal = o[prop]) {
        if (Is.def(legVal)) {
            if (Is.def(oVal)) {
                name += " leg";
                if (legVal != oVal)
                    console.log(
                        `You defined obj.${prop} and ${name}.${prop}, and they `
                      + `don't match.${leg ? "" : "The sum of"} `
                      + `${name}.${prop} overrides obj.${prop}`);
            }
            o[prop] = legVal;
        }
        else if (Is.def(oVal))
            leg[prop] = oVal;
    }
    static #legText(i, name) {
        return `legs[${i}].${name}`;
    }
    static #legNumber(leg, name, i, defVal, notNeg, notZero) {
        leg[name] = Ez.toNumber(leg[name], Easy.#legText(i, name),
                                defVal, notNeg, notZero);
        return leg[name];
    }
    // E.pow, E.bezier, E.steps, and E.increment require a value in a
    // property of the same name. If a leg inherits the value, we might
    // validate the same value more than once. The alternative is two blocks
    // of validation code: one here, and one in constructor() that would
    // validate all the possible values to be inherited, not just the value
    // for one type, as legs of different types inherit different values.
    // IMO the constructor() validation code is not worth it.
    // Those types can also be set implicitly by setting that property
    // value instead of setting the type.
    static #type(o, defaultType, type = o.type) {
        if (!Is.def(type)) {
            for (const name of PFactory.type.slice(E.pow))
                if (Is.def(o[name]))
                    return E[name];  // E.pow, E.bezier, E.steps, E.increment
            //----------------------
            if (Is.def(defaultType))
                return defaultType;  // caller's default value
            else
                if (o.count || o.legs?.[0].increment || o.legs?.[0].count
                            || o.legs?.[0].type == E.increment)
                    return E.increment;
                else
                    return E.linear; // fallback default value
        }
        else if (!PFactory.type[type])
            Ez._invalidErr("type", type, Ez._listE("type"));
        //----------
        return type;
    }
    #legType(o, leg, i, defaultType) {
        const type = Easy.#type(leg, defaultType);
        if ((type == E.increment) != this.#isInc)
            Ez._cantBeErr("E.increment", "mixed with other types");
        //--------------
        leg.type = type;
        if (type >= E.pow) { // E.pow, E.bezier, E.steps, and E.increment
            // For E.pow and E.bezier leg[name] must be defined
            // For E.steps and E.increment additional validation occurs later
            const name = PFactory.type[type];
            if (!Is.def(leg[name])) {
                if (!Is.def(o[name])  && type < E.steps)
                    Ez._mustBeErr(`${Easy.#legText(i, name)}`, "defined");
                //------------------
                leg[name] = o[name];
            }
            switch (type) {  // validate leg[name]
            case E.pow:
                Easy.#legNumber(leg, name, i, o.pow, ...Ez.grThan0);
                break;
            case E.increment:
                Easy.#legNumber(leg, name, i, ...Ez.undefNotZero);
                break;
            case E.bezier:
                leg[name] = Easy.#toBezier(leg[name], leg.time, name);
            case E.steps:
            }                // steps validated after leg.time is established
        }
    }
    static #io(io, defaultEase = E.in) {
        const name = "io";
        switch (io) {
            case E.inOut: case E.inIn:
            case E.outIn: case E.outOut:
                if (arguments.length > 2) // leg.io, not o.io
                    Ez._cantBeErr("leg.io", `${Ez._listE(name, E.inIn)}. `
                                          + "You must split this leg into two legs");
            case E.in: case E.out:
                return io;
            case undefined:
                return defaultEase;
            default:
                Ez._invalidErr(name, io, Ez._listE(name));
        }
    }
    static #toNumberArray(val, name, notNeg) {
        return Ez.toArray(val, name, notNeg ? Easy.#validNotNeg
                                            : Easy.#validNumber);
    }
    static #validNumber(val, name) { // it can be any number, but not undefined
        return Ez.toNumber(val, name, undefined, false, false, true);
    }
    static #validNotNeg(val, name) { // it must be a positive number
        return Ez.toNumber(val, name, ...Ez.defNotNeg);
    }
    static #toBezier(val, time, name = PFactory.type[E.bezier]) {
        try {
            if (val.isEBezier)
                val.time = time;
            else {
                val = Easy.#toNumberArray(val, name);
                if (val.length != 4)
                    throw new Error();
                //----------------------------------
                val = new EBezier(...val, time);
            }
        } catch {
            Ez._mustBeErr(name, "an EBezier or an array of 4 numbers");
        }
        return val;
    }
} ///////////////////////////////////// end class Easy |||||||||||||||||||||||||
////////////////////////////////////////////////////////////////////////////////
class EBezier {
//  #accuracy is a relative level of precision for the calculation. If you want
//  more or less precision you can set this.time to a bigger or smaller number.
//  #accuracy is pre-calculated, which is one less calculation during animation,
//  but beware of reusing the same EBezier instance for legs of different
//  durations in the same animation (if you're concerned about the precision).
    #accuracy; #time;
    constructor(x1, y1, x2, y2, time) {
        // Calculate the polynomial coefficients, implicit first and last
        // control points are (0,0) and (1,1).
        Ez.readOnly(this, "cx", 3 * x1);
        Ez.readOnly(this, "cy", 3 * y1);
        Ez.readOnly(this, "bx", 3 * (x2 - x1) - this.cx);
        Ez.readOnly(this, "by", 3 * (y2 - y1) - this.cy);
        Ez.readOnly(this, "ax", 1 -  this.bx  - this.cx);
        Ez.readOnly(this, "ay", 1 -  this.by  - this.cy);

        Ez.readOnly(this, "x1", x1);
        Ez.readOnly(this, "y1", y1);
        Ez.readOnly(this, "x2", x2);
        Ez.readOnly(this, "y2", y2);

        this.time = time; // setter
        Ez.is(this);
        Object.seal(this);
    }
//  get reversed() is for round-tripping
    get reversed() {
        return new EBezier(1 - this.x2, 1 - this.y2,
                           1 - this.x1, 1 - this.y1,
                           this.#time);
    }
//  set time() calculates the accuracy for evaluating a timing function
//             for an animation with the specified duration.
    set time(time) {
        this.#accuracy =  1 / (200 * time);
        this.#time = time;
    }
//  solve() is called as this.#leg.ease() in Easy.prototype.#ease().
    solve(x) {
        return this.#sampleCurveY(this.#solveCurveX(x));
    }
    #sampleCurveY(t) {
        return ((this.ay * t + this.by) * t + this.cy) * t;
    }
    #sampleCurveX(t) {
        // ax t^3 + bx t^2 + cx t expanded using Horner's rule.
        return ((this.ax * t + this.bx) * t + this.cx) * t;
    }
    #sampleCurveDerivativeX(t) {
        return (3 * this.ax * t + 2 * this.bx) * t + this.cx;
    }
    // Given an x value, find a parametric value it came from.
    #solveCurveX(x) {
        // First try a few iterations of Newton's method, normally very fast
        let d2, i, t0, t1, t2, x2;
        for (t2 = x, i = 0; i < 8; i++) {
            x2 = this.#sampleCurveX(t2) - x;
            if (Math.abs(x2) < this.#accuracy)
                return t2;
            d2 = this.#sampleCurveDerivativeX(t2);
            if (Math.abs(d2) < 1e-6)
                break;
            t2 = t2 - x2 / d2;
        }
        // Fall back to the bisection method for reliability
        t0 = 0;
        t1 = 1;
        t2 = x;
        if (t0 - t2 > Number.EPSILON)
            return t0;
        if (t2 - t1 > Number.EPSILON)
            return t1;
        while (t1 - t0 > Number.EPSILON) {
            x2 = this.#sampleCurveX(t2);
            if (Math.abs(x2 - x) < this.#accuracy)
                return t2;
            if (x > x2)
                t0 = t2;
            else
                t1 = t2;
            t2 = (t1 - t0) * 0.5 + t0;
        }
        return t2; // Failure
    }
}
///////////////////////////////////////|||||||||||||||||||||||||||||||||||||||||
class Easies {
    #active; #byEasy; #byTarget; #easy2ME; #onArrival; #peri; #post;
    #easies; #targets;
//  #easies, #targets are sets. It prevents duplicates and makes removing items
//  easier. Easies implements iteration protocol for #easies and a few other
//  Set.prototype properties and methods, so an Easies instance acts like a Set
//  (except add() doesn't return a value because that value would be a reference
//  to #easies, and I don't want users modifying it directly).
    constructor(easies, onArrival, post) {
        // These will be <10 items, so let toArray() handle the validation
        this.#easies = new Set(Ez.toArray(easies, "new Easies(arg1, ...): arg1",
                                          Easy._validate, ...Ez.okEmptyUndef));
        this.#targets  = new Set; // Set(MEaser)
        this.#byEasy   = new Map; // Map(Easy,   Map(Easer, plays))
        this.#byTarget = new Map; // Map(MEaser, Map(Easy,  plays))
        this.#easy2ME  = new Map; // Map(Easy,   MEaser)
        this.post      = post;
        this.onArrival = onArrival;
        Ez.is(this);
        Object.seal(this);
    }
    get easies()   { return Array.from(this.#easies); } // shallow copy as Array
//////////////////
//  Set emulation:
    get size() { return this.#easies.size; }

//  [Symbol.iterator]() allows clients to iterate this.#easies
    [Symbol.iterator]() { return this.#easies.values(); }

//  values() can be used by Ez.toArray()
    values() { return this.#easies.values(); }

    has(ez) { return this.#easies.has(ez); }
    add(ez) { this.#easies.add(Easy._validate(ez, "add(arg): arg")); }

//  delete(ez) deletes ez from this.#easies.
//  Then it deletes all the targets that use ez. A MEaser's easies are paired to
//  a property argument, and every masked argument requires an Easy in order to
//  generate a value to apply. A MEaser with a missing Easy is not operational.
    delete(ez) {
        if (this.#easies.delete(ez)) {
            for (const t of this.#targets) {
                if (t.easies.includes(ez))
                    this.#targets.delete(t);
            }
            return true;
        }
        return false;
    }
//  clear() clears both collections, if #easies is empty, so is #targets
    clear() {
        this.#easies .clear();
        this.#targets.clear();
    }
////////////////////////////////////////////////
//  Target-related public properties:
//  get targets() returns a shallow copy of this.#targets.
//      Easy exposes #targets via a shallow copy. Might as well imitate it here.
//      But there's no reason for a setter. Create a new Easies instead, using
//      createFromTargets(). get targets() returns an array, which is what
//      users will probably pass into createFromTargets(). I could return
//      new Set(this.#targets), but Array is more flexible for users.
    get targets() { return Array.from(this.#targets); }

//  newTarget() creates a MEaser instance, adds it to #targets, returns it
    newTarget(o) {
        if (!o.easies && !o.multiFunc?.some(obj => obj.easies || obj.easy))
            throw new Error("For single-ease targets you must use "
                          + "Easy.prototype.newTarget().");
        //-----------------------------------------
        const t = EFactory.create(o);
        this.#targets.add(t);
        return t;
    }
//  addTarget() validates a MEaser instance, adds it to #targets. returns it
    addTarget(t) {
        this.#targets.add(MEBase._validate(t, "addTarget(arg): arg"));
    }
//  cutTarget() deletes a MEaser from #targets, but it does not modify #easies.
    cutTarget(t) { return this.#targets.delete(t); }

//  clearTargets() does what it says
    clearTargets() { this.#targets.clear(); }

//  static createFromTargets() uses targets.easies to create a new Easies
    static createFromTargets(targets, onArrival, post) {
        targets = Ez.toArray(targets, "createFromTargets(arg): arg",
                             MEBase._validate);
        let easies, ez, t;
        easies = new Set;
        for (t of targets)           // t  is MEaser
            for (ez of t.easies)     // ez is Easy
                easies.add(ez);

        easies = new Easies(easies, onArrival, post);
        easies.#targets = targets;
        return easies;
    }
//////////////////
//  Miscellaneous:
// this.peri is an optional callback run once per frame, see _next()
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, "peri"); }

// this.post is an optional callback run after the last Easy has played
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, "easies.post"); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) { this.#onArrival = Easy._validArrival(sts, "Easies"); }

//  restore() and init()
    restore()     { for (const ez of this.#easies) ez.restore();     }
    init(applyIt) { for (const ez of this.#easies) ez.init(applyIt); }

//!!last() returns the Easy that finishes last.
//  Useful when RAF.post is defined for the session and you need to run
//  another function at the end of full animation. AFrame.post could be
//  an array, as could .peri, but how often do you need this?
    last() {
        return Array.from(this.#easies)
                    .toSorted((a, b) => a.total - b.total)
                    .at(-1);
    }
////////////////////////////////////////////////////////////////////////////////
// "Protected" methods, called by AFrame instances:
//  _zero() helps AFrame.prototype.play() zero out before first call to _next()
    _zero(now) {
        let e2M, easies, easy, map, plays, set, t, tplays;
        this.#active = new Set(this.#easies);
        this.#byEasy.clear();
        for (easy of this.#easies) {
            map = new Map;         // map target to plays
            for (t of easy.targets)
                map.set(t, t.plays || easy.plays);
            this.#byEasy.set(easy, map);
        }
        this.#byTarget .clear();
        e2M = this.#easy2ME;
        e2M.clear();
        for (t of this.#targets) {
            easies = t.easies;     // getter returns a shallow copy
            tplays = t.plays;      // ditto
            plays  = new Array(easies.length);
            easies.forEach((ez, i) => {
                plays[i] = tplays[i] || ez.plays;
                set = e2M.get(ez);
                if (set)
                    set.add(t);
                else {
                    set = new Set;
                    set.add(t);
                    e2M.set(ez, set);
                }
            });
            this.#byTarget.set(t, plays);
        }
        for (const ez of this.#easies)
            ez._zero(now);
    }
//  _resume() helps AFrame.prototype.play() reset #zero before resuming playback
    _resume(now) {
        for (const ez of this.#active)
            ez._resume(now);
    }
//  _reset(): helps AFrame.prototype.#cancel() reset this to the requested state
    _reset(sts) {
        for (const ez of this.#easies)
            ez._reset(sts);
    }
//  _runPost() helps AFrame.prototype.#cancel() run .post() for unfinished ACues
    _runPost() {
        for (const ez of this.#active)
            ez.post?.(ez);
        this.#post?.(this);
    }
//  _next() is the animation run-time. The name matches ACues.protytope._next().
//   AFrame.prototype.#animate() runs it once per frame. It runs ez._easeMe() to
//   get eased values, and t._apply() to apply those values to #targets.
//   Returns true upon arrival, else false. No easies means no targets.
    _next(timeStamp) {
        let byElm, e, e2, easers, easy, map, noWait, plays, set, sts, t, val, val2;

        // Execute each easy
        for (easy of this.#active) {
            easy._easeMe(timeStamp);
            console.log()
        }

        // Process the easies' targets
        for ([easy, map] of this.#byEasy) {
            e   = easy.e;
            sts = e.status;
            if (sts == E.waiting) continue;
            //------------------------------
            easers = Array.from(map.keys());
            if (sts > E.waiting)          // apply it
                for (t of easers)
                    t._apply(e);
            else {                        // arrive, trip, or loop
                e2 = easy.e2;
                noWait = !e.waitNow;
                if (sts == E.tripped) {
                    for (t of easers) {   // delete non-autoTrippers
                        t._apply(t._autoTripping && noWait ? e2 : e);
                        if (!t._autoTripping)
                            map.delete(t);
                    }
                }
                else {                    // sts == E.arrived
                    for (t of easers) {
                        byElm = t.loopByElm;
                        plays = map.get(t);
                        t._apply(!byElm && noWait && plays > 1
                                 ? e2     // loop w/o wait
                                 : e);    // arrive, loop w/wait, loopByElm
                        if (!byElm || !t._nextElm()) {
                            plays--;
                            plays ? map.set(t, plays)
                                  : map.delete(t);
                        }
                        else if (noWait)
                            t._apply(e2); // loopByElm w/o wait
                    }
                }
            }
            if (!map.size)
                this.#byEasy.delete(easy);
        }

        // Process #targets, the MEasers
        for ([t, plays] of this.#byTarget) {
            val  = [];                    // val is sparse like t.#calcs
            if (!t.loopByElm) {
                plays.forEach((p, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (sts != E.waiting) {
                        if (--p && !sts && !e.waitNow)
                            e = easy.e2   //!!e2 for loopNoWait, not tripNoWait??
                        val[i] = t.eVal(e, i);

                        if (!sts || (sts == E.tripped && !t._autoTripping[i])) {
                            if (!p) {            // no more plays, arriving
                                delete plays[i]; // delete preserves order/indexes
                                set = this.#easy2ME.get(easy);
                                set.delete(t);
                                if (!set.size)
                                    this.#easy2ME.delete(easy);
                            }
                            else if (!sts)       // looping
                                plays[i] = p;    // decrement the play count
                        }
                    }
                });
                if (val.length)
                    t._apply(val);
                if (!plays.some(v => v))
                    this.#byTarget.delete(t);
            }
            else if (t.loopEasy.e.status) { // loopByElm, but not looping now
                plays.forEach((_, i) => {
                    e = t.easies[i].e;
                    if (e.status != E.waiting)
                        val[i] = t.eVal(e, i);
                });
                if (val.length)
                    t._apply(val);
            }
            else {                          // looping by element
                val2 = [];
                plays.forEach((_, i) => {
                    easy = t.easies[i];
                    e    = easy.e;
                    sts  = e.status;
                    if (!sts) {
                        val[i] = t.eVal(e, i);
                        if (!e.waitNow)
                            val2[i] = t.eVal(easy.e2, i);
                    }
                    else if (sts > E.waiting)
                        val2[i] = t.eVal(e, i);
                });
                t._apply(val);              // apply to current elm
                if (!t._nextElm(true)) {    // go to next elm or arrive
                    plays.forEach((p, i) => {
                        if (p > 1)          // loop back to first elm
                            --plays[i];
                        else                // arrive
                            delete plays[i];

                    });
                    if (!plays.some(v => v))
                        this.#targets.delete(t);
                }
                else if (val2.length)
                    t._apply(val2);
            }
        }

        // Clean up and return
        for (easy of this.#active) {
            if (!this.#byEasy.has(easy) && !this.#easy2ME.has(easy)) {
                easy.post?.(easy);
                this.#active.delete(easy);
            }
            else {
                e = easy.e;
                if (!e.status) {
                    if (e.waitNow) {
                        e.status  = E.waiting;
                        e.waitNow = false;
                    }
                    else
                        e.status = E.outbound;

                    easy.loop?.(easy);
                }
                else if (e.status == E.tripped)
                    e.status = E.inbound;
            }
        }
        this.#peri?.(this);         // wait until everything is updated
        return !this.#active.size;
    }
}
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//||||||||||||||||||||||||||||||||||||| RAF classes: ACues, AFrame |||||||||||||
//||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||||
//\ ACues: a barebones cue list
/** @unrestricted */ class ACues {
    #cues; #elms; #i; #last; #now; #peri; #post; #pre; #prop; #validate; #zero;

    constructor(callback, obj, validate = true) {
        this.peri     = callback;  // use the setters to validate (or not)
        this.validate = validate;  // for set cues() and set elms()
        if (Is.Arrayish(obj))
            this.cues = Ez.toArray(obj, "cues", this.#validate, ...Ez.okEmptyUndef);
        else if (Is.def(obj)) {
            this.cues = obj.cues;     this.pre  = obj.pre;
            this.prop = obj.prop;     this.post = obj.post;
            this.elms = obj.elms ?? obj.elm;
        }
        else
            this.#cues = [];

        Ez.is(this);
        Object.seal(this);
    }

    get validate()  { return Is.def(this.#validate); }
    set validate(b) { this.#validate = b ? this.#validCue : undefined; }

    get prop()    { return this.#prop; }
    set prop(val) { this.#prop = PBase._validate(val, "prop"); }

    get elms()    { return this.elms.slice(); }
    set elms(val) {
        if (Is.def(val) && this.#validate)
            val = Ez.toElements(val);
        this.#elms = val;
    }

// this.cues is an array of cue objects
    get cues()    { return this.#cues; }
    set cues(val) {
        val = Ez.toArray(val, "cues", this.#validate, ...Ez.okEmptyUndef);
        if (Ez._mustAscendErr(val, "cues", false)) {
            cues.sort((a, b) => a.wait - b.wait);
            console.log("Your cues had to be sorted.");
        }
        this.#cues = val;
        this.#last = val.length - 1;
    }
    #validCue(cue) {
        Ez._validObj(cue, "cue");
        cue.wait = Ez.toNumber(cue.wait ?? cue.time, "cue.wait|time",
                               ...Ez.defNotNeg);
        if (this.#peri === this.default) {
            const so = "defined for default callback";
            if (!Is.def(value))
                Ez._mustBeErr("cue.value", so);

            const elms = cue.elms ?? cue.elm;
            if (Is.def(elms))
                cue.elms = Ez.toElements(elms); //!!not the best error msg here!!
            else if (!this.#elms)
                Ez._mustBeErr("cue.elms|elm or this.elms", so)
            cue.prop = PBase._validate(cue.prop, "cue.prop", !this.#prop);
        }
        return cue;
    }
    newCue(wait, value, elms, prop) {
        return this.#insertCue({wait, value, elms, prop});
    }
    addCue(cue) {
        return this.#insertCue(cue);
    }
    #insertCue(cue) {
        if (this.#validate)
            cue = this.#validate(cue);

        const w = cue.wait;
        const a = this.#cues[0].wait;
        const z = this.#cues.at(-1).wait;
        if (w > z)
            this.#cues.push(cue);
        if (w < a)
            this.#cues.unshift(cue);
        else {
            const findNext = (c) => { return w <= c.wait; };
            const i = w > ((z - a) / 2)
                    ? this.#cues.findLastIndex(findNext)
                    : this.#cues.findIndex    (findNext);
            if (w == this.#cues[i].wait)
                Ez._mustBeErr("cue.wait|time", "a unique value. No duplicates.");
            this.#cues.splice(i - 1, 0, cue);
        }
    }
//  splice(), push(), unshift(), insert() if you want to manage array sorting
    splice(start, deleteCount) {
        const cues = Array.prototype.slice.call(arguments, 2);
        if (this.#validate)
            for (const cue of cues)
                cue = this.#validate(cue);

        return this.#cues.splice(start, deleteCount, ...cues);
    }
    push   (cue)        { return this.#pushift( 0, cue); }
    unshift(cue)        { return this.#pushift(-1, cue); }
    insert (start, cue) { return this.splice(start, 0, cue); }

//  #pushift() helps push() and unshift()
    #pushift(start, cue) {
        if (this.#validate)
            cue = this.#validate(cue);
        switch (start) {
            case  0: this.#cues.push   (cue); break;
            case -1: this.#cues.unshift(cue); break;
            default: this.#cues.splice (start, 0, cue);
        }
        return cue;
    }
// this.pre  is optional, it runs prior to first call to requestAnimationFrame()
// this.post is optional, it runs after the last cue has played
// this.peri is required, it runs once per cue, it defaults to ACues.default
    get pre () { return this.#pre;  }
    get post() { return this.#post; }
    get peri() { return this.#peri; }
    set pre (val) { this.#pre  = Ez._validFunc(val, "cue.pre"); }
    set post(val) { this.#post = Ez._validFunc(val, "cue.post"); }
    set peri(val) { this.#peri = Is.def(val)
                               ? Ez._validFunc(val, "cue.peri|callback", true)
                               : this.default; }

// this.callback is an alias for this.peri
    get callback()    { return this.peri; }
    set callback(val) { this.peri = val;  }

//  default() is the default peri (aka callback) function
    default(cue) {
        try {  //++adding let/net: better to preset plugs, as with Easer
            for (const elm of cue.elms ?? this.#elms)
                (cue.prop ?? this.#prop).setIt(elm, cue.value);
        } catch (e) {
            throw new Error(`default(cue): cue = ${cue}, `
                           + `this.elms = ${this.#elms}, `
                           + `this.prop = ${this.#prop}\n${e}`);
        }
    }
////////////////////////////////////////////////////////////////////////////////
// "Protected" helpers for AFrame. They all match methods in Easies and/or Easy.
//  _next(): AFrame.prototype.#animate() calls it every frame. Why adjust "now"
    _next(now) { // here? Tt's simplest, drawbacks everywhere are equally bad.
        const cues = this.#cues;    // assign to consts and -= for readability
        const i    = this.#i;
        now -= this.#zero;
        while (now >= cues[i].wait)
           this.#peri(cues[i++]);

        this.#now = now;
        this.#i   = i;
        return (i == this.#last);   // return true = finished
    }
//  _zero() helps AFrame.prototype.play() zero out before first call to _next()
    _zero(now) {
        this.#zero = now;
        this.#now  = 0;
        this.#i    = 0;
    }
//  _resume() helps AFrame.prototype.play() reset #zero before resuming playback
    _resume(now) { // #now stays the same, that's the whole idea of pausing
        this.#zero = now - this.#now;
    }
//  _reset(): helps AFrame.prototype.#cancel() reset this to the requested state
    _reset(sts) {
        if (!sts && this.#i < this.#last) // E.arrived only
            this._next(Infinity);         //!!include more statuses?? E.empty always excluded
    }
//  _runPost() helps AFrame.prototype.#cancel() run .post() for unfinished ACues
    _runPost() { this.#post?.(this); }
}
////////////////////////////////////////////////////////////////////////////////
//\ AFrame: the animation frame manager
/** @unrestricted */ class AFrame {
    #backup; #callback; #fps; #frame; #gpu; #keepPost; #now; #onArrival; #peri;
    #post; #promise; #syncZero; #targets; #useNow; #zero;
    #status    = E.empty;
    #frameZero = true;   // Unfortunately, this is the best default (for now...)

    constructor(arg) {   // arg is int, bool, arrayish, object, or undefined
        this.#callback = this.#animate; // overwritten by this.useNow setter
        if (arg?.isEasies || arg?.isACues)
            this.targets = arg;
        else if (Is.Arrayish(arg))
            this.targets = Ez.toArray(arg, "new AFrame(targets)", AFrame.#validTarget, false);
        else if (Ez._validObj(arg)) {
            this.peri    = arg.peri;       this.onArrival = arg.onArrival;
            this.post    = arg.post;       this.keepPost  = arg.keepPost;
            this.useNow  = arg.useNow;     this.frameZero = arg.frameZero;
            this.targets = arg.targets;    this.syncZero  = arg.syncZero;
        }
        else {
            this.#targets = new Set;
            this.#backup  = new Set;
            if (Easy._validArrival(arg, undefined, true) !== false)
                this.#onArrival = arg;  // legit int status or undefined
            else if (arg === true || arg === false)
                this.#frameZero = arg;
            else
                Ez._mustBeErr("new AFrame(arg): arg",
                              "a valid onArrival status, a boolean, array-ish, "
                            + "a valid object with properties, or undefined.");
        }
        Object.seal(this);
    }
////////////////////////////////////////////////////
    get zero()    { return this.#zero; }
    get now()     { return this.#now;  }
    get elapsed() { return this.#now - this.#zero; }
////////////////////////////////////////////////////
//  Two types of target: Easies and ACues
    get targets()    { return Array.from(this.#targets); }
    set targets(val) {
        // How often is val.length > 2? It's easier to convert to Array, then
        // to Set, even if it's originally a Set, especially for validation.
        if (val?.isEasies || val?.isACues)
            val = [val];
        else
            val = Ez.toArray(val, "targets", AFrame.#validTarget, false);

        if (!val.length)
            this.clearTargets(); // sets #status = E.empty
        else {
            val = new Set(val);
            this.#targets = val;
            this.#backup  = new Set(val);
            if (this.isEmpty)
                this.#status = E.original;
        }
    }
//  newEasies() and newCues() create a target instance and add it to #targets
    newEasies() { return this.#newTarget(Easies, arguments); }
    newCues()   { return this.#newTarget(ACues,  arguments); }
    #newTarget(cls, args) {
        const t = new cls(...args);
        this.#targets.add(t);
        this.#backup .add(t);
        return t;
    }
    addTarget(val) {
        val = AFrame.#validTarget(val);
        this.#targets.add(val);
        this.#backup .add(val);
        if (this.isEmpty)
            this.#status = E.original;
    }
    cutTarget(val) { // return value emulates Set and is consistent with other classes in this library.
        if (!this.#backup.has(val))
            return false;
        //-------------------------
        if (this.#backup.size == 1)
            this.clearTargets();
        else {
            this.#targets.delete(val);
            this.#backup .delete(val);
        }
        return true;
    }
    clearTargets() {
        this.#targets.clear();
        this.#backup .clear();
        if (this.isRunning)
            this.#cancel(E.empty);
        else
            this.#status = E.empty;
    }
    static #validTarget(t) {
        if (!t?.isEasies && !t?.isACues) //!!should this just warn??toArray() would need change...
            Ez._mustBeErr("targets", "a collection of Easies and/or ACues");
        return t;
    }

    get useNow()  { return this.#useNow; }
    set useNow(b) {
        this.#useNow   = Boolean(b);
        this.#callback = b ? this.#animateNow : this.#animate;
    }

    get frameZero()  { return this.#frameZero}
    set frameZero(b) { this.#frameZero = Boolean(b); }

// this.onArrival
    get onArrival()    { return this.#onArrival; }
    set onArrival(sts) { this.#onArrival = Easy._validArrival(sts, "AFrame"); }

// this.oneShot
    get oneShot()  { return this.#onArrival == E.empty; }
    set oneShot(b) { // if (!b && this.#onArrival != E.empty)
        if (b)       //     it's already "off", leave #onArrival alone;
            this.#onArrival = E.empty;
        else if (this.#onArrival == E.empty)
            this.#onArrival = undefined;
    }

// this.syncZero is optional, run by #animateZero(), only if #frameZero == true
    get syncZero()    { return this.#syncZero; }
    set syncZero(val) { this.#syncZero = Ez._validFunc(val, ".syncZero"); }
// this.peri is optional, runs once per frame, helps throttle events
    get peri()    { return this.#peri; }
    set peri(val) { this.#peri = Ez._validFunc(val, ".peri"); }
// this.post is optional, runs just before the animation callback loop exits
    get post()    { return this.#post; }
    set post(val) { this.#post = Ez._validFunc(val, ".post"); }
// this.keepPost indicates whether to keep or delete this.#post after running it
    get keepPost()    { return this.#keepPost; }
    set keepPost(val) { this.#keepPost = Boolean(val); }
// this.fps
    get fps()    { return this.#fps; }
// this.gpu
    get gpu()    { return this.#gpu; }
/////////////////////////////////////
//  Animation properties and methods:
// this.status and its booleans are read-only
    get status()    { return this.#status; }
    get atOrigin()  { return this.#status == E.original; }
    get atStart()   { return this.#status == E.initial;  }
    get atEnd()     { return this.#status == E.arrived;  }
    get isPausing() { return this.#status == E.pausing;  }
    get isRunning() { return this.#status == E.running;  }
    get isEmpty()   { return this.#status == E.empty;    }
    get isInit()    { return this.#status == E.initial;  }
    get isInitialized() { return this.#status == E.initial;  }
    get hasArrived()    { return this.#status == E.arrived;  }

//  play() initiates the #animate() callback loop
    play() {
        if (!this.isRunning) {          // if it's already running, ignore it
            this.#promise = Ez.promise();
            if (!this.#targets.size)    // nothing to animate
                this.#promise.resolve(E.empty);
            else {
                let t;
                const now = this.#useNow ? performance.now()
                                         : document.timeline.currentTime;
                const isResuming = this.isPausing;
                if (isResuming)
                    for (t of this.#targets)
                        t._resume(now);
                else if (this.#frameZero)
                    for (t of this.#targets)
                        t.pre?.(t);
                else {
                    for (t of this.#targets) {
                        t._zero(now);
                        t.pre?.(t);
                    }
                }
                this.#status = E.running;
                if (this.#frameZero && !isResuming)
                    this.#frame = requestAnimationFrame(t => this.#animateZero(t));
                else {
                    this.#zero  = isResuming ? this.#zero + now - this.#now : now;
                    this.#now   = now;
                    this.#frame = requestAnimationFrame(t => this.#callback(t));
                }
            }
        }
        return this.#promise;
    }

//  #animate() is the requestAnimationFrame() callback
    #animate(timeStamp) {
        this.#now = timeStamp;           // set it first so callbacks can use it
        for (const t of this.#targets) { // execute this frame
            if (t._next(timeStamp)) {    // true = arrived, finished
                t.post?.(t);
                this.#targets.delete(t);
            }
        }
        if (this.#peri?.(this, timeStamp) || this.#targets.size)
            this.#frame = requestAnimationFrame(t => this.#callback(t));
        else
            this.#cancel(this.#onArrival, true, true);
    }
//  #animateNow() is the animation callback that uses performance.now()
    #animateNow() { this.#animate(performance.now()); }

//  #animateZero() is for one frame only
    #animateZero(timeStamp) {
        this.#zero = timeStamp;
        this.#now  = timeStamp;
        if (this.#useNow)
            timeStamp = performance.now();
        for (const t of this.#targets)
            t._zero(timeStamp);
        this.#syncZero?.(timeStamp);  // not an exact sync unless #useNow
        this.#callback(timeStamp);    // timeStamp is always less than now
    }
//  pause() arrive() init() stop() all cancel, then set different states
//  clearTargets() is the way to set E.empty and call #cancel() if running
    pause (forceIt) { return this.#cancel(E.pausing,  forceIt); }
    arrive(forceIt) { return this.#cancel(E.arrived,  forceIt); }
    init  (forceIt) { return this.#cancel(E.initial,  forceIt); }
    stop  (forceIt) { return this.#cancel(E.original, forceIt); }

//  #cancel helps pause(), stop(), arrive(), init(), clearTargets(), #animate()
    #cancel(sts, forceIt, hasArrived) {
        const wasRunning = hasArrived ?? this.isRunning;

        if (wasRunning && !hasArrived)
            cancelAnimationFrame(this.#frame);
        else if (!forceIt && sts == this.#status)
            return this.#status;
        //---------------------
        if (sts != E.pausing) {
            let t;
            const wasPausing = this.isPausing;
            const isArriving = hasArrived ?? !sts;

            if (wasRunning || wasPausing) {
                if (isArriving && !hasArrived)
                    for (t of this.#targets)  // remaining targets, not #backup
                        t._runPost();
                if (isArriving && this.#post) {
                    const post = this.#post;  // this.#post can be set in post()
                    if (!this.#keepPost)      // and it defaults to single-use.
                        this.#post = undefined;
                    post(this);
                }
            }
            if (Is.def(sts)) {
                for (t of this.#backup)
                    t._reset(sts);
            }
            if (sts != E.empty)
                this.#targets = new Set(this.#backup);
        }
        this.#status = sts ?? E.arrived;
        if (wasRunning)                       // .then() won't execute otherwise
            this.#promise.resolve(this.#status);
        return this.#status;
    }
////////////////////////////////////////////////////////////////////////////////
//  Device-probing functions. "skip" arg skips frames prior to collecting data
//  because the time between the first two frames is rarely reprentative of the
//  devices frame rate. fpsBaseline() and test() skip 3 frames by default.
//  ============================================================================
//  fpsBaseline() runs rAF() with no animation and returns average fps + times
    fpsBaseline(size, max, diff) {
        const args = ["sampleSize","maxFrames","maxDiff"];
        const name = `fpsBaseline(${args.join(", ")})`;
        if (this.isRunning)
            Ez._cantErr("You", `run ${name} during animation playback`);
        //----------------------------------------------------------------------
        size = Math.max(1,        Ez.toNumber(size, `${name}: ${args[0]}`,  3));
        max  = Math.max(1 + size, Ez.toNumber(max,  `${name}: ${args[1]}`, 10));
        diff = Math.max(0,        Ez.toNumber(diff, `${name}: ${args[2]}`,  0.1));

        this.#fps = {size, max, diff, times:[], intervals:[], diffs:[],
                     status:this.#status};
        this.#status  = E.running;
        this.#frame   = requestAnimationFrame(t => this.#fpsAnimate(t));
        this.#promise = Ez.promise();
        return this.#promise;
    }
//  #fpsAnimate() is the rAF callback for fpsBaseline()
    #fpsAnimate(timeStamp) {
        let diff, isDone, lt, lv, sample;
        const fps   = this.#fps;
        const size  = fps.size;
        const times = fps.times;
        const vals  = fps.intervals;
        const diffs = fps.diffs;

        lt = times.length;
        if (lt++) {         // don't run when .length == 0
            lv = vals.push(timeStamp - times.at(-1));
            if (lv >= size) {
                sample = vals.slice(lv - size, lv);
                diff   = Math.max(...sample.slice(1)
                                           .map(v => Math.abs(v - sample[0])));
                isDone = diff <= fps.diff;
                if (!isDone)
                    diffs.push(diff);
            }
        }
        times.push(timeStamp);

        if (isDone || lt >= fps.max) {
            if (!isDone) {
                diff    = Math.min(...diffs);
                const i = diffs.indexOf(diff);
                sample  = vals.slice(i, i + size);
            }
            const avg  = sample.reduce((sum, v) => sum + v, 0) / size;
            const vars = sample.slice(1).map(v => v - sample[0]);
            Ez.readOnly(fps, "diff",   diff);   // overwrite user-supplied value
            Ez.readOnly(fps, "sample", sample);
            Ez.readOnly(fps, "msecs",  avg);
            Ez.readOnly(fps, "value",  1000 / avg);
            Ez.readOnly(fps, "range",  Math.max(...vars) - Math.min(...vars, 0));
            this.#status = fps.status;
            this.#promise.resolve(fps);
        }
        else
            this.#frame = requestAnimationFrame(t => this.#fpsAnimate(t));
    }
//  ============================================================================
//  gpuTest() is an alternative to start(), used to determine local GPU power.
//  It runs the animates the current targets and calculates average fps.
//  #gpu.value is a boolean = pass/fail: fps >= min
    gpuTest(min, skip, peri) { // they're used via arguments global array
        const args = ["min","skip","peri"];
        const name = `gpuTest(${args.join(", ")})`;
        if (this.isRunning)
            Ez._cantErr("You", `run ${name} during animation playback`);
        //------------------
        if (!this.isEmpty) {
            this.clearTargets();
            console.warn(`${name} cleared targets, status: ${this.#status}`);
        }
        min  = Ez.toNumber  (min , `${name}: ${args[0]}`, 0, ...Ez.intNotNeg);
        skip = Ez.toNumber  (skip, `${name}: ${args[1]}`, 3, ...Ez.intNotNeg);
        peri = Ez._validFunc(peri, `${name}: ${args[2]}`);

        this.#gpu = { min, skip, peri, times:[] };
        this.peri = AFrame.#gpuPeri;
        this.post = AFrame.#gpuPost;
        this.#status  = E.running;
        this.#promise = Ez.promise();
        this.#skipFrames();
        return this.#promise;
    }
//  #skipFrames() skips this.#skip frames prior to running the test animation.
//                At least the first frame interval must be ignored when
//                calculating frames per second.
    #skipFrames() {
        this.#frame = requestAnimationFrame(t => this.#gpu.skip--
                                               ? this.#skipFrames()
                                               : this.#animateZero(t));
    }
//  static #gpuPeri() caches timestamps and runs #gpu.peri(), #gpu is extensible
    static #gpuPeri(aframe, t) {
        aframe.#gpu.times.push(t);
        aframe.#gpu.peri?.(aframe, aframe.#gpu, t);
    }

//  #gpuPost() sets .fps (frames per second) and .value (pass/fail fps >= min),
    static #gpuPost(aframe) {       // then it cleans up and resolves the promise.
        const gpu = aframe.#gpu;
        Ez.readOnly(gpu, "fps",   gpu.times.length / (aframe.elapsed / 1000));
        Ez.readOnly(gpu, "value", gpu.fps >= gpu.min);
        aframe.clearTargets();
    //!! .then(arg): arg is always the number 9, regardless of setting here
    //!! workaround: use AFrame.prototype.gpu property to get gpu
        aframe.#promise.resolve(gpu);
    }
//  ============================================================================
//  fpsRound() rounds a value to the nearest commonly-used hardware refresh rate
    static fpsRound(val) {
        val = Ez.toNumber(val, "fpsRound", ...Ez.defNotNeg);
        const ranges = [         // [max, fps], above 165fps round to nearest 10
            [ 50, Math.round(val)],          // below  50fps just round
            [ 69,  60], [ 83,  75], [ 87,  85], [ 95,  90],
            [105, 100], [132, 120], [157, 144], [162, 160], [168, 165],
            [Infinity, Math.round(val / 10) * 10]
        ];
        for (let [max, fps] of ranges)
            if (val < max)
                return fps;
    }
}
