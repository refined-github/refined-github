import React from 'dom-chef';
import select from 'select-dom';
import {CheckIcon} from '@primer/octicons-react';

function ToastSpinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/>
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"/>
		</svg>
	);
}

export default class Toast {
	baseElement(backgroundClass: string, icon: JSX.Element, toastContent: string): JSX.Element {
		return (
			<div
				role="log"
				style={{zIndex: 101}}
				className={`rgh-toast position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast ${backgroundClass}`}
			>
				<span className="Toast-icon">
					{icon}
				</span>
				<span className="Toast-content">{toastContent}</span>
			</div>
		);
	}

	show(textContent = 'Bulk actions currently being processed.'): void {
		this.destroy();
		document.body.append(this.baseElement('Toast--loading', <ToastSpinner/>, textContent));
	}

	done(textContent = 'Bulk action processing complete.'): void {
		this.destroy();
		document.body.append(this.baseElement('Toast--success', <CheckIcon/>, textContent));
		setTimeout(() => {
			this.destroy();
		}, 3000);
	}

	destroy(): void {
		select('.rgh-toast')?.remove();
	}
}

