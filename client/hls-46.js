var index_check_prt = 0;
var index_speed_v4 = 0;
var index_speed_v6 = 0;
var last_speed_v4 = 0;
var last_speed_v6 = 0;
var ave_speed_v4 = 0;
var ave_speed_v6 = 0;
var speed_v4 = [];
var speed_v6 = [];
var downloaded_index=0;
var ipv4_base_url;
var ipv6_base_url;
var ipv4_media_url;
var ipv6_media_url;
var beacon_url;
var track;
var cue;
var mode46;
var modeName;
var started_index = 0;
var checked46 = 0;
var agent = window.navigator.userAgent;
var beaconMode = 0;
var debugMode = 0;
var request;
var ts_size = new Array();

function hls46init(mode,v4base,v6base,v4media,v6media) {
    mode46 = mode;
    if (v4base.length&&v6base.length) {
	beaconMode = 1;
	beacon_url = v6base+"/beacon.php";
	ipv4_base_url = v4base;
	ipv6_base_url = v6base;
    }
    ipv4_media_url = v4media;
    ipv6_media_url = v6media;
    
    if (mode46 == 0) {
	modeName = "comp0";
    } else if (mode46 == 1) {
	modeName = "comp1";
    } else if (mode46 == 2) {
	modeName = "mcdn1";
    } else if (mode46 == 3) {
	modeName = "mcdn2";
    }

    if (beaconMode) {
	request = new XMLHttpRequest();
	request.open("GET",ipv6_base_url+"/uid.php",false);
	request.send(null);
	uid = request.responseText

	request.open("GET",ipv6_base_url+"/sid.php",false);
	request.send(null);
	sid = request.responseText

	request.open("GET",ipv6_base_url+"/ip.php",false);
	request.send(null);
	ipv6 = request.responseText

    	request.open("GET",ipv4_base_url+"/ip.php",false);
	request.send(null);
	ipv4 = request.responseText
    }
    video.addEventListener('ontimeupdate', speedHandler());
}

function urlHandler(url) {
//    console.log("url handler "+url);
    speedHandler();
    if (mode46 == 0) {
	return(url);
    } else if ((mode46 == 1)||(mode46 == 2)||(mode46 == 3)) {
	var result = url.match(/([^\/]+.ts)/);
	if (result) {
	    var file = result[1];
//	    console.log(file+","+started_index);
	    if (mode46 == 1) {
		if ((started_index % 2) == 0) {
		    url2 = ipv4_media_url+file;
		} else {
		    url2 = ipv6_media_url+file;
		}
	    } else if (mode46 == 2) {
//		console.log("started_index:"+started_index);
		if ((started_index < 4) || (downloaded_index < 4)) {
		    if ((started_index % 2) == 0) {
			url2 = ipv4_media_url+file;
		    } else {
			url2 = ipv6_media_url+file;
		    }
		} else if (!checked46) {
		    checked46=1
		    var ave_v4 = parseInt(ave_speed_v4)
		    var ave_v6 = parseInt(ave_speed_v6);

		    var speed_str = "(v6:"+ave_v6+",v4:"+ave_v4+")";
		    if (ave_speed_v4<ave_speed_v6) {
			prefer_v6 = 1;
			hls46addText("IPv6 is faster "+speed_str+" I only use IPv6");
		    } else {
			prefer_v6 = 0;
			hls46addText("IPv6 is slower "+speed_str+" I only use IPv4");
		    }
		    if (prefer_v6) {
			url2 = ipv6_media_url+file;
		    } else {
			url2 = ipv4_media_url+file;
		    }
		} else {
		    if (prefer_v6) {
			url2 = ipv6_media_url+file;
		    } else {
			url2 = ipv4_media_url+file;
		    }
		}
	    } else if (mode46 == 3) {
		if (started_index < 4) {
		    if ((started_index % 2) == 0) {
			url2 = ipv4_media_url+file;
		    } else {
			url2 = ipv6_media_url+file;
		    }
		} else if ((started_index > 3) && (((started_index - 4) % 5) == 0)) {
		    if (ave_speed_v4<ave_speed_v6) {
			console.log("IPv6 is faster, I prefer IPv6 now");
			prefer_v6 = 1;
			hls46addText("IPv6 is faster, I prefer IPv6 now");
		    } else {
			console.log("IPv4 is faster, I prefer IPv4 now");
			prefer_v6 = 0;
			hls46addText("IPv6 is slower, I perfer IPv4 now");
		    }
		    if (prefer_v6) {
			url2 = ipv6_media_url+file;
		    } else {
			url2 = ipv4_media_url+file;
		    }
		} else {
		    if (prefer_v6) {
			url2 = ipv6_media_url+file;
		    } else {
			url2 = ipv4_media_url+file;
		    }
		    hls46addText("");
		}

	    }
	    started_index++;		    
	    return (url2);
	} else {
	    return (url);
	}
    }
}

