import select from 'select-dom';
import * as pageDetect from 'github-url-detection';

export default function isArchivedRepo(): boolean {
	return pageDetect.isRepo() && select('#repository-container-header .Label')!.textContent!.endsWith('archive');
}
