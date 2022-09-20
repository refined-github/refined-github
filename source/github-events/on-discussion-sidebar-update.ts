import onElementReplacement from '../helpers/on-element-replacement';
import type {CallerFunction} from '../feature-manager';

const onDiscussionSidebarUpdate: CallerFunction = (runFeature, signal) => {
	void onElementReplacement('#partial-discussion-sidebar', runFeature, {signal});
};

export default onDiscussionSidebarUpdate;
