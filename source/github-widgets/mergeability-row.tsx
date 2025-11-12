import React from 'dom-chef';

type MergeabilityRowProps = {
	action?: JSX.Element;
	icon: JSX.Element;
	iconClass?: string;
	heading: JSX.Element | string;
	meta?: JSX.Element | string;
	className?: string;
};

export default function createMergeabilityRow({
	className = '',
	action,
	icon,
	iconClass = '',
	heading,
	meta,
}: MergeabilityRowProps): JSX.Element {
	return (
		<div className={`branch-action-item ${className}`}>
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
