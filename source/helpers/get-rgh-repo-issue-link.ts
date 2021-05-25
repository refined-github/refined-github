export default function getRghRepoIssueLink(issueId: number | string): string {
	return 'https://github.com/sindresorhus/refined-github/issues/' + issueId.toString();
}
