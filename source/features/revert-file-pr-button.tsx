import features from "../libs/features";
import * as api from "../libs/api";
import { getOwnerAndRepo } from "../libs/utils";

async function revertFile(filePath, baseBranch) {
	const { ownerName, repoName } = getOwnerAndRepo();
	const { content } = await api.v3(`repos/${ownerName}/${repoName}/contents/${filePath}?ref=${baseBranch}`);
	// await api.v3(`repos/${ownerName}/${repoName}/contents/${filePath}`, {
	//   method: PUT
	// })
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
