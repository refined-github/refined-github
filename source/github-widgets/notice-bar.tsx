import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import select from 'select-dom';

interface Options {
	action?: Element | false;
	type?: 'success' | 'notice' | 'warn' | 'error';
}

/** https://primer.style/css/components/alerts */
export default function addNotice(
	message: string | Node | Array<string | Node>,
	{
		type = 'notice',
		action = (
			<button className="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
				<XIcon/>
			</button>
		)
	}: Options = {}
): void {
	select('#start-of-content')!.after(
		<div className={`flash flash-full flash-${type}`}>
			<div className="container-lg px-3 d-flex flex-items-center flex-justify-between">
				<div>{message}</div> {action}
			</div>
		</div>
	);
}
