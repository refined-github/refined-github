import delay from 'delay';
import React from 'dom-chef';
import {assertError} from 'ts-extras';
import CheckIcon from 'octicons-plain-react/Check';
import StopIcon from 'octicons-plain-react/Stop';

function ToastSpinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4" />
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z" />
		</svg>
	);
}

type ProgressCallback = (message: string) => void;
type Task = Promise<unknown> | ((progress?: ProgressCallback) => Promise<unknown>);
export default async function showToast(
	task: Task | Error,
	{
		message = 'Bulk actions currently being processed.',
		doneMessage = 'Bulk action processing complete.',
	} = {},
): Promise<void> {
	const iconWrapper = <span className="Toast-icon"><ToastSpinner /></span>;
	const messageWrapper = <span className="Toast-content">{message}</span>;
	const rghBlock = (
		<div className="d-flex flex-items-center pl-3">
			<img
				style={{width: '32px', height: '32px'}}
				src="https://avatars.githubusercontent.com/refined-github?size=128"
				alt="Refined GitHub"
			/>
		</div>
	);
	const toast = (
		<div
			role="log"
			style={{zIndex: 101}}
			className="rgh-toast position-fixed bottom-0 right-0 ml-5 mb-5 Toast Toast--loading Toast--animateIn"
		>
			{iconWrapper}
			{rghBlock}
			{messageWrapper}
		</div>
	);
	const updateToast = (message: string): void => {
		messageWrapper.textContent = message;
	};

	document.body.append(toast);
	await delay(30); // Without this, the Toast doesn't appear in time

	let finalToastMessage = 'Unknown error';
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
		updateToast(finalToastMessage);

		// Without rAF the toast might be removed before the first page paint
		// rAF also allows showToast to resolve as soon as task is done
		requestAnimationFrame(() => {
			setTimeout(() => {
				// https://primer.style/css/storybook/?path=/docs/deprecated-toast--docs#toast-animation-in
				toast.classList.replace('Toast--animateIn', 'Toast--animateOut');
				// Removed after the animation ends
				setTimeout(() => {
					toast.remove();
				}, 1000);
			}, finalToastMessage.split(' ').length * 300 + 2000);
		});
	}
}
