import typescript from '@rollup/plugin-typescript'
export default {
  input: 'src/index.ts',
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.mjs', format: 'es' },
    {
      name: 'Lotus-Client-SDK',
      file: 'dist/index.umd.js',
      format: 'umd',
    },
  ],
  plugins: [typescript()],
}
