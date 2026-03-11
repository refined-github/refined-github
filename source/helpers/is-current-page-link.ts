type LinkLike = Pick<HTMLAnchorElement, 'href'>;

export default function isCurrentPageLink(link: LinkLike): boolean {
	const [currentPage] = location.href.split('#');
	const [linkTarget] = link.href.split('#');

	return currentPage === linkTarget;
}
