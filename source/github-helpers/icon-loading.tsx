/** @jsx h */
import {h} from 'preact';
import render from '../helpers/render';

export default function LoadingIcon(): JSX.Element {
	return (
		<img
			className="rgh-loading-icon"
			src="https://github.githubassets.com/images/spinners/octocat-spinner-128.gif"
			width="18"
		/>
	);
}
