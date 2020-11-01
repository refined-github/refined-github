import React from 'dom-chef';
import XIcon from 'octicon/x.svg';
import domify from 'doma';
import elementReady from 'element-ready';

import features from '.';

async function init(): Promise<void | false> {
	const currentFeature = /features\/(.*).[a-z]{3}$/.exec(location.pathname)![1];
	const {id, description, screenshot} = __featuresMeta__.find(feature => feature.id === currentFeature) ?? {};
	if (!description) {
		return false;
	}

	const descriptionElement = domify.one(description)!;
	descriptionElement.classList.add('mb-0', 'mr-3');

	const branchSelector = await elementReady('[data-hotkey="w"]')!;
	branchSelector!.closest('.d-flex')!.after(
		<div className="Box mb-3">
			<div className="Box-row d-flex flex-items-center" style={{boxShadow: '0 0 0 2px #d1d5da'}}>
				<div className="flex-auto">
					<strong>{descriptionElement}</strong>
				</div>
				{screenshot && id !== __filebasename &&
					<details className="details-reset details-overlay details-overlay-dark">
						<summary className="btn btn-primary" aria-haspopup="dialog">
							View Screenshot
						</summary>
						<details-dialog
							className="Box Box--overlay d-flex flex-column anim-fade-in fast Box-overlay--wide"
							role="dialog"
							aria-modal="true"
							tabindex="-1"
						>
							<div className="Box-header">
								<button
									data-close-dialog
									className="Box-btn-octicon btn-octicon float-right"
									type="button"
									aria-label="Close dialog"
								>
									<XIcon/>
								</button>
							</div>
							<div className="overflow-auto">
								<div className="Box-body overflow-auto">
									<a href={screenshot}>
										<img className="width-fit" src={screenshot}/>
									</a>
								</div>

							</div>
						</details-dialog>
					</details>}
			</div>
		</div>
	);
}

void features.add(__filebasename, {
	include: [
		() => /refined-github\/blob\/\w+\/source\/features\/[\w.-]+$/.test(location.pathname)
	],
	awaitDomReady: false,
	init
});
