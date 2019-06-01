import React from 'dom-chef';
import select from 'select-dom';
import features from '../libs/features';
import './highest-rated-comment.css';

type Option = {
	$el: Element,
	likes: number,
	unlikes: number,
	index: number
}
type Props = {
	id: string,
	username: string,
	text: string,
	avatar: string
}

const like = '👍'
const unlike = '👎'

const element = ({ id, username, text, avatar }: Props) => (
	<div className="timeline-comment-wrapper rgh-highest-rated-comment">
		<div className="avatar-parent-child timeline-comment-avatar">
			<a href={`https://github.com/${username}`} className="d-inline-block">
				<img src={avatar} alt={username} className="avatar rounded-1" height="44" width="44"/>
			</a>
		</div>

		<a href={`#${id}`}>
			<div className="bg-white border details-reset rounded-1">
				<div className="bg-gray border-bottom-0 px-2 py-0 rgh-highest-rated-comment-summary">
					<div className="d-flex flex-items-center">
						<a href={`#${id}`} className="btn btn-sm rgh-highest-rated-comment-btn">
							<svg height="16" className="octicon octicon-arrow-down" viewBox="0 0 10 16" version="1.1" width="20" aria-hidden="true">
								<path fill-rule="evenodd" d="M7 7V3H3v4H0l5 6 5-6H7z"></path>
							</svg>
						</a>

						<div className="text-gray timeline-comment-header-text rgh-highest-rated-comment-text">
							<span>Highest-Rated Comment: {text}</span>
						</div>
					</div>
				</div>
			</div>
		</a>
	</div>
)

function init(): void {
	const $comments: Element[] = select.all('.comment')

	const options: Option[] = select.all('.comment-reactions-options') // search for those with reactions
		.map($reactions => {
			const $el = $reactions.closest('.comment')!
			const $buttons = select.all('button', $reactions)
			const reactions: {[key: string]: number} = $buttons.reduce((acc: {[s: string]: number}, $button) => {
				try {
					const [emoji, countStr] = $button.innerText
						.split(' ')
						.map(x => x.trim())
					const count = parseInt(countStr, 10)
					acc[emoji] = count
					return acc
				} catch (error) {
					return acc
				}
			}, {})

			const likes = reactions[like] || 0
			const unlikes = reactions[unlike] || 0
			const index = $comments.indexOf($el)

			return {
				$el,
				likes,
				unlikes,
				index
			}
		})
		.sort((a, b) => b.likes - a.likes)

	const highestNumber = Math.max(...options.map(option => option.likes))

	function candidate (option: Option) {
		// is the 5th or later comment (it doesn't make sense to highlight a comment that is right under the opening issue already)
		const notClose = option.index >= 4
		// has the most 👍 reactions
		const mostLikes = option.likes >= highestNumber
		// has at least 10 👍 reactions (or 👍.count > comments.length * 0.8)
		const minimum = option.likes >= 10 || option.likes > $comments.length * 0.8
		// controversial: 👎.count >= 👍.count / 2
		const controversial = option.unlikes >= (option.likes / 2)

		return notClose && mostLikes && minimum && !controversial
	}

	const comment = options.find(candidate)

	if (comment && comment.$el) {
		const $parent = comment.$el.closest('.timeline-comment-group')!
		const id = $parent.id
		const username = select('.author', comment.$el)!.innerText
		const text = select('.comment-body', comment.$el)!.innerText.substring(0, 100)
		const $avatar = select('img.avatar', $parent)! as HTMLImageElement
		const avatar = $avatar.src
		const props: Props = { id, username, text, avatar }

		comment.$el.classList.add('rgh-highest-rated-comment')
		select('.js-discussion')!.prepend(element(props))
	}
}

features.add({
	id: 'highest-rated-comment',
	description: 'Highlight and make a shortcut to most useful comments in issues.',
	screenshot: 'https://i.imgur.com/vXmv0R6.png',
	include: [
		features.isIssue
	],
	exclude: [
	],
	load: features.onDomReady, // Wait for dom-ready
	init
});
