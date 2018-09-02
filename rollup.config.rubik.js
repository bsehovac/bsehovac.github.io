//import minify from 'rollup-plugin-babel-minify';

export default {
  input: './src/js/Rubik.js',
  // plugins: [
  //   minify({
  //     comments: false,
  //     sourceMap: false,
  //   }),
  // ],
  output: {
      format: 'umd',
      name: 'RUBIK',
      file: './assets/js/rubik.js',
      indent: '\t',
  },
};
