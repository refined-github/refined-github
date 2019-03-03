import {getOwnerAndRepo} from '../libs/utils';
import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';

async function init() {
	const container = select('.repohead-details-container');
	if (!container) {
		return false;
	}

	const originalDesc = select("div.repository-content > div > div.f4 > span");
	originalDesc.remove();

	const {ownerName, repoName} = getOwnerAndRepo();
	const userInfo = await api.v4(
		`{
			repository(owner: "${ownerName}", name: "${repoName}") {
				description
				repositoryTopics(first: 100) {
				  nodes {
					id
					resourcePath
					topic {
					  name
					  id
					}
				  }
				}
			}
		}`
	);
	const repo = select('.repohead-details-container > .public');
	const description = (
		<div class="repo-description">
			{repo}
			<span class="text-gray-dark mr-2" itemprop="about">
				{userInfo.repository.description}
			</span>
		</div>
	);
	container.appendChild(description);
}

features.add({
	id: 'move-description',
	load: features.onAjaxedPages,
	init
});
