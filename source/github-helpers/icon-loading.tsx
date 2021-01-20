import React from 'dom-chef';

export default function LoadingIcon(props: Record<string, any>): JSX.Element {
	return (
		<img
			className={props.className + ' rgh-loading-icon'}
			src="https://github.githubassets.com/images/spinners/octocat-spinner-128.gif"
			width="18"
		/>
	);
}
