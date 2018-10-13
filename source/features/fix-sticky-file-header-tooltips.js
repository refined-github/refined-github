import select from 'select-dom';

const oppositeDirections = {
	'tooltipped-n': 'tooltipped-s',
	'tooltipped-ne': 'tooltipped-se',
	'tooltipped-nw': 'tooltipped-sw'
};

export default function () {
	for (const el of select.all('.file-header [class*=tooltipped-n]')) {
		let direction;
		if (el.classList.contains('tooltipped-n')) {
			direction = 'tooltipped-n';
		} else if (el.classList.contains('tooltipped-ne')) {
			direction = 'tooltipped-ne';
		} else if (el.classList.contains('tooltipped-nw')) {
			direction = 'tooltipped-nw';
		}
		el.classList.replace(direction, oppositeDirections[direction]);
	}
}
