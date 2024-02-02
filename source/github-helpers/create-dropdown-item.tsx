import React from 'dom-chef';

// Random icon just for types
import type TagIcon from 'octicons-plain-react/Tag';

export default function createDropdownItem(label: string, url: string, Icon: typeof TagIcon, attributes?: Record<string, string>): Element {
	return (
		<li data-targets="action-list.items action-list.items" role="none" data-view-component="true" className="ActionListItem" {...attributes}>

			<a tabIndex={-1} href={url} role="menuitem" data-view-component="true" className="ActionListContent ActionListContent--visual16">
				<span className="ActionListItem-visual ActionListItem-visual--leading">
					<Icon/>
				</span>

				<span data-view-component="true" className="ActionListItem-label">
					{label}
				</span>
			</a>

		</li>
	);
}
