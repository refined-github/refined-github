import cssDocumentation from './css-documentation.js';
import cssRequireFuchsiaFallback from './css-require-fuchsia-fallback.js';
import noOptionalChaining from './no-optional-chaining.js';

const refinedGithubPlugin = {
	rules: {
		'no-optional-chaining': noOptionalChaining,
		'css-documentation': cssDocumentation,
		'css-require-fuchsia-fallback': cssRequireFuchsiaFallback,
	},
};

export default refinedGithubPlugin;
