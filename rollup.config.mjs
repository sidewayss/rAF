import { getBabelOutputPlugin } from "@rollup/plugin-babel";
import terser from "@rollup/plugin-terser";

const
format = "es",
input  = "src/raf.js";

export default {
  input,
  output: {
    file: `dist/${input}`,
    format
  },
  plugins: [/*
    getBabelOutputPlugin({
      comments: false,
      assumptions: {"noDocumentAll":true},
      plugins: [
        ["babel-plugin-private-to-public", {"prefix":"ø"}],    // &#xF8
        "@babel/plugin-transform-nullish-coalescing-operator",
        "@babel/plugin-transform-optional-chaining"
      ]
    })/*,
    terser({
      compress: {
        keep_classnames: true,
        keep_infinity: true,
        module: true
      },
      mangle: {
        keep_classnames: true,
        module: true,
        toplevel: false,
        properties: {
          regex: /^ø/
        }
      }
    })*/
  ]
};