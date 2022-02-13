import { defineConfig } from 'rollup';
import serve from 'rollup-plugin-serve2';

import * as esbuild from 'esbuild';

const inWatchMode = process.env.ROLLUP_WATCH;

export default defineConfig({
	input: './src/core/index.js',
	output: [
		{
			file: './dist/core.js',
			format: 'iife',
			sourcemap: true,
			freeze: false,
			generatedCode: {
				constBindings: true,
			},
		},
		{
			file: './dist/core.min.js',
			format: 'iife',
			sourcemap: true,
			freeze: false,
			generatedCode: {
				constBindings: true,
			},
			plugins: [
				{
					name: 'esbuild-minify',
					async renderChunk (code, chunk) {
						const result = await esbuild.transform(code, {
							target: 'esnext',
							minify: true,
							sourcemap: true,
						});

						return {
							code: result.code,
							map: result.map,
						};
					},
				},
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
		{
			name: 'esbuild',
			async transform (code, id) {
				if (!id.endsWith('.jsx')) {
					return null;
				}

				const result = await esbuild.transform(code, {
					target: 'esnext',
					jsx: 'transform',
					sourcemap: true,
				});

				return {
					code: result.code,
					map: result.map,
				};
			},
		},
	],
});
