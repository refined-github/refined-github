import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import {getOwnerAndRepo} from '../libs/utils';
import * as api from '../libs/api';
import {appendBefore} from '../libs/dom-utils';
// import {getUsername} from '../libs/utils';

// function log() {
//     console.log('✨', <div className="rgh-jsx-element"/>);
// }

// type PrPlaceholder = {
//     id: number;
//     title: string;
// };

// async function getPrs(): Promise<PrPlaceholder[]> {
//     return [{id: 1, title: "placeholder"}]
// }
interface UserInfo { id: number, name: string, state: string};
interface UserStateMap {[id: number] : UserInfo};

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

    // Pending? This is a yellow color
    // else if (state == "") {
    //     return "#dbab09";
    // }
    return "";
}

function addToPrList(pull_number: string, reviewStates: UserStateMap): void
{
    // if (pull_number != "3585"){
    //     return;
    // }
    const tableRow = select(`#issue_${pull_number}`)!;
    const titleDiv = select("div .float-left.col-8", tableRow)!;
    const symbolSpan = select("span", titleDiv)!;
    // const detailsDiv = select("div.mt-1.text-small", titleDiv)!;
    // const rightHalf = select(`div .float-right.col-3`, tableRow)!;
    // const commentsBlock = select(`div .float-right`, rightHalf)!;
    console.log(tableRow);
    console.log(titleDiv);
    console.log(symbolSpan);
    // console.log(commentsBlock);
    // commentsBlock.append("background", "#ff00ff");
    // commentsBlock.append(<p/>);
    for (const reviewerId in reviewStates)
    {
        const reviewer = reviewStates[reviewerId];
        console.log(reviewer);
        // commentsBlock.append(<span>{reviewer.name}: {reviewer.state}</span>);
        // appendBefore(titleDiv, "div.mt-1.text-small", <span>{reviewer.name}: {reviewer.state}</span>)
        // appendBefore(titleDiv, "div.mt-1.text-small", <img class="from-avatar" src="https://avatars0.githubusercontent.com/u/${reviewer.id}?s=40&amp;v=4" alt="@${reviewer.name}" width="20" height="20"/>)
        const thumbnailStyles = {
            // "border-width": "2px",
            // "border-style": "solid",
            "border": `1px solid ${getPrColor(reviewer.state)}`
        };
        let thumbnail = <img
                        src={`https://avatars0.githubusercontent.com/u/${reviewer.id}?s=40&amp;v=4`}
                        alt={`@${reviewer.name}`}
                        className="avatar mr-1 from-avatar"
                        width="20"
                        height="20"
                        // style={`border: ${getPrColor(reviewer.state)};border-width: 2px;border-style: solid;`}
                        // style={`border-width: 2px;border-style: solid;`}
                        style={thumbnailStyles}
                    />;

        appendBefore(titleDiv,
                     "div.mt-1.text-small",
                     thumbnail);
        // appendBefore(titleDiv,
        //              "div.mt-1.text-small",
        //              <svg
        //                  className="octicon octicon-primitive-dot v-align-middle .color-yellow-7"
        //                  viewBox="0 0 8 16"
        //                  version="1.1"
        //                  width="8"
        //                  height="16"
        //                  aria-hidden="true"
        //              >
        //                 <path fill-rule="evenodd" d="M0 8c0-2.2 1.8-4 4-4s4 1.8 4 4-1.8 4-4 4-4-1.8-4-4z"></path>
        //              </svg>);
        // symbolSpan.append(<span>{reviewer.name}: {reviewer.state}</span>);
        // commentsBlock.append(<p/>);
    }
    // commentsBlock.append(<span>{Object.keys(reviewStates).length}</span>);
    reviewStates;
}

async function getPRState(ownerName: any, repoName: any, pull_number: string): Promise<void> {
    const result = await api.v3(`repos/${ownerName}/${repoName}/pulls/${pull_number}/reviews`)
    // console.log(result);

    let user_state:UserStateMap = {};
    for (let i = 0; i < result.length; i++)
    // for (const review of result)
    {
        const review = result[i];
        if (review.state)
        {
            user_state[review.user.id] = {
                id: review.user.id,
                name: review.user.login,
                state: review.state
            };
        }
    }
    // console.log(user_state);
    addToPrList(pull_number, user_state);
}

async function init(): Promise<void> {
    // select('.btn')!.addEventListener('click', log);
    console.log('This is my extension loading ✨');


    // Without this, the Issues page also displays PRs, and viceversa
    // const isIssues = location.pathname.startsWith('/issues');
    // const isPulls = location.pathname.startsWith('/pulls');
    // const typeQuery = isIssues ? 'is:issue' : 'is:pr';
    // const typeName = isIssues ? 'Issues' : 'Pull Requests';

    const {ownerName, repoName} = getOwnerAndRepo();
    console.log(`${ownerName}/${repoName}`);

    // const links = select<HTMLAnchorElement>('[data-hovercard-type^="pull_request"]')!;
    const links = select.all<HTMLAnchorElement>('[data-hovercard-type="pull_request"]');
    // console.log(links);

    let prIDs = [];
    for (const link of links)
    {
        const pathnameParts = link.pathname.split('/');
        const prID = pathnameParts[4];
        prIDs.push(prID);
        if (prID)
        {
            getPRState(ownerName, repoName, prID);

        }

        // // const result = await api.v4(`
        // //     reviews(owner: "${ownerName}", name: "${repoName}", pull_number: ${prID})
        // //     {
        // //         id
        // //     }
        // // `, {
        // //     allowErrors: true
        // // });
        // const result = await api.v3(`repos/${ownerName}/${repoName}/pulls/${prID}/reviews`)
        // console.log(result);



    }
    console.log(prIDs);


    // const prs = await getPrs();

    // console.log(prs);
}

features.add({
    id: __featureName__,
    description: 'Add reviewer thumbnails to the pulls list',
    // TODO: Set a real screenshot
    screenshot: 'https://user-images.githubusercontent.com/14323370/66400400-64ba7280-e9af-11e9-8d6c-07b35afde91f.png',
    load: features.onDomReady, // Wait for DOM ready
    init
});
