import features from "../libs/features";
import * as api from "../libs/api";
import { getOwnerAndRepo } from "../libs/utils";

async function revertFile(filePath, ref) {
	const { ownerName, repoName } = getOwnerAndRepo();
	const { content } = await api.v3(`repos/${ownerName}/${repoName}/contents/${filePath}?ref=${ref}`);

	const userInfo = await api.v4(`
		{
			viewer {
				login
				email
			}
		}
	`);

	await api.v3(`repos/${ownerName}/${repoName}/contents/${filePath}`, {
		method: "PUT",
		body: JSON.stringify({
			message: `Reverting ${filePath}`,
			content,
			committer: {
				name: userInfo.viewer.login,
				email: userInfo.viewer.email
			}
			// TODO: Get Sha of file at current state
		})
	})
}

function init() {
	const container = select(".file-actions");

	if (!container) {
		return false;
	}
}

features.add({
	id: "revert-file-pr-button",
	include: [features.isPRFiles],
	load: features.onAjaxedPages,
	init
});
