import React from 'dom-chef';
import select from 'select-dom';
import * as api from '../libs/api';
import features from '../libs/features';
import * as icons from '../libs/icons';
import {getRepoGQL} from '../libs/utils';

async function getRepoCreationDate(): Promise<Date> {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			createdAt
		}
	`);

	return new Date(repository.createdAt);
}

function timeAgo(date: Date): {interval: number; timespan: string} {
	const units = ['minute', 'hour', 'day', 'year'];

	const ago = (<time-ago datetime={date.toISOString()} format="micro"/>).textContent;
	const [interval, short] = ago!.match(/[a-z]+|[^a-z]+/gi)! as [number, string];

	let timespan = units.find(unit => unit.startsWith(short))!;
	timespan = interval > 1 ? timespan + 's' : timespan;

	return {interval, timespan};
}

async function init(): Promise<void> {
	const date = await getRepoCreationDate();
	const {interval, timespan} = timeAgo(date);

	const element = (
		<li title={`Repository created ${date.toDateString()}`}>
			{icons.calendar()}

			<span className="num text-emphasized">{interval}</span> {timespan} old
		</li>
	);

	select('.numbers-summary li:last-child')!.before(element);
}

features.add({
	id: __featureName__,
	description: 'Adds the age of the repository to the stats/numbers bar',
	screenshot: 'https://user-images.githubusercontent.com/3848317/69256318-95e6af00-0bb9-11ea-84c8-c6996d39da80.png',
	include: [
		features.isRepoRoot
	],
	init
});
