import features from "../feature-manager";
import * as pageDetect from "github-url-detection";
import * as api from '../github-helpers/api';
import observe from "../helpers/selector-observer";
import React from "dom-chef";
import GitHubURL from "../github-helpers/github-url";

const getHistoryOids = async (curr: string, filePath: string): Promise<string[]> => {
	const {resource: {history}} = await api.v4(`
		resource(url: "/refined-github/refined-github/commit/${curr}") {
			... on Commit {
				history(path: "${filePath}") {
					nodes {
						oid
					}
				}
			}
		}
	`);

	const nodes = history.nodes as any[];
	return nodes.map<string>(n => n.oid);
};
const add = (header: HTMLElement) => {
	const child = header.children[1];

	const button = <div className="ml-1">
		<div className="BtnGroup-parent">
			<div className="btn-sm BtnGroup-item btn">
				Previous
			</div>
		</div>

		<details className="details-reset details-overlay select-menu BtnGroup-parent d-inline-block position-relative" open={false}>
			<summary data-disable-invalid="" data-disable-with=""
							 data-dropdown-tracking="{&quot;type&quot;:&quot;blob_edit_dropdown.more_options_click&quot;,&quot;context&quot;:{&quot;repository_id&quot;:51769689,&quot;actor_id&quot;:null,&quot;github_dev_enabled&quot;:false,&quot;edit_enabled&quot;:false,&quot;small_screen&quot;:false}}"
							 aria-label="Select additional options" data-view-component="true"
							 className="js-blob-dropdown-click select-menu-button btn-sm btn BtnGroup-item float-none px-2">
			</summary>
			<div className="SelectMenu right-0">
				<div className="SelectMenu-modal width-full">
					<div className="SelectMenu-list SelectMenu-list--borderless py-2">
						<div className="SelectMenu-item no-wrap width-full text-normal f5">
							<div className="d-flex">
								<div className="color-fg-default">1 commits ago</div>
								<div style={{width: '20px'}}/>
								<div className="color-fg-muted">123abcd~1</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</details>
	</div>;
	child.append(button);
};
async function init(signal: AbortSignal): Promise<false | void> {

	console.log('previous-version')

	const githubUrl = new GitHubURL(location.href);
	console.log(githubUrl);

	console.log(getHistoryOids)

	observe(['#repos-sticky-header>div>div>div:nth-child(2)', '.js-blob-header'], add, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isSingleFile,
	],
	init,
});
