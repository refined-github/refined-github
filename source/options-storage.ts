import OptionsSyncPerDomain from 'webext-options-sync-per-domain';

import {featureList} from '../readme.md';

export type RGHOptions = typeof defaults;

// eslint-disable-next-line prefer-object-spread -- TypeScript doesn't merge the definitions so `...` is not equivalent.
const defaults = Object.assign({
	customCSS: '',
	personalToken: '',
	logging: false,
	logHTTP: false,
}, Object.fromEntries(featureList.map(id => [`feature:${id}`, true])));

export const renamedFeatures = new Map<string, string>([
	['separate-draft-pr-button', 'one-click-pr-or-gist'],
	['prevent-pr-commit-link-loss', 'prevent-link-loss'],
	['remove-projects-tab', 'remove-unused-repo-tabs'],
	['remove-unused-repo-tabs', 'clean-repo-tabs'],
	['more-dropdown', 'clean-repo-tabs'],
	['remove-diff-signs', 'hide-diff-signs'],
	['remove-label-faster', 'quick-label-hiding'],
	['edit-files-faster', 'quick-file-edit'],
	['edit-comments-faster', 'quick-comment-edit'],
	['delete-review-comments-faster', 'quick-review-comment-deletion'],
	['hide-comments-faster', 'quick-comment-hiding'],
	['faster-reviews', 'quick-review'],
	['faster-pr-diff-options', 'quick-pr-diff-options'],
	['hide-useless-comments', 'hide-low-quality-comments'],
	['hide-useless-newsfeed-events', 'hide-noisy-newsfeed-events'],
	['no-useless-split-diff-view', 'no-unnecessary-split-diff-view'],
	['unwrap-useless-dropdowns', 'unwrap-unnecessary-dropdowns'],
	['tag-changelog-link', 'tag-changes-link'],
	['navigate-pages-with-arrow-keys', 'pagination-hotkey'],
	['list-pr-for-branch', 'list-prs-for-branch'],
	['quick-label-hiding', 'quick-label-removal'],
	['next-scheduled-github-action', 'scheduled-and-manual-workflow-indicators'],
]);

export function getNewFeatureName(possibleFeatureName: string): FeatureID | undefined {
	let newFeatureName = possibleFeatureName;
	while (renamedFeatures.has(newFeatureName)) {
		newFeatureName = renamedFeatures.get(newFeatureName)!;
	}

	return featureList.includes(newFeatureName as FeatureID) ? newFeatureName as FeatureID : undefined;
}

// TODO [2022-05-01]: Remove obsolete color classes & variables https://primer.style/css/support/v18-migration #4970 #4982
const migrations = [
	function (options: RGHOptions): void {
		for (const [from, to] of renamedFeatures) {
			if (typeof options[`feature:${from}`] === 'boolean') {
				options[`feature:${to}`] = options[`feature:${from}`];
			}
		}
	},

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused,
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
