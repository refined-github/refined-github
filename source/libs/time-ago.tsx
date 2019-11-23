import React from 'dom-chef';

export default function timeAgo(date: Date): {value: number; unit: string} {
	const units = ['minute', 'hour', 'day', 'year'];

	const time = (<time-ago datetime={date.toISOString()} format="micro"/>).textContent!;
	const value = parseInt(time, 10);
	const short = time.slice(-1);

	let unit = units.find(unit => unit.startsWith(short))!;
	unit = value > 1 ? unit + 's' : unit;

	return {value, unit};
}
