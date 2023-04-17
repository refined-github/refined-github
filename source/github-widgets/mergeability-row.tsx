import React from 'dom-chef';

type MergeabilityRowProps = {
	action?: JSX.Element;
	icon: JSX.Element;
	iconClass?: string;
	heading: string;
	meta?: JSX.Element;
};

export default function createMergeabilityRow({
	action,
	icon,
	iconClass = '',
	heading,
	meta,
}: MergeabilityRowProps): JSX.Element {
	return (
		<div className="branch-action-item">
			<div
				className="branch-action-btn float-right js-immediate-updates js-needs-timeline-marker-header"
			>
				{action}
			</div>
			<div
				className={`branch-action-item-icon completeness-indicator ${iconClass}`}
			>
				{icon}
			</div>
			<h3 className="h4 status-heading">
				{heading}
			</h3>
			<span className="status-meta">
				{meta}
			</span>
		</div>
	);
}
