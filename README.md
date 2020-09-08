# hls-46-plugin
A plug-in for hls.js to compares speeds of IPv4 and IPv6 session and chooses the faster one. 

# Mode

- mode 0 (simple speed comparison)
  - The player only monitors download speeds. This mode uses special (mixed) playlist (m3u8).
- mode 1 (speed comparison)
  - The player automatically adds URL prefix (e.g. https://ipv6.example.com/hls) and monitors download speeds.
- mode 2 (initial check to choose)
  - The player compares the speeds of protocols during the first segments. After that, the player keeps using the faster protocol.
- mode 3 (continuous check to choose)
  - The player compares the speeds of protocols during the first segments. After that, the player uses both protocols by the following rate (e.g. faster protocol: 4, slower protocol: 1) to get the latest speeds. 

# Files
## Client
- hls-46.js
  - main plug-in
- hls-customload.js
  - own customLoadInternal(media download handler) for hls.js. 
## Server (codes for reporting)
- beacon.php
  - receive JSON and write it to log
- ip.php
  - return client's ip address
- sid.php
  - return UUID
- uid.php
  - return UUID
## Tool 
- set-mixed-m3u8.pl
  - make a mixed (full path) m3u8
- ts-size-out.pl
  - make a filesize.js file
  
# Usage

## Mode 0 (Simple speed comparision)
Sample: http://ipv6.jpcdn.jp/hls-comp0.html

```
<html>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@0.14.1"></script>
  <video id="video" controls preload="none"></video>
  <script src="hls-46.js"></script>
  <script src="hls-customload.js"></script>
  <script src="cb-2-filesize.js"></script>  

  <script>
    var video = document.getElementById('video');
    var videoSrc = 'cb-2-mixed.m3u8';
  
    var customLoader = function() {};
    customLoader.prototype = new Hls.DefaultConfig.loader();
    customLoader.prototype.loadInternal = customLoadInternal;

    hls46init(0,"http://ipv4.example.com/","http://ipv6.example.com/","","");

    var hls = new Hls({loader: customLoader});
    hls.loadSource(videoSrc);
    hls.attachMedia(video);

    hls46TextShow();
  </script>
</html>
```
You must use mixed m3u8. You can omit hls46init's 3rd and 4th parameters (mode 0 does not use them).

- Simplification
  - If you do not need iOS safari support, you can omit cb-2-filesize.js.
  - If you do not need reporting, you can omit hls46init's 2nd and 3rd parameters. Also you do not have to install system files (beacon.php, ip.php, uid.php, sid.php)
    - hls46init(0,"","","","");
    - sample: http://ipv6.jpcdn.jp/hls-comp0-simple.html

## Mode 1 (Speed comparision)
Sample: http://ipv6.jpcdn.jp/hls-comp1.html

```
<html>
  <script src="https://cdn.jsdelivr.net/npm/hls.js@0.14.1"></script>
  <video id="video" controls preload="none"></video>
  <script src="hls-46.js"></script>
  <script src="hls-customload.js"></script>
  <script src="cb-2-filesize.js"></script>  

  <script>
    var video = document.getElementById('video');
    var videoSrc = 'cb-2.m3u8';
  
    var customLoader = function() {};
    customLoader.prototype = new Hls.DefaultConfig.loader();
    customLoader.prototype.loadInternal = customLoadInternal;

    hls46init(0,"http://ipv4.example.com/","http://ipv6.example.com/",
      "https://ipv4.media.example.com/hls/","https://ipv6.media.example.com/hls/");

    var hls = new Hls({loader: customLoader});
    hls.loadSource(videoSrc);
    hls.attachMedia(video);

    hls46TextShow();
  </script>
</html>
```
You must use normal m3u8 and set 3rd and 4th pamrameters of hls46init. Simplificaiton is the same as mode 0.

## Mode 2 (initial check)
Sample: http://ipv6.jpcdn.jp/hls-mcdn1.html

The first parameter of hls46init is 2. Other things are the same as mode 1.

## Mode 3 (continous check)

Sample: http://ipv6.jpcdn.jp/hls-mcdn2.html

The first parameter of hls46init is 3. Other things are the same as mode 1.

# Instalation
## System 
You must arrange files as the following:
### System files
- https://ipv4.example.com/
  - https://ipv4.example.com/ip.php (to get IPv4 address by plugin)
- https://ipv6.example.com/
  - https://ipv6.example.com/beacon.php (to send statistics by plugin)
  - https://ipv6.example.com/uid.php (to get user-id by plugin)
  - https://ipv6.example.com/sid.php (to get session-id by plugin)
  - https://ipv6.example.com/ip.php (to get IPv4 address by plugin)

### Media files (subdomians must be ipv4 and ipv6 to undestand by plugin)
- https://ipv4.media.example.com/
- https://ipv6.media.example.com/


## Media
Media files need the following preparations
- ipv4/ipv6 mixed m3u8 (only for mode 0)
  - example
    - perl set-mixed-m3u8.pl < sunrise-2.m3u8 https://ipv4.jstream.jp/media/hls/sunrise-2/ https://ipv6.jstream.jp/media/hls/sunrise-2/ > sunrise-2-mixed.m3u8

- filesize js
  - example
    - cd ts-file-directory
    - perl ts-size-out.pl  > sunrise-2-filesize.js

# Internal

This plugin consists of the following functinos:

- hls46init
  - initilizes this plugin
- customLoadInternal (in hls-customload.js)
  - overrides hls.js's loadInternal. The point of customization is calling the urlHandler that modifies the Media URL.
- urlHandler
  - modifies media URLs. It's called by customLoadInternal.
- speedHandler
  - calculates session speeds. It's called by urlHandler and ontimeupdate of html5 video.

# Sample media files

- cb.zip
  - based on https://upload.wikimedia.org/wikipedia/commons/thumb/6/60/SMPTE_Color_Bars_16x9.svg/1920px-SMPTE_Color_Bars_16x9.svg.png
  - 1920x1080, 60 FPS, all I-frames
    - ffmpeg -loop 1 -i 1920px-SMPTE_Color_Bars_16x9.svg.png -t 180 -vcodec libx264 -pix_fmt yuv420p -r 60 -f hls -hls_time 2 -g 1 -hls_playlist_type vod  -hls_segment_filename "cb%3d.ts" cb-2.m3u8

- sunrize.zip
  - sunrise.mp4: my own sunrise video at top of Mt. Fuji (copyfree)
  - 1920x1080, 30FPS
    - ffmpeg -i sunrise.mp4 -t 30 -c:v libx264 -pix_fmt yuv420p  -c:a aac -b:a 256k -f hls -r 30 -hls_time 2 -g 30  -sc_threshold 0  -hls_playlist_type vod -hls_segment_filename "sunrise%3d.ts" sunrise-2.m3u8

# Note and future work

## Chunk size correction

Real media files have different size of chunk. It has a negative effect on speed comparison. 

Due to TCP slow start, 
- Rapid movement scene (chunk) -> Big chunk size -> Transfer (TCP) speed is faster
- Quiet movement scene (chunk) -> Small chunk size -> Transfer (TCP) speed is slower
We need to correct them to fair speed comparison.

## Player side multi CDN

We can use this plugin to choose any 2 media servers (or CDNs) without any modification (e.g. akamai and cloudfront, https://aaa.cloudfront.net/hls/xxx.ts and  https://aaa.edgesuite.net/hls/xxx.ts)

## mode 0 (simple speed comparision)

Currently, this mode only use W3C Resource Timing API to calculate speed. Probably, this mode will work on another media player like Video.js and so on.

## Safari iOS

They do not support transferSize on Resource Timing API. We can not get file sizes to calculate speeds. As a workaround, I added media-filesize.js like the following:
- ts_size["cb000.ts"]=272036;
- ts_size["cb001.ts"]=271284;
- ts_size["cb002.ts"]=271284;

I plan to implement a new feature to get the file size using the internal code of hls.js without filesize.js

## IPv6 native support

Currently, this plugin determines the using protocol from media URL. But, better way to handle them is to get IPv4 and IPv6 addresses from a URL and use different connections for each. It needs some deep customization of hls.js.

## Speed calculation

This plugin only supports sequential play. Any trick play (fast forward, rewinding) would be problem.

## Better protocol selection (mode 3, continous check)

This plugin use average speed of latest the 4 chunks of each protocols to choose the better protocol and keep use slower protocol by 1:4 ratio.However, this algorithm is tentative. We should find better way to choose.


