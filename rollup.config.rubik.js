//import minify from 'rollup-plugin-babel-minify';

export default {
  input: './src/js/Cube.js',
  // plugins: [
  //   minify({
  //     comments: false,
  //     sourceMap: false,
  //   }),
  // ],
  output: {
      format: 'umd',
      name: 'CUBE',
      file: './assets/js/cube.js',
      indent: '\t',
      sourceMap: false,
  },
};
