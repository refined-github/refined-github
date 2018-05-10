import select from 'select-dom';

export default function () {
	const btn = select('.merge-message .btn-group-squash [type=submit]');
	if (!btn) {
		return;
	}
	btn.addEventListener('click', () => {
		const desc = select_dom_default()(".comment-form-textarea[name='pull_request[body]']").textContent;
    		select_dom_default()("#merge_message_field").value = `${desc}`;
	});
}
