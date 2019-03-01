import features from '../libs/features';
import {getOwnerAndRepo, getRepoBranch, getRepoPath} from '../libs/utils';
import * as api from '../libs/api';

import * as icons from '../libs/icons';
import select from 'select-dom';
import React from 'dom-chef';
import {appendBefore} from '../libs/dom-utils';
let repoInfo;
async function fetchRepoData() {
    const {ownerName, repoName} = getOwnerAndRepo();
    const branch = getRepoBranch();
    const path = getRepoPath().split('/').splice(2).join('/');
    const repoResponse = await api.v4(
        `{
            repository(owner: "${ownerName}", name: "${repoName}") {
                diskUsage
                ${branch ?` object(expression: "${branch}:${path}") { ... on Tree {` : `defaultBranchRef {  target {  ... on Commit { tree {`}
                        entries {
                            name
                            object {
                                ... on Blob {
                                    byteSize
                                }
                            }
                        }
                    }
                    ${branch ? ``:`}}`}
                }
            }
        }`
    );
   
    return repoResponse.repository;
}
function humanFileSize(bytes, si) {
    if(bytes == null)
    return bytes;
    var thresh = si ? 1000 : 1024;
    if(Math.abs(bytes) < thresh) {
        return bytes + ' B';
    }
    var units = si
        ? ['kB','MB','GB','TB','PB','EB','ZB','YB']
        : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
    var u = -1;
    do {
        bytes /= thresh;
        ++u;
    } while(Math.abs(bytes) >= thresh && u < units.length - 1);
    return bytes.toFixed(1)+' '+units[u];
}


function addSize() {
    let m = new Map<string, string>();
	for (const {name, object} of repoInfo.object ? repoInfo.object.entries : repoInfo.defaultBranchRef.target.tree.entries ) {
            m.set(name, humanFileSize(object.byteSize, true));
    }
    return m;
}

async function init () {
    repoInfo = await fetchRepoData();
    
    const fileSize = addSize();
    const repo_info_container = select('ul.numbers-summary');

    if (repo_info_container) {
        appendBefore(repo_info_container, 'li:last-child ', <li> <svg class="octicon octicon-database" viewBox="0 0 12 16" version="1.1" width="12" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M6 15c-3.31 0-6-.9-6-2v-2c0-.17.09-.34.21-.5.67.86 3 1.5 5.79 1.5s5.12-.64 5.79-1.5c.13.16.21.33.21.5v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V7c0-.11.04-.21.09-.31.03-.06.07-.13.12-.19C.88 7.36 3.21 8 6 8s5.12-.64 5.79-1.5c.05.06.09.13.12.19.05.1.09.21.09.31v2c0 1.1-2.69 2-6 2zm0-4c-3.31 0-6-.9-6-2V3c0-1.1 2.69-2 6-2s6 .9 6 2v2c0 1.1-2.69 2-6 2zm0-5c-2.21 0-4 .45-4 1s1.79 1 4 1 4-.45 4-1-1.79-1-4-1z"></path></svg> {humanFileSize(repoInfo.diskUsage * 1000, true)} </li>)
        
    }
    
    for (const item of select.all('span.css-truncate.css-truncate-target > .js-navigation-open')) {
        appendBefore(item.parentNode.parentNode.parentElement, '.age', <td class="age size"><span class="css-truncate css-truncate-target">{fileSize.get(item.title) ? fileSize.get(item.title) :'' }</span></td>)
    }
}


features.add({
	id: 'add-file-size',
    include: [
        features.isRepoRoot,
        features.isRepoTree
	],
    load: features.onAjaxedPages,
	init
});