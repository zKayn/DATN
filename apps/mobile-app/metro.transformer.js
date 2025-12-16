const upstreamTransformer = require('@expo/metro-config/babel-transformer');

module.exports.transform = function ({ src, filename, options }) {
  // Skip codegen for problematic native components
  if (
    filename.includes('VirtualViewNativeComponent.js') ||
    filename.includes('DebuggingOverlayNativeComponent.js')
  ) {
    const componentName = filename.includes('VirtualView')
      ? 'VirtualView'
      : 'DebuggingOverlay';

    return upstreamTransformer.transform({
      src: `
        import { requireNativeComponent } from 'react-native';
        export default requireNativeComponent('${componentName}');
      `,
      filename,
      options,
    });
  }

  return upstreamTransformer.transform({ src, filename, options });
};
