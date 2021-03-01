import React from 'dom-chef';

export default class Toast {
	toast: JSX.Element;
	constructor(backgroundClass: string, icon: JSX.Element, toastContent: string) {
		this.toast = (
			<div
				role="log"
				style={{zIndex: 101}}
				className={`position-fixed bottom-0 right-0 ml-5 mb-5 anim-fade-in fast Toast ${backgroundClass}`}
			>
				<span className="Toast-icon">
					{icon}
				</span>
				<span className="Toast-content">{toastContent}</span>
			</div>
		);
	}

	show(): void {
		this.toast.remove();
		document.body.append(this.toast);
	}
}

