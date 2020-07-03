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
	featureWasRenamed('fix-view-file-link-in-pr', 'enable-file-links-in-compare-view'), // Merged on June 3rd
	featureWasRenamed('revert-file', 'restore-file'), // Merged on June 16th

	// Merged on July 2nd
	featureWasRenamed('sticky-discussion-list-toolbar', 'sticky-conversation-list-toolbar'),
	featureWasRenamed('highlight-collaborators-and-own-discussions', 'highlight-collaborators-and-own-conversations'),
	featureWasRenamed('discussion-filters', 'conversation-filters'),
	featureWasRenamed('global-discussion-list-filters', 'global-conversation-list-filters'),
	featureWasRenamed('extend-discussion-status-filters', 'extend-conversation-status-filters'),
	featureWasRenamed('discussion-links-on-repo-lists', 'conversation-links-on-repo-lists'),
	featureWasRenamed('format-discussion-titles', 'format-conversation-titles'),
	featureWasRenamed('sticky-discussion-sidebar', 'sticky-conversation-sidebar'),
	featureWasRenamed('batch-open-issues', 'batch-open-conversations'),
	featureWasRenamed('sort-issues-by-update-time', 'sort-conversations-by-update-time'),
	featureWasRenamed('clean-issue-filters', 'clean-conversation-filters'),

	// Removed features will be automatically removed from the options as well
	OptionsSyncPerDomain.migrations.removeUnused
];

export const perDomainOptions = new OptionsSyncPerDomain({defaults, migrations});
export default perDomainOptions.getOptionsForOrigin();
