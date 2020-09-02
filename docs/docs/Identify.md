## `Identify()`

```
var identify = new amplitude.Identify();
```

Identify API - instance constructor. Identify objects are a wrapper for user property operations.
Each method adds a user property operation to the Identify object, and returns the same Identify object,
allowing you to chain multiple method calls together.
Note: if the same user property is used in multiple operations on a single Identify object,
only the first operation on that property will be saved, and the rest will be ignored.
See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
for more information on the Identify API and user property operations.

## `Identify#add`

```
var identify = new amplitude.Identify().add('karma', 1).add('friends', 1);
amplitude.identify(identify); // send the Identify call
```

Increment a user property by a given value (can also be negative to decrement).
If the user property does not have a value set yet, it will be initialized to 0 before being incremented.

### Parameters

- `property` (`string`)
  The user property key.

- `value` (`number`)
  The amount by which to increment the user property. Allows numbers as strings (ex: '123').

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.

## `Identify#append`

```
var identify = new amplitude.Identify().append('ab-tests', 'new-user-tests');
identify.append('some_list', [1, 2, 3, 4, 'values']);
amplitude.identify(identify); // send the Identify call
```

Append a value or values to a user property.
If the user property does not have a value set yet,
it will be initialized to an empty list before the new values are appended.
If the user property has an existing value and it is not a list,
the existing value will be converted into a list with the new values appended.

### Parameters

- `property` (`string`)
  The user property key.

- `value` (`number`)
  A value or values to append.
  Values can be numbers, strings, lists, or object (key:value dict will be flattened).

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.

## `Identify#prepend`

```
var identify = new amplitude.Identify().prepend('ab-tests', 'new-user-tests');
identify.prepend('some_list', [1, 2, 3, 4, 'values']);
amplitude.identify(identify); // send the Identify call
```

Prepend a value or values to a user property.
Prepend means inserting the value or values at the front of a list.
If the user property does not have a value set yet,
it will be initialized to an empty list before the new values are prepended.
If the user property has an existing value and it is not a list,
the existing value will be converted into a list with the new values prepended.

### Parameters

- `property` (`string`)
  The user property key.

- `value` (`number`)
  A value or values to prepend.
  Values can be numbers, strings, lists, or object (key:value dict will be flattened).

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.

## `Identify#set`

```
var identify = new amplitude.Identify().set('user_type', 'beta');
identify.set('name', {'first': 'John', 'last': 'Doe'}); // dict is flattened and becomes name.first: John, name.last: Doe
amplitude.identify(identify); // send the Identify call
```

Sets the value of a given user property. If a value already exists, it will be overwriten with the new value.

### Parameters

- `property` (`string`)
  The user property key.

- `value` (`number`)
  A value or values to set.
  Values can be numbers, strings, lists, or object (key:value dict will be flattened).

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.

## `Identify#setOnce`

```
var identify = new amplitude.Identify().setOnce('sign_up_date', '2016-04-01');
amplitude.identify(identify); // send the Identify call
```

Sets the value of a given user property only once. Subsequent setOnce operations on that user property will be ignored;
however, that user property can still be modified through any of the other operations.
Useful for capturing properties such as 'initial_signup_date', 'initial_referrer', etc.

### Parameters

- `property` (`string`)
  The user property key.

- `value` (`number`)
  A value or values to set once.
  Values can be numbers, strings, lists, or object (key:value dict will be flattened).

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.

## `Identify#unset`

```
var identify = new amplitude.Identify().unset('user_type').unset('age');
amplitude.identify(identify); // send the Identify call
```

Unset and remove a user property. This user property will no longer show up in a user's profile.

### Parameters

- `property` (`string`)
  The user property key.

### Return Value

- (`Identify`)
  Returns the same Identify object, allowing you to chain multiple method calls together.
