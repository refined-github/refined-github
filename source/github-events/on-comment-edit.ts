import delegate from 'delegate-it';

import {createFragmentLoadListener} from './on-diff-file-load';

export default function onCommentEdit(callback: EventListener): delegate.Subscription {
	return createFragmentLoadListener('.js-comment-edit-form-deferred-include-fragment', callback);
}
