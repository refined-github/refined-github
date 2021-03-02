import React from 'dom-chef';
import select from 'select-dom';
import {CheckIcon} from '@primer/octicons-react';

import {ToastSpinner} from '../helpers/icons';

export default class Toast {
	toastContent: string;

	constructor(toastContent: string) {
		this.toastContent = toastContent;
	}

	baseElement(backgroundClass: string, icon: JSX.Element): JSX.Element {
		return (
			<div
				role="log"
				style={{zIndex: 101}}
				className={`rgh-toast position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast ${backgroundClass}`}
			>
				<span className="Toast-icon">
					{icon}
				</span>
				<span className="Toast-content">{this.toastContent}</span>
			</div>
		);
	}

	show(): void {
		this.destroy();
		document.body.append(this.baseElement('Toast--loading', <ToastSpinner/>));
	}

	done(): void {
		this.destroy();
		document.body.append(this.baseElement('Toast--success', <CheckIcon/>));
		setTimeout(() => {
			this.destroy();
		}, 3000);
	}

	destroy(): void {
		select('.rgh-toast')?.remove();
	}
}

