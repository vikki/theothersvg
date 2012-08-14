var vixgl = vixgl || {};
vixgl.config = vixgl.config || {};

// TODO might be able to put the attributes on the config object instead, but decent for now
vixgl.config.getConfig = function() {
   var config = vixgl.util.isOffline() ? this.offline : this.online;
   vixgl.config.getConfig = function() {
      return config;
   };
   return vixgl.config.getConfig();
};
