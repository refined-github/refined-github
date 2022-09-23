import React from 'dom-chef';
import {XIcon} from '@primer/octicons-react';
import elementReady from 'element-ready';

type Options = {
	action?: Element | false;
	type?: 'success' | 'notice' | 'warn' | 'error';
};

/** https://primer.style/css/components/alerts */
export default async function addNotice(
	message: string | Node | Array<string | Node>,
	{
		type = 'notice',
		action = (
			<button className="flash-close js-flash-close" type="button" aria-label="Dismiss this message">
				<XIcon/>
			</button>
		),
	}: Options = {},
): Promise<void> {
	const container = await elementReady('#js-flash-container');
	container!.append(
		<div className={`flash flash-full flash-${type} px-4`}>
			{action}
			<div>
				{message}
			</div>
		</div>,
	);
}
