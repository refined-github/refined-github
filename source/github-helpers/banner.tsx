import React from 'dom-chef';
import {RequireAllOrNone} from 'type-fest';

export type BannerProps = RequireAllOrNone<{
	icon?: JSX.Element;
	text: Array<string | JSX.Element> | string | JSX.Element;
	classes?: string[];
	action: string | (() => void);
	buttonLabel: JSX.Element | string;
}, 'action' | 'buttonLabel'>;

// Classes copied from "had recent pushes" banner from repo home
const classes = 'flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center';

// This could be a `<Banner/>` element but dom-chef doesn't pass props
// https://github.com/vadimdemedes/dom-chef/issues/77
export default function createBanner(props: BannerProps): JSX.Element {
	let button: JSX.Element | undefined;

	if (typeof props.action === 'string') {
		button = (
			<a href={props.action} className={classes}>
				{props.buttonLabel}
			</a>
		);
	} else if (typeof props.action === 'function') {
		button = (
			<button type="button" className={classes} onClick={props.action}>
				{props.buttonLabel}
			</button>
		);
	}

	return (
		<div className={['flash', ...props.classes ?? ''].join(' ')}>
			<div className="d-sm-flex flex-items-center gap-2">
				<div className="d-flex flex-auto flex-self-center flex-items-center gap-2">
					{props.icon}
					{/* TODO: Drop `any` after https://github.com/frenic/csstype/issues/177 */}
					<span style={{textWrap: 'balance'} as any}>{props.text}</span>
				</div>
				{button}
			</div>
		</div>
	);
}
