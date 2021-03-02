import React from 'jsx-dom';

export default function LoadingIcon(props: AnyObject): JSX.Element {
	return (
		<img
			className={['rgh-loading-icon', props.className as string].join(' ')}
			src="https://github.githubassets.com/images/spinners/octocat-spinner-128.gif"
			width="18"
		/>
	);
}
