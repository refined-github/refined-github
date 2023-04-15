import React from 'dom-chef';
import {CalendarIcon, XIcon} from '@primer/octicons-react';
import * as pageDetect from 'github-url-detection';

import features from '../feature-manager';
import observe from '../helpers/selector-observer';

function isoDateFormatter(date: Date): string {
	return new Date(date.getTime() - (date.getTimezoneOffset() * 60_000))
		.toISOString()
		.split('T')[0];
}

const humanDateFormatter = new Intl.DateTimeFormat(undefined, {
	dateStyle: 'medium',
});

function DateInput(props: React.InputHTMLAttributes<HTMLInputElement>): JSX.Element {
	return (
		<input
			{...props}
			className="btn btn-sm ml-2"
			type="date"
			onClick={event => {
				(event.currentTarget as HTMLInputElement).showPicker();
			}}
		/>
	);
}

function addDropdown(anchor: HTMLElement): void {
	const url = new URL(location.href);
	const link = <a hidden href={url.href}/> as unknown as HTMLAnchorElement;

	function onChange(type: 'since' | 'until'): React.FormEventHandler<HTMLInputElement> {
		return event => {
			const date = event.currentTarget.valueAsDate;
			if (date) {
				url.searchParams.set(type, isoDateFormatter(date));
			} else {
				url.searchParams.delete(type);
			}

			link.href = url.href;
			link.click();
		};
	}

	const since = url.searchParams.get('since') ?? '';
	const until = url.searchParams.get('until') ?? '';
	const now = isoDateFormatter(new Date());

	const id = 'rgh-commit-date-picker';
	anchor.append(
		<details id={id} className="details-reset details-overlay">
			<summary className="btn ml-2" aria-haspopup="true">
				<CalendarIcon className="mr-2"/>
				{since && !until && `Since ${humanDateFormatter.format(new Date(since))}`}
				{!since && until && `Until ${humanDateFormatter.format(new Date(until))}`}
				{since && until && humanDateFormatter.formatRange(new Date(since), new Date(until))}
				{!since && !until && 'Select date'}
			</summary>
			<div className="SelectMenu">
				<div className="SelectMenu-modal">
					<header className="SelectMenu-header">
						<h3 className="SelectMenu-title">Show commits</h3>
						<button
							className="SelectMenu-closeButton"
							type="button"
							data-toggle-for={id}
						>
							<XIcon/>
						</button>
					</header>
					<div className="SelectMenu-list">
						<label className="SelectMenu-item">
							Since <DateInput
								value={since}
								max={until || now}
								onChange={onChange('since')}
							/>
						</label>
						<label className="SelectMenu-item">
							Until <DateInput
								value={until}
								min={since}
								max={now}
								onChange={onChange('until')}
							/>
						</label>
					</div>
				</div>
			</div>
		</details>,
		link,
	);
}

function init(signal: AbortSignal): void {
	observe('.file-navigation', addDropdown, {signal});
}

void features.add(import.meta.url, {
	include: [
		pageDetect.isRepoCommitList,
	],
	deduplicate: 'has-rgh-inner',
	init,
});
