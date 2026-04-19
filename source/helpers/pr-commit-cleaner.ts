/**
@example 'Something done (#123)' => 'Something done'
*/
export default function cleanPrCommitTitle(commitTitle: string, pr: number): string {
	return commitTitle.replace(new RegExp(String.raw`\(#${pr}\)\s*$`), '').trim();
}
