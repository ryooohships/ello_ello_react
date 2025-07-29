const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

module.exports = function withVoIPPushKit(config) {
  // Add VoIP entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.pushkit.unrestricted-voip'] = true;
    config.modResults['aps-environment'] = 'development';
    return config;
  });

  // Add VoIP background modes to Info.plist
  config = withInfoPlist(config, (config) => {
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }
    
    const backgroundModes = ['voip', 'audio', 'background-processing', 'remote-notification'];
    backgroundModes.forEach(mode => {
      if (!config.modResults.UIBackgroundModes.includes(mode)) {
        config.modResults.UIBackgroundModes.push(mode);
      }
    });
    
    return config;
  });

  return config;
};