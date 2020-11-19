import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import select from "select-dom";

interface Options {
	showCloseButton?: boolean;
}

export default function addNotice(
	message: string | Element | JSX.Element,
	{showCloseButton = true}: Options = {}
): void {
	const closeButton = (
		<button className="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
			<XIcon/>
		</button>
	);
	select('#start-of-content')!.after(
		<div className="flash flash-full flash-notice">
			<div className="container-lg px-3">
				{showCloseButton && closeButton} {message}
			</div>
		</div>
	);
}
