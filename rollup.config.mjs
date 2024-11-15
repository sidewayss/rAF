import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import { minify } from "rollup-plugin-swc-minify";

const
format = "es",
input  = "raf.js";

export default {
  input,
  output: {
    file: `dist/${input}`,
    format
  },
  plugins: [
    getBabelOutputPlugin({
      comments: false,
      assumptions: {"noDocumentAll":true},
      plugins: [
        ["babel-plugin-private-to-public", {"minify":true, "aToZ":true}],
        "@babel/plugin-transform-nullish-coalescing-operator",
        "@babel/plugin-transform-optional-chaining"
      ]
    }),
    //minify({format})
  ]
};