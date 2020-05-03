import OptionsSync, {Migration} from 'webext-options-sync';
import OptionsSyncMulti from './libs/webext-options-sync-multi';

export type RGHOptions = typeof defaults;

function featureWasRenamed(from: string, to: string): Migration<RGHOptions> {
	return (options: RGHOptions) => {
		if (typeof options[`feature:${from}`] === 'boolean') {
			options[`feature:${to}`] = options[`feature:${from}`];
		}
	};
}

// TypeScript doesn't merge the definitions so `...` is not equivalent.
const defaults = Object.assign({
	customCSS: '',
	personalToken: '',
	logging: false
}, __featuresOptionDefaults__); // This variable is replaced at build time

const migrations = [
	featureWasRenamed('branch-buttons', 'latest-tag-button'), // Merged on January 10th

	// Removed features will be automatically removed from the options as well
	OptionsSync.migrations.removeUnused
];

export default new OptionsSyncMulti({defaults, migrations});
