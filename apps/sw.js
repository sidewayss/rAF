// Shared file names & different baseURI folders make absolute paths appealing
"use strict"
let cache;
const raf  = "/raf/",       load   = "load.js",
      test = `${raf}test/`, update = "update.js", named = "named.js";
//==============================================================================
async function cacheOpen () {
    return cache ?? caches.open("raf-test")
                          .then(cash => cache = cash)
                          .catch(responseError);
};
//==============================================================================
self.addEventListener("install", evt => {
    self.skipWaiting();                     // why not?
    evt.waitUntil(cacheOpen().then(() => {
        const easy = `${raf}easy/`,  fonts = `${test}fonts/`,
              prop = `${raf}prop/`,  html  = "/html-elements/";

        cache.addAll([
            "/",
            `${raf}raf.js`,       `${raf}acues.js`,     `${raf}aframe.js`,
            `${raf}ez.js`,        `${raf}globals.js`,

            `${easy}easies.js`,   `${easy}easy.js`,     `${easy}incremental.js`,
            `${easy}ebezier.js`,  `${easy}easings.js`,  `${easy}easy-construct.js`,
            `${easy}efactory.js`, `${easy}easer.js`,    `${easy}easy-steps.js`,
            `${easy}ecalc.js`,    `${easy}measer.js`,

            `${prop}func.js`,     `${prop}pfactory.js`, `${prop}color-names.js`,
            `${prop}prop.js`,     `${prop}pbase.js`,    `${prop}color-convert.js`,

            `${test}common.css`,  `${test}${load}`,     `${test}play.js`,
            `${test}common.json`, `${test}${update}`,   `${test}copy.js`,
            `${test}common.js`,   `${test}${named}`,    `${test}sw.js`,

            `${fonts}RobotoMono.ttf`, `${fonts}MaterialSymbolsRounded.woff2`,

            `${html}multi-state.js`,
            `${html}multi-button.js`, `${html}template-button.html`,
            `${html}multi-check.js`,  `${html}template-check.html`
        ]).catch(responseError);
    }));
});
//==============================================================================
//self.addEventListener("activate", evt => {
//    ; //!! TBD !!
//});
//==============================================================================
self.addEventListener("fetch", evt => { // server-fresh first, then cache-stale,
    const request = evt.request;        // except for fonts.
    if (request.url.includes("fonts/"))
        evt.respondWith(fromCache(request.clone())
         .then(response => response
                        ?? fromServer(request))
         .catch(() => fromServer(request)));
    else
        evt.respondWith(fromServer(request.clone())
         .then(response => response.ok
                         ? response
                         : fromCache(request, response))
         .catch(() => fromCache(request, response)));
});
function fromServer(request) {
    return fetch(request)
      .then(response => {
        if (response.ok)
            cacheOpen().then(cache.put(request, response.clone())
                                  .catch(catchError));
        return response;
    }).catch(catchError);
}
function fromCache(request, orig) {
    return cacheOpen().then(() =>
        cache.match(request)
         .then (response => orig
                          ? response ?? responseError(null, request, orig)
                          : response)
         .catch(responseError)
    );
}
//==============================================================================
self.addEventListener("message", async evt => {
    const id   = evt.data.id;
    const dir  = `${test}${id}/`;
    const html = "index.html";

    cache.match(`${dir}${html}`)
     .then(response => {
        if (!response) {
            let file;
            const requests = [];

            for (file of [html,"index.css","index.js","events.js"])
                requests.push(`${dir}${file}`);
            for (file of [load, update, named])
                requests.push(`${dir}_${file}`);

            if (id[0] == "e")  // easings has some additional files
                requests.push(`${dir}chart.js`,`${dir}msg.js`,`${dir}tio-pow.js`,
                              `${dir}steps.js`,`${dir}not-steps.js`);

            cache.addAll(requests);
        }
      }
    ).catch(catchError);
});
//==============================================================================
function catchError(err) {
    console.error(err.stack ?? err);
}
function responseError(err, request, response) {
    let body, status;
    if (request) {              // err is null
        if (request.headers.has("suppress-errors"))
            status = 202;
        else {
            body   = "Network error followed by cache error";
            status = response?.status ?? 418;
        }
    }
    else {                      // request is undefined
        body   = "Cache error";
        status = 404;           // "Not found" seems about right
        catchError(err);
    }
    return new Response(body, {status});
}