import select from 'select-dom';
import 'webext-dynamic-content-scripts';

import './features/*.js'; // eslint-disable-line import/no-unresolved,import/extensions

// Add global for easier debugging
window.select = select;
