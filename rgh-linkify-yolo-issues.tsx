import React from "dom-chef";
import * as pageDetect from "github-url-detection";
import { wrap } from "../helpers/dom-utils";
import features from "../feature-manager";
import featureLink from "../helpers/feature-link";
import { getNewFeatureName } from "../options-storage";
import { isAnyRefinedGitHubRepo } from "../github-helpers";
import observe from "../helpers/selector-observer";
function init(): void {
	for (const issueCell of select.all("table-selector td:nth-child(2)")) {
		wrap(
			issueCell.firstNode,
			<a href={getRghIssueUrl(issueCell.textContent)}>
				{issueCell.textContent}
			</a>
		);
	}
}

features.add({
	include: [
		pageDetect.hasComments,
		pageDetect.isReleasesOrTags,
		pageDetect.isCommitList,
		pageDetect.isSingleCommit,
		pageDetect.isRepoWiki,
		pageDetect.isPR,
		pageDetect.isIssue,
	],
	asyncDomReady: false,
	init,
	asLongAs: isAnyRefinedGitHubRepo,
	url: import.meta.url,
});
