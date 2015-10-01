(function(t,e){var n=t.amplitude||{};var r=e.createElement("script");r.type="text/javascript";
r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.5.0-min.gz.js";
r.onload=function(){t.amplitude.runQueuedFunctions()};var s=e.getElementsByTagName("script")[0];
s.parentNode.insertBefore(r,s);var i=function(){this._q=[];return this};function o(t){
i.prototype[t]=function(){this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
return this}}var a=["add","set","setOnce","unset"];for(var u=0;u<a.length;u++){o(a[u]);
}n.Identify=i;n._q=[];function c(t){n[t]=function(){n._q.push([t].concat(Array.prototype.slice.call(arguments,0)));
}}var l=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify"];
for(var p=0;p<l.length;p++){c(l[p])}t.amplitude=n})(window,document);
