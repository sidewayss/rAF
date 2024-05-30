# rAF - <b>JavaScript animation library for CSS and SVG</b>

<b>`rAF` stands for `requestAnimationFrame`. It provides a flexible, structured, and compact way to create and execute CSS or SVG animations of two types:</b><br>
&nbsp;• Gradual value changes, aka easing or steps<br>
&nbsp;• Cue-based animations, where timing cues trigger animation events<br>
It also provides an alternate paradigm for setting properties/attributes where the property sets the value on the element, not the other way around.  It has its advantages.

<b>Goals, Assumptions, and Approach:</b><br>
&nbsp;• Normalize all things similar across CSS and SVG.<br>
&nbsp;• Allow for the animation of every property/attribute and function in full detail.<br>
&nbsp;• Create a minimal syntax that is both flexible and forgiving.<br>
&nbsp;• Make it fully object-oriented within the confines of JavaScript.<br>
&nbsp;• Assume a “modern browser” that supports ES6*.<br>
&nbsp;• Build in callbacks for flexibility and the ability to meet as-yet-unknown requirements.<br>
&nbsp;• Create a way to test user gpu power and develop methods for handling low-end vs high-end gpus.<br>
&nbsp;• Use my home page animations as functional requirements and a test bed.  Ensure that all the exceptional situations are handled.  There are ~100 separate animations, most of which work together as parts of larger animations.

\* _Probably the biggest browser compatibility issue for rAF is [private properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Private_properties) which have [limited support](https://caniuse.com/?search=private%20class) in pre-2021 browser versions. I have considered converting all the `#`s to `_`s, but the more time that passes, the less it matters._

<b>Structure:</b><br>
I have not included every CSS property and SVG attribute in existence.  Not even close.  Adding to those lists is a pull request I would accept easily.

<b>Getting Started:</b><br>
No packages yet ...hopefully soon. raf.js is the master file.  From it I copy/paste to create prop.js and easy.js.  Yes, it's primitive, but it doesn't require any code, like modules would.

I'm working on docs too...

If you want to contribute, contact me here, and we'll work something out.  I'm the only one here right now.
