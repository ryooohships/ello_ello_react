const { withEntitlementsPlist, withInfoPlist } = require('@expo/config-plugins');

module.exports = function withVoIPPushKit(config) {
  // Add VoIP entitlements
  config = withEntitlementsPlist(config, (config) => {
    config.modResults['com.apple.developer.pushkit.voip'] = true;
    config.modResults['aps-environment'] = 'production';
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
    
    // Add required usage descriptions for CallKit
    if (!config.modResults.NSUserActivityTypes) {
      config.modResults.NSUserActivityTypes = [];
    }
    
    // Add VoIP activity type for CallKit
    const voipActivityType = 'INStartAudioCallIntent';
    if (!config.modResults.NSUserActivityTypes.includes(voipActivityType)) {
      config.modResults.NSUserActivityTypes.push(voipActivityType);
    }
    
    return config;
  });

  return config;
};