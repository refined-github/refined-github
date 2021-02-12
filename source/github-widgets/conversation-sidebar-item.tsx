import React from 'dom-chef';
import {GearIcon, XIcon} from '@primer/octicons-react';

interface Options {
	id: string;
	name: string;
	subHeader: string;
	handleSelection: EventListener;
	content: any;
}

export default function sidebarItem({id, name, subHeader, handleSelection, content}: Options): JSX.Element {
	return (
		<div className="discussion-sidebar-item js-discussion-sidebar-item rgh-clean-sidebar" id={id}>
			<details className="details-reset details-overlay select-menu hx_rsm">
				<summary
					className="text-bold discussion-sidebar-heading discussion-sidebar-toggle hx_rsm-trigger"
					aria-haspopup="menu"
					data-hotkey="x"
					role="button"
				>
					<GearIcon/>
					{name}
				</summary>

				<details-menu
					className="select-menu-modal position-absolute right-0 hx_rsm-modal"
					style={{zIndex: 99}}
					on-details-menu-select={handleSelection}
				>
					<div className="select-menu-header">
						<span className="select-menu-title">{subHeader}</span>
						<button
							className="hx_rsm-close-button btn-link close-button"
							type="button"
							data-toggle-for="reference-select-menu"
						>
							<XIcon aria-label="Close menu" role="img"/>
						</button>
					</div>
					<div className="hx_rsm-content" role="menu">
						{content}
					</div>
				</details-menu>
			</details>

			<p className="reason text-small text-gray"/>
		</div>
	);
}
