import minify from 'rollup-plugin-babel-minify';

export default {
  input: './src/rubik/Rubik.js',
  plugins: [
    minify({
      comments: false,
      sourceMap: false,
    }),
  ],
  output: {
      format: 'umd',
      name: 'RUBIK',
      file: './build/rubik.js',
      indent: '\t',
  },
};