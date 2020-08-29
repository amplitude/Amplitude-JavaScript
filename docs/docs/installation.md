# SDK Installation
You can install the JavaScript SDK using a small snippet of code which you paste on your site to asynchronously load the SDK. Or alternatively you can install the [npm module](https://www.npmjs.com/package/amplitude-js) and embed the SDK directly into your product.

## Installing the Snippet

On every page that you want to install Amplitude analytics, paste the code snippet just before the `</head>` tag. 

```javascript
<script type="text/javascript">
(function(e,t){var n=e.amplitude||{_q:[],_iq:{}};var r=t.createElement("script")
;r.type="text/javascript"
;r.integrity="sha384-+EOJUyXoWkQo2G0XTc+u2DOlZkrMUcc5yOqCuE2XHRnytSyqpFQSbgFZAlGmjpLI"
;r.crossOrigin="anonymous";r.async=true
;r.src="https://cdn.amplitude.com/libs/amplitude-7.1.1-min.gz.js"
;r.onload=function(){if(!e.amplitude.runQueuedFunctions){
console.log("[Amplitude] Error: could not load SDK")}}
;var i=t.getElementsByTagName("script")[0];i.parentNode.insertBefore(r,i)
;function s(e,t){e.prototype[t]=function(){
this._q.push([t].concat(Array.prototype.slice.call(arguments,0)));return this}}
var o=function(){this._q=[];return this}
;var a=["add","append","clearAll","prepend","set","setOnce","unset"]
;for(var c=0;c<a.length;c++){s(o,a[c])}n.Identify=o;var u=function(){this._q=[]
;return this}
;var l=["setProductId","setQuantity","setPrice","setRevenueType","setEventProperties"]
;for(var p=0;p<l.length;p++){s(u,l[p])}n.Revenue=u
;var d=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","enableTracking","setGlobalUserProperties","identify","clearUserProperties","setGroup","logRevenueV2","regenerateDeviceId","groupIdentify","onInit","logEventWithTimestamp","logEventWithGroups","setSessionId","resetSessionId"]
;function v(e){function t(t){e[t]=function(){
e._q.push([t].concat(Array.prototype.slice.call(arguments,0)))}}
for(var n=0;n<d.length;n++){t(d[n])}}v(n);n.getInstance=function(e){
e=(!e||e.length===0?"$default_instance":e).toLowerCase()
;if(!n._iq.hasOwnProperty(e)){n._iq[e]={_q:[]};v(n._iq[e])}return n._iq[e]}
;e.amplitude=n})(window,document);

amplitude.getInstance().init("API_KEY");
</script>
```

Replace API_KEY with the API Key given to you. You can find your project's API Key in your project's [Settings page](https://help.amplitude.com/hc/en-us/articles/360035522372#h_52731f6f-5c45-4c28-b1e1-5c0074f83ee5).

## Installing with npm or yarn

If you are using npm, use the following command:

```javascript
npm install amplitude-js
```

If you are using yarn, use the following command:

```javascript
yarn add amplitude-js
```

You will now be able to import amplitude in your project:

```javascript
const amplitude = require('amplitude-js');
amplitude.getInstance().init("API_KEY");
```

## Debugging Tools

If you develop on chrome, we also recommend you use the <a href="https://chrome.google.com/webstore/detail/amplitude-instrumentation/acehfjhnmhbmgkedjmjlobpgdicnhkbp?hl=en-US" target="_blank">Amplitude Instrumentation Explorer</a> from the Chrome Web Store. It allows you to explore and debug your Amplitude instrumentation as you interact with your site.

## Content Security Policy (CSP)

If your site uses a content security policy you will need to add `api.amplitude.com` to your `connect-src` policy to send data to amplitude:

```javascript
connect-src api.amplitude.com;
```

If you load the SDK using the snippet, you will also need to add `cdn.amplitude.com` to your `script-src` policy to be able to fetch the SDK.

```javascript
script-src cdn.amplitude.com;
```