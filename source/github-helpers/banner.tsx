import React from 'dom-chef';
import {RequireAllOrNone} from 'type-fest';

type BannerProps = RequireAllOrNone<{
	text: Array<string | JSX.Element> | string | JSX.Element;
	url: string;
	buttonLabel: JSX.Element | string;
	classes?: string[];
}, 'buttonLabel' | 'url'>;

// This could be a `<Banner/>` element but dom-chef doesn't pass props
// https://github.com/vadimdemedes/dom-chef/issues/77
export default function createBanner(props: BannerProps): JSX.Element {
	// Classes copied from "had recent pushes" banner from repo home
	return (
		<div className={["flash", ...props.classes ?? ''].join(' ')}>
			<div className="d-sm-flex">
				<div className="flex-auto">{props.text}</div>
				{props.url && (
					<a href={props.url} className="flex-shrink-0 btn btn-sm ml-sm-3 mt-2 mt-sm-n2 mb-sm-n2 mr-sm-n1 flex-self-center">
						{props.buttonLabel}
					</a>)}
			</div>
		</div>
	);
}
