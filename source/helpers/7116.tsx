import {isPRFiles} from "github-url-detection";
import {isChrome} from "webext-detect-page"

// TODO: Bad performance https://github.com/refined-github/refined-github/issues/7116
export default function isBadBrowserOnPrFiles(): boolean {
	return !isChrome() && isPRFiles();
}
