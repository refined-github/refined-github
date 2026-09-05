import './contribution-calendar-view.css';

import React from 'dom-chef';
import * as pageDetect from 'github-url-detection';
import {$$} from 'select-dom';

import features from '../feature-manager.js';
import observe from '../helpers/selector-observer.js';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
const monthLabels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];

type MonthKey = `${number}-${number}`; // `${year}-${month}`, month is 0-indexed

function buildMonth(monthKey: MonthKey, daysInThisMonth: Map<number, HTMLTableCellElement>): HTMLElement {
	const [year, month] = monthKey.split('-').map(Number);
	const daysInMonth = new Date(year, month + 1, 0).getDate();
	const firstWeekday = new Date(year, month, 1).getDay();

	const cells: Array<HTMLTableCellElement | undefined> = [
		...Array.from({length: firstWeekday}, () => undefined),
		...Array.from({length: daysInMonth}, (_, day) => daysInThisMonth.get(day + 1)),
	];

	const weeks: Array<Array<HTMLTableCellElement | undefined>> = [];
	for (let index = 0; index < cells.length; index += 7) {
		weeks.push(cells.slice(index, index + 7));
	}

	return (
		<div className="rgh-contribution-calendar-month">
			<h4 className="rgh-contribution-calendar-month-title">{monthLabels[month]} {year}</h4>
			<table>
				<colgroup>
					{dayLabels.map(() => <col style={{width: '9px'}}/>)}
				</colgroup>
				<thead>
					<tr>
						{dayLabels.map(label => <th>{label}</th>)}
					</tr>
				</thead>
				<tbody>
					{weeks.map(week => (
						<tr>
							{Array.from({length: 7}, (_, dayIndex) => week[dayIndex] ?? <td/>)}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

function reflowCalendar(table: HTMLTableElement): void {
	if (table.classList.contains('rgh-contribution-calendar-processed')) {
		return;
	}

	table.classList.add('rgh-contribution-calendar-processed');

	const months = new Map<MonthKey, Map<number, HTMLTableCellElement>>();
	for (const cell of $$('td.ContributionCalendar-day[data-date]', table)) {
		const [year, month, day] = cell.dataset.date!.split('-').map(Number);
		const monthKey: MonthKey = `${year}-${month - 1}`;
		if (!months.has(monthKey)) {
			months.set(monthKey, new Map());
		}

		months.get(monthKey)!.set(day, cell);
	}

	if (months.size === 0) {
		return;
	}

	const container = (
		<div className="rgh-contribution-calendar-container">
			{[...months].map(([monthKey, days]) => buildMonth(monthKey, days))}
		</div>
	);

	table.after(container);
	table.hidden = true;
}

function init(signal: AbortSignal): void {
	observe('table.js-calendar-graph-table', reflowCalendar, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isUserProfile,
	],
	init,
});

void features.addCssFeature(import.meta.url);

/*

Test URLs:

* https://github.com/sindresorhus

*/
