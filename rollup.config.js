import typescript from '@rollup/plugin-typescript'

export default {
  input: 'src/index.ts',
  external: ['uuid', 'axios', 'axios-retry', 'ms'],
  output: [
    { file: 'dist/index.js', format: 'cjs' },
    { file: 'dist/index.mjs', format: 'es' },
    {
      name: 'Lotus-Client-SDK',
      file: 'dist/index.umd.js',
      format: 'umd',
      globals: {
        uuid: 'uuid',
        'axios-retry': 'axiosRetry',
        ms: 'ms',
        axios: 'axios',
      },
    },
  ],
  plugins: [typescript()],
}
