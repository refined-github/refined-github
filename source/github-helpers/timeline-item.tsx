import React from 'dom-chef';

export function TimelineItemOld(): JSX.Element {
	// Classes copied from #issuecomment-new + mt-3 added
	return <div className="ml-0 pl-0 ml-md-6 pl-md-3 mt-3" />;
}

// https://github.com/refined-github/refined-github/pull/8141
export function TimelineItem(): JSX.Element {
	return <div className="my-2" />;
}
