export default function getRghIssueUrl(issueId: number | string): string {
	return 'https://github.com/sindresorhus/refined-github/issues/' + issueId.toString();
}
