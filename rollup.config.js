import typescript from '@rollup/plugin-typescript'
import pkg from './package.json'
export default {
  input: 'src/index.ts',
  output: [
    { file: pkg.main, format: 'cjs' },
    { file: pkg.module, format: 'es' },
    {
      name: 'Lotus-Client-SDK',
      file: pkg.browser,
      format: 'umd',
    },
  ],
  plugins: [typescript()],
}
