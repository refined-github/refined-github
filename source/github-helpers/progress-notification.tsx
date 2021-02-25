import React from 'dom-chef';

export default function progressNotification(backgroundClass: string, icon: JSX.Element, toastContent: string): JSX.Element {
	return (
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
