import onElementReplacement from '../helpers/on-element-replacement';
import type {CallerFunction} from '../features';

const onDiscussionSidebarUpdate: CallerFunction = (runFeature, signal) => {
	void onElementReplacement('#partial-discussion-sidebar', runFeature, {signal});
};

export default onDiscussionSidebarUpdate;
