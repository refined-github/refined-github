import React from 'dom-chef';
import {RequireAllOrNone} from 'type-fest';

export type BannerProps = RequireAllOrNone<{
	icon?: JSX.Element;
	text: Array<string | JSX.Element> | string | JSX.Element;
	classes?: string[];
	action: string | React.MouseEventHandler<HTMLButtonElement>;
	buttonLabel: JSX.Element | string;
}, 'action' | 'buttonLabel'>;

// Classes copied from "had recent pushes" banner from repo home
const classes = 'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';

// This could be a `<Banner/>` element but dom-chef doesn't pass props
// https://github.com/vadimdemedes/dom-chef/issues/77
export default function createBanner(properties: BannerProps): JSX.Element {
	let button: JSX.Element | undefined;

	if (typeof properties.action === 'string') {
		button = (
			<a href={properties.action} className={classes}>
				{properties.buttonLabel}
			</a>
		);
	} else if (typeof properties.action === 'function') {
		button = (
			<button type="button" className={classes} onClick={properties.action}>
				{properties.buttonLabel}
			</button>
		);
	}

	return (
		<div className={['flash', ...properties.classes ?? ''].join(' ')}>
			<div className="d-sm-flex flex-items-center gap-2">
				<div className="d-flex flex-auto flex-self-center flex-items-center gap-2">
					{properties.icon}
					<span>{properties.text}</span>
				</div>
				{button}
			</div>
		</div>
	);
}
