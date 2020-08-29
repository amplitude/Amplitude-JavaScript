This article describes all the available SDK methods for Amplitude's [JavaScript SDK](https://github.com/amplitude/Amplitude-Javascript). The variables and values in <span class="wysiwyg-color-red">red</span> are what you will need to replace with your own. Please see the [JavaScript SDK Installation](/docs/javascript) documentation for instructions on how to install the SDK.

## Class: Amplitude

Most of the methods in this class have been deprecated, and this class is just a wrapper that manages multiple `amplitude-client` instances for you. SDK methods are called by first fetching an instance and then calling the appropriate `amplitude-client` method (e.g. `amplitude.getInstance().logEvent("<span class="wysiwyg-color-red">EVENT_TYPE</span>");`). More information about instances and logging events to multiple Amplitude API keys can be found [here](https://developers.amplitude.com/docs/tracking-events#logging-events-to-multiple-projects). More information about this class can be found [here](https://github.com/amplitude/Amplitude-Javascript/).

### Type Definitions

<pre>eventCallback(responseCode, responseBody)</pre>

This is the callback for `logEvent` and `identify` calls. It gets called after the event/`identify` call is uploaded, and the server response code and response body from the upload request are passed to the callback function.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`responseCode`|_number_|The server response code for the event/`identify` upload request.|
|`responseBody`|_string_|The server response body for the event/`identify` upload request.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

* * *

## Class: AmplitudeClient

### AmplitudeClient

AmplitudeClient SDK API - instance constructor. The Amplitude class handles creation of client instances. All you need to do is call `amplitude.getInstance()`.

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>var <span class="wysiwyg-color-red">amplitudeClient</span> = new AmplitudeClient();</pre>

### Members

The example shows how to get the current version of Amplitude's JavaScript SDK.

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>var <span class="wysiwyg-color-red">amplitudeVersion</span> = amplitude.__VERSION__;</pre>

### Methods 

**1\. `clearUserProperties()`**

Clear all of the user properties for the current user. This will wipe all of the user's user properties and reset them.

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">
<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">Clearing user properties is irreversible! Amplitude will not be able to sync the user's user property values before the wipe to any future events that the user triggers as they will have been reset.</span>

</div>

</div>

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example: **

<pre>amplitudeClient.clearUserProperties();</pre>

**2\. `getSessionId()`**

Returns the ID of the current session.

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Returns: **ID of the current session of type number. 

**3\. `identify(identify_obj, opt_callback)`**

Send an `identify` call containing user property operations to Amplitude servers. See the [JavaScript SDK Installation](/docs/setting-user-properties) documentation for more information. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`identify_obj` **(required)**|[_Identify_](/docs/javascript-sdk-reference#class-identify)|The Identify object containing the user property operations to send.|
|`opt_callback` (optional)|[_Amplitude~eventCallback_](/docs/javascript-sdk-reference#type-definitions)|Callback function to run when the `identify` event has been sent. _Note: The server response code and response body from the `identify` event upload are passed to the callback function. _|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre><span class="kwd">var</span> <span class="pln wysiwyg-color-red">identify</span> <span class="pun">=</span> <span class="kwd">new</span> <span class="pln">amplitude</span><span class="pun">.</span><span class="typ">Identify</span><span class="pun">().</span><span class="kwd">set</span><span class="pun">(</span><span class="str">'<span class="wysiwyg-color-red">colors</span>'</span><span class="pun">,</span> <span class="pun">[</span><span class="str">'<span class="wysiwyg-color-red">rose</span>'</span><span class="pun">,</span> <span class="str">'<span class="wysiwyg-color-red">gold</span>'</span><span class="pun">]).</span><span class="pln">add</span><span class="pun">(</span><span class="str">'<span class="wysiwyg-color-red">karma</span>'</span><span class="pun">,</span> <span class="lit wysiwyg-color-red">1</span><span class="pun">).</span><span class="pln">setOnce</span><span class="pun">(</span><span class="str">'<span class="wysiwyg-color-red">sign_up_date</span>'</span><span class="pun">,</span> <span class="str">'<span class="wysiwyg-color-red">2016-03-31</span>'</span><span class="pun">);</span> <span class="pln">amplitude</span><span class="pun">.</span><span class="pln">identify</span><span class="pun">(</span><span class="pln wysiwyg-color-red">identify</span><span class="pun">);</span></pre>

**4\. `init(apiKey, opt_userId, opt_config, opt_callback)`**

Initializes the Amplitude JavaScript SDK with your `apiKey` and any optional configurations. This is required before any other methods can be called.

**Parameters:**

<table class="table param-table wysiwyg-text-align-justify" style="width:719.991px" border="1" cellpadding="5" align="center">

|Name|Type|Description|
|--|--|--|
|`apiKey` **(required)**|_string_|The API Key for your project.|
|`opt_userId` (optional)|_string_|An identifier for this user.|
|`opt_config` (optional)|_object_|Configuration options. See the [JavaScript SDK documentation](/hc/en-us/articles/115001361248#settings-configuration-options) for a list of options and the default values.|
|`opt_callback` (optional)|_function_|Provide a callback function to run after initialization is complete.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

    amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete');});

**5\. `onInit(callback)`**

Allows for a callback to be called immediately after init before any queued up events are logged. This is useful for sending identify calls from integrations before any events that your application logs.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`callback` **(required)**|_function_|The callback to be invoked after init.|

**6\. `isNewSession()`**

Returns true if a new session was created during initialization, otherwise false.

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Returns: **Whether a new session was created during initialization as type boolean. 

**7\. `logEvent(eventType, eventProperties, opt_callback)`**

Log an event with `eventType` and `eventProperties`. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`eventType` **(required)**|_string_|The name of the event.|
|`eventProperties` (optional)|_object_|An object with string keys and values for the event properties.|
|`opt_callback` (optional)|[_Amplitude~eventCallback_](/docs/javascript-sdk-reference#type-definitions)|A callback function to run after the event is logged. _Note: The server response code and response body from the event upload are passed to the callback function._|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

    amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});

**8\. `logEventWithTimestamp(eventType, eventProperties, timestamp, opt_callback)`**

Log an event with `eventType`, `eventProperties`, and a custom timestamp. 

**Parameters:**

<table class="table param-table wysiwyg-text-align-justify" style="width:719.991px" border="1" cellpadding="5" align="center">

|Name|Type|Description|
|--|--|--|
|`eventType` **(required)**|_string_|The name of the event.|
|`eventProperties` (optional)|_object_|An object with string keys and values for the event properties.|
|`timestamp` (optional)|_number_|The custom timestamp as milliseconds since epoch.|
|`opt_callback` (optional)|[_Amplitude~eventCallback_](/hc/en-us/articles/115002889587#type-definitions)|A callback function to run after the event is logged. _Note: The server response code and response body from the event upload are passed to the callback function._|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.logEventWithTimestamp('<span class="wysiwyg-color-red">Clicked Homepage Button</span>', {'<span class="wysiwyg-color-red">finished_flow</span>': <span class="wysiwyg-color-red">false</span>, '<span class="wysiwyg-color-red">clicks</span>': <span class="wysiwyg-color-red">15</span>}, 1545041372000);</pre>

**9\. `logRevenueV2(revenue_obj)`**

Log revenue with the revenue interface. The new revenue interface allows for more revenue fields like 'revenueType' and event properties. See the [SDK documentation](/hc/en-us/articles/115001361248#tracking-revenue) for more information on the Revenue interface and logging revenue. 

|Name|Type|Description|
|--|--|--|
|`revenue_obj`|[_Revenue_](/hc/en-us/articles/115002889587#class-revenue)|The revenue object containing the revenue data being logged.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example: **

<pre>var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue().setProductId('<span class="wysiwyg-color-red">productIdentifier</span>').setPrice(<span class="wysiwyg-color-red">10.99</span>);  
amplitude.logRevenueV2(<span class="wysiwyg-color-red">revenue</span>);</pre>

**10\. `regenerateDeviceId()`**

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">Using this is not recommended unless you 100% sure of what you are doing</span>

</div>

</div>

Regenerates a new random `deviceId` for the current user. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out. The current user would appear as a brand new user in Amplitude if they have a null `userId` and a completely new `deviceId`. This uses [src/uuid.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/uuid.js) to regenerate the `deviceId`. 

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**11\. `setDeviceId(deviceId)`**

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">Using this is not recommended unless you 100% sure of what you are doing (e.g. you have your own system for managing _deviceIds_</span>

</div>

</div>

Sets a custom `deviceId` for the current user. Make sure the `deviceId` you set is sufficiently unique (we recommend something like a UUID - see [src/uuid.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/uuid.js) for an example of how to generate) to prevent conflicts with other devices in our system.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`deviceId`|_string_|Custom `deviceId` for the current user.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setDeviceId('<span class="wysiwyg-color-red">45f0954f-eb79-4463-ac8a-233a6f45a8f0</span>');</pre>

**12\. `setDomain(domain)`**

Sets a custom domain for the Amplitude cookie. This is useful if you want to support cross-subdomain tracking.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`domain`|_string_|The custom domain to set.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setDomain('<span class="wysiwyg-color-red">.amplitude.com</span>');</pre>

**13\. `setGroup(groupType, groupName)`**

Add a user to a group or groups. You will need to specify a `groupType` and `groupName`(s). For example, you can group people by their organization, in which case their `groupType` could be 'orgId' and their `groupName` would be the actual ID(s). `groupName` can be a string or an array of strings to indicate that a user is in multiple groups. You can also call `setGroup` multiple times with different `groupType`s to track multiple types of groups (up to five per app). 

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">This will also set 'groupType:groupName' as a user property. See the **[SDK installation](https://help.amplitude.com/hc/en-us/articles/115001361248#setting-groups)** documentation for more information.</span>

</div>

</div>

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`groupType`|_string_|The group type (e.g. 'orgId).|
|`groupName`|_string or list_|The name of the group (e.g. '15') or a list of names of the groups.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setGroup('<span class="wysiwyg-color-red">orgId</span>', <span class="wysiwyg-color-red">15</span>); // This adds the current user to 'orgId' 15</pre>

**14\. `setOptOut(enable)`**

Sets whether to opt current user out of tracking.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`enable`|_boolean_|If true, then no events will be logged or sent.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**15\. `setUserId(userId)`**

Sets an identifier for the current user.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`userId`|_string_|The identifier to set. This can be `null`.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setUserId('<span class="wysiwyg-color-red">joe@gmail.com</span>');</pre>

**16\. `setUserProperties(userProperties)`**

Sets user properties for the current user.

**Parameters:**

<table class="table param-table wysiwyg-text-align-justify" style="width:719.991px" border="1" cellpadding="5" align="center">

|Name|Type|Description|
|--|--|--|
|`userProperties`|_object_|The identifier to set. This can be `null`.|
|`opt_replace` (deprecated)|_boolean_|In earlier versions of the JavaScript SDK the user properties object was kept in memory and setting this to `true` would replace the object in memory. Now, the properties are no longer stored in memory so this parameter has been deprecated.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example: **

<pre>amplitudeClient.setUserProperties({'<span class="wysiwyg-color-red">gender</span>': '<span class="wysiwyg-color-red">female</span>', '<span class="wysiwyg-color-red">sign_up_complete</span>': <span class="wysiwyg-color-red">true</span>})</pre>

**17\. `setVersionName(versionName)`**

Set a `versionName` for your application.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`versionName`|_string_|The version to set for your application.|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setVersionName('<span class="wysiwyg-color-red">1.12.3</span>');</pre>

**18. `setSessionId(sessionId)`**

Set a custom [Session ID](/hc/en-us/articles/115002323627#session-id) for the current session. 

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">This is not recommended unless you know what you are doing because the Session ID of a session is utilized for all session metrics in Amplitude.</span>

</div>

</div>

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`sessionId`|_int_|The Session ID to set for the current session. _**IMPORTANT NOTE: This must be in milliseconds since epoch (Unix Timestamp).**_|

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)

**Example:**

<pre>amplitudeClient.setSessionId(<span class="wysiwyg-color-red">1505430378000</span>);</pre>

**19\. `enableTracking()`**

* To be used with the option (`deferInitialization`) set to true. This will enable the sdk to perform its core functionalities, including saving an amplitude cookie and logging events.

**Source:** [amplitude-client.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/amplitude-client.js)<span class="wysiwyg-font-size-small"></span>

* * *

## Class: Identify 

### Identify

<pre>new Identify()</pre>

Identify API - instance constructor. Identify objects are a wrapper for user property operations. Each method adds a user property operation to the Identify object and returns the same Identify object, allowing you to chain multiple method calls together. 

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">If the same user property is used in multiple operations on a single Identify object, only the first operation on that property will be saved and the rest will be ignored. See the **[JavaScript SDK Installation documentation](https://help.amplitude.com/hc/en-us/articles/115001361248#setting-user-properties)** for more information on the Identify API and user property operations.</span>

</div>

</div>

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify();</pre>

### Methods

**1\. `add(property, value)`**

Increment a user property by a given value. To decrement, pass in a negative value. If the user property does not have a value set yet, it will be initialized to zero before being incremented. 

**Parameters:**

<table class="table param-table wysiwyg-text-align-justify" style="width:719.991px" border="1" cellpadding="5" align="center">

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|
|`value`|_number | string_|The amount by which to increment the user property. Allows numbers as strings (e.g. '123').|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().add('<span class="wysiwyg-color-red">karma</span>', <span class="wysiwyg-color-red">1</span>).add('<span class="wysiwyg-color-red">friends</span>', <span class="wysiwyg-color-red">1</span>);
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // Send the Identify call</pre>

**2\. `append(property, value)`**

Append a value or values to a user property. If the user property does not have a value set yet, it will be initialized to an empty list before the new values are appended. If the user property has an existing value and it is not a list, the existing value will be converted into a list with the new values appended. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|
|`value`|_number | string | list | object_|A value or values to append. Values can be numbers, strings, lists, or objects. Key + value dictionaries will be flattened.|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().append('<span class="wysiwyg-color-red">ab-tests</span>', '<span class="wysiwyg-color-red">new-user-tests</span>');
identify.append('<span class="wysiwyg-color-red">some_list</span>', [<span class="wysiwyg-color-red">1</span>, <span class="wysiwyg-color-red">2</span>, <span class="wysiwyg-color-red">3</span>, <span class="wysiwyg-color-red">4</span>, '<span class="wysiwyg-color-red">values</span>']);
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // Send the Identify call</pre>

**3\. `prepend(property, value)`**

Prepend a value or values to a user property. Prepend means inserting the value or values at the front of a list. If the user property does not have a value set yet, it will be initialized to an empty list before the new values are prepended. If the user property has an existing value and it is not a list, the existing value will be converted into a list with the new values prepended. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|
|`value`|_number | string | list | object_|A value or values to prepend. Values can be numbers, strings, lists, or objects. Key + value dictionaries will be flattened.|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().prepend('<span class="wysiwyg-color-red">ab-tests</span>', '<span class="wysiwyg-color-red">new-user-tests</span>');
<span class="wysiwyg-color-red">identify</span>.prepend('<span class="wysiwyg-color-red">some_list</span>', [<span class="wysiwyg-color-red">1</span>, <span class="wysiwyg-color-red">2</span>, <span class="wysiwyg-color-red">3</span>, <span class="wysiwyg-color-red">4</span>, '<span class="wysiwyg-color-red">values</span>']);
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // Send the Identify call</pre>

**4\. `set(property, value)`**

Sets the value of a given user property. If a value already exists, it will be overwritten with the new value.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|
|`value`|_number | string | list | object_|A value or values to set. Values can be numbers, strings, lists, or objects. Key + value dictionaries will be flattened.|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().set('<span class="wysiwyg-color-red">user_type</span>', '<span class="wysiwyg-color-red">beta</span>');
<span class="wysiwyg-color-red">identify</span>.set('<span class="wysiwyg-color-red">name</span>', {'<span class="wysiwyg-color-red">first</span>': '<span class="wysiwyg-color-red">John</span>', '<span class="wysiwyg-color-red">last</span>': '<span class="wysiwyg-color-red">Doe</span>'}); // dictionary is flattened and becomes name.first: John, name.last: Doe
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // Send the Identify call</pre>

**5\. `setOnce(property, value)`**

Sets the value of a given user property only once. Subsequent `setOnce` operations on that user property will be ignored. However, that user property can still be modified through any of the other operations. This is useful for capturing user properties such as 'initial_signup_date' and 'initial_referrer'. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|
|`value`|_number, string, list, object_|A value or values to set. Values can be numbers, strings, lists, or objects. Key + value dictionaries will be flattened.|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().setOnce('<span class="wysiwyg-color-red">sign_up_date</span>', '<span class="wysiwyg-color-red">2016-04-01</span>');
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // send the Identify call</pre>

**6\. unset`(property)`**

Unsets, and removes a user property value. The user property will be null in the user's profile.

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`property`|_string_|The user property key.|

**Source:** [identify.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/identify.js)

**Returns:** Returns the same `Identify` object of type `Identify`, allowing you to chain multiple method calls together.

**Example:**

<pre>var <span class="wysiwyg-color-red">identify</span> = new amplitude.Identify().unset('<span class="wysiwyg-color-red">user_type</span>').unset('<span class="wysiwyg-color-red">age</span>');
amplitude.identify(<span class="wysiwyg-color-red">identify</span>); // Send the Identify call</pre>

* * *

## Class: Revenue 

### Revenue

<pre>new Revenue()</pre>

Revenue API - instance constructor. `Revenue` objects are a wrapper for revenue data. Each method updates a revenue property in the `Revenue` object and returns the same `Revenue` object, allowing you to chain multiple method calls together.

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">Price is a required field to log revenue events. If the quantity is not specified, then this will default to 1\. See the **[JavaScript SDK Installation](https://help.amplitude.com/hc/en-us/articles/115001361248#tracking-revenue)** for more information about logging revenue.</span>

</div>

</div>

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Example:**

<pre>var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue();</pre>

### Methods

**1. `setEventProperties(eventProperties)`**

Set event properties for the revenue event. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`eventProperties`|_object_|Revenue event properties to set.|

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Returns:** Returns the same Revenue object of type Revenue, allowing you to chain multiple method calls together.

**Example: **

<pre>var <span class="wysiwyg-color-red">event_properties</span> = {'<span class="wysiwyg-color-red">city</span>': '<span class="wysiwyg-color-red">San Francisco</span>'};
var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue().setProductId('<span class="wysiwyg-color-red">productIdentifier</span>').setPrice(<span class="wysiwyg-color-red">10.99</span>).setEventProperties(<span class="wysiwyg-color-red">event_properties</span>);
amplitude.logRevenueV2(<span class="wysiwyg-color-red">revenue</span>);</pre>

**2\. `setPrice(price)`**

Set a value for the price. This field is required for all revenue events being logged. _Note: The revenue amount is calculated as price * quantity._

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`price`|_number_|Double value for the quantity.|

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Returns:** Returns the same `Revenue` object of type `Revenue`, allowing you to chain multiple method calls together.

**Example: **

<pre>var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue().setProductId('<span class="wysiwyg-color-red">productIdentifier</span>').setPrice(<span class="wysiwyg-color-red">10.99</span>);
amplitude.logRevenueV2(<span class="wysiwyg-color-red">revenue</span>);</pre>

**3\. `setProductId(productId)`**

Set a value for the product identifier. 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`productId`|_string_|The value for the product identifier. Empty and invalid strings are ignored.|

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Returns:** Returns the same `Revenue` object of type `Revenue`, allowing you to chain multiple method calls together.

**Example: **

<pre>var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue().setProductId('<span class="wysiwyg-color-red">productIdentifier</span>').setPrice(<span class="wysiwyg-color-red">10.99</span>);
amplitude.logRevenueV2(<span class="wysiwyg-color-red">revenue</span>);</pre>

**4\. `setQuantity(quantity)`**

Set a value for the quantity. 

<div class="wysiwyg-text-align-justify" style="background-color:#fefaea;padding:15px;color:#252525;border:1px solid #FFD52D;border-radius:5px;margin-top:20px;margin-bottom:20px">

<div style="color:#3c3c3c">

<span>**Important Note:**</span>

*   <span style="font-family:-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif">The Revenue amount is calculated as price * quantity.</span>

</div>

</div>

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`quantity`|_number_|The integer value for the quantity. If this is not set, it will default to `1`.|

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Returns:** Returns the same `Revenue` object of type `Revenue`, allowing you to chain multiple method calls together.

**Example: **

<pre>var <span class="wysiwyg-color-red">revenue</span> = new amplitude.Revenue().setProductId('<span class="wysiwyg-color-red">productIdentifier</span>').setPrice(<span class="wysiwyg-color-red">10.99</span>).setQuantity(<span class="wysiwyg-color-red">5</span>);
amplitude.logRevenueV2(<span class="wysiwyg-color-red">revenue</span>);</pre>

**5\. `setRevenueType(revenueType)`**

Set a value for the type of revenue (e.g. purchase, cost, tax, refund, etc.). 

**Parameters:**

|Name|Type|Description|
|--|--|--|
|`revenueType`|_string_|The type of revenue to designate.|

**Source:** [revenue.js](https://github.com/amplitude/Amplitude-Javascript/blob/master/src/revenue.js)

**Returns:** Returns the same `Revenue` object of type `Revenue`, allowing you to chain multiple method calls together.

**Example**

```javascript
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setRevenueType('purchase');
amplitude.logRevenueV2(revenue);
```