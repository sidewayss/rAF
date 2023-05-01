# rAF - <b>JavaScript animation library for CSS and SVG</b>

<b>It provides a structured, compact way to create and execute CSS or SVG animations of two types:</b><br>
&nbsp;• Gradual value changes, aka easing<br>
&nbsp;• Cue-based animations, where timing cues trigger animation events<br>
It also provides an alternate paradigm for setting properties/attributes where the property sets the value on the element, not the other way around.  It has its advantages.

<b>Goals, Assumptions, and Approach:</b><br>
&nbsp;• Normalize all things similar across CSS and SVG.<br>
&nbsp;• Allow for the animation of every property/attribute and function in full detail.<br>
&nbsp;• Create a minimal syntax that is both flexible and forgiving.<br>
&nbsp;• Make it fully object-oriented within the confines of JavaScript.<br>
&nbsp;• Assume a “modern browser” that supports ES6.<br>
&nbsp;• Build in callbacks for flexibility and the ability to meet as-yet-unknown requirements.<br>
&nbsp;• Create a way to test user gpu power and develop methods for handling low-end vs high-end gpus.<br>
&nbsp;• Use my home page animations as functional requirements and a test bed.  Ensure that all the exceptional situations are handled.  There are ~100 separate animations, most of which work together as parts of larger animations.
  
<b>Structure:</b><br>
raf.js has three sub-libraries that wrap each other like nesting dolls (inner to outer order):<br>
&nbsp;• prop.js defines the Prop, Func, Is, and Ez classes<br>
&nbsp;• easy.js defines the Easy, Easee, Easer, Teaser, and Geaser classes<br>
&nbsp;• raf.js defines the ACues and AFrame classes

Each file is standalone: easy.js contains all the prop.js code, raf.js contains all the easy.js code.  I didn't want to get into JavaScript modules with something this small.  Standalone prop.js allows users to take advantage of its property/attribute-setting features when they are not animating anything.  Standalone easy.js can be used to animate by integrating with your own requestAnimationFrame() calls and callbacks, not those provided by raf.js.

As a user of the library, you will not need to familiarize yourself with the Easee, Easer, Teaser, and Geaser classes.  Except for the ACues class, you will never need to write: let myVar = new ClassName.  There is no need for multiple instances of the prop.js classes, as you will see once you use them. For the Aframe class, unless you are getting fancy (like pausing one animation to play another, then resuming the paused animation) you only need one declared instance.  So the libraries pre-declare an instance of each of the prop.js classes and the AFrame class.  You'll see how that works in the examples.  The easy.js class instances are generally created by Easy static methods or AFrame instance methods.  Of course you are free to declare instances of any of these classes, but beware that with the AFrame class it means multiple requestAnimationFrame callback loops at runtime.

Note: Loading any of these .js files automatically generates the contents of the pre-declared instances for the prop.js classes based on lists stored in the Prop class (lists stored as arrays returned by static functions).  The auto-generation of the content obviates the need for a whole lot of literal object definitions in the code.  The one downside is that it makes the advanced settings of Closure Compiler unavailable.  That is part of the reason why there are a lot of very short variable names in this library.<br>
I have not included every CSS property and SVG attribute in existence.  Not even close.  Adding to those lists is a pull request I would accept easily.

<b>Getting Started:</b><br>
No packages yet ...hopefully soon. raf.js is the master file.  From it I copy/paste to create prop.js and easy.js.  Yes, it's primitive, but it doesn't require any code, like modules would.

I'm working on docs to.  They'll be in the Wiki for this repository.

If you want to use the library, download raf.js and start coding.  Use my homepage, sidewayss.com, to see how I did stuff.

If you want to contribute, contact me here, and we'll work something out.  I'm the only one here right now.
