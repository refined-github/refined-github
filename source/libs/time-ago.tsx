import React from 'dom-chef';

const units = {
	m: 'minute',
	h: 'hour',
	d: 'day',
	y: 'year'
};

export default function timeAgo(date: Date): {value: number; unit: string} {
	// Documentation: https://github.com/github/time-elements#time-ago
	const time = (<time-ago datetime={date.toISOString()} format="micro"/>).textContent!;
	const value = parseInt(time, 10);
	const short = time.slice(-1) as 'm' | 'h' | 'd' | 'y';
	const unit = units[short] + (value > 1 ? 's' : '');
	return {value, unit};
}
