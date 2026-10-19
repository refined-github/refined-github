/** @type {import('rollup-plugin-svelte').Options} */
const options = {
	compilerOptions: {
		// Enable custom elements compilation
		customElement: true,
	},

	// TODO: Look for a way to emit CSS into the CSS files rather than inlined in JS
	emitCss: false,
};

export default options;
