Amplitude-Javascript
====================

# Setup #
1. If you haven't already, go to http://amplitude.com and register for an account. You will receive an API Key.
2. On every page that uses analytics, paste the following Javascript code between the `<head>` and `</head>` tags:

        <script type="text/javascript">
          (function(e,t){var r=e.amplitude||{};var a=t.createElement("script");a.type="text/javascript";
          a.async=true;a.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-1.0-min.js";
          var n=t.getElementsByTagName("script")[0];n.parentNode.insertBefore(a,n);
          r._q=[];function i(e){r[e]=function(){r._q.push([e].concat(Array.prototype.slice.call(arguments,0)))}}
          var s=["init","logEvent","setUserId","setGlobalUserProperties","setVersionName"];
          for(var c=0;c<s.length;c++){i(s[c])}e.amplitude=r})(window,document);

          amplitude.init("YOUR_API_KEY_HERE");
        </script>

3. Replace `YOUR_API_KEY_HERE` with the API Key given to you.
4. To track an event anywhere on the page, call:

        amplitude.logEvent("EVENT_IDENTIFIER_HERE");

5. Events are uploaded immediately and saved to the browser's local storage until the server confirms the upload. After calling logEvent in your app, you will immediately see data appear on Amplitude.

# Tracking Events #

It's important to think about what types of events you care about as a developer. You should aim to track between 5 and 50 types of events on your site. Common event types are actions the user initiates (such as pressing a button) and events you want the user to complete (such as filling out a form, completing a level, or making a payment). Shoot me an email if you want assistance determining what would be best for you to track.

# Settings Custom User IDs #

If your app has its own login system that you want to track users with, you can call `setUserId` at any time:

    amplitude.setUserId("USER_ID_HERE");

A user's data will be merged on the backend so that any events up to that point from the same browser will be tracked under the same user.

You can also add the user ID as an argument to the `init` call:

    amplitude.init("YOUR_API_KEY_HERE", "USER_ID_HERE");

# Setting Custom Properties #

You can attach additional data to any event by passing a Javascript object as the second argument to `logEvent`:

    var customProperties = {};
    customProperties.key = "value";
    amplitude.logEvent("EVENT_IDENTIFIER_HERE", customProperties);

To add properties that are tracked in every event, you can set global properties for a user:

    var globalProperties = {};
    globalProperties.key = "value";
    amplitude.setGlobalUserProperties(globalProperties);

# Advanced #

This SDK automatically grabs useful data about the browser, including browser type and operating system version.

By default, no version name is set. You can specify a version name to distinguish between different versions of your site by calling `setVersionName`:

    amplitude.setVersionName("VERSION_NAME_HERE");

User IDs are automatically generated and stored in cookies if not specified.
