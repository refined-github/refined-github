import * as pageDetect from 'github-url-detection';
import {isWebPage} from 'webext-detect';

export const api3 = pageDetect.isEnterprise()
	? `${location.origin}/api/v3/`
	: 'https://api.github.com/';

export const api4 = pageDetect.isEnterprise() && isWebPage() // It can also run in graphql.html
	? `${location.origin}/api/graphql`
	: 'https://api.github.com/graphql';
