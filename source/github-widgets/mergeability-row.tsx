import {AlertIcon, CheckIcon} from '@primer/octicons-react';
import React from 'dom-chef';

export default function createMergeabilityRow(): JSX.Element {
	return (
		<div className="branch-action-item">
			<div
				className="branch-action-btn float-right js-immediate-updates js-update-branch-form js-needs-timeline-marker-header"
			>
				<div className="select-menu d-inline-block">
					<div className="BtnGroup position-relative">
						<button
							type="submit"
							className="btn-group-update-merge rounded-left-2 btn BtnGroup-item hx_create-pr-button"
						>
							Update branch
						</button>

						<button
							type="submit"
							className="btn-group-update-rebase rounded-left-2 btn BtnGroup-item hx_create-pr-button"
						>
							Rebase branch
						</button>

						<details className="details-reset details-overlay BtnGroup-parent">
							<summary
								aria-label="Select update method"
								data-view-component="true"
								className="select-menu-button js-update-method-menu-button btn BtnGroup-item"
								aria-haspopup="menu"
								role="button"
							/>

							<details-menu
								className="select-menu-modal position-absolute right-0 left-md-0 js-update-branch-method-menu"
								style={{
									top: '100%',
									zIndex: 99
								}}
								role="menu"
								data-focus-trap="suspended"
							>
								<div className="select-menu-list">
									<button
										className="width-full select-menu-item"
										role="menuitemradio"
										value="merge"
										type="button"
										aria-checked="true"
									>
										<CheckIcon className="select-menu-item-icon"/>
										<div className="select-menu-item-text">
											<span className="select-menu-item-heading">Update with merge commit
											</span>
											<span className="description">The latest changes will be merged into this branch with a
												merge commit.
											</span>
										</div>
									</button>

									<button
										className="width-full select-menu-item"
										role="menuitemradio"
										value="rebase"
										type="button"
									>
										<CheckIcon className="select-menu-item-icon"/>
										<div className="select-menu-item-text">
											<span className="select-menu-item-heading">Update with rebase
											</span>
											<span className="description">This pull request will be rebased on top of the latest
												changes and then force pushed.
											</span>
										</div>
									</button>
								</div>
							</details-menu>
						</details>
					</div>
				</div>
			</div>
			<div
				className="branch-action-item-icon completeness-indicator completeness-indicator-problem"
			>
				<AlertIcon/>
			</div>
			<h3 className="h4 status-heading">
				This branch is out-of-date with the base branch
			</h3>
			<span className="status-meta">
				Merge the latest changes from <span className="branch-name">main</span> into
				this branch.
			</span>
		</div>
	);
}
