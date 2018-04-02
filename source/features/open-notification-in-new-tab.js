import select from 'select-dom';
import {registerShortcut} from './improve-shortcut-help';

export default function () {
  registerShortcut('notifications', 'shift o', 'Open Notification in New Tab');

  document.addEventListener('keyup', event => {
      const notification = select('.js-notification, .navigation-focus');
      const isO = (event.key === 'O');
      const url = document.querySelector('.navigation-focus').querySelector('a');

      if (notification && isO) {
        window.open(url, '_blank');
      }
  });
}
