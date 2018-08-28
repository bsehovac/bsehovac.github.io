import minify from 'rollup-plugin-babel-minify';

function glsl() {
	return {
		transform( code, id ) {
			if ( /\.glsl$/.test( id ) === false ) return;
			var transformedCode = 'export default ' + JSON.stringify(
				code
					.replace( /[ \t]*\/\/.*\n/g, '' ) // remove //
					.replace( /[ \t]*\/\*[\s\S]*?\*\//g, '' ) // remove /* */
					.replace( /\n{2,}/g, '\n' ) // # \n+ to \n
			) + ';';
			return {
				code: transformedCode,
				map: { mappings: '' }
			};
		}
	};
}

export default {
	input: './src/three/Three.js',
	plugins: [
		glsl(),
		minify({
			comments: false,
			sourceMap: false,
		}),
	],
	output: [
		{
			format: 'umd',
			name: 'THREE',
			file: './build/three.js',
			indent: '\t'
		},
	]
};