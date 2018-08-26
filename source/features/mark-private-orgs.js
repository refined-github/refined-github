import {h} from 'dom-chef';
import {getCleanPathname} from "../libs/page-detect";
import {getUsername} from "../libs/utils";
import select from "select-dom";
import * as icons from '../libs/icons';
import api from "../libs/api";

export default async () => {
	if (!getCleanPathname().startsWith(getUsername())) {
		// only for own user
		return;
	}
	// list public orgs
	const publicOrgs = [];
	const orgDataList = await api(`users/${getUsername()}/orgs`, true);
	if (!orgDataList) {
		return;
	}
	for (const orgData of orgDataList) {
		publicOrgs.push("/" + orgData["login"]);
	}

	// display
	const userContainer = select('[itemtype="http://schema.org/Person"]');
	if (!userContainer) {
		return;
	}
	// find all org avatars
	const orgAvatars = select.all('[itemprop="follows"]', userContainer);
	for (let orgAvatar of orgAvatars) {
		// check if org is private
		const orgPath = orgAvatar.getAttribute("href");
		if (!orgPath) {
			continue;
		}
		if (!publicOrgs.includes(orgPath)) {
			orgAvatar.append(
				<span style={{
					"pointer-events": "none",
					color: "gray",
					position: "absolute",
					top: "15px",
					left: "20px"
				}}>
					{icons.privateLock()}
				</span>
			);
		}
	}
}
