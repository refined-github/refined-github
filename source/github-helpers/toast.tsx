import delay from 'delay';
import React from 'dom-chef';
import {CheckIcon, StopIcon, InfoIcon} from '@primer/octicons-react';
import {frame} from '../helpers/dom-utils';

// onDoneState when toast is done animating 
export enum ToastOnDoneState {
	success = "success",
	error = "error",
	info = "info",
}

function assertToastOnDoneState(value: never): never {
	throw new Error(`Toast state ${value} is not valid, Use ToastOnDoneState.`);
}

export function ToastSpinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/>
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"/>
		</svg>
	);
}

type Task = () => Promise<unknown>;
export default async function showToast<TTask extends Task>(
	task: TTask,
	{
		message = 'Bulk actions currently being processed.',
		doneMessage = 'Bulk action processing complete.',
		onDone = ToastOnDoneState.info,
	} = {},
): Promise<ReturnType<TTask>> {
	const iconWrapper = <span className="Toast-icon"><ToastSpinner/></span>;
	const messageWrapper = <span className="Toast-content">{message}</span>;
	const toast = (
		<div
			role="log"
			style={{zIndex: 101}}
			className="rgh-toast position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast Toast--loading"
		>
			{iconWrapper}
			{messageWrapper}
		</div>
	);

	document.body.append(toast);
	await delay(30); // Without this, the Toast doesn't appear in time

	try {
		return await task();
	} finally {

		messageWrapper.replaceWith(<span className="Toast-content">{doneMessage}</span>);
		switch (onDone) {
			case ToastOnDoneState.success:
				toast.classList.replace('Toast--loading', 'Toast--success');
				iconWrapper.replaceWith(<span className="Toast-icon"><CheckIcon /></span>);
				break;
			case ToastOnDoneState.error:
				toast.classList.replace('Toast--loading', 'Toast--error');
				iconWrapper.replaceWith(<span className="Toast-icon"><StopIcon /></span>);
				break;
			case ToastOnDoneState.info:
				toast.classList.replace('Toast--loading', 'Toast--info');
				iconWrapper.replaceWith(<span className="Toast-icon"><InfoIcon /></span>);
				break;
			default:
				assertToastOnDoneState(onDone);
		}

		await frame(); // Without this, the toast might be removed before the first page paint
		await delay(3000);
		toast.remove();
	}
}
