// https://github.com/octo-linker/injection 0.2.0
'use strict';

var gitHubInjection = function (global, cb) {
  if (!global) {
    throw new Error('Missing argument global');
  }

  if (!global.document || !global.document.getElementById) {
    throw new Error('The given argument global is not a valid window object');
  }

  if (!cb) {
    throw new Error('Missing argument callback');
  }

  if (typeof cb !== 'function') {
    throw new Error('Callback is not a function');
  }

  var domElement = global.document.getElementById('js-repo-pjax-container');
  if (!domElement || !global.MutationObserver) {
    return cb(null);
  }

  var viewSpy = new global.MutationObserver(function (mutations) {
    mutations.forEach(function (mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length) {
        cb(null);
      }
    });
  });

  viewSpy.observe(domElement, {
    attributes: true,
    childList: true,
    characterData: true
  });

  cb(null);
};

// Export the gitHubInjection function for **Node.js**, with
// backwards-compatibility for the old `require()` API. If we're in
// the browser, add `gitHubInjection` as a global object.
if (typeof exports !== 'undefined') {
  if (typeof module !== 'undefined' && module.exports) {
    exports = module.exports = gitHubInjection;
  }
  exports.gitHubInjection = gitHubInjection;
} else {
  /*jshint -W040 */
  this.gitHubInjection = gitHubInjection;
  /*jshint +W040 */
}
