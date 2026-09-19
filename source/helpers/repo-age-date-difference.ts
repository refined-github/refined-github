export default function hasSignificantDateDifference(
	firstCommitDate: Date,
	repositoryCreatedAt: Date,
	now = new Date(),
): boolean {
	const repositoryAge = Math.abs(now.getTime() - repositoryCreatedAt.getTime());
	const dateDifference = Math.abs(firstCommitDate.getTime() - repositoryCreatedAt.getTime());

	return dateDifference > repositoryAge / 10;
}
