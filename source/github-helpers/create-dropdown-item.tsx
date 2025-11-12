import React from 'dom-chef';

// Random icon just for types
import type TagIcon from 'octicons-plain-react/Tag';

type Options = {
	label: string;
	href: string;
	icon: typeof TagIcon;
} & Record<string, string | typeof TagIcon>;

export default function createDropdownItem({
	label,
	href,
	icon: Icon,
	...attributes
}: Options): Element {
	return (
		<li
			data-targets='action-list.items action-list.items'
			role='none'
			data-view-component='true'
			className='ActionListItem'
			{...attributes}
		>
			<a
				tabIndex={-1}
				href={href}
				role='menuitem'
				data-view-component='true'
				className='ActionListContent ActionListContent--visual16'
			>
				<span className='ActionListItem-visual ActionListItem-visual--leading'>
					<Icon />
				</span>

				<span data-view-component='true' className='ActionListItem-label'>
					{label}
				</span>
			</a>

		</li>
	);
}
