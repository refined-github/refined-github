import React from 'dom-chef';

export function TableIcon(): JSX.Element {
	return (
		<svg width="16" height="16" xmlns="http://www.w3.org/2000/svg" className="octicon">
			<path d="m2.75 1c-0.9665 0-1.75 0.7835-1.75 1.75v10.5c0 0.9665 0.7835 1.75 1.75 1.75h10.5c0.9665 0 1.75-0.7835 1.75-1.75v-10.5c0-0.9665-0.7835-1.75-1.75-1.75h-10.5zm0 1.5h4.5v4.75h-4.75v-4.5c0-0.13807 0.11193-0.25 0.25-0.25zm6 0h4.5c0.1381 0 0.25 0.11193 0.25 0.25v4.5h-4.75v-4.75zm-6.25 6.25h4.75v4.75h-4.5c-0.13807 0-0.25-0.1119-0.25-0.25v-4.5zm6.25 0h4.75v4.5c0 0.1381-0.1119 0.25-0.25 0.25h-4.5v-4.75z"/>
		</svg>
	);
}

export function ToastSpinner(): JSX.Element {
	return (
		<svg className="Toast--spinner" viewBox="0 0 32 32" width="18" height="18">
			<path fill="#959da5" d="M16 0 A16 16 0 0 0 16 32 A16 16 0 0 0 16 0 M16 4 A12 12 0 0 1 16 28 A12 12 0 0 1 16 4"/>
			<path fill="#ffffff" d="M16 0 A16 16 0 0 1 32 16 L28 16 A12 12 0 0 0 16 4z"/>
		</svg>
	);
}
