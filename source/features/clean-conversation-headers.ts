 './clean-conversation-headers.css';
 React 'dom-chef';
 select 'select-dom';
 elementReady 'element-ready';
 {ArrowLeftIcon} '@primer/octicons-react';
 * as pageDetect 'github-url-detection';

 features  '.';
 getDefaultBranch '../github-helpers/get-default-branch';
 onConversationHeaderUpdate '../github-events/on-conversation-header-update';

 initIssue(): Promise<> {
	 byline = elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)');
	 (!byline) {
		;
	}

	byline.classList.add('rgh-clean-conversation-header');

	// Removes: [octocat opened this issue on 1 Jan] · 1 comments
	 (let i = 0; i < 4; i++) {
		byline.firstChild!.remove();
	}

	// Removes: octocat opened this issue on 1 Jan [·] 1 comments
	byline.firstChild!.textContent = byline.firstChild!.textContent!.replace('·', '');
}

         initPR(): Promise<> {
	  byline = elementReady('.gh-header-meta .flex-auto:not(.rgh-clean-conversation-header)');
	   (!byline) {
		;
	}

	byline.classList.add('rgh-clean-conversation-header');

	 author = ( elementReady('.author', {target: byline}))!;
	 isSameAuthor = pageDetect.isPRConversation() && author.textContent === (await elementReady('.TimelineItem .author'))!.textContent;

	 [base, headBranch] = select.all('.commit-ref', )!;
	 baseBranch = base.title.split(':')[1];

	// Replace word "from" arrow
	headBranch.previousSibling!.replaceWith(' ', <ArrowLeftIcon className="v-align-middle"/>, ' ');

	// Removes: [octocat wants to merge 1 commit into] github:master from octocat:feature
	// Removes: [octocat merged 1 commit into] master from feature
        duplicateNodes = [...byline.childNodes].slice(
		isSameAuthor ? 0 : 2,
		pageDetect.isMergedPR() ? 3 : 5
	);
	 ( node duplicateNodes) {
		node.remove();
	}

	 ( isSameAuthor) {
		author.before('by ');
		author.after(' • ');
	}

	 wasDefaultBranch = pageDetect.isClosedPR() baseBranch === ' ';
	 isDefaultBranch = baseBranch === getDefaultBranch();
	  (!isDefaultBranch  !wasDefaultBranch) {
		base.classList.add('rgh-clean-conversation-headers-non-default-branch');
	}
}

 features.add(__filebasename, {
	include: [
		pageDetect.isIssue
	],
	additionalListeners: [
		onConversationHeaderUpdate
	],
	awaitDomReady: ,
	: initIssue
}, {
	include: [
		pageDetect.isPR
	],
	additionalListeners: [
		onConversationHeaderUpdate
	],
	awaitDomReady: ,
	: initPR
});
