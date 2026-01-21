import React from 'dom-chef';
import {assertError} from 'ts-extras';
import CheckIcon from 'octicons-plain-react/Check';
import StopIcon from 'octicons-plain-react/Stop';
import oneEvent from 'one-event';

import delay from '../helpers/delay.js';
import {frame} from '../helpers/dom-utils.js';

function ToastSpinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4" />
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z" />
		</svg>
	);
}

type ProgressCallback = (message: string) => void;
type Task = Promise<unknown> | ((progress: ProgressCallback) => Promise<unknown>);
export default async function showToast(
	task: Task | Error,
	{
		message = 'Bulk actions currently being processed.',
		doneMessage = 'Bulk action processing complete.',
	}: {
		message?: string;
		doneMessage?: string | false;
	} = {},
): Promise<void> {
	const iconWrapper = <span className="Toast-icon"><ToastSpinner /></span>;
	const messageWrapper = <span>{message}</span>;
	const toast = (
		<div
			role="log"
			style={{zIndex: 101}}
			className="rgh-toast position-fixed bottom-0 right-0 ml-5 mb-5 Toast Toast--loading Toast--animateIn"
		>
			{iconWrapper}
			<span className="Toast-content py-2">
				<div style={{fontSize: '10px', color: 'silver', marginBottom: '-0.3em'}}>Refined GitHub</div>
				{messageWrapper}
			</span>
		</div>
	);
	const updateToast = (message: string): void => {
		messageWrapper.textContent = message;
	};

	const finalUpdateToast = async (message: string): Promise<void> => {
		updateToast(message);

		// Without rAF the toast might be removed before the first page paint
		// rAF also allows showToast to resolve as soon as task is done
		await frame();

		const displayTime = (message.split(' ').length * 300) + 2000;
		await delay(displayTime);

		// Display time is over, animate out
		toast.classList.replace('Toast--animateIn', 'Toast--animateOut');
		await oneEvent(toast, 'animationend');
		toast.remove();
	};

	document.body.append(toast);
	await delay(30); // Without this, the Toast doesn't appear in time

	let finalToastMessage: string | false = 'Unknown error';
	try {
		if (task instanceof Error) {
			throw task;
		}

		if (typeof task === 'function') {
			await task(updateToast);
		} else {
			await task;
		}

		toast.classList.replace('Toast--loading', 'Toast--success');
		finalToastMessage = doneMessage;
		iconWrapper.firstChild!.replaceWith(<CheckIcon />);
	} catch (error) {
		assertError(error);
		toast.classList.replace('Toast--loading', 'Toast--error');
		finalToastMessage = error.message;
		iconWrapper.firstChild!.replaceWith(<StopIcon />);
		throw error;
	} finally {
		// Use the last message if `false` was passed
		void finalUpdateToast(finalToastMessage || messageWrapper.textContent);
	}
}