function speedHandler() {
//    console.log("SpeedHandler");
    var peformance_array = window.performance.getEntriesByType('resource');
    var peformance_length = peformance_array.length;

    if (index_check_prt < peformance_length) {
//	console.log(index_check_prt, peformance_length);
	var prt = peformance_array[index_check_prt];
	dataName = prt.name;
	file = dataName.match(/[^\/]*$/)[0];

	if (prt.transferSize) {
	    transferSize = prt.transferSize;
	} else if (ts_size[file]) {
	    transferSize = ts_size[file];
	} else {
	    //dummy
	    transferSize = -1;
	}
	    
	if (prt.name.match(/ipv4.*\.ts/)) {
	    downloaded_index++;
	    last_speed_v4 = transferSize/prt.duration;
	    speed_v4[index_speed_v4]  = last_speed_v4;
	    ave_speed_v4 = aveSpeed(speed_v4);
	    console.log("ipv4",prt.name,last_speed_v4);

	    if (track) {
		hls46addDebugText(prt.encodedBodySize);
	    }

	    if (cue &&(mode46==0||mode46==1)) {
		hls46addText(makeSpeedText());
	    }
	    index_speed_v4++;
	    if (beaconMode) {
		sendBeacon(downloaded_index,"ipv4",transferSize,last_speed_v4);
	    }
	} else if (prt.name.match(/ipv6.*\.ts/)) {
	    downloaded_index++;
	    last_speed_v6 = transferSize/prt.duration;
	    speed_v6[index_speed_v6] = last_speed_v6;
	    ave_speed_v6 = aveSpeed(speed_v6);
	    console.log("ipv6",prt.name,last_speed_v6);
	    if (cue&&(mode46==0||mode46==1)) {
		hls46addText(makeSpeedText());
	    }
	    index_speed_v6++;
	    if (beaconMode) {
		sendBeacon(downloaded_index,"ipv6",transferSize,last_speed_v6);
	    }
	} else  {
//	    console.log(prt.name);
	}
	index_check_prt++;
    }
}

function makeSpeedText() {
    
    var last_v4 = last_speed_v4;
    var last_v6 = last_speed_v6;
    var ave_v4 = ave_speed_v4;
    var ave_v6 = ave_speed_v6;
    if (last_v4) last_v4 = parseInt(last_v4) ;else last_v4 = "-";
    if (last_v6) last_v6 = parseInt(last_v6) ;else last_v6 = "-";
    if (ave_v4) ave_v4 = parseInt(ave_v4) ;else ave_v4 = "-";
    if (ave_v6) ave_v6 = parseInt(ave_v6) ;else ave_v6 = "-";
    var str = "Chunk:"+downloaded_index+", IPv4: "+last_v4+"KB/s(Ave "+ave_v4+"KB/s), IPv6: "+last_v6+"KB/s(Ave "+ave_v6+"KB/s)";
    return (str);
}

function aveSpeed(speed) {
    var s=0;
    for (i=0;i<speed.length;i++) {
        s+=speed[i];
    }
    return(s/speed.length);
}

function sendBeacon(index,cdnhost,len,speed) {
    var date = new Date();
    date.setTime(date.getTime() + 1000*60*60*9);
    var data = {
        "date": date,
        "mode": modeName,
        "agent": agent,
        "data": dataName,
        "ipv4": ipv4,
        "ipv6": ipv6,
        "uid": uid,
        "sid": sid,
        "index": index,
        "cdn":cdnhost,
        "len":len,
        "speed":speed
    }
    request.open("POST",beacon_url,true);
    request.send(JSON.stringify(data));
}

	
function hls46showText() {
    track = video.addTextTrack("captions","test","en");
    track.mode = "showing";

    if (window.VTTCue) {
	cue = new VTTCue(0,999,"Please play video, you will see download speeds");
	track.addCue(cue);
    }
}

function hls46addText(text) {
    if (!debugMode) {
	track.removeCue(cue);
	cue = new VTTCue(0,999,text);
	track.addCue(cue);
    }
}
function hls46addDebugText(text) {
    if (debugMode) {
	track.removeCue(cue);
	cue = new VTTCue(0,999,text);
	track.addCue(cue);
    }
}
