import twas from 'twas';
import React from 'dom-chef';
import cache from 'webext-storage-cache';
import select from 'select-dom';
import elementReady from 'element-ready';
import features from '../libs/features';
import * as api from '../libs/api';
import * as icons from '../libs/icons';
import {getRepoGQL, getRepoURL} from '../libs/utils';

const getRepoCreationDate = cache.function(async (): Promise<string> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			createdAt
		}
	`);

	return repository.createdAt;
}, {
	cacheKey: () => __featureName__ + ':' + getRepoURL()
});

async function init(): Promise<void> {
	const date = new Date(await getRepoCreationDate());
	// `twas` could also return `an hour ago` or `just now`
	const [value, unit] = twas(date.getTime())
	.replace('just now', '1 second')
	.replace(/^an?/, '1')
	.split(' ');

	const element = (
		<li title={`Repository created on ${date.toDateString()}`}>
			<a className="text-gray"> {/* Required just to match GitHub’s style */}
				{icons.repo()}
				<span className="num text-emphasized">{value}</span> {unit} old
			</a>
		</li>
	);

	const license = select('.numbers-summary .octicon-law');
	if (license) {
		license.closest('li')!.before(element);
	} else {
		select('.numbers-summary')!.append(element);
	}
}

features.add({
	id: __featureName__,
	description: 'Adds the age of the repository to the stats/numbers bar',
	screenshot: 'https://user-images.githubusercontent.com/3848317/69256318-95e6af00-0bb9-11ea-84c8-c6996d39da80.png',
	include: [
		features.isRepoRoot
	],
	load: features.onAjaxedPages,
	init
});
