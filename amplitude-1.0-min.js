(function(e,t){var r=function(e){console.log("[Amplitude] "+e)};var n=Array.isArray||function(e){return toString.call(e)==="[object Array]"};var i=function(e){var t=[];for(var r in e){var i=e[r];if(n(i)){for(var o=0;o<i.length;o++){t.push(encodeURIComponent(r)+"="+encodeURIComponent(i[o]))}}else{t.push(encodeURIComponent(r)+"="+encodeURIComponent(i))}}return t.join("&")};var o=function(){var e=[];for(var t=0;t<32;t++){e[t]=Math.floor(Math.random()*16).toString(16)}var r=e.join("");return r};var a;if(e.localStorage){a=e.localStorage}else if(e.globalStorage){try{a=e.globalStorage[e.location.hostname]}catch(s){}}else{var d=t.createElement("div"),c="localStorage";d.style.display="none";t.getElementsByTagName("head")[0].appendChild(d);if(d.addBehavior){d.addBehavior("#default#userdata");a={length:0,setItem:function(e,t){d.load(c);if(!d.getAttribute(e)){this.length++}d.setAttribute(e,t);d.save(c)},getItem:function(e){d.load(c);return d.getAttribute(e)},removeItem:function(e){d.load(c);if(d.getAttribute(e)){this.length--}d.removeAttribute(e);d.save(c)},clear:function(){d.load(c);var e=0;var t;while(t=d.XMLDocument.documentElement.attributes[e++]){d.removeAttribute(t.name)}d.save(c);this.length=0},key:function(e){d.load(c);return d.XMLDocument.documentElement.attributes[e]}};d.load(c);a.length=d.XMLDocument.documentElement.attributes.length}else{}}if(!a){a={length:0,setItem:function(e,t){},getItem:function(e){},removeItem:function(e){},clear:function(){},key:function(e){}}}var l={encode:function(e){e=e.replace(/\r\n/g,"\n");var t="";for(var r=0;r<e.length;r++){var n=e.charCodeAt(r);if(n<128){t+=String.fromCharCode(n)}else if(n>127&&n<2048){t+=String.fromCharCode(n>>6|192);t+=String.fromCharCode(n&63|128)}else{t+=String.fromCharCode(n>>12|224);t+=String.fromCharCode(n>>6&63|128);t+=String.fromCharCode(n&63|128)}}return t},decode:function(e){var t="";var r=0;var n=0,i=0,o=0;while(r<e.length){n=e.charCodeAt(r);if(n<128){t+=String.fromCharCode(n);r++}else if(n>191&&n<224){i=e.charCodeAt(r+1);t+=String.fromCharCode((n&31)<<6|i&63);r+=2}else{i=e.charCodeAt(r+1);o=e.charCodeAt(r+2);t+=String.fromCharCode((n&15)<<12|(i&63)<<6|o&63);r+=3}}return t}};var u={_keyStr:"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",encode:function(e){var t="";var r,n,i,o,a,s,d;var c=0;e=l.encode(e);while(c<e.length){r=e.charCodeAt(c++);n=e.charCodeAt(c++);i=e.charCodeAt(c++);o=r>>2;a=(r&3)<<4|n>>4;s=(n&15)<<2|i>>6;d=i&63;if(isNaN(n)){s=d=64}else if(isNaN(i)){d=64}t=t+u._keyStr.charAt(o)+u._keyStr.charAt(a)+u._keyStr.charAt(s)+u._keyStr.charAt(d)}return t},decode:function(e){var t="";var r,n,i;var o,a,s,d;var c=0;e=e.replace(/[^A-Za-z0-9\+\/\=]/g,"");while(c<e.length){o=u._keyStr.indexOf(e.charAt(c++));a=u._keyStr.indexOf(e.charAt(c++));s=u._keyStr.indexOf(e.charAt(c++));d=u._keyStr.indexOf(e.charAt(c++));r=o<<2|a>>4;n=(a&15)<<4|s>>2;i=(s&3)<<6|d;t=t+String.fromCharCode(r);if(s!=64){t=t+String.fromCharCode(n)}if(d!=64){t=t+String.fromCharCode(i)}}t=l.decode(t);return t}};var h={compress:function(e){var t,r,n;var i={},o="",a=[],s=256;e=l.encode(e);for(t=0;t<s;t+=1){i[String.fromCharCode(t)]=t}for(t=0;t<e.length;t+=1){r=e.charAt(t);n=o+r;if(i.hasOwnProperty(n)){o=n}else{a.push(String.fromCharCode(i[o]));i[n]=s++;o=String(r)}}if(o!==""){a.push(String.fromCharCode(i[o]))}return a.join("")},decompress:function(e){var t,r,n,i;var o=[],a="",s=256;for(t=0;t<s;t+=1){o[t]=String.fromCharCode(t)}r=e.charAt(0);n=r;for(t=1;t<e.length;t+=1){i=e.charCodeAt(t);if(o[i]){a=o[i]}else{if(i===s){a=r+r.charAt(0)}else{return null}}n+=a;o[s++]=r+a.charAt(0);r=a}n=l.decode(n);return n}};var g=navigator.userAgent;var v=navigator.vendor;var f=navigator.platform;var p={init:function(){this.browser=this.searchString(this.dataBrowser)||null;this.version=this.searchVersion(navigator.userAgent)||this.searchVersion(navigator.appVersion)||null;this.OS=this.searchString(this.dataOS)||null},searchString:function(e){for(var t=0;t<e.length;t++){var r=e[t].string;var n=e[t].prop;this.versionSearchString=e[t].versionSearch||e[t].identity;if(r){if(r.indexOf(e[t].subString)!=-1){return e[t].identity}}else if(n){return e[t].identity}}},searchVersion:function(e){var t=e.indexOf(this.versionSearchString);if(t==-1){return}return parseFloat(e.substring(t+this.versionSearchString.length+1))},dataBrowser:[{string:g,subString:"Chrome",identity:"Chrome"},{string:g,subString:"OmniWeb",versionSearch:"OmniWeb/",identity:"OmniWeb"},{string:v,subString:"Apple",identity:"Safari",versionSearch:"Version"},{prop:e.opera,identity:"Opera",versionSearch:"Version"},{string:v,subString:"iCab",identity:"iCab"},{string:v,subString:"KDE",identity:"Konqueror"},{string:g,subString:"Firefox",identity:"Firefox"},{string:v,subString:"Camino",identity:"Camino"},{string:g,subString:"Netscape",identity:"Netscape"},{string:g,subString:"MSIE",identity:"Explorer",versionSearch:"MSIE"},{string:g,subString:"Gecko",identity:"Mozilla",versionSearch:"rv"},{string:g,subString:"Mozilla",identity:"Netscape",versionSearch:"Mozilla"}],dataOS:[{string:f,subString:"Win",identity:"Windows"},{string:f,subString:"Mac",identity:"Mac"},{string:g,subString:"iPhone",identity:"iPhone/iPod"},{string:g,subString:"Android",identity:"Android"},{string:f,subString:"Linux",identity:"Linux"}]};p.init();var m=function(e,t){this.url=e;this.data=t||{}};m.prototype.send=function(e){var t=new XMLHttpRequest;t.open("POST",this.url,true);t.onreadystatechange=function(){if(t.readyState==4){e(t.status,t.responseText)}};t.setRequestHeader("Content-Type","application/x-www-form-urlencoded; charset=UTF-8");t.send(i(this.data))};var S={get:function(e){var r=e+"=";var n=t.cookie.split(";");for(var i=0;i<n.length;i++){var o=n[i];while(o.charAt(0)==" "){o=o.substring(1,o.length)}if(o.indexOf(r)==0){return o.substring(r.length,o.length)}}return null},set:function(e,r,n){if(n){var i=new Date;i.setTime(i.getTime()+n*24*60*60*1e3);var o="; expires="+i.toGMTString()}else{var o=""}t.cookie=e+"="+r+o+"; path=/"},remove:function(e){S.set(e,"",-1)}};var y=function(){};var C={apiEndpoint:"api.amplitude.com",cookieName:"amplitude_id",cookieExpiration:365*10,unsentKey:"amplitude_unsent"};var b=0;var A=[];var I=false;var _=function(){b++;return b};y.prototype.init=function(e,t){this.options=C;C.apiKey=e;var r=S.get(C.cookieName);var n=null;if(r){try{n=JSON.parse(h.decompress(u.decode(r)));if(n){if(n.deviceId){C.deviceId=n.deviceId}if(n.userId){C.userId=n.userId}if(n.globalUserProperties){C.globalUserProperties=n.globalUserProperties}}}catch(i){}}C.deviceId=C.deviceId||o();C.userId=t!==undefined&&t!==null&&t||C.userId||null;O();b=0;var s=a.getItem(C.unsentKey);A=s&&JSON.parse(h.decompress(u.decode(s)))||[];if(A.length>0){this.sendEvents()}};var O=function(){S.set(C.cookieName,u.encode(h.compress(JSON.stringify({deviceId:C.deviceId,userId:C.userId,globalUserProperties:C.globalUserProperties}))),C.cookieExpiration)};y.prototype.setUserId=function(e){C.userId=e!==undefined&&e!==null&&""+e||null;O()};y.prototype.setGlobalUserProperties=function(e){C.globalUserProperties=e;O()};y.prototype.setVersionName=function(e){C.versionName=e};y.prototype.logEvent=function(e,t){var r=(new Date).getTime();t=t||{};var n={device_id:C.deviceId,user_id:C.userId||C.deviceId,timestamp:r,event_id:_(),session_id:-1,event_type:e,client:p.browser,version_code:0,version_name:C.versionName||null,build_version_sdk:0,build_version_release:p.version,phone_model:p.OS,custom_properties:t,global_properties:C.globalUserProperties||{}};A.push(n);a.setItem(C.unsentKey,u.encode(h.compress(JSON.stringify(A))));this.sendEvents()};y.prototype.sendEvents=function(){if(!I){I=true;var t=("https:"==e.location.protocol?"https":"http")+"://"+C.apiEndpoint+"/";var r={client:C.apiKey,e:JSON.stringify(A)};var n=A.length;var i=this;new m(t,r).send(function(e,t){I=false;try{if(e==200&&JSON.parse(t).added==n){A.splice(0,n);a.setItem(C.unsentKey,u.encode(h.compress(JSON.stringify(A))));if(A.length>0){i.sendEvents()}}}catch(r){}})}};var k=e.amplitude||{};var w=k._q||[];var N=new y;e.amplitude=N;e.Base64=u;e.Cookie=S;e.LZW=h;for(var E=0;E<w.length;E++){var x=N[w[E][0]];x&&x.apply(N,w[E].slice(1))}})(window,document);