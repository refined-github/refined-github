import onReplacedElement from '../helpers/on-replaced-element';
import type {CallerFunction} from '../features';

const onDiscussionSidebarUpdate: CallerFunction = (runFeature, signal) => {
	void onReplacedElement('#partial-discussion-sidebar', runFeature, {signal});
};

export default onDiscussionSidebarUpdate;
