import { defineConfig } from 'rollup';
import serve from 'rollup-plugin-serve2';
import { terser } from 'rollup-plugin-terser';

const inWatchMode = process.env.ROLLUP_WATCH;

export default defineConfig({
	input: './src/core/index.js',
	output: [
		{
			file: './dist/core.js',
			format: 'iife',
			freeze: false,
			generatedCode: {
				constBindings: true,
			},
		},
		!inWatchMode && {
			file: './dist/core.min.js',
			format: 'iife',
			freeze: false,
			generatedCode: {
				constBindings: true,
			},
			plugins: [
				terser({
					compress: {
						reduce_funcs: false,
					},
				}),
			],
		},
	],
	plugins: [
		inWatchMode && serve({
			port: 1234,
			contentBase: 'dist/',
			headers: {
				'Access-Control-Allow-Origin': '*',
				'Access-Control-Allow-Private-Network': 'true',
			},
		}),
	],
});
