var theothersvg = {
   drawVid : function (videoRef) {
      "use strict";
   
      vixgl.util.log('draw vid');
   
      var video_id = 'video' + videoRef,
          vid = document.getElementById(video_id);
   
      vixgl.util.log('vid is ' + video_id);
      if (vid) {
         vixgl.util.log('already had video ' + video_id);
         return vid;
      }
   
      vixgl.util.log('creating new video ' + video_id);
      vid = document.createElement('video');
         vid.id = video_id;
         vid.style.display = 'none';
         vid.height = '256';
         vid.width = '256';
         vid.className = 'vidTexture';
         vid.src = '/vid?vid=http://streaming.vikkiread.co.uk.s3.amazonaws.com/' + videoRef + '.mp4';
      document.body.appendChild(vid);
      return vid;
   },
   
   // normal   === no selected planet
   // selected === selected planet, not playing
   // playing  === selected planet, playing
   
   reset : function(planet, vid) {
      "use strict";
   
      var prop,
          currentPlanet;
   
      for (prop in this.planets) {
         if (this.planets.hasOwnProperty(prop)) {
            currentPlanet = this.planets[prop];
            currentPlanet.selected = false;
            currentPlanet.greyed = (typeof planet !== 'undefined');
            this.proper.updateTextureWith(currentPlanet.origTexture, currentPlanet.texture);
         }
      }
   
      //vixgl.util.removeOldVidEmbeds(vid);
   },

   doStuffWithPlanet : function () {
      "use strict";
   
      var coords = vixgl.util.relMouseCoords(event),
          planet = vixgl.getPlanetFromCoords(coords),
          toShow = planet ? planet.title : 'the VOID....',
          vid;
   
      document.getElementById('whoo').innerText = 'i am embarassingly happy that you clicked on ' + toShow;
   
      // ARGH
      if (planet) {
         vid = document.getElementById('video' + planet.videoRef);
      }
      this.reset(planet, vid);
   
      if (planet) {
         //vid = document.getElementById('video' + planet.videoRef);
         if (!vid) {
            vid = this.drawVid(planet.videoRef);
         }
         planet.selected = true;
         planet.greyed = false;
      }
   }
};
