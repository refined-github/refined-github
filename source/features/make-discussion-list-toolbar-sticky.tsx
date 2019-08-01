import './make-discussion-list-toolbar-sticky.css';
import features from '../libs/features';

function init(): void {
	document.body.classList.add('rgh-sticky-discussion-list-toolbar');
}

features.add({
	id: __featureName__,
	description: 'Makes the discussion list’s filters toolbar sticky.',
	screenshot: 'https://user-images.githubusercontent.com/380914/39878141-7632e61a-542c-11e8-9c66-74fcd3a134aa.gif',
	include: [
		features.isRepoDiscussionList
	],
	init
});
