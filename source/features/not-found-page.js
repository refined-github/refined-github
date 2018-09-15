/*
This feature adds more useful 404 (not found) page.
- Display the full URL clickable piece by piece
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const flatMap = (arr, fn) =>
	arr.flatMap ?
		arr.flatMap(fn) :
		arr.reduce((acc, ...args) => acc.concat(fn(...args)), []);

const getRepoAnchors = (repoHref, repoPath) => {
	const [prefix, ...parts] = repoPath.split('/');
	return parts.map((part, index) => {
		const path = [repoHref, prefix, ...parts.slice(0, index + 1)];
		return <a href={path.join('/')}>{part}</a>;
	});
};

const getAnchors = () => {
	const repoPath = pageDetect.getRepoPath();
	if (!repoPath) {
		return false;
	}

	const {ownerName, repoName} = pageDetect.getOwnerAndRepo();
	const ownerHref = `/${ownerName}`;
	const repoHref = `${ownerHref}/${repoName}`;

	return [
		<a href={ownerHref}>{ownerName}</a>,
		<a href={repoHref}>{repoName}</a>,
		...getRepoAnchors(repoHref, repoPath)
	];
};

export default function () {
	const anchors = getAnchors();
	if (!anchors) {
		return;
	}

	// NOTE: We need to append it after the parallax_wrapper because other elements might not be available yet.
	return select('#parallax_wrapper').after(
		<div className="container">
			<h3>Do. Or do not. There is no try.</h3>
			<h2>
				{flatMap(anchors, (e, i) => (i === 0 ? [e] : [' / ', e]))}
			</h2>
		</div>
	);
}
