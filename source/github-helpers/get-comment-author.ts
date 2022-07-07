/**
Given any element in a comment, returns the comment’s author

This works on:
- First comment
- Following comments
- Main review comment
- Following review comments
- Gist comments
- Bots

Note: Bots are used as `name[bot]`, `app/name`, or `apps/name` depending on the context:
- https://github.com/webpack/webpack/commits?author=dependabot%5Bbot%5D
- https://github.com/webpack/webpack/pulls/app%2Fdependabot
- https://github.com/apps/dependabot

@returns user-name
@returns dependabot[bot]

*/
export default function getCommentAuthor(anyElementInsideComment: Element): string {
	const avatar = anyElementInsideComment
		.closest('.TimelineItem, .review-comment')!
		.querySelector('.TimelineItem-avatar img, img.avatar')!;

	const name = avatar
		.alt // Occasionally ends with `[bot]`
		.replace(/^@/, ''); // May or may not be present

	if (!name.endsWith('[bot]') && avatar.closest('[href^="https://github.com/apps/"]')) {
		// Example: https://github.com/webpack/webpack/pull/15926#issuecomment-1170670173
		return name + '[bot]';
	}

	return name;
}
