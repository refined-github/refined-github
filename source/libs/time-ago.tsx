import React from 'dom-chef';

export default function timeAgo(date: Date): {interval: number; timespan: string} {
	const units = ['minute', 'hour', 'day', 'year'];

	const ago = (<time-ago datetime={date.toISOString()} format="micro"/>).textContent;
	const [interval, short] = ago!.match(/[a-z]+|[^a-z]+/gi)! as [number, string];

	let timespan = units.find(unit => unit.startsWith(short))!;
	timespan = interval > 1 ? timespan + 's' : timespan;

	return {interval, timespan};
}
