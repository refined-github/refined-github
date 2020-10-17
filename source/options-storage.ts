import OptionsSyncPerDomain, {Migration} from 'webext-options-sync-per-domain';

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
	featureWasRenamed('sticky-conversation-sidebar', 'sticky-sidebar'), // Merged in September
	featureWasRenamed('add-tags-to-commits', 'tags-on-commits-list'), // Merged in October
	featureWasRenamed('cleanup-repo-filelist-actions', 'clean-repo-filelist-actions'), // Merged in October

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
