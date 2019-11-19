import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import * as api from '../libs/api';
import {appendBefore} from '../libs/dom-utils';

interface UserInfo {
    id: number,
    name: string,
    state: string
};
interface UserStateMap {
    [id: number]: UserInfo
};

// helper function to get a color based upon the state of a PR.
function getPrColor(state: string): any {
    if (state == "APPROVED") {
        return "#28a745";
    }
    else if (state == "COMMENTED") {
        return "#586069";
    }
    else if (state == "CHANGES_REQUESTED") {
        return "var(--github-red)";
    }
    return "";
}

function addToPrList(pull_number: string, reviewStates: UserStateMap): void
{
    const tableRow = select(`#issue_${pull_number}`)!;
    const titleDiv = select("div .float-left.col-8", tableRow)!;
    // For each reviewer, add a thumbnail to the end of the title in the pull
    // request listing.
    //  * each thumbnail has a 1px border indicating if the reviewer has
    //    commented, approved, or requested changes.
    for (const reviewerId in reviewStates)
    {
        const reviewer = reviewStates[reviewerId];
        const thumbnailStyles = {
            "border": `1px solid ${getPrColor(reviewer.state)}`,
            "padding": `1px`
        };
        let thumbnail = <img
                        src={`https://avatars0.githubusercontent.com/u/${reviewer.id}?s=40&amp;v=4`}
                        alt={`@${reviewer.name}`}
                        className="avatar mr-1 from-avatar"
                        width="20"
                        height="20"
                        style={thumbnailStyles}
                    />;

        appendBefore(titleDiv,
                     "div.mt-1.text-small",
                     thumbnail);
    }
}

async function getPRState(ownerName: any, repoName: any, pull_number: string): Promise<void> {
    // Get all the reviews on this pull request
    const result = await api.v3(`repos/${ownerName}/${repoName}/pulls/${pull_number}/reviews`);

    // We only care about the last state a user was in for this PR, so iterate
    // over the reviews, and keep track of the curent state of each user. As we
    // see new reviews from a user, we'll update their state.
    let user_state: UserStateMap = {};
    for (let i = 0; i < result.length; i++) {
        const review = result[i];
        if (review.state) {
            if (user_state[review.user.id]) {
                let lastReview = user_state[review.user.id];
                if (lastReview.state == "CHANGES_REQUESTED" && review.state == "COMMENTED") {
                    // skip this review. The reviewer is still blocking the
                    // review until they explicitly approve or dismiss their
                    // state review, (which will change the old review's state
                    // to blocking).
                    continue;
                }
            }
            user_state[review.user.id] = {
                id: review.user.id,
                name: review.user.login,
                state: review.state
            };
        }
    }

    // Update the row in the PR list with the thumbnails for each reviewer.
    addToPrList(pull_number, user_state);
}

async function init(): Promise<void> {
    // Without this, the Issues page also displays PRs, and viceversa
    let currentPageParts = location.pathname.split('/');
    const isPulls = currentPageParts.length > 2 && currentPageParts[3] == 'pulls';
    if (!isPulls) {
        return;
    }

    const {ownerName, repoName} = getOwnerAndRepo();
    // Collect each of the PRs on this page
    const links = select.all<HTMLAnchorElement>('[data-hovercard-type="pull_request"]');
    for (const link of links) {
        const pathnameParts = link.pathname.split('/');
        const pull_number = pathnameParts[4];
        if (pull_number) {
            getPRState(ownerName, repoName, pull_number);
        }
    }
}

features.add({
    id: __featureName__,
    description: 'Adds thumbnails of reviewers to the pulls list, to check their status at a glance',
    screenshot: 'https://user-images.githubusercontent.com/18356694/69174051-aff39500-0ac6-11ea-9249-24cc2bdbc1bb.png',
    load: features.onAjaxedPages,
    init
});
