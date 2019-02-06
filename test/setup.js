// test/setup.js
const hooks = require('require-extension-hooks');

// Set up a virtual browser environment.
require('jsdom-global')();

// Setup `.vue` files to be processed by `require-extension-hooks-vue`.
hooks('vue').plugin('vue').push();
// Setup `.vue` and `.js` files to be processed by `require-extension-hooks-babel`.
hooks(['vue', 'js']).plugin('babel').push();
