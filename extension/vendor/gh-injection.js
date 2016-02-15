'use strict';
// https://github.com/octo-linker/injection

// Grabbed from underscore.js
// http://underscorejs.org/#debounce
function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) {
        func.apply(context, args);
      }
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) {
      func.apply(context, args);
    }
  };
}

var gitHubInjection = function (global, options, cb) {
  if (!global) {
    throw new Error('Missing argument global');
  }
  if (!global.document || !global.document.getElementById) {
    throw new Error('The given argument global is not a valid window object');
  }

  if (!cb) {
    cb = options;
    options = {};
  } else if (typeof cb !== 'function') {
    throw new Error('Callback is not a function');
  }

  if (!cb) {
    throw new Error('Missing argument callback');
  }

  options = options || {};
  options.context = options.context || null;
  options.wait = options.wait || 250;

  cb = debounce(cb, options.wait).bind(options.context);

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
