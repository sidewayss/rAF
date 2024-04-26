"use strict"
let background, theName, viewBox;
const
    groups = {},
    pairs  = {},
    uses   = {},
    toggle = [],
    mouse  = {
        enter:"mouseenter",
        leave:"mouseleave",
        down: "mousedown",
        up:   "mouseup",
    },
    PX = "px",
    ON = "on",
    OFF = "off",
    PRE = "raf-diagram-test-",
    HREF = "href",
    PAGE = "page",
    CHECK = "check",
    RADIO = "radio",
    OBJ_EZ = "objEz"
;
//==============================================================================
document.addEventListener("DOMContentLoaded", loadIt);
function loadIt() {
    background = document.getElementById("bg");
    viewBox    = document.documentElement
                         .getAttribute("viewBox")
                         .split(" ")
                         .map(Number);

    let elm = document.getElementById("frame");
    elm.style.width  = viewBox[2] - 2 + PX;
    elm.style.height = viewBox[3] - 2 + PX;

    for (elm of document.getElementsByTagName("g"))
        if (elm.id)
            groups[elm.id] = elm;

    elm = groups.controls;
    if (elm) {
        [[OFF, ON,  "all",  "remove", "hidden" ],
         [ON,  OFF, "none", "add",    "visible"]]
        .forEach(([value, oppo, events, func, vis]) =>
            toggle.push({value, oppo, events, func, vis})
        );
        let name, type, val;
        const kids = elm.children;
        elm.addEventListener("click", onClick);
        for (elm of kids) {
            for (type of Object.values(mouse))
                elm.addEventListener(type, onMouse, true);

            name = elm.dataset.name
            if (!pairs[name]) {
                uses [name] = elm; // <use> elements first
                pairs[name] = [];
            }
            pairs[name].push(elm);
        }
        theName = kids[0].dataset.name;
        val = localStorage.getItem(PRE + PAGE);
        if (val)
            onClick({target:uses[val]});
        if (groups[OBJ_EZ]) {
          val = localStorage.getItem(PRE + OBJ_EZ);
          if (val) {
            elm = uses[OBJ_EZ];
            setHref(elm, CHECK, val);
            onClick({target:elm});
          }
        }
    }
    onResize();
    window.addEventListener("resize", onResize);
}
//==============================================================================
function setHref(elm, type, val) {
    elm.setAttribute(HREF, `#${type}-${val}`);
}
function restoreOne(key) {
    const name = localStorage.getItem(PRE + key);
    if (name)
        onClick({target:uses[name]});
    return name;
}
function storeOne(key, val) {
    localStorage.setItem(PRE + key, val);
}
//==============================================================================
function onClick(evt) {
    let   obj, pair;
    const
    name = evt.target.dataset.name,
    isEz = uses[OBJ_EZ]?.getAttribute(HREF).endsWith(ON);

    if (name == OBJ_EZ) {
      obj = toggle[Number(!isEz)];
      setPair(obj, CHECK, name);
      setVisibility([name, `${theName}-${name}`], obj.vis);
      storeOne(OBJ_EZ, obj.oppo);
    }
    else {
      toggle[0].key = theName;
      toggle[1].key = name;
      for (obj of toggle) {
        for (const elm of setPair(obj, RADIO))
          elm.setAttribute("pointer-events", obj.events);

        pair = [obj.key];
        if (isEz)
          pair.push(`${obj.key}-${OBJ_EZ}`)
        setVisibility(pair, obj.vis);
      }
      storeOne(PAGE, name);
      theName = name;
    }
}
function setPair(obj, type, key = obj.key) {
    const pair = pairs[key];
    pair[0].setAttribute(HREF, `#${type}-${obj.value}`);
    for (const elm of pair)
      elm.classList[obj.func](ON);
    return pair;
}
function setVisibility(ids, b) {
    for (const id of ids)
      groups[id].setAttribute("visibility", b);
}
//==============================================================================
function onMouse(evt) {
    let add, cut, elm;
    switch (evt.type) {
      case mouse.up:
        cut = "active";
      case mouse.enter:
        add = "hover";
        break;
      case mouse.down:
        add = "active";
      case mouse.leave:
        cut = "hover";
    }
    for (elm of pairs[evt.target.dataset.name]) {
      elm.classList.remove(cut);
      elm.classList.add(add);
    }
}
function onResize() {
    let w = window.innerWidth,
        h = window.innerHeight;
    if (w / h > viewBox[2] / viewBox[3]) {
      w = Math.ceil(w * viewBox[3] / h);
      background.style.x = viewBox[0] + ((viewBox[2] - w) / 2) + PX;
      background.style.y = viewBox[1] + PX;
    }
    else {
      h = Math.ceil(h * viewBox[2] / w);
      background.style.x = viewBox[0] + PX;
      background.style.y = viewBox[1] + ((viewBox[3] - h) / 2) + PX;
    }
    background.style.width  = w + PX;
    background.style.height = h + PX;
}
