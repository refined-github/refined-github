import clockIcon from 'octicon/clock.svg';
import features from '../libs/features';
import * as api from '../libs/api';
import {getRepoGQL} from '../libs/utils';
import React from 'dom-chef';
import select from 'select-dom';

async function init(): Promise<false | void | any> {
	for (const link of select.all<HTMLAnchorElement | any>('.pinned-issue-item')) {
		const issueNUmber: any = Number((select<any>('a.link-gray-dark.no-underline.h4[href]', link)).href.split('/').slice(-1).pop());
		const [lastCommented, lastUpdated] = await getLastCommented(issueNUmber);
		if (select.exists('a[aria-label*="comment"]', link)) {
			const now = new Intl.DateTimeFormat('default', {
				month: 'numeric',
				day: 'numeric',
				year: 'numeric'
			}).format(new Date(lastCommented));
			const updatedTitle = `Last Commented on ${now}`;
			select<HTMLAnchorElement | any>('a[aria-label*="comment"]', link).title = updatedTitle;
		}

		const bottomBar: any = (select.all(['.open', '.closed'], link))[0].parentElement;

		bottomBar.append(
			<span className="d-none d-md-inline">
				<span className="issue-meta-section ml-2">
					{clockIcon()} updated <relative-time datetime={lastUpdated} title={lastUpdated}/>
				</span>
			</span>
		);
	}
}

const getLastCommented = async (issue: number): Promise<string | false | any> => {
	const {repository} = await api.v4(`
		repository(${getRepoGQL()}) {
			    issue (number:${issue}){
      updatedAt
      comments(last: 1) {
        nodes {
          updatedAt
        }
      }
    }
		}
	`);
	const {nodes} = repository.issue.comments;
	let lastCommented;
	if (nodes.length > 0) {
		lastCommented = nodes[0].updatedAt;
	} else {
		lastCommented = [];
	}

	const lastUpdated = repository.issue.updatedAt;
	// Otherwise just use the latest
	return [lastCommented, lastUpdated];
};

features.add({
	id: __featureName__,
	description: 'Changes the default sort order of discussions to `Recently updated`.',
	screenshot: false,
	include: [
		features.isRepoIssueList
	],
	init
});
