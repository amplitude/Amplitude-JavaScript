## `AmplitudeClient()`

```
var amplitudeClient = new AmplitudeClient();
```

AmplitudeClient SDK API - instance constructor.
The Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()

## `AmplitudeClient#__VERSION__`

```
var amplitudeVersion = amplitude.__VERSION__;
```

Get the current version of Amplitude's Javascript SDK.

### Return Value

- (`number`)
  version number

## `AmplitudeClient#init`

```
amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
```

Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
This is required before any other methods can be called.

### Parameters

- `apiKey` (`string`)
  The API key for your app.

- `opt_userId` (`string`)
  (optional) An identifier for this user.

- `opt_config` (`object`)
  (optional) Configuration options.
  See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.

- `opt_callback` (`function`)
  (optional) Provide a callback function to run after initialization is complete.

## `AmplitudeClient#isNewSession`

Returns true if a new session was created during initialization, otherwise false.

### Return Value

- (`boolean`)
  Whether a new session was created during initialization.

## `AmplitudeClient#getSessionId`

Returns the id of the current session.

### Return Value

- (`number`)
  Id of the current session.

## `AmplitudeClient#setDomain`

```
amplitudeClient.setDomain('.amplitude.com');
```

Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.

### Parameters

- `domain` (`string`)
  to set.

## `AmplitudeClient#setUserId`

```
amplitudeClient.setUserId('joe@gmail.com');
```

Sets an identifier for the current user.

### Parameters

- `userId` (`string`)
  identifier to set. Can be null.

## `AmplitudeClient#setGroup`

```
amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.
```

Add user to a group or groups. You need to specify a groupType and groupName(s).
For example you can group people by their organization.
In that case groupType is "orgId" and groupName would be the actual ID(s).
groupName can be a string or an array of strings to indicate a user in multiple gruups.
You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
Note: this will also set groupType: groupName as a user property.
See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information.

### Parameters

- `groupType` (`string`)
  the group type (ex: orgId)

- `groupName` (`string`)
  the name of the group (ex: 15), or a list of names of the groups

## `AmplitudeClient#setOptOut`

Sets whether to opt current user out of tracking.

### Parameters

- `enable` (`boolean`)
  if true then no events will be logged or sent.

## `AmplitudeClient#regenerateDeviceId`

Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
This uses src/uuid.js to regenerate the deviceId.

## `AmplitudeClient#setDeviceId`

```
amplitudeClient.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
```

Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
(like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
(we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.

### Parameters

- `deviceId` (`string`)
  custom deviceId for current user.

## `AmplitudeClient#setUserProperties`

```
amplitudeClient.setUserProperties({'gender': 'female', 'sign_up_complete': true})
```

Sets user properties for the current user.

### Parameters

- `userProperties` (`object`)
  object with string keys and values for the user properties to set.

- `` (`boolean`)
  DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
  memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.

## `AmplitudeClient#clearUserProperties`

```
amplitudeClient.clearUserProperties();
```

Clear all of the user properties for the current user. Note: clearing user properties is irreversible!

## `AmplitudeClient#setVersionName`

```
amplitudeClient.setVersionName('1.12.3');
```

Set a versionName for your application.

### Parameters

- `versionName` (`string`)
  The version to set for your application.

## `AmplitudeClient#logEvent`

```
amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
```

Log an event with eventType and eventProperties

### Parameters

- `eventType` (`string`)
  name of event

- `eventProperties` (`object`)
  (optional) an object with string keys and values for the event properties.

- `opt_callback` (`Amplitude~eventCallback`)
  (optional) a callback function to run after the event is logged.
  Note: the server response code and response body from the event upload are passed to the callback function.

## `AmplitudeClient#logEventWithTimestamp`

```
amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
```

Log an event with eventType and eventProperties and a custom timestamp

### Parameters

- `eventType` (`string`)
  name of event

- `eventProperties` (`object`)
  (optional) an object with string keys and values for the event properties.

- `timestamp` (`number`)
  (optional) the custom timestamp as milliseconds since epoch.

- `opt_callback` (`Amplitude~eventCallback`)
  (optional) a callback function to run after the event is logged.
  Note: the server response code and response body from the event upload are passed to the callback function.

## `AmplitudeClient#logEventWithGroups`

```
amplitudeClient.logEventWithGroups('Clicked Button', null, {'orgId': 24});
```

Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
(unless you explicitly set it with setGroup).
See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information
about groups and Count by Distinct on the Amplitude platform.

### Parameters

- `eventType` (`string`)
  name of event

- `eventProperties` (`object`)
  (optional) an object with string keys and values for the event properties.

- `groups` (`object`)
  (optional) an object with string groupType: groupName values for the event being logged.
  groupName can be a string or an array of strings.

- `opt_callback` (`Amplitude~eventCallback`)
  (optional) a callback function to run after the event is logged.
  Note: the server response code and response body from the event upload are passed to the callback function.

## `AmplitudeClient#logRevenueV2`

```
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
amplitude.logRevenueV2(revenue);
```

Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
revenueType and event properties.
See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue}
for more information on the Revenue interface and logging revenue.

### Parameters

- `revenue_obj` (`Revenue`)
  the revenue object containing the revenue data being logged.

## `AmplitudeClient#logRevenue`

```
amplitudeClient.logRevenue(3.99, 1, 'product_1234');
```

Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2

### Parameters

- `price` (`number`)
  price of revenue event

- `quantity` (`number`)
  (optional) quantity of products in revenue event. If no quantity specified default to 1.

- `product` (`string`)
  (optional) product identifier

## `AmplitudeClient#setGlobalUserProperties`

Set global user properties. Note this is deprecated, and we recommend using setUserProperties

## `AmplitudeClient#enableTracking`

Enable tracking via logging events and dropping a cookie
Intended to be used with the deferInitialization configuration flag
This will drop a cookie and reset initialization deferred
