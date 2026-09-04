import cssDocumentation from './css-documentation.js';
import preferNesting from './css-prefer-nesting.js';
import requireFuchsiaFallback from './css-require-fuchsia-fallback.js';
import sortCompoundSelector from './css-sort-compound-selector.js';
import noOptionalChaining from './no-optional-chaining.js';

const refinedGithubPlugin = {
	rules: {
		'no-optional-chaining': noOptionalChaining,
		'css-documentation': cssDocumentation,
		'css-require-fuchsia-fallback': requireFuchsiaFallback,
		'css-prefer-nesting': preferNesting,
		'css-sort-compound-selector': sortCompoundSelector,
	},
};

export default refinedGithubPlugin;
