import OptionsSyncPerDomain, {Migration} from 'webext-options-sync-per-domain';

export type RGHOptions = typeof defaults;

function featureWasRenamed(from: string, to: string): Migration<RGHOptions> {
	return (options: RGHOptions) => {
		if (typeof options[`feature:${from}`] === 'boolean') {
			options[`feature:${to}`] = options[`feature:${from}`];
		}
	};
}

// eslint-disable-next-line prefer-object-spread -- TypeScript doesn't merge the definitions so `...` is not equivalent.
const defaults = Object.assign({
	customCSS: '',
	personalToken: '',
	logging: false
}, Object.fromEntries(__features__.map(id => [`feature:${id}`, true])));

// TODO[2021-10-01]: Drop classes `muted-link`, `link-gray-dark`, `text-gray` and `text-gray-dark` #4021
const migrations = [
	featureWasRenamed('pr-easy-toggle-files', 'easy-toggle-files'), // Merged in December
	featureWasRenamed('cleanup-repo-filelist-actions', 'clean-repo-filelist-actions'), // Merged in February

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
