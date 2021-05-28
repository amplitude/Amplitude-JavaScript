(window.webpackJsonp=window.webpackJsonp||[]).push([[5],{60:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return p})),n.d(t,"rightToc",(function(){return o})),n.d(t,"default",(function(){return d}));var i=n(2),a=n(6),l=(n(0),n(71)),r={},p={unversionedId:"AmplitudeClient",id:"AmplitudeClient",isDocsHomePage:!0,title:"AmplitudeClient",description:"AmplitudeClient()",source:"@site/docs/AmplitudeClient.md",permalink:"/Amplitude-JavaScript/",editUrl:"https://github.com/amplitude/Amplitude-JavaScript/website/docs/AmplitudeClient.md",sidebar:"sidebar",next:{title:"Amplitude",permalink:"/Amplitude-JavaScript/Amplitude"}},o=[{value:"<code>AmplitudeClient()</code>",id:"amplitudeclient",children:[]},{value:"<code>AmplitudeClient()</code>",id:"amplitudeclient-1",children:[{value:"Return Value",id:"return-value",children:[]}]},{value:"<code>AmplitudeClient#__VERSION__</code>",id:"amplitudeclient__version__",children:[{value:"Return Value",id:"return-value-1",children:[]}]},{value:"<code>AmplitudeClient#init</code>",id:"amplitudeclientinit",children:[{value:"Parameters",id:"parameters",children:[]}]},{value:"<code>AmplitudeClient#isNewSession</code>",id:"amplitudeclientisnewsession",children:[{value:"Return Value",id:"return-value-2",children:[]}]},{value:"<code>AmplitudeClient#onInit</code>",id:"amplitudeclientoninit",children:[]},{value:"<code>AmplitudeClient#getSessionId</code>",id:"amplitudeclientgetsessionid",children:[{value:"Return Value",id:"return-value-3",children:[]}]},{value:"<code>AmplitudeClient#setDomain</code>",id:"amplitudeclientsetdomain",children:[{value:"Parameters",id:"parameters-1",children:[]}]},{value:"<code>AmplitudeClient#setUserId</code>",id:"amplitudeclientsetuserid",children:[{value:"Parameters",id:"parameters-2",children:[]}]},{value:"<code>AmplitudeClient#setGroup</code>",id:"amplitudeclientsetgroup",children:[{value:"Parameters",id:"parameters-3",children:[]}]},{value:"<code>AmplitudeClient#setOptOut</code>",id:"amplitudeclientsetoptout",children:[{value:"Parameters",id:"parameters-4",children:[]}]},{value:"<code>AmplitudeClient#setSessionId</code>",id:"amplitudeclientsetsessionid",children:[{value:"Parameters",id:"parameters-5",children:[]}]},{value:"<code>AmplitudeClient#regenerateDeviceId</code>",id:"amplitudeclientregeneratedeviceid",children:[]},{value:"<code>AmplitudeClient#setDeviceId</code>",id:"amplitudeclientsetdeviceid",children:[{value:"Parameters",id:"parameters-6",children:[]}]},{value:"<code>AmplitudeClient#setUserProperties</code>",id:"amplitudeclientsetuserproperties",children:[{value:"Parameters",id:"parameters-7",children:[]}]},{value:"<code>AmplitudeClient#clearUserProperties</code>",id:"amplitudeclientclearuserproperties",children:[]},{value:"<code>AmplitudeClient#setVersionName</code>",id:"amplitudeclientsetversionname",children:[{value:"Parameters",id:"parameters-8",children:[]}]},{value:"<code>AmplitudeClient#logEvent</code>",id:"amplitudeclientlogevent",children:[{value:"Parameters",id:"parameters-9",children:[]}]},{value:"<code>AmplitudeClient#logEventWithTimestamp</code>",id:"amplitudeclientlogeventwithtimestamp",children:[{value:"Parameters",id:"parameters-10",children:[]}]},{value:"<code>AmplitudeClient#logEventWithGroups</code>",id:"amplitudeclientlogeventwithgroups",children:[{value:"Parameters",id:"parameters-11",children:[]}]},{value:"<code>AmplitudeClient#logRevenueV2</code>",id:"amplitudeclientlogrevenuev2",children:[{value:"Parameters",id:"parameters-12",children:[]}]},{value:"<del><code>AmplitudeClient#logRevenue</code></del>",id:"amplitudeclientlogrevenue",children:[{value:"Parameters",id:"parameters-13",children:[]}]},{value:"<del><code>AmplitudeClient#setGlobalUserProperties</code></del>",id:"amplitudeclientsetglobaluserproperties",children:[]},{value:"<code>AmplitudeClient#enableTracking</code>",id:"amplitudeclientenabletracking",children:[]}],c={rightToc:o};function d(e){var t=e.components,n=Object(a.a)(e,["components"]);return Object(l.b)("wrapper",Object(i.a)({},c,n,{components:t,mdxType:"MDXLayout"}),Object(l.b)("h2",{id:"amplitudeclient"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient()")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"var amplitudeClient = new AmplitudeClient();\n")),Object(l.b)("p",null,"AmplitudeClient SDK API - instance constructor.\nThe Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()"),Object(l.b)("h2",{id:"amplitudeclient-1"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient()")),Object(l.b)("p",null,"Clears any stored events and metadata. Storage is then re-created on next event sending."),Object(l.b)("h3",{id:"return-value"},"Return Value"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"(",Object(l.b)("inlineCode",{parentName:"li"},"boolean"),")\nTrue if metadata was cleared, false if none existed")),Object(l.b)("h2",{id:"amplitudeclient__version__"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#__VERSION__")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"var amplitudeVersion = amplitude.__VERSION__;\n")),Object(l.b)("p",null,"Get the current version of Amplitude's Javascript SDK."),Object(l.b)("h3",{id:"return-value-1"},"Return Value"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"(",Object(l.b)("inlineCode",{parentName:"li"},"number"),")\nversion number")),Object(l.b)("h2",{id:"amplitudeclientinit"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#init")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });\n")),Object(l.b)("p",null,"Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.\nThis is required before any other methods can be called."),Object(l.b)("h3",{id:"parameters"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"apiKey")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\nThe API key for your app.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_userId")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\n(optional) An identifier for this user.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_config")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\n(optional) Configuration options.\nSee ",Object(l.b)("a",Object(i.a)({parentName:"p"},{href:"https://amplitude.github.io/Amplitude-JavaScript/Options"}),"options.js")," for a list of options and default values.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_callback")," (",Object(l.b)("inlineCode",{parentName:"p"},"function"),")\n(optional) Provide a callback function to run after initialization is complete."))),Object(l.b)("h2",{id:"amplitudeclientisnewsession"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#isNewSession")),Object(l.b)("p",null,"Returns true if a new session was created during initialization, otherwise false."),Object(l.b)("h3",{id:"return-value-2"},"Return Value"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"(",Object(l.b)("inlineCode",{parentName:"li"},"boolean"),")\nWhether a new session was created during initialization.")),Object(l.b)("h2",{id:"amplitudeclientoninit"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#onInit")),Object(l.b)("p",null,"Add callbacks to call after init. Useful for users who load Amplitude through a snippet."),Object(l.b)("h2",{id:"amplitudeclientgetsessionid"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#getSessionId")),Object(l.b)("p",null,"Returns the id of the current session."),Object(l.b)("h3",{id:"return-value-3"},"Return Value"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},"(",Object(l.b)("inlineCode",{parentName:"li"},"number"),")\nId of the current session.")),Object(l.b)("h2",{id:"amplitudeclientsetdomain"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setDomain")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setDomain('.amplitude.com');\n")),Object(l.b)("p",null,"Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking."),Object(l.b)("h3",{id:"parameters-1"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"domain")," (",Object(l.b)("inlineCode",{parentName:"li"},"string"),")\nto set.")),Object(l.b)("h2",{id:"amplitudeclientsetuserid"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setUserId")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setUserId('joe@gmail.com');\n")),Object(l.b)("p",null,"Sets an identifier for the current user."),Object(l.b)("h3",{id:"parameters-2"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"userId")," (",Object(l.b)("inlineCode",{parentName:"li"},"string"),")\nidentifier to set. Can be null.")),Object(l.b)("h2",{id:"amplitudeclientsetgroup"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setGroup")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.\n")),Object(l.b)("p",null,"Add user to a group or groups. You need to specify a groupType and groupName(s)."),Object(l.b)("p",null,'For example you can group people by their organization.\nIn that case, groupType is "orgId" and groupName would be the actual ID(s).\ngroupName can be a string or an array of strings to indicate a user in multiple gruups.\nYou can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).'),Object(l.b)("p",null,"Note: this will also set groupType: groupName as a user property.\nSee the ",Object(l.b)("a",Object(i.a)({parentName:"p"},{href:"https://developers.amplitude.com/docs/setting-user-groups"}),"advanced topics article")," for more information."),Object(l.b)("h3",{id:"parameters-3"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"groupType")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\nthe group type (ex: orgId)")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"groupName")," (",Object(l.b)("inlineCode",{parentName:"p"},"string|list"),")\nthe name of the group (ex: 15), or a list of names of the groups"))),Object(l.b)("h2",{id:"amplitudeclientsetoptout"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setOptOut")),Object(l.b)("p",null,"Sets whether to opt current user out of tracking."),Object(l.b)("h3",{id:"parameters-4"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"enable")," (",Object(l.b)("inlineCode",{parentName:"li"},"boolean"),")\nif true then no events will be logged or sent.")),Object(l.b)("h2",{id:"amplitudeclientsetsessionid"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setSessionId")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setSessionId(1622158968000);\n")),Object(l.b)("p",null,"Set a custom Session ID for the current session.\nNote: This is not recommended unless you know what you are doing because the Session ID of a session is utilized for all session metrics in Amplitude.\nThe Session ID to set for the current session must be in milliseconds since epoch (Unix Timestamp)."),Object(l.b)("h3",{id:"parameters-5"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"sessionId")," (",Object(l.b)("inlineCode",{parentName:"li"},"int"),")\nto set.")),Object(l.b)("h2",{id:"amplitudeclientregeneratedeviceid"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#regenerateDeviceId")),Object(l.b)("p",null,"Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you\nare doing. This can be used in conjunction with ",Object(l.b)("inlineCode",{parentName:"p"},"setUserId(null)")," to anonymize users after they log out.\nWith a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.\nThis uses src/uuid.js to regenerate the deviceId."),Object(l.b)("h2",{id:"amplitudeclientsetdeviceid"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setDeviceId")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');\n")),Object(l.b)("p",null,"Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing\n(like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique\n(we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system."),Object(l.b)("h3",{id:"parameters-6"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"deviceId")," (",Object(l.b)("inlineCode",{parentName:"li"},"string"),")\ncustom deviceId for current user.")),Object(l.b)("h2",{id:"amplitudeclientsetuserproperties"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setUserProperties")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setUserProperties({'gender': 'female', 'sign_up_complete': true})\n")),Object(l.b)("p",null,"Sets user properties for the current user."),Object(l.b)("h3",{id:"parameters-7"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"userProperties")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\nobject with string keys and values for the user properties to set.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},"`",Object(l.b)("inlineCode",{parentName:"p"}," ("),"boolean`)\nDEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in\nmemory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated."))),Object(l.b)("h2",{id:"amplitudeclientclearuserproperties"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#clearUserProperties")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.clearUserProperties();\n")),Object(l.b)("p",null,"Clear all of the user properties for the current user. Note: clearing user properties is irreversible!"),Object(l.b)("h2",{id:"amplitudeclientsetversionname"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#setVersionName")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.setVersionName('1.12.3');\n")),Object(l.b)("p",null,"Set a versionName for your application."),Object(l.b)("h3",{id:"parameters-8"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"versionName")," (",Object(l.b)("inlineCode",{parentName:"li"},"string"),")\nThe version to set for your application.")),Object(l.b)("h2",{id:"amplitudeclientlogevent"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#logEvent")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});\n")),Object(l.b)("p",null,"Log an event with eventType and eventProperties"),Object(l.b)("h3",{id:"parameters-9"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventType")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\nname of event")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventProperties")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\n(optional) an object with string keys and values for the event properties.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_callback")," (",Object(l.b)("inlineCode",{parentName:"p"},"Amplitude~eventCallback"),")\n(optional) a callback function to run after the event is logged.\nNote: the server response code and response body from the event upload are passed to the callback function."))),Object(l.b)("h2",{id:"amplitudeclientlogeventwithtimestamp"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#logEventWithTimestamp")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});\n")),Object(l.b)("p",null,"Log an event with eventType and eventProperties and a custom timestamp"),Object(l.b)("h3",{id:"parameters-10"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventType")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\nname of event")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventProperties")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\n(optional) an object with string keys and values for the event properties.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"timestamp")," (",Object(l.b)("inlineCode",{parentName:"p"},"number"),")\n(optional) the custom timestamp as milliseconds since epoch.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_callback")," (",Object(l.b)("inlineCode",{parentName:"p"},"Amplitude~eventCallback"),")\n(optional) a callback function to run after the event is logged.\nNote: the server response code and response body from the event upload are passed to the callback function."))),Object(l.b)("h2",{id:"amplitudeclientlogeventwithgroups"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#logEventWithGroups")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.logEventWithGroups('Clicked Button', null, {'orgId': 24});\n")),Object(l.b)("p",null,"Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.\nNote: the group(s) set only apply for the specific event type being logged and does not persist on the user\n(unless you explicitly set it with setGroup)."),Object(l.b)("p",null,"See the ",Object(l.b)("a",Object(i.a)({parentName:"p"},{href:"https://developers.amplitude.com/docs/setting-user-groups"}),"advanced topics article")," for more information.\nabout groups and Count by Distinct on the Amplitude platform."),Object(l.b)("h3",{id:"parameters-11"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventType")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\nname of event")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"eventProperties")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\n(optional) an object with string keys and values for the event properties.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"groups")," (",Object(l.b)("inlineCode",{parentName:"p"},"object"),")\n(optional) an object with string groupType: groupName values for the event being logged.\ngroupName can be a string or an array of strings.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"opt_callback")," (",Object(l.b)("inlineCode",{parentName:"p"},"Amplitude~eventCallback"),")\n(optional) a callback function to run after the event is logged.\nNote: the server response code and response body from the event upload are passed to the callback function."))),Object(l.b)("h2",{id:"amplitudeclientlogrevenuev2"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#logRevenueV2")),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);\namplitude.logRevenueV2(revenue);\n")),Object(l.b)("p",null,"Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like\nrevenueType and event properties."),Object(l.b)("p",null,"See the ",Object(l.b)("a",Object(i.a)({parentName:"p"},{href:"https://amplitude.github.io/Amplitude-JavaScript/Revenue/"}),"Revenue"),"\nreference page for more information on the Revenue interface and logging revenue."),Object(l.b)("h3",{id:"parameters-12"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("inlineCode",{parentName:"li"},"revenue_obj")," (",Object(l.b)("inlineCode",{parentName:"li"},"Revenue"),")\nthe revenue object containing the revenue data being logged.")),Object(l.b)("h2",{id:"amplitudeclientlogrevenue"},Object(l.b)("del",{parentName:"h2"},Object(l.b)("inlineCode",{parentName:"del"},"AmplitudeClient#logRevenue"))),Object(l.b)("pre",null,Object(l.b)("code",Object(i.a)({parentName:"pre"},{}),"amplitudeClient.logRevenue(3.99, 1, 'product_1234');\n")),Object(l.b)("p",null,"Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2"),Object(l.b)("div",{className:"admonition admonition-danger alert alert--danger"},Object(l.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(l.b)("h5",{parentName:"div"},Object(l.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(l.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(l.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"Deprecated")),Object(l.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(l.b)("p",{parentName:"div"},"true"))),Object(l.b)("h3",{id:"parameters-13"},"Parameters"),Object(l.b)("ul",null,Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"price")," (",Object(l.b)("inlineCode",{parentName:"p"},"number"),")\nprice of revenue event")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"quantity")," (",Object(l.b)("inlineCode",{parentName:"p"},"number"),")\n(optional) quantity of products in revenue event. If no quantity specified default to 1.")),Object(l.b)("li",{parentName:"ul"},Object(l.b)("p",{parentName:"li"},Object(l.b)("inlineCode",{parentName:"p"},"product")," (",Object(l.b)("inlineCode",{parentName:"p"},"string"),")\n(optional) product identifier"))),Object(l.b)("h2",{id:"amplitudeclientsetglobaluserproperties"},Object(l.b)("del",{parentName:"h2"},Object(l.b)("inlineCode",{parentName:"del"},"AmplitudeClient#setGlobalUserProperties"))),Object(l.b)("p",null,"Set global user properties. Note this is deprecated, and we recommend using setUserProperties"),Object(l.b)("div",{className:"admonition admonition-danger alert alert--danger"},Object(l.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-heading"}),Object(l.b)("h5",{parentName:"div"},Object(l.b)("span",Object(i.a)({parentName:"h5"},{className:"admonition-icon"}),Object(l.b)("svg",Object(i.a)({parentName:"span"},{xmlns:"http://www.w3.org/2000/svg",width:"12",height:"16",viewBox:"0 0 12 16"}),Object(l.b)("path",Object(i.a)({parentName:"svg"},{fillRule:"evenodd",d:"M5.05.31c.81 2.17.41 3.38-.52 4.31C3.55 5.67 1.98 6.45.9 7.98c-1.45 2.05-1.7 6.53 3.53 7.7-2.2-1.16-2.67-4.52-.3-6.61-.61 2.03.53 3.33 1.94 2.86 1.39-.47 2.3.53 2.27 1.67-.02.78-.31 1.44-1.13 1.81 3.42-.59 4.78-3.42 4.78-5.56 0-2.84-2.53-3.22-1.25-5.61-1.52.13-2.03 1.13-1.89 2.75.09 1.08-1.02 1.8-1.86 1.33-.67-.41-.66-1.19-.06-1.78C8.18 5.31 8.68 2.45 5.05.32L5.03.3l.02.01z"})))),"Deprecated")),Object(l.b)("div",Object(i.a)({parentName:"div"},{className:"admonition-content"}),Object(l.b)("p",{parentName:"div"},"true"))),Object(l.b)("h2",{id:"amplitudeclientenabletracking"},Object(l.b)("inlineCode",{parentName:"h2"},"AmplitudeClient#enableTracking")),Object(l.b)("p",null,"Enable tracking via logging events and dropping a cookie\nIntended to be used with the deferInitialization configuration flag\nThis will drop a cookie and reset initialization deferred"))}d.isMDXComponent=!0}}]);