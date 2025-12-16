const fs = require('fs');
const path = require('path');

console.log('Patching React Native codegen files...');

// Patch VirtualViewNativeComponent.js
const virtualViewPath = path.join(
  __dirname,
  'node_modules/react-native/src/private/components/virtualview/VirtualViewNativeComponent.js'
);

const virtualViewContent = `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

const requireNativeComponent = require('../../../../Libraries/ReactNative/requireNativeComponent').default;

module.exports = requireNativeComponent('VirtualView');
`;

if (fs.existsSync(virtualViewPath)) {
  fs.writeFileSync(virtualViewPath, virtualViewContent, 'utf8');
  console.log('✓ Patched VirtualViewNativeComponent.js');
}

// Patch DebuggingOverlayNativeComponent.js
const debuggingOverlayPath = path.join(
  __dirname,
  'node_modules/react-native/src/private/specs_DEPRECATED/components/DebuggingOverlayNativeComponent.js'
);

const debuggingOverlayContent = `/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow strict-local
 * @format
 */

const requireNativeComponent = require('../../../../Libraries/ReactNative/requireNativeComponent').default;

module.exports = requireNativeComponent('DebuggingOverlay');
`;

if (fs.existsSync(debuggingOverlayPath)) {
  fs.writeFileSync(debuggingOverlayPath, debuggingOverlayContent, 'utf8');
  console.log('✓ Patched DebuggingOverlayNativeComponent.js');
}

console.log('All patches applied successfully!');
