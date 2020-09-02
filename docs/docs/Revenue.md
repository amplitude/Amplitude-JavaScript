## `Revenue#setProductId`

```
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
amplitude.logRevenueV2(revenue);
```

Set a value for the product identifer.

### Parameters

- `productId` (`string`)
  The value for the product identifier. Empty and invalid strings are ignored.

### Return Value

- (`Revenue`)
  Returns the same Revenue object, allowing you to chain multiple method calls together.

## `Revenue#setQuantity`

```
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setQuantity(5);
amplitude.logRevenueV2(revenue);
```

Set a value for the quantity. Note revenue amount is calculated as price \* quantity.

### Parameters

- `quantity` (`number`)
  Integer value for the quantity. If not set, quantity defaults to 1.

### Return Value

- (`Revenue`)
  Returns the same Revenue object, allowing you to chain multiple method calls together.

## `Revenue#setPrice`

```
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
amplitude.logRevenueV2(revenue);
```

Set a value for the price. This field is required for all revenue being logged.
Note revenue amount is calculated as price \* quantity.

### Parameters

- `price` (`number`)
  Double value for the quantity.

### Return Value

- (`Revenue`)
  Returns the same Revenue object, allowing you to chain multiple method calls together.

## `Revenue#setRevenueType`

```
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setRevenueType('purchase');
amplitude.logRevenueV2(revenue);
```

Set a value for the revenueType (for example purchase, cost, tax, refund, etc).

### Parameters

- `revenueType` (`string`)
  RevenueType to designate.

### Return Value

- (`Revenue`)
  Returns the same Revenue object, allowing you to chain multiple method calls together.

## `Revenue#setEventProperties`

```
var event_properties = {'city': 'San Francisco'};
var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setEventProperties(event_properties);
amplitude.logRevenueV2(revenue);
```

Set event properties for the revenue event.

### Parameters

- `eventProperties` (`object`)
  Revenue event properties to set.

### Return Value

- (`Revenue`)
  Returns the same Revenue object, allowing you to chain multiple method calls together.
