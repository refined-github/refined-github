import select from 'select-dom';

export default function () {
       const btn = select('.merge-message .btn-group-merge [type=submit]');
       if (!btn) {
               return;
       }
       btn.addEventListener('click', () => {
                // fix merge commit title
               const title = select('.js-issue-title').textContent;
               const number = select('.gh-header-number').textContent;
               select('#merge_title_field').value = `${title.trim()} (${number})`;
                // fix merge commit message
                const merge_message = select('.mt-0 .js-comment-body').textContent;
                select('#merge_message_field').value = `${merge_message.trim()}`;
       });
}
