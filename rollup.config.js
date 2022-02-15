import { nodeResolve } from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import postcss from "rollup-plugin-postcss"

export default {
  input: 'src/main.js',
  output: {
    dir: 'output',
    format: 'cjs'
  },
  plugins: [nodeResolve(), commonjs(), postcss()]
}
