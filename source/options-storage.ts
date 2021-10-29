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

// TODO [2022-05-01]: Remove obsolete color classes & variables https://primer.style/css/support/v18-migration #4970 #4982
const migrations = [
	featureWasRenamed('separate-draft-pr-button', 'one-click-pr-or-gist'), // Merged in May
	featureWasRenamed('prevent-pr-commit-link-loss', 'prevent-link-loss'), // Merged in May
	featureWasRenamed('remove-projects-tab', 'remove-unused-repo-tabs'), // Merged in July
	featureWasRenamed('remove-unused-repo-tabs', 'clean-repo-tabs'), // Merged in July
	featureWasRenamed('more-dropdown', 'clean-repo-tabs'), // Merged in July
	featureWasRenamed('remove-diff-signs', 'hide-diff-signs'), // Merged in August
	featureWasRenamed('remove-label-faster', 'quick-label-hiding'), // Merged in August
	featureWasRenamed('edit-files-faster', 'quick-file-edit'), // Merged in August
	featureWasRenamed('edit-comments-faster', 'quick-comment-edit'), // Merged in August
	featureWasRenamed('delete-review-comments-faster', 'quick-review-comment-deletion'), // Merged in August
	featureWasRenamed('hide-comments-faster', 'quick-comment-hiding'), // Merged in August
	featureWasRenamed('faster-reviews', 'quick-review'), // Merged in August
	featureWasRenamed('faster-pr-diff-options', 'quick-pr-diff-options'), // Merged in August
	featureWasRenamed('hide-useless-comments', 'hide-low-quality-comments'), // Merged in August
	featureWasRenamed('hide-useless-newsfeed-events', 'hide-noisy-newsfeed-events'), // Merged in August
	featureWasRenamed('no-useless-split-diff-view', 'no-unnecessary-split-diff-view'), // Merged in August
	featureWasRenamed('unwrap-useless-dropdowns', 'unwrap-unnecessary-dropdowns'), // Merged in August
	featureWasRenamed('tag-changelog-link', 'tag-changes-link'), // Merged in October
	featureWasRenamed('navigate-pages-with-arrow-keys', 'pagination-hotkey'), // Merged in September
	featureWasRenamed('list-pr-for-branch', 'list-prs-for-branch'), // Merged in October
	featureWasRenamed('quick-label-hiding', 'quick-label-removal'), // Merged in October

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused,
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
