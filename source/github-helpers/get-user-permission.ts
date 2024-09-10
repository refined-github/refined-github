import api from './api.js';

// https://docs.github.com/en/graphql/reference/enums#repositorypermission
type ViewerPermission = 'ADMIN' | 'MAINTAIN' | 'READ' | 'TRIAGE' | 'WRITE';

async function getViewerPermission(): Promise<ViewerPermission> {
	const {repository} = await api.v4uncached(`
		repository() {
			viewerPermission
		}
	`);

	return repository.viewerPermission;
}

export async function userCanMergePR(): Promise<boolean> {
	const viewerPermission = await getViewerPermission();
	return viewerPermission !== 'READ';
}

export async function userCanEditEveryComment(): Promise<boolean> {
	const viewerPermission = await getViewerPermission();
	return !(viewerPermission === 'READ' || viewerPermission === 'TRIAGE');
}

export async function userCanRelease(): Promise<boolean> {
	const viewerPermission = await getViewerPermission();
	return !(viewerPermission === 'READ' || viewerPermission === 'TRIAGE');
}
