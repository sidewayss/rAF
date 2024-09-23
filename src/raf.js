export * from "./globals.js";           // E, Ease, F, Fn, HD, Is, P, Pn, U, Rx
export * from "./ez.js";                // Ez
export * from "./prop/color-names.js";  // C
export * from "./prop/pfactory.js";     // PFactory initializes everything
export * from "./easy/easy.js";         // Easy
export * from "./easy/incremental.js";  // Incremental, subclass of Easy
export * from "./easy/easies.js";       // Easies
export * from "./acues.js";             // ACues
export * from "./aframe.js";            // AFrame

// General Comments for the library:
// I have chosen to do extensive validation when creating new instances and
// setting properties because debugging an animation call stack can be daunting,
// and there are so many things to validate, so many parameters and
// configurations, so many ways for typos and other oversights to cause errors.
// I also wanted to clarify all the rules. What better place than in the code?
// Invalid parameters throw errors. That might be harsh, but it's also the
// simplest way to handle it.
