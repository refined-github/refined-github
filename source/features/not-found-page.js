/*
This feature adds more useful 404 (not found) page.
- Display the full URL clickable piece by piece
- Strikethrough all anchor that return a 404 status code
- Replace file links with more useful commit history
*/

import {h} from 'dom-chef';
import select from 'select-dom';
import * as pageDetect from '../libs/page-detect';

const flatMap = (arr, fn) =>
	arr.flatMap ?
		arr.flatMap(fn) :
		arr.reduce((acc, ...args) => acc.concat(fn(...args)), []);

const strikethrough = target => {
	const wrapper = <del style={{color: '#6a737d'}}></del>;
	for (const child of target.childNodes) {
		wrapper.appendChild(child);
	}
	return target.appendChild(wrapper);
};

const checkAnchors = async a => {
	const {status} = await fetch(a.href, {method: 'head'});
	if (status === 404) {
		strikethrough(a);
	}
	return a;
};

const getRepoAnchors = (repoHref, repoPath) => {
	const [prefix, ...parts] = repoPath.split('/');
	return parts.map((part, index) => {
		const path = [
			repoHref,
			// NOTE: Replace the file path with the commit path
			// This allows to see the history of the file/path
			prefix === 'blob' ? 'commits' : prefix,
			...parts.slice(0, index + 1)
		];
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

	const anchors = [
		<a href={ownerHref}>{ownerName}</a>,
		<a href={repoHref}>{repoName}</a>,
		...getRepoAnchors(repoHref, repoPath)
	];

	// NOTE: This will asynchronously check if the anchor href is reachable
	// If not it will strikethrough the element content
	anchors.forEach(checkAnchors);

	return anchors;
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
