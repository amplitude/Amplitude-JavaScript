[![Circle CI](https://circleci.com/gh/amplitude/Amplitude-Javascript.svg?style=badge&circle-token=80de0dbb7632b2db13f76ccb20a79bbdfc50c215)](https://circleci.com/gh/amplitude/Amplitude-Javascript)

Amplitude-Javascript
====================

# Setup #
1. If you haven't already, go to http://amplitude.com and register for an account. You will receive an API Key.
2. On every page that uses analytics, paste the following Javascript code between the `<head>` and `</head>` tags:

```
<script type="text/javascript">
  (function(e,t){var n=e.amplitude||{};var r=t.createElement("script");r.type="text/javascript";
  r.async=true;r.src="https://d24n15hnbwhuhn.cloudfront.net/libs/amplitude-2.9.0-min.gz.js";
  r.onload=function(){e.amplitude.runQueuedFunctions()};var s=t.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(r,s);var i=function(){this._q=[];return this};function a(e){
  i.prototype[e]=function(){this._q.push([e].concat(Array.prototype.slice.call(arguments,0)));
  return this}}var o=["add","append","clearAll","set","setOnce","unset"];for(var c=0;c<o.length;c++){
  a(o[c])}n.Identify=i;n._q=[];function u(e){n[e]=function(){n._q.push([e].concat(Array.prototype.slice.call(arguments,0)));
  }}var l=["init","logEvent","logRevenue","setUserId","setUserProperties","setOptOut","setVersionName","setDomain","setDeviceId","setGlobalUserProperties","identify","clearUserProperties"];
  for(var p=0;p<l.length;p++){u(l[p])}e.amplitude=n})(window,document);

  amplitude.init("YOUR_API_KEY_HERE");
</script>
```

3. Replace `YOUR_API_KEY_HERE` with the API Key given to you.
4. To track an event anywhere on the page, call:

```javascript
amplitude.logEvent('EVENT_IDENTIFIER_HERE');
```

5. Events are uploaded immediately and saved to the browser's local storage until the server confirms the upload. After calling logEvent in your app, you will immediately see data appear on Amplitude.

# Tracking Events #

It's important to think about what types of events you care about as a developer. You should aim to track between 5 and 50 types of events on your site. Common event types are actions the user initiates (such as pressing a button) and events you want the user to complete (such as filling out a form, completing a level, or making a payment). Shoot me an email if you want assistance determining what would be best for you to track.

# Settings Custom User IDs #

If your app has its own login system that you want to track users with, you can call `setUserId` at any time:

```javascript
amplitude.setUserId('USER_ID_HERE');
```

A user's data will be merged on the backend so that any events up to that point from the same browser will be tracked under the same user. Note: if a user logs out, or you want to log the events under an anonymous user, you may set the userId to `null` like so:

```javascript
amplitude.setUserId(null); // not string 'null'
```

You can also add the user ID as an argument to the `init` call:

```javascript
amplitude.init('YOUR_API_KEY_HERE', 'USER_ID_HERE');
```

# Setting Event Properties #

You can attach additional data to any event by passing a Javascript object as the second argument to `logEvent`:

```javascript
var eventProperties = {};
eventProperties.key = 'value';
amplitude.logEvent('EVENT_IDENTIFIER_HERE', eventProperties);
```

# User Properties and User Property Operations #

The SDK supports the operations `set`, `setOnce`, `unset`, and `add` on individual user properties. The operations are declared via a provided `Identify` interface. Multiple operations can be chained together in a single `Identify` object. The `Identify` object is then passed to the Amplitude client to send to the server. The results of the operations will be visible immediately in the dashboard, and take effect for events logged after.

1. `set`: this sets the value of a user property.

    ```javascript
    var identify = new amplitude.Identify().set('gender', 'female').set('age', 20);
    amplitude.identify(identify);
    ```

2. `setOnce`: this sets the value of a user property only once. Subsequent `setOnce` operations on that user property will be ignored. In the following example, `sign_up_date` will be set once to `08/24/2015`, and the following setOnce to `09/14/2015` will be ignored:

    ```javascript
    var identify = new amplitude.Identify().setOnce('sign_up_date', '08/24/2015');
    amplitude.identify(identify);

    var identify = new amplitude.Identify().setOnce('sign_up_date', '09/14/2015');
    amplitude.identify(identify);
    ```

3. `unset`: this will unset and remove a user property.

    ```javascript
    var identify = new amplitude.Identify().unset('gender').unset('age');
    amplitude.identify(identify);
    ```

4. `add`: this will increment a user property by some numerical value. If the user property does not have a value set yet, it will be initialized to 0 before being incremented.

    ```javascript
    var identify = new amplitude.Identify().add('karma', 1).add('friends', 1);
    amplitude.identify(identify);
    ```

5. `append`: this will append a value or values to a user property. If the user property does not have a value set yet, it will be initialized to an empty list before the new values are appended. If the user property has an existing value and it is not a list, it will be converted into a list with the new value appended.

    ```javascript
    var identify = new amplitude.Identify().append('ab-tests', 'new-user-test').append('some_list', [1, 2, 3, 4, 'values']);
    amplitude.identify(identify);
    ```

Note: if a user property is used in multiple operations on the same `Identify` object, only the first operation will be saved, and the rest will be ignored. In this example, only the set operation will be saved, and the add and unset will be ignored:

```javascript
var identify = new amplitude.Identify()
    .set('karma', 10)
    .add('karma', 1)
    .unset('karma');
amplitude.identify(identify);
```

### Arrays in User Properties ###

The SDK supports arrays in user properties. Any of the user property operations above (with the exception of `add`) can accept a Javascript array. You can directly `set` arrays, or use `append` to generate an array.

```javascript
var identify = new amplitude.Identify()
    .set('colors', ['rose', 'gold'])
    .append('ab-tests', 'campaign_a')
    .append('existing_list', [4, 5]);
amplitude.identify(identify);
```

### Setting Multiple Properties with `setUserProperties` ###

You may use `setUserProperties` shorthand to set multiple user properties at once. This method is simply a wrapper around `Identify.set` and `identify`.

```javascript
var userProperties = {
    gender: 'female',
    age: 20
};
amplitude.setUserProperties(userProperties);
```

### Clearing User Properties ###

You may use `clearUserProperties` to clear all user properties at once. Note: the result is irreversible!

```javascript
amplitude.clearUserProperties();
```

# Tracking Revenue #

To track revenue from a user, call

```javascript
amplitude.logRevenue(9.99, 1, 'product');
```

The function takes a unit price, a quantity, and a product identifier. Quantity and product identifier are optional parameters.

This allows us to automatically display data relevant to revenue on the Amplitude website, including average revenue per daily active user (ARPDAU), 7, 30, and 90 day revenue, lifetime value (LTV) estimates, and revenue by advertising campaign cohort and daily/weekly/monthly cohorts.

# Opting User Out of Logging #

You can turn off logging for a given user:

```javascript
amplitude.setOptOut(true);
```

No events will be saved or sent to the server while opt out is enabled. The opt out
setting will persist across page loads. Calling

```javascript
amplitude.setOptOut(false);
```

will reenable logging.

# Configuration Options #

You can configure Amplitude by passing an object as the third argument to the `init`:

```javascript
amplitude.init('YOUR_API_KEY_HERE', null, {
    // optional configuration options
    saveEvents: true,
    includeUtm: true,
    includeReferrer: true,
    batchEvents: true,
    eventUploadThreshold: 50
});
```

| option | description | default |
|------------|----------------------------------------------------------------------------------|-----------|
| saveEvents | If `true`, saves events to localStorage and removes them upon successful upload.<br><i>NOTE:</i> Without saving events, events may be lost if the user navigates to another page before events are uploaded. | `true` |
| savedMaxCount | Maximum number of events to save in localStorage. If more events are logged while offline, old events are removed. | 1000 |
| uploadBatchSize | Maximum number of events to send to the server per request. | 100 |
| includeUtm | If `true`, finds utm parameters in the query string or the __utmz cookie, parses, and includes them as user propeties on all events uploaded. | `false` |
| includeReferrer | If `true`, captures the `referrer` and `referring_domain` for each session, as well as the user's `initial_referrer` and `initial_referring_domain` via a set once operation. | `false` |
| batchEvents | If `true`, events are batched together and uploaded only when the number of unsent events is greater than or equal to `eventUploadThreshold` or after `eventUploadPeriodMillis` milliseconds have passed since the first unsent event was logged. | `false` |
| eventUploadThreshold | Minimum number of events to batch together per request if `batchEvents` is `true`. | 30 |
| eventUploadPeriodMillis | Amount of time in milliseconds that the SDK waits before uploading events if `batchEvents` is `true`. | 30\*1000 (30 sec) |
| deviceId | Custom device ID to set | Randomly generated UUID |
| sessionTimeout | Time between logged events before a new session starts in milliseconds | 30\*60\*1000 (30 min) |


# Advanced #
This SDK automatically grabs useful data about the browser, including browser type and operating system version.

### Setting Version Name ###
By default, no version name is set. You can specify a version name to distinguish between different versions of your site by calling `setVersionName`:

```javascript
amplitude.setVersionName('VERSION_NAME_HERE');
```

### Custom Device Ids ###
Device IDs are generated randomly, although you can define a custom device ID setting it as a configuration option or by calling:

```javascript
amplitude.setDeviceId('CUSTOM_DEVICE_ID');
```

**Note: this is not recommended unless you really know what you are doing** (like if you have your own system for tracking user devices). Make sure the deviceId you set is sufficiently unique (we recommend something like a UUID - see `src/uuid.js` for an example of how to generate) to prevent conflicts with other devices in our system.

### Log Event Callbacks and Redirects ###
You can pass a callback function to logEvent, which will get called after receiving a response from the server:

```javascript
amplitude.logEvent("EVENT_IDENTIFIER_HERE", null, callback_function);
```

The status and response from the server are passed to the callback function, which you might find useful. An example of a callback function which redirects the browser to another site after a response:

```javascript
var callback_function = function(status, response) {
    if (status === 200 && response === 'success') {
        // do something here
    }
    window.location.replace('URL_OF_OTHER_SITE');
};
```

You can also use this to track outbound links on your website. For example you would have a link like this:

```html
<a href="javascript:trackClickLinkA();">Link A</a>
```

And then you would define a function that is called when the link is clicked like this:

```javascript
var trackClickLinkA = function() {
    amplitude.logEvent('Clicked Link A', null, function() {
        window.location='LINK_A_URL';
    });
};
```

### Init Callbacks ###
You can also pass a callback function to init, which will get called after the SDK finishes its asynchronous loading. *Note: no values are passed to the init callback function*:

```javascript
amplitude.init('YOUR_API_KEY_HERE', 'USER_ID_HERE', null, callback_function);
```

In the case that `optOut` is true, then no event will be logged, but the callback will be called. In the case that `batchEvents` is true, if the batch requirements `eventUploadThreshold` and `eventUploadPeriodMillis` are not met when `logEvent` is called, then no request is sent, but the callback is still called. In these cases, the callback will be called with an input status of 0 and response 'No request sent'.
