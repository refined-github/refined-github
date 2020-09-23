import * as pageDetect from 'github-url-detection';
import features from '.';

function init(): void {
  document.querySelectorAll('.avatar-user').forEach(el => el.classList.remove('avatar-user'));
}

features.add({
  id: __filebasename,
  description: 'Restores the squared format of user avatars.',
  screenshot: 'https://user-images.githubusercontent.com/23259585/94072057-3ec2f380-fdf5-11ea-8bfc-31b9cff2f898.png',
}, {
  include: [
    pageDetect.isDashboard,
    pageDetect.isIssue,
    pageDetect.isPR,
    pageDetect.isPRConversation,
    pageDetect.isRepoHome,
    pageDetect.isRepoCommitList,
    pageDetect.isRepoSettings,
    pageDetect.isUserProfile,
  ],
  init,
});
