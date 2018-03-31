import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function() {
  registerShortcut('notifications', 'shift o', 'Open Notification in New Tab');

  document.addEventListener('keydown', event => {
    let notification = select('.js-notification, .navigation-focus')
    let isO = event.key === "O"

    if (notification && isO) {
      window.open('https://www.google.com', '_blank')
    }
  })
}
