import {h} from 'dom-chef';
import select from 'select-dom';
import * as icons from '../libs/icons';

export default function () {
	for (const {parentElement: editLink} of select.all('.file-header .octicon-pencil')) {
		// Transform the `edit` URL into a `delete` url
		const deleteUrl = editLink.pathname.replace(/^(\/[^/]+\/[^/]+\/)edit/, '$1delete');

		editLink.after(
			<a href={deleteUrl} className="btn-octicon btn-octicon-danger">
				{icons.trashcan()}
			</a>
		);
	}
}
