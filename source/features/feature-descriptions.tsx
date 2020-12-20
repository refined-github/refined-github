import React from 'dom-chef';
import domify from 'doma';
import elementReady from 'element-ready';

import features from '.';
import * as api from '../github-helpers/api';

interface FileHistory {
	message: string;
	oid: string;
}

const fileHistory = async (featureName: string): Promise<FileHistory | string[]> => {
	const {repository} = await api.v4(`
		repository() {
			defaultBranchRef {
				target {
					...on Commit {
						history(first:100, path: "source/features/${featureName}.tsx") {
							nodes {
								message
								oid
							}
						}
					}
				}
			}
		}
	`);
	const history = repository.defaultBranchRef.target.history.nodes;
	return history.filter((commit: FileHistory) => !/^Meta|^Document|^Readme|^Lint|^Update.+dependencies/.exec(commit.message));
};

async function init(): Promise<void | false> {
	const [, currentFeature] = /features\/([^.]+)/.exec(location.pathname)!;
	const {id, description, screenshot} = __featuresMeta__.find(feature => feature.id === currentFeature) ?? {};
	if (!description) {
		return false;
	}

	const descriptionElement = domify.one(description)!;
	descriptionElement.classList.add('mb-0', 'ml-3', 'flex-auto', 'text-bold');

	const branchSelector = await elementReady('[data-hotkey="w"]')!;
	branchSelector!.closest('.d-flex')!.after(
		<div className="Box mb-3">
			<div className="Box-row d-flex flex-items-center" style={{boxShadow: '0 0 0 2px #d1d5da'}}>
				{screenshot && id !== __filebasename &&
					<a href={screenshot}>
						<img
							src={screenshot}
							className="d-block border"
							height="100"
							width="100"
							style={{objectFit: 'cover'}}/>
					</a>}
				{descriptionElement}
			</div>
		</div>
	);

	const history = await fileHistory(id!);
	console.log(history);
}

void features.add(__filebasename, {
	include: [
		() => /refined-github\/blob\/.+?\/source\/features\/[\w.-]+$/.test(location.pathname)
	],
	awaitDomReady: false,
	init
});
