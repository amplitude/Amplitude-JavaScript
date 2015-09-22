[![Circle CI](https://circleci.com/gh/amplitude/Amplitude-Javascript.svg?style=badge&circle-token=80de0dbb7632b2db13f76ccb20a79bbdfc50c215)](https://circleci.com/gh/amplitude/Amplitude-Javascript)

Amplitude-Javascript
====================

# Setup #
1. If you haven't already, go to http://amplitude.com and register for an account. You will receive an API Key.
2. On every page that uses analytics, paste the following Javascript code between the `<head>` and `</head>` tags:

        <script type="text/javascript">
          (function(e,t){var r=e.amplitude||{};var n=t.createElement("script");n.type="text/javascript";
          n.async=true;n.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.4.1-min.gz.js";
          var s=t.getElementsByTagName("script")[0];s.parentNode.insertBefore(n,s);r._q=[];function a(e){
          r[e]=function(){r._q.push([e].concat(Array.prototype.slice.call(arguments,0)))}}var i=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties"];
          for(var o=0;o<i.length;o++){a(i[o])}e.amplitude=r})(window,document);

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

# Setting Event Properties #

You can attach additional data to any event by passing a Javascript object as the second argument to `logEvent`:

    var eventProperties = {};
    eventProperties.key = "value";
    amplitude.logEvent("EVENT_IDENTIFIER_HERE", eventProperties);

# Setting User Properties #

To add properties that are tracked in every event, you can set properties for a user:

    var userProperties = {};
    userProperties.key = "value";
    amplitude.setUserProperties(userProperties);

# Tracking Revenue #

To track revenue from a user, call

    amplitude.logRevenue(9.99, 1, "product");

The function takes a unit price, a quantity, and a product identifier. Quantity and product identifier are optional parameters.

This allows us to automatically display data relevant to revenue on the Amplitude website, including average revenue per daily active user (ARPDAU), 7, 30, and 90 day revenue, lifetime value (LTV) estimates, and revenue by advertising campaign cohort and daily/weekly/monthly cohorts.

# Opting User Out of Logging #

You can turn off logging for a given user:

    amplitude.setOptOut(true);

No events will be saved or sent to the server while opt out is enabled. The opt out
setting will persist across page loads. Calling

    setOptOut(false)

will reenable logging.

# Configuration Options #

You can configure Amplitude by passing an object as the third argument to the `init`:

    amplitude.init("YOUR_API_KEY_HERE", null, {
      // optional configuration options
      saveEvents: true,
      includeUtm: true,
      includeReferrer: true,
      batchEvents: true,
      eventUploadThreshold: 50
    })

| option | description | default |
|------------|----------------------------------------------------------------------------------|-----------|
| saveEvents | If `true`, saves events to localStorage and removes them upon successful upload.<br><i>NOTE:</i> Without saving events, events may be lost if the user navigates to another page before events are uploaded. | `true` |
| savedMaxCount | Maximum number of events to save in localStorage. If more events are logged while offline, old events are removed. | 1000 |
| uploadBatchSize | Maximum number of events to send to the server per request. | 100 |
| includeUtm | If `true`, finds utm parameters in the query string or the __utmz cookie, parses, and includes them as user propeties on all events uploaded. | `false` |
| includeReferrer | If `true`, includes `referrer` and `referring_domain` as user propeties on all events uploaded. | `false` |
| batchEvents | If `true`, events are batched together and uploaded only when the number of unsent events is greater than or equal to `eventUploadThreshold` or after `eventUploadPeriodMillis` milliseconds have passed since the first unsent event was logged. | `false` |
| eventUploadThreshold | Minimum number of events to batch together per request if `batchEvents` is `true`. | 30 |
| eventUploadPeriodMillis | Amount of time in milliseconds that the SDK waits before uploading events if `batchEvents` is `true`. | 30*1000 |
| deviceId | Custom device ID to set | Randomly generated UUID |


# Advanced #

This SDK automatically grabs useful data about the browser, including browser type and operating system version.

By default, no version name is set. You can specify a version name to distinguish between different versions of your site by calling `setVersionName`:

    amplitude.setVersionName("VERSION_NAME_HERE");

User IDs are automatically generated and stored in cookies if not specified.

Device IDs are generated randomly, although you can define a custom device ID setting it as a configuration option or by calling:

    amplitude.setDeviceId("CUSTOM_DEVICE_ID");

You can pass a callback function to logEvent, which will get called after receiving a response from the server:

    amplitude.logEvent("EVENT_IDENTIFIER_HERE", null, callback_function);

The status and response from the server are passed to the callback function, which you might find useful. An example of a callback function which redirects the browser to another site after a response:

```javascript
  var callback_function = function(status, response) {
    if (status === 200 && response === 'success') {
      // do something here
    }
    window.location.replace('URL_OF_OTHER_SITE');
  };
```

You can also pass a callback function to init, which will get called after the SDK finishes its asynchronous loading. Note: no values are passed to the init callback function:

    amplitude.init("YOUR_API_KEY_HERE", "USER_ID_HERE", null, callback_function);

In the case that `optOut` is true, then no event will be logged, but the callback will be called. In the case that `batchEvents` is true, if the batch requirements `eventUploadThreshold` and `eventUploadPeriodMillis` are not met when `logEvent` is called, then no request is sent, but the callback is still called. In these cases, the callback will be called with an input status of 0 and response 'No request sent'.
