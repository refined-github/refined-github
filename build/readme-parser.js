import regexJoin from 'regex-join';
import { readFileSync } from 'node:fs';
import parseMarkdown from 'snarkdown';
// Group names must be unique because they will be merged
const simpleFeatureRegex = /^- \[]\(# "(?<simpleId>[^"]+)"\)(?: 🔥)? (?<simpleDescription>.+)$/gm;
const highlightedFeatureRegex = /<p><a title="(?<highlightedId>[^"]+)"><\/a> (?<highlightedDescripion>.+?)\n\t+<p><img src="(?<highlightedImage>.+?)">/g;
const featureRegex = regexJoin(simpleFeatureRegex, /|/, highlightedFeatureRegex);
const imageRegex = /\.\w{3}$/; // 3 since .png and .gif have 3 letters
const rghUploadsRegex = /refined-github[/]refined-github[/]assets[/]/;
const screenshotRegex = regexJoin(imageRegex, /|/, rghUploadsRegex);
function extractDataFromMatch(match) {
    const { simpleId, simpleDescription, highlightedId, highlightedDescripion, highlightedImage, } = match.groups;
    if (highlightedId) {
        return {
            id: highlightedId,
            description: parseMarkdown(highlightedDescripion + '.'),
            screenshot: highlightedImage,
        };
    }
    const urls = [];
    function urlExtracter(_match, title, url) {
        urls.push(url);
        return title;
    }
    const linkLessMarkdownDescription = simpleDescription.replaceAll(/\[(.+?)]\((.+?)\)/g, urlExtracter);
    return {
        id: simpleId,
        description: parseMarkdown(linkLessMarkdownDescription),
        screenshot: urls.find(url => screenshotRegex.test(url)),
    };
}
export function getFeaturesMeta() {
    const readmeContent = readFileSync('readme.md', 'utf8');
    return [...readmeContent.matchAll(featureRegex)]
        .map(match => extractDataFromMatch(match))
        .sort((firstFeature, secondFeature) => firstFeature.id.localeCompare(secondFeature.id));
}
export function getImportedFeatures() {
    const contents = readFileSync('source/refined-github.ts', 'utf8');
    return [...contents.matchAll(/^import '\.\/features\/([^.]+)\.js';/gm)]
        .map(match => match[1])
        .sort();
}
