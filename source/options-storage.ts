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
	logging: false,
	logHTTP: false,
}, Object.fromEntries(__features__.map(id => [`feature:${id}`, true])));

// TODO[2021-10-01]: Drop classes `muted-link`, `link-gray`, `link-gray-dark`, `text-gray`, `text-gray-light`, `text-gray-dark`, `text-green`, `text-red` `text-blue` #4021
const migrations = [
	featureWasRenamed('collapse-markdown-sections', 'collapse-wiki-sections'), // Merged in May
	featureWasRenamed('separate-draft-pr-button', 'one-click-pr-or-gist'), // Merged in May
	featureWasRenamed('prevent-pr-commit-link-loss', 'prevent-link-loss'), // Merged in May
	featureWasRenamed('remove-projects-tab', 'remove-unused-repo-tabs'), // Merged in July
	featureWasRenamed('remove-unused-repo-tabs', 'clean-repo-tabs'), // Merged in July
	featureWasRenamed('more-dropdown', 'clean-repo-tabs'), // Merged in July
	featureWasRenamed('remove-diff-signs', 'hide-diff-signs'), // Merged in August
	featureWasRenamed('remove-label-faster', 'hide-label-faster'), // Merged in August
	featureWasRenamed('hide-useless-comments', 'hide-noisy-comments'), // Merged in August
	featureWasRenamed('hide-useless-newsfeed-events', 'hide-noisy-newsfeed-events'), // Merged in August
	featureWasRenamed('no-useless-split-diff-view', 'no-unnecessary-split-diff-view'), // Merged in August
	featureWasRenamed('unwrap-useless-dropdowns', 'unwrap-unnecessary-dropdowns'), // Merged in August

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused,
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
