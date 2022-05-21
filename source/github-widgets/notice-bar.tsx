import React from 'dom-chef';
import select from 'select-dom';
import {XIcon} from '@primer/octicons-react';

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
			<button className='flash-close js-flash-close' type='button' aria-label='Dismiss this message'>
				<XIcon/>
			</button>
		),
	}: Options = {},
): void {
	select('#js-flash-container')!.append(
		<div className={`flash flash-full flash-${type} px-4`}>
			{action}
			<div>
				{message}
			</div>
		</div>,
	);
}
