import React from 'dom-chef';

export default function timeAgo(date: Date): {value: number; unit: string} {
	const units = ['minute', 'hour', 'day', 'year'];

	const time = (<time-ago datetime={date.toISOString()} format="micro"/>).textContent!;
	const [value, short] = time.match(/[a-z]+|[^a-z]+/gi)! as [number, string];

	let unit = units.find(unit => unit.startsWith(short))!;
	unit = value > 1 ? unit + 's' : unit;

	return {value, unit};
}
