// select video element
var vid = document.getElementById('myVideo');
//var vid = $('#v0')[0]; // jquery option

// pause video on load
//vid.pause();
 
// pause video on document scroll (stops autoplay once scroll started)
window.onscroll = function(){
    vid.pause();
};

// refresh video frames on interval for smoother playback
setInterval(function(){
	var mult = 70;
    vid.currentTime = window.pageYOffset*mult || document.documentElement.scrollTop*mult || document.body.scrollTop*mult || 0;
}, 40);