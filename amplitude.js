(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.amplitude = factory());
}(this, (function () { 'use strict';

var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var json3 = createCommonjsModule(function (module, exports) {
(function () {
  // Detect the `define` function exposed by asynchronous module loaders. The
  // strict `define` check is necessary for compatibility with `r.js`.
  var isLoader = typeof undefined === "function" && undefined.amd;

  // A set of types used to distinguish objects from primitives.
  var objectTypes = {
    "function": true,
    "object": true
  };

  // Detect the `exports` object exposed by CommonJS implementations.
  var freeExports = objectTypes['object'] && exports && !exports.nodeType && exports;

  // Use the `global` object exposed by Node (including Browserify via
  // `insert-module-globals`), Narwhal, and Ringo as the default context,
  // and the `window` object in browsers. Rhino exports a `global` function
  // instead.
  var root = objectTypes[typeof window] && window || this,
      freeGlobal = freeExports && objectTypes['object'] && module && !module.nodeType && typeof commonjsGlobal == "object" && commonjsGlobal;

  if (freeGlobal && (freeGlobal["global"] === freeGlobal || freeGlobal["window"] === freeGlobal || freeGlobal["self"] === freeGlobal)) {
    root = freeGlobal;
  }

  // Public: Initializes JSON 3 using the given `context` object, attaching the
  // `stringify` and `parse` functions to the specified `exports` object.
  function runInContext(context, exports) {
    context || (context = root["Object"]());
    exports || (exports = root["Object"]());

    // Native constructor aliases.
    var Number = context["Number"] || root["Number"],
        String = context["String"] || root["String"],
        Object = context["Object"] || root["Object"],
        Date = context["Date"] || root["Date"],
        SyntaxError = context["SyntaxError"] || root["SyntaxError"],
        TypeError = context["TypeError"] || root["TypeError"],
        Math = context["Math"] || root["Math"],
        nativeJSON = context["JSON"] || root["JSON"];

    // Delegate to the native `stringify` and `parse` implementations.
    if (typeof nativeJSON == "object" && nativeJSON) {
      exports.stringify = nativeJSON.stringify;
      exports.parse = nativeJSON.parse;
    }

    // Convenience aliases.
    var objectProto = Object.prototype,
        getClass = objectProto.toString,
        isProperty, forEach, undef;

    // Test the `Date#getUTC*` methods. Based on work by @Yaffle.
    var isExtended = new Date(-3509827334573292);
    try {
      // The `getUTCFullYear`, `Month`, and `Date` methods return nonsensical
      // results for certain dates in Opera >= 10.53.
      isExtended = isExtended.getUTCFullYear() == -109252 && isExtended.getUTCMonth() === 0 && isExtended.getUTCDate() === 1 &&
        // Safari < 2.0.2 stores the internal millisecond time value correctly,
        // but clips the values returned by the date methods to the range of
        // signed 32-bit integers ([-2 ** 31, 2 ** 31 - 1]).
        isExtended.getUTCHours() == 10 && isExtended.getUTCMinutes() == 37 && isExtended.getUTCSeconds() == 6 && isExtended.getUTCMilliseconds() == 708;
    } catch (exception) {}

    // Internal: Determines whether the native `JSON.stringify` and `parse`
    // implementations are spec-compliant. Based on work by Ken Snyder.
    function has(name) {
      if (has[name] !== undef) {
        // Return cached feature test result.
        return has[name];
      }
      var isSupported;
      if (name == "bug-string-char-index") {
        // IE <= 7 doesn't support accessing string characters using square
        // bracket notation. IE 8 only supports this for primitives.
        isSupported = "a"[0] != "a";
      } else if (name == "json") {
        // Indicates whether both `JSON.stringify` and `JSON.parse` are
        // supported.
        isSupported = has("json-stringify") && has("json-parse");
      } else {
        var value, serialized = '{"a":[1,true,false,null,"\\u0000\\b\\n\\f\\r\\t"]}';
        // Test `JSON.stringify`.
        if (name == "json-stringify") {
          var stringify = exports.stringify, stringifySupported = typeof stringify == "function" && isExtended;
          if (stringifySupported) {
            // A test function object with a custom `toJSON` method.
            (value = function () {
              return 1;
            }).toJSON = value;
            try {
              stringifySupported =
                // Firefox 3.1b1 and b2 serialize string, number, and boolean
                // primitives as object literals.
                stringify(0) === "0" &&
                // FF 3.1b1, b2, and JSON 2 serialize wrapped primitives as object
                // literals.
                stringify(new Number()) === "0" &&
                stringify(new String()) == '""' &&
                // FF 3.1b1, 2 throw an error if the value is `null`, `undefined`, or
                // does not define a canonical JSON representation (this applies to
                // objects with `toJSON` properties as well, *unless* they are nested
                // within an object or array).
                stringify(getClass) === undef &&
                // IE 8 serializes `undefined` as `"undefined"`. Safari <= 5.1.7 and
                // FF 3.1b3 pass this test.
                stringify(undef) === undef &&
                // Safari <= 5.1.7 and FF 3.1b3 throw `Error`s and `TypeError`s,
                // respectively, if the value is omitted entirely.
                stringify() === undef &&
                // FF 3.1b1, 2 throw an error if the given value is not a number,
                // string, array, object, Boolean, or `null` literal. This applies to
                // objects with custom `toJSON` methods as well, unless they are nested
                // inside object or array literals. YUI 3.0.0b1 ignores custom `toJSON`
                // methods entirely.
                stringify(value) === "1" &&
                stringify([value]) == "[1]" &&
                // Prototype <= 1.6.1 serializes `[undefined]` as `"[]"` instead of
                // `"[null]"`.
                stringify([undef]) == "[null]" &&
                // YUI 3.0.0b1 fails to serialize `null` literals.
                stringify(null) == "null" &&
                // FF 3.1b1, 2 halts serialization if an array contains a function:
                // `[1, true, getClass, 1]` serializes as "[1,true,],". FF 3.1b3
                // elides non-JSON values from objects and arrays, unless they
                // define custom `toJSON` methods.
                stringify([undef, getClass, null]) == "[null,null,null]" &&
                // Simple serialization test. FF 3.1b1 uses Unicode escape sequences
                // where character escape codes are expected (e.g., `\b` => `\u0008`).
                stringify({ "a": [value, true, false, null, "\x00\b\n\f\r\t"] }) == serialized &&
                // FF 3.1b1 and b2 ignore the `filter` and `width` arguments.
                stringify(null, value) === "1" &&
                stringify([1, 2], null, 1) == "[\n 1,\n 2\n]" &&
                // JSON 2, Prototype <= 1.7, and older WebKit builds incorrectly
                // serialize extended years.
                stringify(new Date(-8.64e15)) == '"-271821-04-20T00:00:00.000Z"' &&
                // The milliseconds are optional in ES 5, but required in 5.1.
                stringify(new Date(8.64e15)) == '"+275760-09-13T00:00:00.000Z"' &&
                // Firefox <= 11.0 incorrectly serializes years prior to 0 as negative
                // four-digit years instead of six-digit years. Credits: @Yaffle.
                stringify(new Date(-621987552e5)) == '"-000001-01-01T00:00:00.000Z"' &&
                // Safari <= 5.1.5 and Opera >= 10.53 incorrectly serialize millisecond
                // values less than 1000. Credits: @Yaffle.
                stringify(new Date(-1)) == '"1969-12-31T23:59:59.999Z"';
            } catch (exception) {
              stringifySupported = false;
            }
          }
          isSupported = stringifySupported;
        }
        // Test `JSON.parse`.
        if (name == "json-parse") {
          var parse = exports.parse;
          if (typeof parse == "function") {
            try {
              // FF 3.1b1, b2 will throw an exception if a bare literal is provided.
              // Conforming implementations should also coerce the initial argument to
              // a string prior to parsing.
              if (parse("0") === 0 && !parse(false)) {
                // Simple parsing test.
                value = parse(serialized);
                var parseSupported = value["a"].length == 5 && value["a"][0] === 1;
                if (parseSupported) {
                  try {
                    // Safari <= 5.1.2 and FF 3.1b1 allow unescaped tabs in strings.
                    parseSupported = !parse('"\t"');
                  } catch (exception) {}
                  if (parseSupported) {
                    try {
                      // FF 4.0 and 4.0.1 allow leading `+` signs and leading
                      // decimal points. FF 4.0, 4.0.1, and IE 9-10 also allow
                      // certain octal literals.
                      parseSupported = parse("01") !== 1;
                    } catch (exception) {}
                  }
                  if (parseSupported) {
                    try {
                      // FF 4.0, 4.0.1, and Rhino 1.7R3-R4 allow trailing decimal
                      // points. These environments, along with FF 3.1b1 and 2,
                      // also allow trailing commas in JSON objects and arrays.
                      parseSupported = parse("1.") !== 1;
                    } catch (exception) {}
                  }
                }
              }
            } catch (exception) {
              parseSupported = false;
            }
          }
          isSupported = parseSupported;
        }
      }
      return has[name] = !!isSupported;
    }

    if (!has("json")) {
      // Common `[[Class]]` name aliases.
      var functionClass = "[object Function]",
          dateClass = "[object Date]",
          numberClass = "[object Number]",
          stringClass = "[object String]",
          arrayClass = "[object Array]",
          booleanClass = "[object Boolean]";

      // Detect incomplete support for accessing string characters by index.
      var charIndexBuggy = has("bug-string-char-index");

      // Define additional utility methods if the `Date` methods are buggy.
      if (!isExtended) {
        var floor = Math.floor;
        // A mapping between the months of the year and the number of days between
        // January 1st and the first of the respective month.
        var Months = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
        // Internal: Calculates the number of days between the Unix epoch and the
        // first day of the given month.
        var getDay = function (year, month) {
          return Months[month] + 365 * (year - 1970) + floor((year - 1969 + (month = +(month > 1))) / 4) - floor((year - 1901 + month) / 100) + floor((year - 1601 + month) / 400);
        };
      }

      // Internal: Determines if a property is a direct property of the given
      // object. Delegates to the native `Object#hasOwnProperty` method.
      if (!(isProperty = objectProto.hasOwnProperty)) {
        isProperty = function (property) {
          var members = {}, constructor;
          if ((members.__proto__ = null, members.__proto__ = {
            // The *proto* property cannot be set multiple times in recent
            // versions of Firefox and SeaMonkey.
            "toString": 1
          }, members).toString != getClass) {
            // Safari <= 2.0.3 doesn't implement `Object#hasOwnProperty`, but
            // supports the mutable *proto* property.
            isProperty = function (property) {
              // Capture and break the object's prototype chain (see section 8.6.2
              // of the ES 5.1 spec). The parenthesized expression prevents an
              // unsafe transformation by the Closure Compiler.
              var original = this.__proto__, result = property in (this.__proto__ = null, this);
              // Restore the original prototype chain.
              this.__proto__ = original;
              return result;
            };
          } else {
            // Capture a reference to the top-level `Object` constructor.
            constructor = members.constructor;
            // Use the `constructor` property to simulate `Object#hasOwnProperty` in
            // other environments.
            isProperty = function (property) {
              var parent = (this.constructor || constructor).prototype;
              return property in this && !(property in parent && this[property] === parent[property]);
            };
          }
          members = null;
          return isProperty.call(this, property);
        };
      }

      // Internal: Normalizes the `for...in` iteration algorithm across
      // environments. Each enumerated key is yielded to a `callback` function.
      forEach = function (object, callback) {
        var size = 0, Properties, members, property;

        // Tests for bugs in the current environment's `for...in` algorithm. The
        // `valueOf` property inherits the non-enumerable flag from
        // `Object.prototype` in older versions of IE, Netscape, and Mozilla.
        (Properties = function () {
          this.valueOf = 0;
        }).prototype.valueOf = 0;

        // Iterate over a new instance of the `Properties` class.
        members = new Properties();
        for (property in members) {
          // Ignore all properties inherited from `Object.prototype`.
          if (isProperty.call(members, property)) {
            size++;
          }
        }
        Properties = members = null;

        // Normalize the iteration algorithm.
        if (!size) {
          // A list of non-enumerable properties inherited from `Object.prototype`.
          members = ["valueOf", "toString", "toLocaleString", "propertyIsEnumerable", "isPrototypeOf", "hasOwnProperty", "constructor"];
          // IE <= 8, Mozilla 1.0, and Netscape 6.2 ignore shadowed non-enumerable
          // properties.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, length;
            var hasProperty = !isFunction && typeof object.constructor != "function" && objectTypes[typeof object.hasOwnProperty] && object.hasOwnProperty || isProperty;
            for (property in object) {
              // Gecko <= 1.0 enumerates the `prototype` property of functions under
              // certain conditions; IE does not.
              if (!(isFunction && property == "prototype") && hasProperty.call(object, property)) {
                callback(property);
              }
            }
            // Manually invoke the callback for each non-enumerable property.
            for (length = members.length; property = members[--length]; hasProperty.call(object, property) && callback(property));
          };
        } else if (size == 2) {
          // Safari <= 2.0.4 enumerates shadowed properties twice.
          forEach = function (object, callback) {
            // Create a set of iterated properties.
            var members = {}, isFunction = getClass.call(object) == functionClass, property;
            for (property in object) {
              // Store each property name to prevent double enumeration. The
              // `prototype` property of functions is not enumerated due to cross-
              // environment inconsistencies.
              if (!(isFunction && property == "prototype") && !isProperty.call(members, property) && (members[property] = 1) && isProperty.call(object, property)) {
                callback(property);
              }
            }
          };
        } else {
          // No bugs detected; use the standard `for...in` algorithm.
          forEach = function (object, callback) {
            var isFunction = getClass.call(object) == functionClass, property, isConstructor;
            for (property in object) {
              if (!(isFunction && property == "prototype") && isProperty.call(object, property) && !(isConstructor = property === "constructor")) {
                callback(property);
              }
            }
            // Manually invoke the callback for the `constructor` property due to
            // cross-environment inconsistencies.
            if (isConstructor || isProperty.call(object, (property = "constructor"))) {
              callback(property);
            }
          };
        }
        return forEach(object, callback);
      };

      // Public: Serializes a JavaScript `value` as a JSON string. The optional
      // `filter` argument may specify either a function that alters how object and
      // array members are serialized, or an array of strings and numbers that
      // indicates which properties should be serialized. The optional `width`
      // argument may be either a string or number that specifies the indentation
      // level of the output.
      if (!has("json-stringify")) {
        // Internal: A map of control characters and their escaped equivalents.
        var Escapes = {
          92: "\\\\",
          34: '\\"',
          8: "\\b",
          12: "\\f",
          10: "\\n",
          13: "\\r",
          9: "\\t"
        };

        // Internal: Converts `value` into a zero-padded string such that its
        // length is at least equal to `width`. The `width` must be <= 6.
        var leadingZeroes = "000000";
        var toPaddedString = function (width, value) {
          // The `|| 0` expression is necessary to work around a bug in
          // Opera <= 7.54u2 where `0 == -0`, but `String(-0) !== "0"`.
          return (leadingZeroes + (value || 0)).slice(-width);
        };

        // Internal: Double-quotes a string `value`, replacing all ASCII control
        // characters (characters with code unit values between 0 and 31) with
        // their escaped equivalents. This is an implementation of the
        // `Quote(value)` operation defined in ES 5.1 section 15.12.3.
        var unicodePrefix = "\\u00";
        var quote = function (value) {
          var result = '"', index = 0, length = value.length, useCharIndex = !charIndexBuggy || length > 10;
          var symbols = useCharIndex && (charIndexBuggy ? value.split("") : value);
          for (; index < length; index++) {
            var charCode = value.charCodeAt(index);
            // If the character is a control character, append its Unicode or
            // shorthand escape sequence; otherwise, append the character as-is.
            switch (charCode) {
              case 8: case 9: case 10: case 12: case 13: case 34: case 92:
                result += Escapes[charCode];
                break;
              default:
                if (charCode < 32) {
                  result += unicodePrefix + toPaddedString(2, charCode.toString(16));
                  break;
                }
                result += useCharIndex ? symbols[index] : value.charAt(index);
            }
          }
          return result + '"';
        };

        // Internal: Recursively serializes an object. Implements the
        // `Str(key, holder)`, `JO(value)`, and `JA(value)` operations.
        var serialize = function (property, object, callback, properties, whitespace, indentation, stack) {
          var value, className, year, month, date, time, hours, minutes, seconds, milliseconds, results, element, index, length, prefix, result;
          try {
            // Necessary for host object support.
            value = object[property];
          } catch (exception) {}
          if (typeof value == "object" && value) {
            className = getClass.call(value);
            if (className == dateClass && !isProperty.call(value, "toJSON")) {
              if (value > -1 / 0 && value < 1 / 0) {
                // Dates are serialized according to the `Date#toJSON` method
                // specified in ES 5.1 section 15.9.5.44. See section 15.9.1.15
                // for the ISO 8601 date time string format.
                if (getDay) {
                  // Manually compute the year, month, date, hours, minutes,
                  // seconds, and milliseconds if the `getUTC*` methods are
                  // buggy. Adapted from @Yaffle's `date-shim` project.
                  date = floor(value / 864e5);
                  for (year = floor(date / 365.2425) + 1970 - 1; getDay(year + 1, 0) <= date; year++);
                  for (month = floor((date - getDay(year, 0)) / 30.42); getDay(year, month + 1) <= date; month++);
                  date = 1 + date - getDay(year, month);
                  // The `time` value specifies the time within the day (see ES
                  // 5.1 section 15.9.1.2). The formula `(A % B + B) % B` is used
                  // to compute `A modulo B`, as the `%` operator does not
                  // correspond to the `modulo` operation for negative numbers.
                  time = (value % 864e5 + 864e5) % 864e5;
                  // The hours, minutes, seconds, and milliseconds are obtained by
                  // decomposing the time within the day. See section 15.9.1.10.
                  hours = floor(time / 36e5) % 24;
                  minutes = floor(time / 6e4) % 60;
                  seconds = floor(time / 1e3) % 60;
                  milliseconds = time % 1e3;
                } else {
                  year = value.getUTCFullYear();
                  month = value.getUTCMonth();
                  date = value.getUTCDate();
                  hours = value.getUTCHours();
                  minutes = value.getUTCMinutes();
                  seconds = value.getUTCSeconds();
                  milliseconds = value.getUTCMilliseconds();
                }
                // Serialize extended years correctly.
                value = (year <= 0 || year >= 1e4 ? (year < 0 ? "-" : "+") + toPaddedString(6, year < 0 ? -year : year) : toPaddedString(4, year)) +
                  "-" + toPaddedString(2, month + 1) + "-" + toPaddedString(2, date) +
                  // Months, dates, hours, minutes, and seconds should have two
                  // digits; milliseconds should have three.
                  "T" + toPaddedString(2, hours) + ":" + toPaddedString(2, minutes) + ":" + toPaddedString(2, seconds) +
                  // Milliseconds are optional in ES 5.0, but required in 5.1.
                  "." + toPaddedString(3, milliseconds) + "Z";
              } else {
                value = null;
              }
            } else if (typeof value.toJSON == "function" && ((className != numberClass && className != stringClass && className != arrayClass) || isProperty.call(value, "toJSON"))) {
              // Prototype <= 1.6.1 adds non-standard `toJSON` methods to the
              // `Number`, `String`, `Date`, and `Array` prototypes. JSON 3
              // ignores all `toJSON` methods on these objects unless they are
              // defined directly on an instance.
              value = value.toJSON(property);
            }
          }
          if (callback) {
            // If a replacement function was provided, call it to obtain the value
            // for serialization.
            value = callback.call(object, property, value);
          }
          if (value === null) {
            return "null";
          }
          className = getClass.call(value);
          if (className == booleanClass) {
            // Booleans are represented literally.
            return "" + value;
          } else if (className == numberClass) {
            // JSON numbers must be finite. `Infinity` and `NaN` are serialized as
            // `"null"`.
            return value > -1 / 0 && value < 1 / 0 ? "" + value : "null";
          } else if (className == stringClass) {
            // Strings are double-quoted and escaped.
            return quote("" + value);
          }
          // Recursively serialize objects and arrays.
          if (typeof value == "object") {
            // Check for cyclic structures. This is a linear search; performance
            // is inversely proportional to the number of unique nested objects.
            for (length = stack.length; length--;) {
              if (stack[length] === value) {
                // Cyclic structures cannot be serialized by `JSON.stringify`.
                throw TypeError();
              }
            }
            // Add the object to the stack of traversed objects.
            stack.push(value);
            results = [];
            // Save the current indentation level and indent one additional level.
            prefix = indentation;
            indentation += whitespace;
            if (className == arrayClass) {
              // Recursively serialize array elements.
              for (index = 0, length = value.length; index < length; index++) {
                element = serialize(index, value, callback, properties, whitespace, indentation, stack);
                results.push(element === undef ? "null" : element);
              }
              result = results.length ? (whitespace ? "[\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "]" : ("[" + results.join(",") + "]")) : "[]";
            } else {
              // Recursively serialize object members. Members are selected from
              // either a user-specified list of property names, or the object
              // itself.
              forEach(properties || value, function (property) {
                var element = serialize(property, value, callback, properties, whitespace, indentation, stack);
                if (element !== undef) {
                  // According to ES 5.1 section 15.12.3: "If `gap` {whitespace}
                  // is not the empty string, let `member` {quote(property) + ":"}
                  // be the concatenation of `member` and the `space` character."
                  // The "`space` character" refers to the literal space
                  // character, not the `space` {width} argument provided to
                  // `JSON.stringify`.
                  results.push(quote(property) + ":" + (whitespace ? " " : "") + element);
                }
              });
              result = results.length ? (whitespace ? "{\n" + indentation + results.join(",\n" + indentation) + "\n" + prefix + "}" : ("{" + results.join(",") + "}")) : "{}";
            }
            // Remove the object from the traversed object stack.
            stack.pop();
            return result;
          }
        };

        // Public: `JSON.stringify`. See ES 5.1 section 15.12.3.
        exports.stringify = function (source, filter, width) {
          var whitespace, callback, properties, className;
          if (objectTypes[typeof filter] && filter) {
            if ((className = getClass.call(filter)) == functionClass) {
              callback = filter;
            } else if (className == arrayClass) {
              // Convert the property names array into a makeshift set.
              properties = {};
              for (var index = 0, length = filter.length, value; index < length; value = filter[index++], (className = getClass.call(value), className == stringClass || className == numberClass) && (properties[value] = 1));
            }
          }
          if (width) {
            if ((className = getClass.call(width)) == numberClass) {
              // Convert the `width` to an integer and create a string containing
              // `width` number of space characters.
              if ((width -= width % 1) > 0) {
                for (whitespace = "", width > 10 && (width = 10); whitespace.length < width; whitespace += " ");
              }
            } else if (className == stringClass) {
              whitespace = width.length <= 10 ? width : width.slice(0, 10);
            }
          }
          // Opera <= 7.54u2 discards the values associated with empty string keys
          // (`""`) only if they are used directly within an object member list
          // (e.g., `!("" in { "": 1})`).
          return serialize("", (value = {}, value[""] = source, value), callback, properties, whitespace, "", []);
        };
      }

      // Public: Parses a JSON source string.
      if (!has("json-parse")) {
        var fromCharCode = String.fromCharCode;

        // Internal: A map of escaped control characters and their unescaped
        // equivalents.
        var Unescapes = {
          92: "\\",
          34: '"',
          47: "/",
          98: "\b",
          116: "\t",
          110: "\n",
          102: "\f",
          114: "\r"
        };

        // Internal: Stores the parser state.
        var Index, Source;

        // Internal: Resets the parser state and throws a `SyntaxError`.
        var abort = function () {
          Index = Source = null;
          throw SyntaxError();
        };

        // Internal: Returns the next token, or `"$"` if the parser has reached
        // the end of the source string. A token may be a string, number, `null`
        // literal, or Boolean literal.
        var lex = function () {
          var source = Source, length = source.length, value, begin, position, isSigned, charCode;
          while (Index < length) {
            charCode = source.charCodeAt(Index);
            switch (charCode) {
              case 9: case 10: case 13: case 32:
                // Skip whitespace tokens, including tabs, carriage returns, line
                // feeds, and space characters.
                Index++;
                break;
              case 123: case 125: case 91: case 93: case 58: case 44:
                // Parse a punctuator token (`{`, `}`, `[`, `]`, `:`, or `,`) at
                // the current position.
                value = charIndexBuggy ? source.charAt(Index) : source[Index];
                Index++;
                return value;
              case 34:
                // `"` delimits a JSON string; advance to the next character and
                // begin parsing the string. String tokens are prefixed with the
                // sentinel `@` character to distinguish them from punctuators and
                // end-of-string tokens.
                for (value = "@", Index++; Index < length;) {
                  charCode = source.charCodeAt(Index);
                  if (charCode < 32) {
                    // Unescaped ASCII control characters (those with a code unit
                    // less than the space character) are not permitted.
                    abort();
                  } else if (charCode == 92) {
                    // A reverse solidus (`\`) marks the beginning of an escaped
                    // control character (including `"`, `\`, and `/`) or Unicode
                    // escape sequence.
                    charCode = source.charCodeAt(++Index);
                    switch (charCode) {
                      case 92: case 34: case 47: case 98: case 116: case 110: case 102: case 114:
                        // Revive escaped control characters.
                        value += Unescapes[charCode];
                        Index++;
                        break;
                      case 117:
                        // `\u` marks the beginning of a Unicode escape sequence.
                        // Advance to the first character and validate the
                        // four-digit code point.
                        begin = ++Index;
                        for (position = Index + 4; Index < position; Index++) {
                          charCode = source.charCodeAt(Index);
                          // A valid sequence comprises four hexdigits (case-
                          // insensitive) that form a single hexadecimal value.
                          if (!(charCode >= 48 && charCode <= 57 || charCode >= 97 && charCode <= 102 || charCode >= 65 && charCode <= 70)) {
                            // Invalid Unicode escape sequence.
                            abort();
                          }
                        }
                        // Revive the escaped character.
                        value += fromCharCode("0x" + source.slice(begin, Index));
                        break;
                      default:
                        // Invalid escape sequence.
                        abort();
                    }
                  } else {
                    if (charCode == 34) {
                      // An unescaped double-quote character marks the end of the
                      // string.
                      break;
                    }
                    charCode = source.charCodeAt(Index);
                    begin = Index;
                    // Optimize for the common case where a string is valid.
                    while (charCode >= 32 && charCode != 92 && charCode != 34) {
                      charCode = source.charCodeAt(++Index);
                    }
                    // Append the string as-is.
                    value += source.slice(begin, Index);
                  }
                }
                if (source.charCodeAt(Index) == 34) {
                  // Advance to the next character and return the revived string.
                  Index++;
                  return value;
                }
                // Unterminated string.
                abort();
              default:
                // Parse numbers and literals.
                begin = Index;
                // Advance past the negative sign, if one is specified.
                if (charCode == 45) {
                  isSigned = true;
                  charCode = source.charCodeAt(++Index);
                }
                // Parse an integer or floating-point value.
                if (charCode >= 48 && charCode <= 57) {
                  // Leading zeroes are interpreted as octal literals.
                  if (charCode == 48 && (charCode = source.charCodeAt(Index + 1), charCode >= 48 && charCode <= 57)) {
                    // Illegal octal literal.
                    abort();
                  }
                  isSigned = false;
                  // Parse the integer component.
                  for (; Index < length && (charCode = source.charCodeAt(Index), charCode >= 48 && charCode <= 57); Index++);
                  // Floats cannot contain a leading decimal point; however, this
                  // case is already accounted for by the parser.
                  if (source.charCodeAt(Index) == 46) {
                    position = ++Index;
                    // Parse the decimal component.
                    for (; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal trailing decimal.
                      abort();
                    }
                    Index = position;
                  }
                  // Parse exponents. The `e` denoting the exponent is
                  // case-insensitive.
                  charCode = source.charCodeAt(Index);
                  if (charCode == 101 || charCode == 69) {
                    charCode = source.charCodeAt(++Index);
                    // Skip past the sign following the exponent, if one is
                    // specified.
                    if (charCode == 43 || charCode == 45) {
                      Index++;
                    }
                    // Parse the exponential component.
                    for (position = Index; position < length && (charCode = source.charCodeAt(position), charCode >= 48 && charCode <= 57); position++);
                    if (position == Index) {
                      // Illegal empty exponent.
                      abort();
                    }
                    Index = position;
                  }
                  // Coerce the parsed value to a JavaScript number.
                  return +source.slice(begin, Index);
                }
                // A negative sign may only precede numbers.
                if (isSigned) {
                  abort();
                }
                // `true`, `false`, and `null` literals.
                if (source.slice(Index, Index + 4) == "true") {
                  Index += 4;
                  return true;
                } else if (source.slice(Index, Index + 5) == "false") {
                  Index += 5;
                  return false;
                } else if (source.slice(Index, Index + 4) == "null") {
                  Index += 4;
                  return null;
                }
                // Unrecognized token.
                abort();
            }
          }
          // Return the sentinel `$` character if the parser has reached the end
          // of the source string.
          return "$";
        };

        // Internal: Parses a JSON `value` token.
        var get = function (value) {
          var results, hasMembers;
          if (value == "$") {
            // Unexpected end of input.
            abort();
          }
          if (typeof value == "string") {
            if ((charIndexBuggy ? value.charAt(0) : value[0]) == "@") {
              // Remove the sentinel `@` character.
              return value.slice(1);
            }
            // Parse object and array literals.
            if (value == "[") {
              // Parses a JSON array, returning a new JavaScript array.
              results = [];
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing square bracket marks the end of the array literal.
                if (value == "]") {
                  break;
                }
                // If the array literal contains elements, the current token
                // should be a comma separating the previous element from the
                // next.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "]") {
                      // Unexpected trailing `,` in array literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each array element.
                    abort();
                  }
                }
                // Elisions and leading commas are not permitted.
                if (value == ",") {
                  abort();
                }
                results.push(get(value));
              }
              return results;
            } else if (value == "{") {
              // Parses a JSON object, returning a new JavaScript object.
              results = {};
              for (;; hasMembers || (hasMembers = true)) {
                value = lex();
                // A closing curly brace marks the end of the object literal.
                if (value == "}") {
                  break;
                }
                // If the object literal contains members, the current token
                // should be a comma separator.
                if (hasMembers) {
                  if (value == ",") {
                    value = lex();
                    if (value == "}") {
                      // Unexpected trailing `,` in object literal.
                      abort();
                    }
                  } else {
                    // A `,` must separate each object member.
                    abort();
                  }
                }
                // Leading commas are not permitted, object property names must be
                // double-quoted strings, and a `:` must separate each property
                // name and value.
                if (value == "," || typeof value != "string" || (charIndexBuggy ? value.charAt(0) : value[0]) != "@" || lex() != ":") {
                  abort();
                }
                results[value.slice(1)] = get(lex());
              }
              return results;
            }
            // Unexpected token encountered.
            abort();
          }
          return value;
        };

        // Internal: Updates a traversed object member.
        var update = function (source, property, callback) {
          var element = walk(source, property, callback);
          if (element === undef) {
            delete source[property];
          } else {
            source[property] = element;
          }
        };

        // Internal: Recursively traverses a parsed JSON object, invoking the
        // `callback` function for each value. This is an implementation of the
        // `Walk(holder, name)` operation defined in ES 5.1 section 15.12.2.
        var walk = function (source, property, callback) {
          var value = source[property], length;
          if (typeof value == "object" && value) {
            // `forEach` can't be used to traverse an array in Opera <= 8.54
            // because its `Object#hasOwnProperty` implementation returns `false`
            // for array indices (e.g., `![1, 2, 3].hasOwnProperty("0")`).
            if (getClass.call(value) == arrayClass) {
              for (length = value.length; length--;) {
                update(value, length, callback);
              }
            } else {
              forEach(value, function (property) {
                update(value, property, callback);
              });
            }
          }
          return callback.call(source, property, value);
        };

        // Public: `JSON.parse`. See ES 5.1 section 15.12.2.
        exports.parse = function (source, callback) {
          var result, value;
          Index = 0;
          Source = "" + source;
          result = get(lex());
          // If a JSON string contains multiple tokens, it is invalid.
          if (lex() != "$") {
            abort();
          }
          // Reset the parser state.
          Index = Source = null;
          return callback && getClass.call(callback) == functionClass ? walk((value = {}, value[""] = result, value), "", callback) : result;
        };
      }
    }

    exports["runInContext"] = runInContext;
    return exports;
  }

  if (freeExports && !isLoader) {
    // Export for CommonJS environments.
    runInContext(root, freeExports);
  } else {
    // Export for web browsers and JavaScript engines.
    var nativeJSON = root.JSON,
        previousJSON = root["JSON3"],
        isRestored = false;

    var JSON3 = runInContext(root, (root["JSON3"] = {
      // Public: Restores the original value of the global `JSON` object and
      // returns a reference to the `JSON3` object.
      "noConflict": function () {
        if (!isRestored) {
          isRestored = true;
          root.JSON = nativeJSON;
          root["JSON3"] = previousJSON;
          nativeJSON = previousJSON = null;
        }
        return JSON3;
      }
    }));

    root.JSON = {
      "parse": JSON3.parse,
      "stringify": JSON3.stringify
    };
  }

  // Export for asynchronous module loaders.
  if (isLoader) {
    undefined(function () {
      return JSON3;
    });
  }
}).call(commonjsGlobal);
});

var constants = {
  DEFAULT_INSTANCE: '$default_instance',
  API_VERSION: 2,
  MAX_STRING_LENGTH: 4096,
  MAX_PROPERTY_KEYS: 1000,
  IDENTIFY_EVENT: '$identify',
  GROUP_IDENTIFY_EVENT: '$groupidentify',

  // localStorageKeys
  LAST_EVENT_ID: 'amplitude_lastEventId',
  LAST_EVENT_TIME: 'amplitude_lastEventTime',
  LAST_IDENTIFY_ID: 'amplitude_lastIdentifyId',
  LAST_SEQUENCE_NUMBER: 'amplitude_lastSequenceNumber',
  SESSION_ID: 'amplitude_sessionId',

  // Used in cookie as well
  DEVICE_ID: 'amplitude_deviceId',
  OPT_OUT: 'amplitude_optOut',
  USER_ID: 'amplitude_userId',

  COOKIE_TEST: 'amplitude_cookie_test',

  // revenue keys
  REVENUE_EVENT: 'revenue_amount',
  REVENUE_PRODUCT_ID: '$productId',
  REVENUE_QUANTITY: '$quantity',
  REVENUE_PRICE: '$price',
  REVENUE_REVENUE_TYPE: '$revenueType',

  AMP_DEVICE_ID_PARAM: 'amp_device_id', // url param

  REFERRER: 'referrer',

  // UTM Params
  UTM_SOURCE: 'utm_source',
  UTM_MEDIUM: 'utm_medium',
  UTM_CAMPAIGN: 'utm_campaign',
  UTM_TERM: 'utm_term',
  UTM_CONTENT: 'utm_content'
};

/* jshint bitwise: false */

/*
 * UTF-8 encoder/decoder
 * http://www.webtoolkit.info/
 */
var UTF8 = {
    encode: function encode(s) {
        var utftext = '';

        for (var n = 0; n < s.length; n++) {
            var c = s.charCodeAt(n);

            if (c < 128) {
                utftext += String.fromCharCode(c);
            } else if (c > 127 && c < 2048) {
                utftext += String.fromCharCode(c >> 6 | 192);
                utftext += String.fromCharCode(c & 63 | 128);
            } else {
                utftext += String.fromCharCode(c >> 12 | 224);
                utftext += String.fromCharCode(c >> 6 & 63 | 128);
                utftext += String.fromCharCode(c & 63 | 128);
            }
        }
        return utftext;
    },

    decode: function decode(utftext) {
        var s = '';
        var i = 0;
        var c = 0,
            c1 = 0,
            c2 = 0;

        while (i < utftext.length) {
            c = utftext.charCodeAt(i);
            if (c < 128) {
                s += String.fromCharCode(c);
                i++;
            } else if (c > 191 && c < 224) {
                c1 = utftext.charCodeAt(i + 1);
                s += String.fromCharCode((c & 31) << 6 | c1 & 63);
                i += 2;
            } else {
                c1 = utftext.charCodeAt(i + 1);
                c2 = utftext.charCodeAt(i + 2);
                s += String.fromCharCode((c & 15) << 12 | (c1 & 63) << 6 | c2 & 63);
                i += 3;
            }
        }
        return s;
    }
};

/* jshint bitwise: false */

/*
 * Base64 encoder/decoder
 * http://www.webtoolkit.info/
 */
var Base64 = {
    _keyStr: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',

    encode: function encode(input) {
        try {
            if (window.btoa && window.atob) {
                return window.btoa(unescape(encodeURIComponent(input)));
            }
        } catch (e) {
            //log(e);
        }
        return Base64._encode(input);
    },

    _encode: function _encode(input) {
        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;

        input = UTF8.encode(input);

        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = (chr1 & 3) << 4 | chr2 >> 4;
            enc3 = (chr2 & 15) << 2 | chr3 >> 6;
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }

            output = output + Base64._keyStr.charAt(enc1) + Base64._keyStr.charAt(enc2) + Base64._keyStr.charAt(enc3) + Base64._keyStr.charAt(enc4);
        }
        return output;
    },

    decode: function decode(input) {
        try {
            if (window.btoa && window.atob) {
                return decodeURIComponent(escape(window.atob(input)));
            }
        } catch (e) {
            //log(e);
        }
        return Base64._decode(input);
    },

    _decode: function _decode(input) {
        var output = '';
        var chr1, chr2, chr3;
        var enc1, enc2, enc3, enc4;
        var i = 0;

        input = input.replace(/[^A-Za-z0-9\+\/\=]/g, '');

        while (i < input.length) {
            enc1 = Base64._keyStr.indexOf(input.charAt(i++));
            enc2 = Base64._keyStr.indexOf(input.charAt(i++));
            enc3 = Base64._keyStr.indexOf(input.charAt(i++));
            enc4 = Base64._keyStr.indexOf(input.charAt(i++));

            chr1 = enc1 << 2 | enc2 >> 4;
            chr2 = (enc2 & 15) << 4 | enc3 >> 2;
            chr3 = (enc3 & 3) << 6 | enc4;

            output = output + String.fromCharCode(chr1);

            if (enc3 !== 64) {
                output = output + String.fromCharCode(chr2);
            }
            if (enc4 !== 64) {
                output = output + String.fromCharCode(chr3);
            }
        }
        output = UTF8.decode(output);
        return output;
    }
};

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};

var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};

/**
 * toString ref.
 * @private
 */

var toString = Object.prototype.toString;

/**
 * Return the type of `val`.
 * @private
 * @param {Mixed} val
 * @return {String}
 * @api public
 */

function type (val) {
  switch (toString.call(val)) {
    case '[object Date]':
      return 'date';
    case '[object RegExp]':
      return 'regexp';
    case '[object Arguments]':
      return 'arguments';
    case '[object Array]':
      return 'array';
    case '[object Error]':
      return 'error';
  }

  if (val === null) {
    return 'null';
  }
  if (val === undefined) {
    return 'undefined';
  }
  if (val !== val) {
    return 'nan';
  }
  if (val && val.nodeType === 1) {
    return 'element';
  }

  if (typeof Buffer !== 'undefined' && typeof Buffer.isBuffer === 'function' && Buffer.isBuffer(val)) {
    return 'buffer';
  }

  val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);
  return typeof val === 'undefined' ? 'undefined' : _typeof(val);
}

var logLevels = {
  DISABLE: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3
};

var logLevel = logLevels.WARN;

var setLogLevel = function setLogLevel(logLevelName) {
  if (logLevels.hasOwnProperty(logLevelName)) {
    logLevel = logLevels[logLevelName];
  }
};

var getLogLevel = function getLogLevel() {
  return logLevel;
};

var log = {
  error: function error(s) {
    if (logLevel >= logLevels.ERROR) {
      _log(s);
    }
  },

  warn: function warn(s) {
    if (logLevel >= logLevels.WARN) {
      _log(s);
    }
  },

  info: function info(s) {
    if (logLevel >= logLevels.INFO) {
      _log(s);
    }
  }
};

var _log = function _log(s) {
  try {
    console.log('[Amplitude] ' + s);
  } catch (e) {
    // console logging not available
  }
};

var isEmptyString = function isEmptyString(str) {
  return !str || str.length === 0;
};

var sessionStorageEnabled = function sessionStorageEnabled() {
  try {
    if (window.sessionStorage) {
      return true;
    }
  } catch (e) {} // sessionStorage disabled
  return false;
};

// truncate string values in event and user properties so that request size does not get too large
var truncate = function truncate(value) {
  if (type(value) === 'array') {
    for (var i = 0; i < value.length; i++) {
      value[i] = truncate(value[i]);
    }
  } else if (type(value) === 'object') {
    for (var key in value) {
      if (value.hasOwnProperty(key)) {
        value[key] = truncate(value[key]);
      }
    }
  } else {
    value = _truncateValue(value);
  }

  return value;
};

var _truncateValue = function _truncateValue(value) {
  if (type(value) === 'string') {
    return value.length > constants.MAX_STRING_LENGTH ? value.substring(0, constants.MAX_STRING_LENGTH) : value;
  }
  return value;
};

var validateInput = function validateInput(input, name, expectedType) {
  if (type(input) !== expectedType) {
    log.error('Invalid ' + name + ' input type. Expected ' + expectedType + ' but received ' + type(input));
    return false;
  }
  return true;
};

// do some basic sanitization and type checking, also catch property dicts with more than 1000 key/value pairs
var validateProperties = function validateProperties(properties) {
  var propsType = type(properties);
  if (propsType !== 'object') {
    log.error('Error: invalid properties format. Expecting Javascript object, received ' + propsType + ', ignoring');
    return {};
  }

  if (Object.keys(properties).length > constants.MAX_PROPERTY_KEYS) {
    log.error('Error: too many properties (more than 1000), ignoring');
    return {};
  }

  var copy = {}; // create a copy with all of the valid properties
  for (var property in properties) {
    if (!properties.hasOwnProperty(property)) {
      continue;
    }

    // validate key
    var key = property;
    var keyType = type(key);
    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string property key, received type ' + keyType + ', coercing to string "' + key + '"');
    }

    // validate value
    var value = validatePropertyValue(key, properties[property]);
    if (value === null) {
      continue;
    }
    copy[key] = value;
  }
  return copy;
};

var invalidValueTypes = ['null', 'nan', 'undefined', 'function', 'arguments', 'regexp', 'element'];

var validatePropertyValue = function validatePropertyValue(key, value) {
  var valueType = type(value);
  if (invalidValueTypes.indexOf(valueType) !== -1) {
    log.warn('WARNING: Property key "' + key + '" with invalid value type ' + valueType + ', ignoring');
    value = null;
  } else if (valueType === 'error') {
    value = String(value);
    log.warn('WARNING: Property key "' + key + '" with value type error, coercing to ' + value);
  } else if (valueType === 'array') {
    // check for nested arrays or objects
    var arrayCopy = [];
    for (var i = 0; i < value.length; i++) {
      var element = value[i];
      var elemType = type(element);
      if (elemType === 'array' || elemType === 'object') {
        log.warn('WARNING: Cannot have ' + elemType + ' nested in an array property value, skipping');
        continue;
      }
      arrayCopy.push(validatePropertyValue(key, element));
    }
    value = arrayCopy;
  } else if (valueType === 'object') {
    value = validateProperties(value);
  }
  return value;
};

var validateGroups = function validateGroups(groups) {
  var groupsType = type(groups);
  if (groupsType !== 'object') {
    log.error('Error: invalid groups format. Expecting Javascript object, received ' + groupsType + ', ignoring');
    return {};
  }

  var copy = {}; // create a copy with all of the valid properties
  for (var group in groups) {
    if (!groups.hasOwnProperty(group)) {
      continue;
    }

    // validate key
    var key = group;
    var keyType = type(key);
    if (keyType !== 'string') {
      key = String(key);
      log.warn('WARNING: Non-string groupType, received type ' + keyType + ', coercing to string "' + key + '"');
    }

    // validate value
    var value = validateGroupName(key, groups[group]);
    if (value === null) {
      continue;
    }
    copy[key] = value;
  }
  return copy;
};

var validateGroupName = function validateGroupName(key, groupName) {
  var groupNameType = type(groupName);
  if (groupNameType === 'string') {
    return groupName;
  }
  if (groupNameType === 'date' || groupNameType === 'number' || groupNameType === 'boolean') {
    groupName = String(groupName);
    log.warn('WARNING: Non-string groupName, received type ' + groupNameType + ', coercing to string "' + groupName + '"');
    return groupName;
  }
  if (groupNameType === 'array') {
    // check for nested arrays or objects
    var arrayCopy = [];
    for (var i = 0; i < groupName.length; i++) {
      var element = groupName[i];
      var elemType = type(element);
      if (elemType === 'array' || elemType === 'object') {
        log.warn('WARNING: Skipping nested ' + elemType + ' in array groupName');
        continue;
      } else if (elemType === 'string') {
        arrayCopy.push(element);
      } else if (elemType === 'date' || elemType === 'number' || elemType === 'boolean') {
        element = String(element);
        log.warn('WARNING: Non-string groupName, received type ' + elemType + ', coercing to string "' + element + '"');
        arrayCopy.push(element);
      }
    }
    return arrayCopy;
  }
  log.warn('WARNING: Non-string groupName, received type ' + groupNameType + '. Please use strings or array of strings for groupName');
};

// parses the value of a url param (for example ?gclid=1234&...)
var getQueryParam = function getQueryParam(name, query) {
  name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
  var regex = new RegExp("[\\?&]" + name + "=([^&#]*)");
  var results = regex.exec(query);
  return results === null ? undefined : decodeURIComponent(results[1].replace(/\+/g, " "));
};

var utils = {
  setLogLevel: setLogLevel,
  getLogLevel: getLogLevel,
  logLevels: logLevels,
  log: log,
  isEmptyString: isEmptyString,
  getQueryParam: getQueryParam,
  sessionStorageEnabled: sessionStorageEnabled,
  truncate: truncate,
  validateGroups: validateGroups,
  validateInput: validateInput,
  validateProperties: validateProperties
};

var getLocation = function getLocation() {
  return window.location;
};

var get = function get(name) {
  try {
    var ca = document.cookie.split(';');
    var value = null;
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === ' ') {
        c = c.substring(1, c.length);
      }
      if (c.indexOf(name) === 0) {
        value = c.substring(name.length, c.length);
        break;
      }
    }

    return value;
  } catch (e) {
    return null;
  }
};

var set = function set(name, value, opts) {
  var expires = value !== null ? opts.expirationDays : -1;
  if (expires) {
    var date = new Date();
    date.setTime(date.getTime() + expires * 24 * 60 * 60 * 1000);
    expires = date;
  }
  var str = name + '=' + value;
  if (expires) {
    str += '; expires=' + expires.toUTCString();
  }
  str += '; path=/';
  if (opts.domain) {
    str += '; domain=' + opts.domain;
  }
  if (opts.secure) {
    str += '; Secure';
  }
  document.cookie = str;
};

var baseCookie = {
  set: set,
  get: get
};

/*
 * Cookie data
 */

var _options = {
  expirationDays: undefined,
  domain: undefined
};

var reset = function reset() {
  _options = {
    expirationDays: undefined,
    domain: undefined
  };
};

var getHost = function getHost(url) {
  var a = document.createElement('a');
  a.href = url;
  return a.hostname || location.hostname;
};

var topDomain = function topDomain(url) {
  var host = getHost(url);
  var parts = host.split('.');
  var last = parts[parts.length - 1];
  var levels = [];

  if (parts.length === 4 && last === parseInt(last, 10)) {
    return levels;
  }

  if (parts.length <= 1) {
    return levels;
  }

  for (var i = parts.length - 2; i >= 0; --i) {
    levels.push(parts.slice(i).join('.'));
  }

  for (var _i = 0; _i < levels.length; ++_i) {
    var cname = '__tld_test__';
    var domain = levels[_i];
    var opts = { domain: '.' + domain };

    baseCookie.set(cname, 1, opts);
    if (baseCookie.get(cname)) {
      baseCookie.set(cname, null, opts);
      return domain;
    }
  }

  return '';
};

var options = function options(opts) {
  if (arguments.length === 0) {
    return _options;
  }

  opts = opts || {};

  _options.expirationDays = opts.expirationDays;
  _options.secure = opts.secure;

  var domain = !utils.isEmptyString(opts.domain) ? opts.domain : '.' + topDomain(getLocation().href);
  var token = Math.random();
  _options.domain = domain;
  set$1('amplitude_test', token);
  var stored = get$1('amplitude_test');
  if (!stored || stored !== token) {
    domain = null;
  }
  remove('amplitude_test');
  _options.domain = domain;

  return _options;
};

var _domainSpecific = function _domainSpecific(name) {
  // differentiate between cookies on different domains
  var suffix = '';
  if (_options.domain) {
    suffix = _options.domain.charAt(0) === '.' ? _options.domain.substring(1) : _options.domain;
  }
  return name + suffix;
};

var get$1 = function get(name) {
  var nameEq = _domainSpecific(name) + '=';
  var value = baseCookie.get(nameEq);

  try {
    if (value) {
      return JSON.parse(Base64.decode(value));
    }
  } catch (e) {
    return null;
  }

  return null;
};

var set$1 = function set(name, value) {
  try {
    baseCookie.set(_domainSpecific(name), Base64.encode(JSON.stringify(value)), _options);
    return true;
  } catch (e) {
    return false;
  }
};

var remove = function remove(name) {
  try {
    baseCookie.set(_domainSpecific(name), null, _options);
    return true;
  } catch (e) {
    return false;
  }
};

var Cookie = {
  reset: reset,
  options: options,
  get: get$1,
  set: set$1,
  remove: remove
};

/* jshint -W020, unused: false, noempty: false, boss: true */

{
  var localStorage; // jshint ignore:line

  // test that Window.localStorage is available and works
  var windowLocalStorageAvailable = function windowLocalStorageAvailable() {
    var uid = new Date();
    var result;
    try {
      window.localStorage.setItem(uid, uid);
      result = window.localStorage.getItem(uid) === String(uid);
      window.localStorage.removeItem(uid);
      return result;
    } catch (e) {
      // localStorage not available
    }
    return false;
  };

  if (windowLocalStorageAvailable()) {
    localStorage = window.localStorage;
  } else if (window.globalStorage) {
    // Firefox 2-3 use globalStorage
    // See https://developer.mozilla.org/en/dom/storage#globalStorage
    try {
      localStorage = window.globalStorage[window.location.hostname];
    } catch (e) {
      // Something bad happened...
    }
  } else {
    // IE 5-7 use userData
    // See http://msdn.microsoft.com/en-us/library/ms531424(v=vs.85).aspx
    var div = document.createElement('div'),
        attrKey = 'localStorage';
    div.style.display = 'none';
    document.getElementsByTagName('head')[0].appendChild(div);
    if (div.addBehavior) {
      div.addBehavior('#default#userdata');
      localStorage = {
        length: 0,
        setItem: function setItem(k, v) {
          div.load(attrKey);
          if (!div.getAttribute(k)) {
            this.length++;
          }
          div.setAttribute(k, v);
          div.save(attrKey);
        },
        getItem: function getItem(k) {
          div.load(attrKey);
          return div.getAttribute(k);
        },
        removeItem: function removeItem(k) {
          div.load(attrKey);
          if (div.getAttribute(k)) {
            this.length--;
          }
          div.removeAttribute(k);
          div.save(attrKey);
        },
        clear: function clear() {
          div.load(attrKey);
          var i = 0;
          var attr;
          while (attr = div.XMLDocument.documentElement.attributes[i++]) {
            div.removeAttribute(attr.name);
          }
          div.save(attrKey);
          this.length = 0;
        },
        key: function key(k) {
          div.load(attrKey);
          return div.XMLDocument.documentElement.attributes[k];
        }
      };
      div.load(attrKey);
      localStorage.length = div.XMLDocument.documentElement.attributes.length;
    } else {
      /* Nothing we can do ... */
    }
  }
  if (!localStorage) {
    localStorage = {
      length: 0,
      setItem: function setItem(k, v) {},
      getItem: function getItem(k) {},
      removeItem: function removeItem(k) {},
      clear: function clear() {},
      key: function key(k) {}
    };
  }
}

var localStorage$1 = localStorage;

/* jshint -W020, unused: false, noempty: false, boss: true */

var cookieStorage = function cookieStorage() {
  this.storage = null;
};

// test that cookies are enabled - navigator.cookiesEnabled yields false positives in IE, need to test directly
cookieStorage.prototype._cookiesEnabled = function () {
  var uid = String(new Date());
  var result;
  try {
    Cookie.set(constants.COOKIE_TEST, uid);
    result = Cookie.get(constants.COOKIE_TEST) === uid;
    Cookie.remove(constants.COOKIE_TEST);
    return result;
  } catch (e) {
    // cookies are not enabled
  }
  return false;
};

cookieStorage.prototype.getStorage = function () {
  if (this.storage !== null) {
    return this.storage;
  }

  if (this._cookiesEnabled()) {
    this.storage = Cookie;
  } else {
    // if cookies disabled, fallback to localstorage
    // note: localstorage does not persist across subdomains
    var keyPrefix = 'amp_cookiestore_';
    this.storage = {
      _options: {
        expirationDays: undefined,
        domain: undefined,
        secure: false
      },
      reset: function reset() {
        this._options = {
          expirationDays: undefined,
          domain: undefined,
          secure: false
        };
      },
      options: function options(opts) {
        if (arguments.length === 0) {
          return this._options;
        }
        opts = opts || {};
        this._options.expirationDays = opts.expirationDays || this._options.expirationDays;
        // localStorage is specific to subdomains
        this._options.domain = opts.domain || this._options.domain || window.location.hostname;
        return this._options.secure = opts.secure || false;
      },
      get: function get(name) {
        try {
          return JSON.parse(localStorage$1.getItem(keyPrefix + name));
        } catch (e) {}
        return null;
      },
      set: function set(name, value) {
        try {
          localStorage$1.setItem(keyPrefix + name, JSON.stringify(value));
          return true;
        } catch (e) {}
        return false;
      },
      remove: function remove(name) {
        try {
          localStorage$1.removeItem(keyPrefix + name);
        } catch (e) {
          return false;
        }
      }
    };
  }

  return this.storage;
};

var getUtmData = function getUtmData(rawCookie, query) {
  // Translate the utmz cookie format into url query string format.
  var cookie = rawCookie ? '?' + rawCookie.split('.').slice(-1)[0].replace(/\|/g, '&') : '';

  var fetchParam = function fetchParam(queryName, query, cookieName, cookie) {
    return utils.getQueryParam(queryName, query) || utils.getQueryParam(cookieName, cookie);
  };

  var utmSource = fetchParam(constants.UTM_SOURCE, query, 'utmcsr', cookie);
  var utmMedium = fetchParam(constants.UTM_MEDIUM, query, 'utmcmd', cookie);
  var utmCampaign = fetchParam(constants.UTM_CAMPAIGN, query, 'utmccn', cookie);
  var utmTerm = fetchParam(constants.UTM_TERM, query, 'utmctr', cookie);
  var utmContent = fetchParam(constants.UTM_CONTENT, query, 'utmcct', cookie);

  var utmData = {};
  var addIfNotNull = function addIfNotNull(key, value) {
    if (!utils.isEmptyString(value)) {
      utmData[key] = value;
    }
  };

  addIfNotNull(constants.UTM_SOURCE, utmSource);
  addIfNotNull(constants.UTM_MEDIUM, utmMedium);
  addIfNotNull(constants.UTM_CAMPAIGN, utmCampaign);
  addIfNotNull(constants.UTM_TERM, utmTerm);
  addIfNotNull(constants.UTM_CONTENT, utmContent);

  return utmData;
};

/*
 * Wrapper for a user properties JSON object that supports operations.
 * Note: if a user property is used in multiple operations on the same Identify object,
 * only the first operation will be saved, and the rest will be ignored.
 */

var AMP_OP_ADD = '$add';
var AMP_OP_APPEND = '$append';
var AMP_OP_CLEAR_ALL = '$clearAll';
var AMP_OP_PREPEND = '$prepend';
var AMP_OP_SET = '$set';
var AMP_OP_SET_ONCE = '$setOnce';
var AMP_OP_UNSET = '$unset';

/**
 * Identify API - instance constructor. Identify objects are a wrapper for user property operations.
 * Each method adds a user property operation to the Identify object, and returns the same Identify object,
 * allowing you to chain multiple method calls together.
 * Note: if the same user property is used in multiple operations on a single Identify object,
 * only the first operation on that property will be saved, and the rest will be ignored.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
 * for more information on the Identify API and user property operations.
 * @constructor Identify
 * @public
 * @example var identify = new amplitude.Identify();
 */
var Identify = function Identify() {
  this.userPropertiesOperations = {};
  this.properties = []; // keep track of keys that have been added
};

/**
 * Increment a user property by a given value (can also be negative to decrement).
 * If the user property does not have a value set yet, it will be initialized to 0 before being incremented.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string} value - The amount by which to increment the user property. Allows numbers as strings (ex: '123').
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().add('karma', 1).add('friends', 1);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.add = function (property, value) {
  if (type(value) === 'number' || type(value) === 'string') {
    this._addOperation(AMP_OP_ADD, property, value);
  } else {
    utils.log.error('Unsupported type for value: ' + type(value) + ', expecting number or string');
  }
  return this;
};

/**
 * Append a value or values to a user property.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are appended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values appended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to append.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().append('ab-tests', 'new-user-tests');
 * identify.append('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.append = function (property, value) {
  this._addOperation(AMP_OP_APPEND, property, value);
  return this;
};

/**
 * Clear all user properties for the current user.
 * SDK user should instead call amplitude.clearUserProperties() instead of using this.
 * $clearAll needs to be sent on its own Identify object. If there are already other operations, then don't add $clearAll.
 * If $clearAll already in an Identify object, don't allow other operations to be added.
 * @private
 */
Identify.prototype.clearAll = function () {
  if (Object.keys(this.userPropertiesOperations).length > 0) {
    if (!this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
      utils.log.error('Need to send $clearAll on its own Identify object without any other operations, skipping $clearAll');
    }
    return this;
  }
  this.userPropertiesOperations[AMP_OP_CLEAR_ALL] = '-';
  return this;
};

/**
 * Prepend a value or values to a user property.
 * Prepend means inserting the value or values at the front of a list.
 * If the user property does not have a value set yet,
 * it will be initialized to an empty list before the new values are prepended.
 * If the user property has an existing value and it is not a list,
 * the existing value will be converted into a list with the new values prepended.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to prepend.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().prepend('ab-tests', 'new-user-tests');
 * identify.prepend('some_list', [1, 2, 3, 4, 'values']);
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.prepend = function (property, value) {
  this._addOperation(AMP_OP_PREPEND, property, value);
  return this;
};

/**
 * Sets the value of a given user property. If a value already exists, it will be overwriten with the new value.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to set.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().set('user_type', 'beta');
 * identify.set('name', {'first': 'John', 'last': 'Doe'}); // dict is flattened and becomes name.first: John, name.last: Doe
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.set = function (property, value) {
  this._addOperation(AMP_OP_SET, property, value);
  return this;
};

/**
 * Sets the value of a given user property only once. Subsequent setOnce operations on that user property will be ignored;
 * however, that user property can still be modified through any of the other operations.
 * Useful for capturing properties such as 'initial_signup_date', 'initial_referrer', etc.
 * @public
 * @param {string} property - The user property key.
 * @param {number|string|list|object} value - A value or values to set once.
 * Values can be numbers, strings, lists, or object (key:value dict will be flattened).
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().setOnce('sign_up_date', '2016-04-01');
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.setOnce = function (property, value) {
  this._addOperation(AMP_OP_SET_ONCE, property, value);
  return this;
};

/**
 * Unset and remove a user property. This user property will no longer show up in a user's profile.
 * @public
 * @param {string} property - The user property key.
 * @return {Identify} Returns the same Identify object, allowing you to chain multiple method calls together.
 * @example var identify = new amplitude.Identify().unset('user_type').unset('age');
 * amplitude.identify(identify); // send the Identify call
 */
Identify.prototype.unset = function (property) {
  this._addOperation(AMP_OP_UNSET, property, '-');
  return this;
};

/**
 * Helper function that adds operation to the Identify's object
 * Handle's filtering of duplicate user property keys, and filtering for clearAll.
 * @private
 */
Identify.prototype._addOperation = function (operation, property, value) {
  // check that the identify doesn't already contain a clearAll
  if (this.userPropertiesOperations.hasOwnProperty(AMP_OP_CLEAR_ALL)) {
    utils.log.error('This identify already contains a $clearAll operation, skipping operation ' + operation);
    return;
  }

  // check that property wasn't already used in this Identify
  if (this.properties.indexOf(property) !== -1) {
    utils.log.error('User property "' + property + '" already used in this identify, skipping operation ' + operation);
    return;
  }

  if (!this.userPropertiesOperations.hasOwnProperty(operation)) {
    this.userPropertiesOperations[operation] = {};
  }
  this.userPropertiesOperations[operation][property] = value;
  this.properties.push(property);
};

var md5 = createCommonjsModule(function (module) {
(function ($) {

  /*
  * Add integers, wrapping at 2^32. This uses 16-bit operations internally
  * to work around bugs in some JS interpreters.
  */
  function safeAdd (x, y) {
    var lsw = (x & 0xffff) + (y & 0xffff);
    var msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff)
  }

  /*
  * Bitwise rotate a 32-bit number to the left.
  */
  function bitRotateLeft (num, cnt) {
    return (num << cnt) | (num >>> (32 - cnt))
  }

  /*
  * These functions implement the four basic operations the algorithm uses.
  */
  function md5cmn (q, a, b, x, s, t) {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b)
  }
  function md5ff (a, b, c, d, x, s, t) {
    return md5cmn((b & c) | (~b & d), a, b, x, s, t)
  }
  function md5gg (a, b, c, d, x, s, t) {
    return md5cmn((b & d) | (c & ~d), a, b, x, s, t)
  }
  function md5hh (a, b, c, d, x, s, t) {
    return md5cmn(b ^ c ^ d, a, b, x, s, t)
  }
  function md5ii (a, b, c, d, x, s, t) {
    return md5cmn(c ^ (b | ~d), a, b, x, s, t)
  }

  /*
  * Calculate the MD5 of an array of little-endian words, and a bit length.
  */
  function binlMD5 (x, len) {
    /* append padding */
    x[len >> 5] |= 0x80 << (len % 32);
    x[((len + 64) >>> 9 << 4) + 14] = len;

    var i;
    var olda;
    var oldb;
    var oldc;
    var oldd;
    var a = 1732584193;
    var b = -271733879;
    var c = -1732584194;
    var d = 271733878;

    for (i = 0; i < x.length; i += 16) {
      olda = a;
      oldb = b;
      oldc = c;
      oldd = d;

      a = md5ff(a, b, c, d, x[i], 7, -680876936);
      d = md5ff(d, a, b, c, x[i + 1], 12, -389564586);
      c = md5ff(c, d, a, b, x[i + 2], 17, 606105819);
      b = md5ff(b, c, d, a, x[i + 3], 22, -1044525330);
      a = md5ff(a, b, c, d, x[i + 4], 7, -176418897);
      d = md5ff(d, a, b, c, x[i + 5], 12, 1200080426);
      c = md5ff(c, d, a, b, x[i + 6], 17, -1473231341);
      b = md5ff(b, c, d, a, x[i + 7], 22, -45705983);
      a = md5ff(a, b, c, d, x[i + 8], 7, 1770035416);
      d = md5ff(d, a, b, c, x[i + 9], 12, -1958414417);
      c = md5ff(c, d, a, b, x[i + 10], 17, -42063);
      b = md5ff(b, c, d, a, x[i + 11], 22, -1990404162);
      a = md5ff(a, b, c, d, x[i + 12], 7, 1804603682);
      d = md5ff(d, a, b, c, x[i + 13], 12, -40341101);
      c = md5ff(c, d, a, b, x[i + 14], 17, -1502002290);
      b = md5ff(b, c, d, a, x[i + 15], 22, 1236535329);

      a = md5gg(a, b, c, d, x[i + 1], 5, -165796510);
      d = md5gg(d, a, b, c, x[i + 6], 9, -1069501632);
      c = md5gg(c, d, a, b, x[i + 11], 14, 643717713);
      b = md5gg(b, c, d, a, x[i], 20, -373897302);
      a = md5gg(a, b, c, d, x[i + 5], 5, -701558691);
      d = md5gg(d, a, b, c, x[i + 10], 9, 38016083);
      c = md5gg(c, d, a, b, x[i + 15], 14, -660478335);
      b = md5gg(b, c, d, a, x[i + 4], 20, -405537848);
      a = md5gg(a, b, c, d, x[i + 9], 5, 568446438);
      d = md5gg(d, a, b, c, x[i + 14], 9, -1019803690);
      c = md5gg(c, d, a, b, x[i + 3], 14, -187363961);
      b = md5gg(b, c, d, a, x[i + 8], 20, 1163531501);
      a = md5gg(a, b, c, d, x[i + 13], 5, -1444681467);
      d = md5gg(d, a, b, c, x[i + 2], 9, -51403784);
      c = md5gg(c, d, a, b, x[i + 7], 14, 1735328473);
      b = md5gg(b, c, d, a, x[i + 12], 20, -1926607734);

      a = md5hh(a, b, c, d, x[i + 5], 4, -378558);
      d = md5hh(d, a, b, c, x[i + 8], 11, -2022574463);
      c = md5hh(c, d, a, b, x[i + 11], 16, 1839030562);
      b = md5hh(b, c, d, a, x[i + 14], 23, -35309556);
      a = md5hh(a, b, c, d, x[i + 1], 4, -1530992060);
      d = md5hh(d, a, b, c, x[i + 4], 11, 1272893353);
      c = md5hh(c, d, a, b, x[i + 7], 16, -155497632);
      b = md5hh(b, c, d, a, x[i + 10], 23, -1094730640);
      a = md5hh(a, b, c, d, x[i + 13], 4, 681279174);
      d = md5hh(d, a, b, c, x[i], 11, -358537222);
      c = md5hh(c, d, a, b, x[i + 3], 16, -722521979);
      b = md5hh(b, c, d, a, x[i + 6], 23, 76029189);
      a = md5hh(a, b, c, d, x[i + 9], 4, -640364487);
      d = md5hh(d, a, b, c, x[i + 12], 11, -421815835);
      c = md5hh(c, d, a, b, x[i + 15], 16, 530742520);
      b = md5hh(b, c, d, a, x[i + 2], 23, -995338651);

      a = md5ii(a, b, c, d, x[i], 6, -198630844);
      d = md5ii(d, a, b, c, x[i + 7], 10, 1126891415);
      c = md5ii(c, d, a, b, x[i + 14], 15, -1416354905);
      b = md5ii(b, c, d, a, x[i + 5], 21, -57434055);
      a = md5ii(a, b, c, d, x[i + 12], 6, 1700485571);
      d = md5ii(d, a, b, c, x[i + 3], 10, -1894986606);
      c = md5ii(c, d, a, b, x[i + 10], 15, -1051523);
      b = md5ii(b, c, d, a, x[i + 1], 21, -2054922799);
      a = md5ii(a, b, c, d, x[i + 8], 6, 1873313359);
      d = md5ii(d, a, b, c, x[i + 15], 10, -30611744);
      c = md5ii(c, d, a, b, x[i + 6], 15, -1560198380);
      b = md5ii(b, c, d, a, x[i + 13], 21, 1309151649);
      a = md5ii(a, b, c, d, x[i + 4], 6, -145523070);
      d = md5ii(d, a, b, c, x[i + 11], 10, -1120210379);
      c = md5ii(c, d, a, b, x[i + 2], 15, 718787259);
      b = md5ii(b, c, d, a, x[i + 9], 21, -343485551);

      a = safeAdd(a, olda);
      b = safeAdd(b, oldb);
      c = safeAdd(c, oldc);
      d = safeAdd(d, oldd);
    }
    return [a, b, c, d]
  }

  /*
  * Convert an array of little-endian words to a string
  */
  function binl2rstr (input) {
    var i;
    var output = '';
    var length32 = input.length * 32;
    for (i = 0; i < length32; i += 8) {
      output += String.fromCharCode((input[i >> 5] >>> (i % 32)) & 0xff);
    }
    return output
  }

  /*
  * Convert a raw string to an array of little-endian words
  * Characters >255 have their high-byte silently ignored.
  */
  function rstr2binl (input) {
    var i;
    var output = [];
    output[(input.length >> 2) - 1] = undefined;
    for (i = 0; i < output.length; i += 1) {
      output[i] = 0;
    }
    var length8 = input.length * 8;
    for (i = 0; i < length8; i += 8) {
      output[i >> 5] |= (input.charCodeAt(i / 8) & 0xff) << (i % 32);
    }
    return output
  }

  /*
  * Calculate the MD5 of a raw string
  */
  function rstrMD5 (s) {
    return binl2rstr(binlMD5(rstr2binl(s), s.length * 8))
  }

  /*
  * Calculate the HMAC-MD5, of a key and some data (raw strings)
  */
  function rstrHMACMD5 (key, data) {
    var i;
    var bkey = rstr2binl(key);
    var ipad = [];
    var opad = [];
    var hash;
    ipad[15] = opad[15] = undefined;
    if (bkey.length > 16) {
      bkey = binlMD5(bkey, key.length * 8);
    }
    for (i = 0; i < 16; i += 1) {
      ipad[i] = bkey[i] ^ 0x36363636;
      opad[i] = bkey[i] ^ 0x5c5c5c5c;
    }
    hash = binlMD5(ipad.concat(rstr2binl(data)), 512 + data.length * 8);
    return binl2rstr(binlMD5(opad.concat(hash), 512 + 128))
  }

  /*
  * Convert a raw string to a hex string
  */
  function rstr2hex (input) {
    var hexTab = '0123456789abcdef';
    var output = '';
    var x;
    var i;
    for (i = 0; i < input.length; i += 1) {
      x = input.charCodeAt(i);
      output += hexTab.charAt((x >>> 4) & 0x0f) + hexTab.charAt(x & 0x0f);
    }
    return output
  }

  /*
  * Encode a string as utf-8
  */
  function str2rstrUTF8 (input) {
    return unescape(encodeURIComponent(input))
  }

  /*
  * Take string arguments and return either raw or hex encoded strings
  */
  function rawMD5 (s) {
    return rstrMD5(str2rstrUTF8(s))
  }
  function hexMD5 (s) {
    return rstr2hex(rawMD5(s))
  }
  function rawHMACMD5 (k, d) {
    return rstrHMACMD5(str2rstrUTF8(k), str2rstrUTF8(d))
  }
  function hexHMACMD5 (k, d) {
    return rstr2hex(rawHMACMD5(k, d))
  }

  function md5 (string, key, raw) {
    if (!key) {
      if (!raw) {
        return hexMD5(string)
      }
      return rawMD5(string)
    }
    if (!raw) {
      return hexHMACMD5(key, string)
    }
    return rawHMACMD5(key, string)
  }

  if (typeof undefined === 'function' && undefined.amd) {
    undefined(function () {
      return md5
    });
  } else if ('object' === 'object' && module.exports) {
    module.exports = md5;
  } else {
    $.md5 = md5;
  }
})(commonjsGlobal);
});

var strictUriEncode = function (str) {
	return encodeURIComponent(str).replace(/[!'()*]/g, function (c) {
		return '%' + c.charCodeAt(0).toString(16).toUpperCase();
	});
};

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

var token = '%[a-f0-9]{2}';
var singleMatcher = new RegExp(token, 'gi');
var multiMatcher = new RegExp('(' + token + ')+', 'gi');

function decodeComponents(components, split) {
	try {
		// Try to decode the entire string first
		return decodeURIComponent(components.join(''));
	} catch (err) {
		// Do nothing
	}

	if (components.length === 1) {
		return components;
	}

	split = split || 1;

	// Split the array in 2 parts
	var left = components.slice(0, split);
	var right = components.slice(split);

	return Array.prototype.concat.call([], decodeComponents(left), decodeComponents(right));
}

function decode(input) {
	try {
		return decodeURIComponent(input);
	} catch (err) {
		var tokens = input.match(singleMatcher);

		for (var i = 1; i < tokens.length; i++) {
			input = decodeComponents(tokens, i).join('');

			tokens = input.match(singleMatcher);
		}

		return input;
	}
}

function customDecodeURIComponent(input) {
	// Keep track of all the replacements and prefill the map with the `BOM`
	var replaceMap = {
		'%FE%FF': '\uFFFD\uFFFD',
		'%FF%FE': '\uFFFD\uFFFD'
	};

	var match = multiMatcher.exec(input);
	while (match) {
		try {
			// Decode as big chunks as possible
			replaceMap[match[0]] = decodeURIComponent(match[0]);
		} catch (err) {
			var result = decode(match[0]);

			if (result !== match[0]) {
				replaceMap[match[0]] = result;
			}
		}

		match = multiMatcher.exec(input);
	}

	// Add `%C2` at the end of the map to make sure it does not replace the combinator before everything else
	replaceMap['%C2'] = '\uFFFD';

	var entries = Object.keys(replaceMap);

	for (var i = 0; i < entries.length; i++) {
		// Replace all decoded components
		var key = entries[i];
		input = input.replace(new RegExp(key, 'g'), replaceMap[key]);
	}

	return input;
}

var decodeUriComponent = function (encodedURI) {
	if (typeof encodedURI !== 'string') {
		throw new TypeError('Expected `encodedURI` to be of type `string`, got `' + typeof encodedURI + '`');
	}

	try {
		encodedURI = encodedURI.replace(/\+/g, ' ');

		// Try the built in decoder first
		return decodeURIComponent(encodedURI);
	} catch (err) {
		// Fallback to a more advanced decoder
		return customDecodeURIComponent(encodedURI);
	}
};

function encoderForArrayFormat(opts) {
	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, index) {
				return value === null ? [
					encode(key, opts),
					'[',
					index,
					']'
				].join('') : [
					encode(key, opts),
					'[',
					encode(index, opts),
					']=',
					encode(value, opts)
				].join('');
			};

		case 'bracket':
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'[]=',
					encode(value, opts)
				].join('');
			};

		default:
			return function (key, value) {
				return value === null ? encode(key, opts) : [
					encode(key, opts),
					'=',
					encode(value, opts)
				].join('');
			};
	}
}

function parserForArrayFormat(opts) {
	var result;

	switch (opts.arrayFormat) {
		case 'index':
			return function (key, value, accumulator) {
				result = /\[(\d*)\]$/.exec(key);

				key = key.replace(/\[\d*\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				}

				if (accumulator[key] === undefined) {
					accumulator[key] = {};
				}

				accumulator[key][result[1]] = value;
			};

		case 'bracket':
			return function (key, value, accumulator) {
				result = /(\[\])$/.exec(key);
				key = key.replace(/\[\]$/, '');

				if (!result) {
					accumulator[key] = value;
					return;
				} else if (accumulator[key] === undefined) {
					accumulator[key] = [value];
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};

		default:
			return function (key, value, accumulator) {
				if (accumulator[key] === undefined) {
					accumulator[key] = value;
					return;
				}

				accumulator[key] = [].concat(accumulator[key], value);
			};
	}
}

function encode(value, opts) {
	if (opts.encode) {
		return opts.strict ? strictUriEncode(value) : encodeURIComponent(value);
	}

	return value;
}

function keysSorter(input) {
	if (Array.isArray(input)) {
		return input.sort();
	} else if (typeof input === 'object') {
		return keysSorter(Object.keys(input)).sort(function (a, b) {
			return Number(a) - Number(b);
		}).map(function (key) {
			return input[key];
		});
	}

	return input;
}

function extract(str) {
	var queryStart = str.indexOf('?');
	if (queryStart === -1) {
		return '';
	}
	return str.slice(queryStart + 1);
}

function parse(str, opts) {
	opts = objectAssign({arrayFormat: 'none'}, opts);

	var formatter = parserForArrayFormat(opts);

	// Create an object with no prototype
	// https://github.com/sindresorhus/query-string/issues/47
	var ret = Object.create(null);

	if (typeof str !== 'string') {
		return ret;
	}

	str = str.trim().replace(/^[?#&]/, '');

	if (!str) {
		return ret;
	}

	str.split('&').forEach(function (param) {
		var parts = param.replace(/\+/g, ' ').split('=');
		// Firefox (pre 40) decodes `%3D` to `=`
		// https://github.com/sindresorhus/query-string/pull/37
		var key = parts.shift();
		var val = parts.length > 0 ? parts.join('=') : undefined;

		// missing `=` should be `null`:
		// http://w3.org/TR/2012/WD-url-20120524/#collect-url-parameters
		val = val === undefined ? null : decodeUriComponent(val);

		formatter(decodeUriComponent(key), val, ret);
	});

	return Object.keys(ret).sort().reduce(function (result, key) {
		var val = ret[key];
		if (Boolean(val) && typeof val === 'object' && !Array.isArray(val)) {
			// Sort object keys, not values
			result[key] = keysSorter(val);
		} else {
			result[key] = val;
		}

		return result;
	}, Object.create(null));
}

var extract_1 = extract;
var parse_1 = parse;

var stringify = function (obj, opts) {
	var defaults = {
		encode: true,
		strict: true,
		arrayFormat: 'none'
	};

	opts = objectAssign(defaults, opts);

	if (opts.sort === false) {
		opts.sort = function () {};
	}

	var formatter = encoderForArrayFormat(opts);

	return obj ? Object.keys(obj).sort(opts.sort).map(function (key) {
		var val = obj[key];

		if (val === undefined) {
			return '';
		}

		if (val === null) {
			return encode(key, opts);
		}

		if (Array.isArray(val)) {
			var result = [];

			val.slice().forEach(function (val2) {
				if (val2 === undefined) {
					return;
				}

				result.push(formatter(key, val2, result.length));
			});

			return result.join('&');
		}

		return encode(key, opts) + '=' + encode(val, opts);
	}).filter(function (x) {
		return x.length > 0;
	}).join('&') : '';
};

var parseUrl = function (str, opts) {
	return {
		url: str.split('?')[0] || '',
		query: parse(extract(str), opts)
	};
};

var queryString = {
	extract: extract_1,
	parse: parse_1,
	stringify: stringify,
	parseUrl: parseUrl
};

/*
 * Simple AJAX request object
 */
var Request = function Request(url, data) {
  this.url = url;
  this.data = data || {};
};

Request.prototype.send = function (callback) {
  var isIE = window.XDomainRequest ? true : false;
  if (isIE) {
    var xdr = new window.XDomainRequest();
    xdr.open('POST', this.url, true);
    xdr.onload = function () {
      callback(200, xdr.responseText);
    };
    xdr.onerror = function () {
      // status code not available from xdr, try string matching on responseText
      if (xdr.responseText === 'Request Entity Too Large') {
        callback(413, xdr.responseText);
      } else {
        callback(500, xdr.responseText);
      }
    };
    xdr.ontimeout = function () {};
    xdr.onprogress = function () {};
    xdr.send(queryString.stringify(this.data));
  } else {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', this.url, true);
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        callback(xhr.status, xhr.responseText);
      }
    };
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
    xhr.send(queryString.stringify(this.data));
  }
  //log('sent request to ' + this.url + ' with data ' + decodeURIComponent(queryString(this.data)));
};

/*
 * Wrapper for logging Revenue data. Revenue objects get passed to amplitude.logRevenueV2 to send to Amplitude servers.
 * Note: price is the only required field. If quantity is not specified, then defaults to 1.
 */

/**
 * Revenue API - instance constructor. Revenue objects are a wrapper for revenue data.
 * Each method updates a revenue property in the Revenue object, and returns the same Revenue object,
 * allowing you to chain multiple method calls together.
 * Note: price is a required field to log revenue events.
 * If quantity is not specified then defaults to 1.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue} for more information
 * about logging Revenue.
 * @constructor Revenue
 * @public
 * @example var revenue = new amplitude.Revenue();
 */
var Revenue = function Revenue() {
  // required fields
  this._price = null;

  // optional fields
  this._productId = null;
  this._quantity = 1;
  this._revenueType = null;
  this._properties = null;
};

/**
 * Set a value for the product identifer.
 * @public
 * @param {string} productId - The value for the product identifier. Empty and invalid strings are ignored.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setProductId = function setProductId(productId) {
  if (type(productId) !== 'string') {
    utils.log.error('Unsupported type for productId: ' + type(productId) + ', expecting string');
  } else if (utils.isEmptyString(productId)) {
    utils.log.error('Invalid empty productId');
  } else {
    this._productId = productId;
  }
  return this;
};

/**
 * Set a value for the quantity. Note revenue amount is calculated as price * quantity.
 * @public
 * @param {number} quantity - Integer value for the quantity. If not set, quantity defaults to 1.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setQuantity(5);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setQuantity = function setQuantity(quantity) {
  if (type(quantity) !== 'number') {
    utils.log.error('Unsupported type for quantity: ' + type(quantity) + ', expecting number');
  } else {
    this._quantity = parseInt(quantity);
  }
  return this;
};

/**
 * Set a value for the price. This field is required for all revenue being logged.
 * Note revenue amount is calculated as price * quantity.
 * @public
 * @param {number} price - Double value for the quantity.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setPrice = function setPrice(price) {
  if (type(price) !== 'number') {
    utils.log.error('Unsupported type for price: ' + type(price) + ', expecting number');
  } else {
    this._price = price;
  }
  return this;
};

/**
 * Set a value for the revenueType (for example purchase, cost, tax, refund, etc).
 * @public
 * @param {string} revenueType - RevenueType to designate.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setRevenueType('purchase');
 * amplitude.logRevenueV2(revenue);
 */
Revenue.prototype.setRevenueType = function setRevenueType(revenueType) {
  if (type(revenueType) !== 'string') {
    utils.log.error('Unsupported type for revenueType: ' + type(revenueType) + ', expecting string');
  } else {
    this._revenueType = revenueType;
  }
  return this;
};

/**
 * Set event properties for the revenue event.
 * @public
 * @param {object} eventProperties - Revenue event properties to set.
 * @return {Revenue} Returns the same Revenue object, allowing you to chain multiple method calls together.
 * @example var event_properties = {'city': 'San Francisco'};
 * var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99).setEventProperties(event_properties);
 * amplitude.logRevenueV2(revenue);
*/
Revenue.prototype.setEventProperties = function setEventProperties(eventProperties) {
  if (type(eventProperties) !== 'object') {
    utils.log.error('Unsupported type for eventProperties: ' + type(eventProperties) + ', expecting object');
  } else {
    this._properties = utils.validateProperties(eventProperties);
  }
  return this;
};

/**
 * @private
 */
Revenue.prototype._isValidRevenue = function _isValidRevenue() {
  if (type(this._price) !== 'number') {
    utils.log.error('Invalid revenue, need to set price field');
    return false;
  }
  return true;
};

/**
 * @private
 */
Revenue.prototype._toJSONObject = function _toJSONObject() {
  var obj = type(this._properties) === 'object' ? this._properties : {};

  if (this._productId !== null) {
    obj[constants.REVENUE_PRODUCT_ID] = this._productId;
  }
  if (this._quantity !== null) {
    obj[constants.REVENUE_QUANTITY] = this._quantity;
  }
  if (this._price !== null) {
    obj[constants.REVENUE_PRICE] = this._price;
  }
  if (this._revenueType !== null) {
    obj[constants.REVENUE_REVENUE_TYPE] = this._revenueType;
  }
  return obj;
};

var uaParser = createCommonjsModule(function (module, exports) {
/* jshint eqeqeq: false, forin: false */
/* global define */

/**
 * UAParser.js v0.7.10
 * Lightweight JavaScript-based User-Agent string parser
 * https://github.com/faisalman/ua-parser-js
 *
 * Copyright © 2012-2015 Faisal Salman <fyzlman@gmail.com>
 * Dual licensed under GPLv2 & MIT
 */

(function (window, undefined) {

    //////////////
    // Constants
    /////////////


    var LIBVERSION  = '0.7.10',
        EMPTY       = '',
        UNKNOWN     = '?',
        FUNC_TYPE   = 'function',
        UNDEF_TYPE  = 'undefined',
        OBJ_TYPE    = 'object',
        STR_TYPE    = 'string',
        MAJOR       = 'major', // deprecated
        MODEL       = 'model',
        NAME        = 'name',
        TYPE        = 'type',
        VENDOR      = 'vendor',
        VERSION     = 'version',
        ARCHITECTURE= 'architecture',
        CONSOLE     = 'console',
        MOBILE      = 'mobile',
        TABLET      = 'tablet',
        SMARTTV     = 'smarttv',
        WEARABLE    = 'wearable',
        EMBEDDED    = 'embedded';


    ///////////
    // Helper
    //////////


    var util = {
        extend : function (regexes, extensions) {
            var margedRegexes = {};
            for (var i in regexes) {
                if (extensions[i] && extensions[i].length % 2 === 0) {
                    margedRegexes[i] = extensions[i].concat(regexes[i]);
                } else {
                    margedRegexes[i] = regexes[i];
                }
            }
            return margedRegexes;
        },
        has : function (str1, str2) {
          if (typeof str1 === "string") {
            return str2.toLowerCase().indexOf(str1.toLowerCase()) !== -1;
          } else {
            return false;
          }
        },
        lowerize : function (str) {
            return str.toLowerCase();
        },
        major : function (version) {
            return typeof(version) === STR_TYPE ? version.split(".")[0] : undefined;
        }
    };


    ///////////////
    // Map helper
    //////////////


    var mapper = {

        rgx : function () {

            var result, i = 0, j, k, p, q, matches, match, args = arguments;

            // loop through all regexes maps
            while (i < args.length && !matches) {

                var regex = args[i],       // even sequence (0,2,4,..)
                    props = args[i + 1];   // odd sequence (1,3,5,..)

                // construct object barebones
                if (typeof result === UNDEF_TYPE) {
                    result = {};
                    for (p in props) {
                        if (props.hasOwnProperty(p)){
                            q = props[p];
                            if (typeof q === OBJ_TYPE) {
                                result[q[0]] = undefined;
                            } else {
                                result[q] = undefined;
                            }
                        }
                    }
                }

                // try matching uastring with regexes
                j = k = 0;
                while (j < regex.length && !matches) {
                    matches = regex[j++].exec(this.getUA());
                    if (!!matches) {
                        for (p = 0; p < props.length; p++) {
                            match = matches[++k];
                            q = props[p];
                            // check if given property is actually array
                            if (typeof q === OBJ_TYPE && q.length > 0) {
                                if (q.length == 2) {
                                    if (typeof q[1] == FUNC_TYPE) {
                                        // assign modified match
                                        result[q[0]] = q[1].call(this, match);
                                    } else {
                                        // assign given value, ignore regex match
                                        result[q[0]] = q[1];
                                    }
                                } else if (q.length == 3) {
                                    // check whether function or regex
                                    if (typeof q[1] === FUNC_TYPE && !(q[1].exec && q[1].test)) {
                                        // call function (usually string mapper)
                                        result[q[0]] = match ? q[1].call(this, match, q[2]) : undefined;
                                    } else {
                                        // sanitize match using given regex
                                        result[q[0]] = match ? match.replace(q[1], q[2]) : undefined;
                                    }
                                } else if (q.length == 4) {
                                        result[q[0]] = match ? q[3].call(this, match.replace(q[1], q[2])) : undefined;
                                }
                            } else {
                                result[q] = match ? match : undefined;
                            }
                        }
                    }
                }
                i += 2;
            }
            return result;
        },

        str : function (str, map) {

            for (var i in map) {
                // check if array
                if (typeof map[i] === OBJ_TYPE && map[i].length > 0) {
                    for (var j = 0; j < map[i].length; j++) {
                        if (util.has(map[i][j], str)) {
                            return (i === UNKNOWN) ? undefined : i;
                        }
                    }
                } else if (util.has(map[i], str)) {
                    return (i === UNKNOWN) ? undefined : i;
                }
            }
            return str;
        }
    };


    ///////////////
    // String map
    //////////////


    var maps = {

        browser : {
            oldsafari : {
                version : {
                    '1.0'   : '/8',
                    '1.2'   : '/1',
                    '1.3'   : '/3',
                    '2.0'   : '/412',
                    '2.0.2' : '/416',
                    '2.0.3' : '/417',
                    '2.0.4' : '/419',
                    '?'     : '/'
                }
            },
            name : {
                'Opera Mobile' : 'Opera Mobi',
                'IE Mobile'    : 'IEMobile'
            }
        },

        device : {
            amazon : {
                model : {
                    'Fire Phone' : ['SD', 'KF']
                }
            },
            sprint : {
                model : {
                    'Evo Shift 4G' : '7373KT'
                },
                vendor : {
                    'HTC'       : 'APA',
                    'Sprint'    : 'Sprint'
                }
            }
        },

        os : {
            windows : {
                version : {
                    'ME'        : '4.90',
                    'NT 3.11'   : 'NT3.51',
                    'NT 4.0'    : 'NT4.0',
                    '2000'      : 'NT 5.0',
                    'XP'        : ['NT 5.1', 'NT 5.2'],
                    'Vista'     : 'NT 6.0',
                    '7'         : 'NT 6.1',
                    '8'         : 'NT 6.2',
                    '8.1'       : 'NT 6.3',
                    '10'        : ['NT 6.4', 'NT 10.0'],
                    'RT'        : 'ARM'
                },
                name : {
                    'Windows Phone' : 'Windows Phone OS'
                }
            }
        }
    };


    //////////////
    // Regex map
    /////////////


    var regexes = {

        browser : [[

            // Presto based
            /(opera\smini)\/([\w\.-]+)/i,                                       // Opera Mini
            /(opera\s[mobiletab]+).+version\/([\w\.-]+)/i,                      // Opera Mobi/Tablet
            /(opera).+version\/([\w\.]+)/i,                                     // Opera > 9.80
            /(opera)[\/\s]+([\w\.]+)/i                                          // Opera < 9.80
            ], [NAME, VERSION], [

            /(OPiOS)[\/\s]+([\w\.]+)/i                                          // Opera mini on iphone >= 8.0
            ], [[NAME, 'Opera Mini'], VERSION], [

            /\s(opr)\/([\w\.]+)/i                                               // Opera Webkit
            ], [[NAME, 'Opera'], VERSION], [

            // Mixed
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /(lunascape|maxthon|netfront|jasmine|blazer)[\/\s]?([\w\.]+)*/i,
                                                                                // Lunascape/Maxthon/Netfront/Jasmine/Blazer

            // Trident based
            /(avant\s|iemobile|slim|baidu)(?:browser)?[\/\s]?([\w\.]*)/i,
                                                                                // Avant/IEMobile/SlimBrowser/Baidu
            /(?:ms|\()(ie)\s([\w\.]+)/i,                                        // Internet Explorer

            // Webkit/KHTML based
            /(rekonq)\/([\w\.]+)*/i,                                            // Rekonq
            /(chromium|flock|rockmelt|midori|epiphany|silk|skyfire|ovibrowser|bolt|iron|vivaldi|iridium|phantomjs)\/([\w\.-]+)/i
                                                                                // Chromium/Flock/RockMelt/Midori/Epiphany/Silk/Skyfire/Bolt/Iron/Iridium/PhantomJS
            ], [NAME, VERSION], [

            /(trident).+rv[:\s]([\w\.]+).+like\sgecko/i                         // IE11
            ], [[NAME, 'IE'], VERSION], [

            /(edge)\/((\d+)?[\w\.]+)/i                                          // Microsoft Edge
            ], [NAME, VERSION], [

            /(yabrowser)\/([\w\.]+)/i                                           // Yandex
            ], [[NAME, 'Yandex'], VERSION], [

            /(comodo_dragon)\/([\w\.]+)/i                                       // Comodo Dragon
            ], [[NAME, /_/g, ' '], VERSION], [

            /((?:android.+)crmo|crios)\/([\w\.]+)/i,
            /android.+(chrome)\/([\w\.]+)\s+(?:mobile\s?safari)/i               // Chrome for Android/iOS
            ], [[NAME, 'Chrome Mobile'], VERSION], [

            /(chrome|omniweb|arora|[tizenoka]{5}\s?browser)\/v?([\w\.]+)/i,
                                                                                // Chrome/OmniWeb/Arora/Tizen/Nokia
            /(qqbrowser)[\/\s]?([\w\.]+)/i
                                                                                // QQBrowser
            ], [NAME, VERSION], [

            /(uc\s?browser)[\/\s]?([\w\.]+)/i,
            /ucweb.+(ucbrowser)[\/\s]?([\w\.]+)/i,
            /JUC.+(ucweb)[\/\s]?([\w\.]+)/i
                                                                                // UCBrowser
            ], [[NAME, 'UCBrowser'], VERSION], [

            /(dolfin)\/([\w\.]+)/i                                              // Dolphin
            ], [[NAME, 'Dolphin'], VERSION], [

            /XiaoMi\/MiuiBrowser\/([\w\.]+)/i                                   // MIUI Browser
            ], [VERSION, [NAME, 'MIUI Browser']], [

            /android.+version\/([\w\.]+)\s+(?:mobile\s?safari|safari)/i         // Android Browser
            ], [VERSION, [NAME, 'Android Browser']], [

            /FBAV\/([\w\.]+);/i                                                 // Facebook App for iOS
            ], [VERSION, [NAME, 'Facebook']], [

            /fxios\/([\w\.-]+)/i                                                // Firefox for iOS
            ], [VERSION, [NAME, 'Firefox']], [

            /version\/([\w\.]+).+?mobile\/\w+\s(safari)/i                       // Mobile Safari
            ], [VERSION, [NAME, 'Mobile Safari']], [

            /version\/([\w\.]+).+?(mobile\s?safari|safari)/i                    // Safari & Safari Mobile
            ], [VERSION, NAME], [

            /webkit.+?(mobile\s?safari|safari)(\/[\w\.]+)/i                     // Safari < 3.0
            ], [NAME, [VERSION, mapper.str, maps.browser.oldsafari.version]], [

            /(konqueror)\/([\w\.]+)/i,                                          // Konqueror
            /(webkit|khtml)\/([\w\.]+)/i
            ], [NAME, VERSION], [

            /(blackberry)\\s?\/([\w\.]+)/i                                      // Blackberry
            ], [[NAME, "BlackBerry"], VERSION], [

            // Gecko based
            /(navigator|netscape)\/([\w\.-]+)/i                                 // Netscape
            ], [[NAME, 'Netscape'], VERSION], [
            /(swiftfox)/i,                                                      // Swiftfox
            /(icedragon|iceweasel|camino|chimera|fennec|maemo\sbrowser|minimo|conkeror)[\/\s]?([\w\.\+]+)/i,
                                                                                // IceDragon/Iceweasel/Camino/Chimera/Fennec/Maemo/Minimo/Conkeror
            /(firefox|seamonkey|k-meleon|icecat|iceape|firebird|phoenix)\/([\w\.-]+)/i,
                                                                                // Firefox/SeaMonkey/K-Meleon/IceCat/IceApe/Firebird/Phoenix
            /(mozilla)\/([\w\.]+).+rv\:.+gecko\/\d+/i,                          // Mozilla

            // Other
            /(polaris|lynx|dillo|icab|doris|amaya|w3m|netsurf|sleipnir)[\/\s]?([\w\.]+)/i,
                                                                                // Polaris/Lynx/Dillo/iCab/Doris/Amaya/w3m/NetSurf/Sleipnir
            /(links)\s\(([\w\.]+)/i,                                            // Links
            /(gobrowser)\/?([\w\.]+)*/i,                                        // GoBrowser
            /(ice\s?browser)\/v?([\w\._]+)/i,                                   // ICE Browser
            /(mosaic)[\/\s]([\w\.]+)/i                                          // Mosaic
            ], [NAME, VERSION]

            /* /////////////////////
            // Media players BEGIN
            ////////////////////////

            , [

            /(apple(?:coremedia|))\/((\d+)[\w\._]+)/i,                          // Generic Apple CoreMedia
            /(coremedia) v((\d+)[\w\._]+)/i
            ], [NAME, VERSION], [

            /(aqualung|lyssna|bsplayer)\/((\d+)?[\w\.-]+)/i                     // Aqualung/Lyssna/BSPlayer
            ], [NAME, VERSION], [

            /(ares|ossproxy)\s((\d+)[\w\.-]+)/i                                 // Ares/OSSProxy
            ], [NAME, VERSION], [

            /(audacious|audimusicstream|amarok|bass|core|dalvik|gnomemplayer|music on console|nsplayer|psp-internetradioplayer|videos)\/((\d+)[\w\.-]+)/i,
                                                                                // Audacious/AudiMusicStream/Amarok/BASS/OpenCORE/Dalvik/GnomeMplayer/MoC
                                                                                // NSPlayer/PSP-InternetRadioPlayer/Videos
            /(clementine|music player daemon)\s((\d+)[\w\.-]+)/i,               // Clementine/MPD
            /(lg player|nexplayer)\s((\d+)[\d\.]+)/i,
            /player\/(nexplayer|lg player)\s((\d+)[\w\.-]+)/i                   // NexPlayer/LG Player
            ], [NAME, VERSION], [
            /(nexplayer)\s((\d+)[\w\.-]+)/i                                     // Nexplayer
            ], [NAME, VERSION], [

            /(flrp)\/((\d+)[\w\.-]+)/i                                          // Flip Player
            ], [[NAME, 'Flip Player'], VERSION], [

            /(fstream|nativehost|queryseekspider|ia-archiver|facebookexternalhit)/i
                                                                                // FStream/NativeHost/QuerySeekSpider/IA Archiver/facebookexternalhit
            ], [NAME], [

            /(gstreamer) souphttpsrc (?:\([^\)]+\)){0,1} libsoup\/((\d+)[\w\.-]+)/i
                                                                                // Gstreamer
            ], [NAME, VERSION], [

            /(htc streaming player)\s[\w_]+\s\/\s((\d+)[\d\.]+)/i,              // HTC Streaming Player
            /(java|python-urllib|python-requests|wget|libcurl)\/((\d+)[\w\.-_]+)/i,
                                                                                // Java/urllib/requests/wget/cURL
            /(lavf)((\d+)[\d\.]+)/i                                             // Lavf (FFMPEG)
            ], [NAME, VERSION], [

            /(htc_one_s)\/((\d+)[\d\.]+)/i                                      // HTC One S
            ], [[NAME, /_/g, ' '], VERSION], [

            /(mplayer)(?:\s|\/)(?:(?:sherpya-){0,1}svn)(?:-|\s)(r\d+(?:-\d+[\w\.-]+){0,1})/i
                                                                                // MPlayer SVN
            ], [NAME, VERSION], [

            /(mplayer)(?:\s|\/|[unkow-]+)((\d+)[\w\.-]+)/i                      // MPlayer
            ], [NAME, VERSION], [

            /(mplayer)/i,                                                       // MPlayer (no other info)
            /(yourmuze)/i,                                                      // YourMuze
            /(media player classic|nero showtime)/i                             // Media Player Classic/Nero ShowTime
            ], [NAME], [

            /(nero (?:home|scout))\/((\d+)[\w\.-]+)/i                           // Nero Home/Nero Scout
            ], [NAME, VERSION], [

            /(nokia\d+)\/((\d+)[\w\.-]+)/i                                      // Nokia
            ], [NAME, VERSION], [

            /\s(songbird)\/((\d+)[\w\.-]+)/i                                    // Songbird/Philips-Songbird
            ], [NAME, VERSION], [

            /(winamp)3 version ((\d+)[\w\.-]+)/i,                               // Winamp
            /(winamp)\s((\d+)[\w\.-]+)/i,
            /(winamp)mpeg\/((\d+)[\w\.-]+)/i
            ], [NAME, VERSION], [

            /(ocms-bot|tapinradio|tunein radio|unknown|winamp|inlight radio)/i  // OCMS-bot/tap in radio/tunein/unknown/winamp (no other info)
                                                                                // inlight radio
            ], [NAME], [

            /(quicktime|rma|radioapp|radioclientapplication|soundtap|totem|stagefright|streamium)\/((\d+)[\w\.-]+)/i
                                                                                // QuickTime/RealMedia/RadioApp/RadioClientApplication/
                                                                                // SoundTap/Totem/Stagefright/Streamium
            ], [NAME, VERSION], [

            /(smp)((\d+)[\d\.]+)/i                                              // SMP
            ], [NAME, VERSION], [

            /(vlc) media player - version ((\d+)[\w\.]+)/i,                     // VLC Videolan
            /(vlc)\/((\d+)[\w\.-]+)/i,
            /(xbmc|gvfs|xine|xmms|irapp)\/((\d+)[\w\.-]+)/i,                    // XBMC/gvfs/Xine/XMMS/irapp
            /(foobar2000)\/((\d+)[\d\.]+)/i,                                    // Foobar2000
            /(itunes)\/((\d+)[\d\.]+)/i                                         // iTunes
            ], [NAME, VERSION], [

            /(wmplayer)\/((\d+)[\w\.-]+)/i,                                     // Windows Media Player
            /(windows-media-player)\/((\d+)[\w\.-]+)/i
            ], [[NAME, /-/g, ' '], VERSION], [

            /windows\/((\d+)[\w\.-]+) upnp\/[\d\.]+ dlnadoc\/[\d\.]+ (home media server)/i
                                                                                // Windows Media Server
            ], [VERSION, [NAME, 'Windows']], [

            /(com\.riseupradioalarm)\/((\d+)[\d\.]*)/i                          // RiseUP Radio Alarm
            ], [NAME, VERSION], [

            /(rad.io)\s((\d+)[\d\.]+)/i,                                        // Rad.io
            /(radio.(?:de|at|fr))\s((\d+)[\d\.]+)/i
            ], [[NAME, 'rad.io'], VERSION]

            //////////////////////
            // Media players END
            ////////////////////*/

        ],

        cpu : [[

            /(?:(amd|x(?:(?:86|64)[_-])?|wow|win)64)[;\)]/i                     // AMD64
            ], [[ARCHITECTURE, 'amd64']], [

            /(ia32(?=;))/i                                                      // IA32 (quicktime)
            ], [[ARCHITECTURE, util.lowerize]], [

            /((?:i[346]|x)86)[;\)]/i                                            // IA32
            ], [[ARCHITECTURE, 'ia32']], [

            // PocketPC mistakenly identified as PowerPC
            /windows\s(ce|mobile);\sppc;/i
            ], [[ARCHITECTURE, 'arm']], [

            /((?:ppc|powerpc)(?:64)?)(?:\smac|;|\))/i                           // PowerPC
            ], [[ARCHITECTURE, /ower/, '', util.lowerize]], [

            /(sun4\w)[;\)]/i                                                    // SPARC
            ], [[ARCHITECTURE, 'sparc']], [

            /((?:avr32|ia64(?=;))|68k(?=\))|arm(?:64|(?=v\d+;))|(?=atmel\s)avr|(?:irix|mips|sparc)(?:64)?(?=;)|pa-risc)/i
                                                                                // IA64, 68K, ARM/64, AVR/32, IRIX/64, MIPS/64, SPARC/64, PA-RISC
            ], [[ARCHITECTURE, util.lowerize]]
        ],

        device : [[

            /\((ipad|playbook);[\w\s\);-]+(rim|apple)/i                         // iPad/PlayBook
            ], [MODEL, VENDOR, [TYPE, TABLET]], [

            /applecoremedia\/[\w\.]+ \((ipad)/                                  // iPad
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, TABLET]], [

            /(apple\s{0,1}tv)/i                                                 // Apple TV
            ], [[MODEL, 'Apple TV'], [VENDOR, 'Apple']], [

            /(archos)\s(gamepad2?)/i,                                           // Archos
            /(hp).+(touchpad)/i,                                                // HP TouchPad
            /(kindle)\/([\w\.]+)/i,                                             // Kindle
            /\s(nook)[\w\s]+build\/(\w+)/i,                                     // Nook
            /(dell)\s(strea[kpr\s\d]*[\dko])/i                                  // Dell Streak
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(kf[A-z]+)\sbuild\/[\w\.]+.*silk\//i                               // Kindle Fire HD
            ], [MODEL, [VENDOR, 'Amazon'], [TYPE, TABLET]], [
            /(sd|kf)[0349hijorstuw]+\sbuild\/[\w\.]+.*silk\//i                  // Fire Phone
            ], [[MODEL, mapper.str, maps.device.amazon.model], [VENDOR, 'Amazon'], [TYPE, MOBILE]], [

            /\((ip[honed|\s\w*]+);.+(apple)/i                                   // iPod/iPhone
            ], [MODEL, VENDOR, [TYPE, MOBILE]], [
            /\((ip[honed|\s\w*]+);/i                                            // iPod/iPhone
            ], [MODEL, [VENDOR, 'Apple'], [TYPE, MOBILE]], [

            /(blackberry)[\s-]?(\w+)/i,                                         // BlackBerry
            /(blackberry|benq|palm(?=\-)|sonyericsson|acer|asus|dell|huawei|meizu|motorola|polytron)[\s_-]?([\w-]+)*/i,
                                                                                // BenQ/Palm/Sony-Ericsson/Acer/Asus/Dell/Huawei/Meizu/Motorola/Polytron
            /(hp)\s([\w\s]+\w)/i,                                               // HP iPAQ
            /(asus)-?(\w+)/i                                                    // Asus
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /\(bb10;\s(\w+)/i                                                   // BlackBerry 10
            ], [MODEL, [VENDOR, 'BlackBerry'], [TYPE, MOBILE]], [
                                                                                // Asus Tablets
            /android.+(transfo[prime\s]{4,10}\s\w+|eeepc|slider\s\w+|nexus 7)/i
            ], [MODEL, [VENDOR, 'Asus'], [TYPE, TABLET]], [

            /(sony)\s(tablet\s[ps])\sbuild\//i,                                  // Sony
            /(sony)?(?:sgp.+)\sbuild\//i
            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Tablet'], [TYPE, TABLET]], [
            /(?:sony)?(?:(?:(?:c|d)\d{4})|(?:so[-l].+))\sbuild\//i
            ], [[VENDOR, 'Sony'], [MODEL, 'Xperia Phone'], [TYPE, MOBILE]], [

            /\s(ouya)\s/i,                                                      // Ouya
            /(nintendo)\s([wids3u]+)/i                                          // Nintendo
            ], [VENDOR, MODEL, [TYPE, CONSOLE]], [

            /android.+;\s(shield)\sbuild/i                                      // Nvidia
            ], [MODEL, [VENDOR, 'Nvidia'], [TYPE, CONSOLE]], [

            /(playstation\s[34portablevi]+)/i                                   // Playstation
            ], [MODEL, [VENDOR, 'Sony'], [TYPE, CONSOLE]], [

            /(sprint\s(\w+))/i                                                  // Sprint Phones
            ], [[VENDOR, mapper.str, maps.device.sprint.vendor], [MODEL, mapper.str, maps.device.sprint.model], [TYPE, MOBILE]], [

            /(lenovo)\s?(S(?:5000|6000)+(?:[-][\w+]))/i                         // Lenovo tablets
            ], [VENDOR, MODEL, [TYPE, TABLET]], [

            /(htc)[;_\s-]+([\w\s]+(?=\))|\w+)*/i,                               // HTC
            /(zte)-(\w+)*/i,                                                    // ZTE
            /(alcatel|geeksphone|huawei|lenovo|nexian|panasonic|(?=;\s)sony)[_\s-]?([\w-]+)*/i
                                                                                // Alcatel/GeeksPhone/Huawei/Lenovo/Nexian/Panasonic/Sony
            ], [VENDOR, [MODEL, /_/g, ' '], [TYPE, MOBILE]], [

            /(nexus\s9)/i                                                       // HTC Nexus 9
            ], [MODEL, [VENDOR, 'HTC'], [TYPE, TABLET]], [

            /[\s\(;](xbox(?:\sone)?)[\s\);]/i                                   // Microsoft Xbox
            ], [MODEL, [VENDOR, 'Microsoft'], [TYPE, CONSOLE]], [
            /(kin\.[onetw]{3})/i                                                // Microsoft Kin
            ], [[MODEL, /\./g, ' '], [VENDOR, 'Microsoft'], [TYPE, MOBILE]], [

                                                                                // Motorola
            /\s(milestone|droid(?:[2-4x]|\s(?:bionic|x2|pro|razr))?(:?\s4g)?)[\w\s]+build\//i,
            /mot[\s-]?(\w+)*/i,
            /(XT\d{3,4}) build\//i,
            /(nexus\s[6])/i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, MOBILE]], [
            /android.+\s(mz60\d|xoom[\s2]{0,2})\sbuild\//i
            ], [MODEL, [VENDOR, 'Motorola'], [TYPE, TABLET]], [

            /android.+((sch-i[89]0\d|shw-m380s|gt-p\d{4}|gt-n8000|sgh-t8[56]9|nexus 10))/i,
            /((SM-T\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, TABLET]], [                  // Samsung
            /((s[cgp]h-\w+|gt-\w+|galaxy\snexus|sm-n900))/i,
            /(sam[sung]*)[\s-]*(\w+-?[\w-]*)*/i,
            /sec-((sgh\w+))/i
            ], [[VENDOR, 'Samsung'], MODEL, [TYPE, MOBILE]], [
            /(samsung);smarttv/i
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [

            /\(dtv[\);].+(aquos)/i                                              // Sharp
            ], [MODEL, [VENDOR, 'Sharp'], [TYPE, SMARTTV]], [
            /sie-(\w+)*/i                                                       // Siemens
            ], [MODEL, [VENDOR, 'Siemens'], [TYPE, MOBILE]], [

            /(maemo|nokia).*(n900|lumia\s\d+)/i,                                // Nokia
            /(nokia)[\s_-]?([\w-]+)*/i
            ], [[VENDOR, 'Nokia'], MODEL, [TYPE, MOBILE]], [

            /android\s3\.[\s\w;-]{10}(a\d{3})/i                                 // Acer
            ], [MODEL, [VENDOR, 'Acer'], [TYPE, TABLET]], [

            /android\s3\.[\s\w;-]{10}(lg?)-([06cv9]{3,4})/i                     // LG Tablet
            ], [[VENDOR, 'LG'], MODEL, [TYPE, TABLET]], [
            /(lg) netcast\.tv/i                                                 // LG SmartTV
            ], [VENDOR, MODEL, [TYPE, SMARTTV]], [
            /(nexus\s[45])/i,                                                   // LG
            /lg[e;\s\/-]+(\w+)*/i
            ], [MODEL, [VENDOR, 'LG'], [TYPE, MOBILE]], [

            /android.+(ideatab[a-z0-9\-\s]+)/i                                  // Lenovo
            ], [MODEL, [VENDOR, 'Lenovo'], [TYPE, TABLET]], [

            /linux;.+((jolla));/i                                               // Jolla
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [

            /((pebble))app\/[\d\.]+\s/i                                         // Pebble
            ], [VENDOR, MODEL, [TYPE, WEARABLE]], [

            /android.+;\s(glass)\s\d/i                                          // Google Glass
            ], [MODEL, [VENDOR, 'Google'], [TYPE, WEARABLE]], [

            /android.+(\w+)\s+build\/hm\1/i,                                        // Xiaomi Hongmi 'numeric' models
            /android.+(hm[\s\-_]*note?[\s_]*(?:\d\w)?)\s+build/i,                   // Xiaomi Hongmi
            /android.+(mi[\s\-_]*(?:one|one[\s_]plus)?[\s_]*(?:\d\w)?)\s+build/i    // Xiaomi Mi
            ], [[MODEL, /_/g, ' '], [VENDOR, 'Xiaomi'], [TYPE, MOBILE]], [

            /\s(tablet)[;\/\s]/i,                                               // Unidentifiable Tablet
            /\s(mobile)[;\/\s]/i                                                // Unidentifiable Mobile
            ], [[TYPE, util.lowerize], VENDOR, MODEL]

            /*//////////////////////////
            // TODO: move to string map
            ////////////////////////////

            /(C6603)/i                                                          // Sony Xperia Z C6603
            ], [[MODEL, 'Xperia Z C6603'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [
            /(C6903)/i                                                          // Sony Xperia Z 1
            ], [[MODEL, 'Xperia Z 1'], [VENDOR, 'Sony'], [TYPE, MOBILE]], [

            /(SM-G900[F|H])/i                                                   // Samsung Galaxy S5
            ], [[MODEL, 'Galaxy S5'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G7102)/i                                                       // Samsung Galaxy Grand 2
            ], [[MODEL, 'Galaxy Grand 2'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G530H)/i                                                       // Samsung Galaxy Grand Prime
            ], [[MODEL, 'Galaxy Grand Prime'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-G313HZ)/i                                                      // Samsung Galaxy V
            ], [[MODEL, 'Galaxy V'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T805)/i                                                        // Samsung Galaxy Tab S 10.5
            ], [[MODEL, 'Galaxy Tab S 10.5'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [
            /(SM-G800F)/i                                                       // Samsung Galaxy S5 Mini
            ], [[MODEL, 'Galaxy S5 Mini'], [VENDOR, 'Samsung'], [TYPE, MOBILE]], [
            /(SM-T311)/i                                                        // Samsung Galaxy Tab 3 8.0
            ], [[MODEL, 'Galaxy Tab 3 8.0'], [VENDOR, 'Samsung'], [TYPE, TABLET]], [

            /(R1001)/i                                                          // Oppo R1001
            ], [MODEL, [VENDOR, 'OPPO'], [TYPE, MOBILE]], [
            /(X9006)/i                                                          // Oppo Find 7a
            ], [[MODEL, 'Find 7a'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R2001)/i                                                          // Oppo YOYO R2001
            ], [[MODEL, 'Yoyo R2001'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
            /(R815)/i                                                           // Oppo Clover R815
            ], [[MODEL, 'Clover R815'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [
             /(U707)/i                                                          // Oppo Find Way S
            ], [[MODEL, 'Find Way S'], [VENDOR, 'Oppo'], [TYPE, MOBILE]], [

            /(T3C)/i                                                            // Advan Vandroid T3C
            ], [MODEL, [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN T1J\+)/i                                                    // Advan Vandroid T1J+
            ], [[MODEL, 'Vandroid T1J+'], [VENDOR, 'Advan'], [TYPE, TABLET]], [
            /(ADVAN S4A)/i                                                      // Advan Vandroid S4A
            ], [[MODEL, 'Vandroid S4A'], [VENDOR, 'Advan'], [TYPE, MOBILE]], [

            /(V972M)/i                                                          // ZTE V972M
            ], [MODEL, [VENDOR, 'ZTE'], [TYPE, MOBILE]], [

            /(i-mobile)\s(IQ\s[\d\.]+)/i                                        // i-mobile IQ
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(IQ6.3)/i                                                          // i-mobile IQ IQ 6.3
            ], [[MODEL, 'IQ 6.3'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [
            /(i-mobile)\s(i-style\s[\d\.]+)/i                                   // i-mobile i-STYLE
            ], [VENDOR, MODEL, [TYPE, MOBILE]], [
            /(i-STYLE2.1)/i                                                     // i-mobile i-STYLE 2.1
            ], [[MODEL, 'i-STYLE 2.1'], [VENDOR, 'i-mobile'], [TYPE, MOBILE]], [

            /(mobiistar touch LAI 512)/i                                        // mobiistar touch LAI 512
            ], [[MODEL, 'Touch LAI 512'], [VENDOR, 'mobiistar'], [TYPE, MOBILE]], [

            /////////////
            // END TODO
            ///////////*/

        ],

        engine : [[

            /windows.+\sedge\/([\w\.]+)/i                                       // EdgeHTML
            ], [VERSION, [NAME, 'EdgeHTML']], [

            /(presto)\/([\w\.]+)/i,                                             // Presto
            /(webkit|trident|netfront|netsurf|amaya|lynx|w3m)\/([\w\.]+)/i,     // WebKit/Trident/NetFront/NetSurf/Amaya/Lynx/w3m
            /(khtml|tasman|links)[\/\s]\(?([\w\.]+)/i,                          // KHTML/Tasman/Links
            /(icab)[\/\s]([23]\.[\d\.]+)/i                                      // iCab
            ], [NAME, VERSION], [

            /rv\:([\w\.]+).*(gecko)/i                                           // Gecko
            ], [VERSION, NAME]
        ],

        os : [[

            // Windows based
            /microsoft\s(windows)\s(vista|xp)/i                                 // Windows (iTunes)
            ], [NAME, VERSION], [
            /(windows)\snt\s6\.2;\s(arm)/i,                                     // Windows RT
            /(windows\sphone(?:\sos)*|windows\smobile|windows)[\s\/]?([ntce\d\.\s]+\w)/i
            ], [[NAME, mapper.str, maps.os.windows.name], [VERSION, mapper.str, maps.os.windows.version]], [
            /(win(?=3|9|n)|win\s9x\s)([nt\d\.]+)/i
            ], [[NAME, 'Windows'], [VERSION, mapper.str, maps.os.windows.version]], [

            // Mobile/Embedded OS
            /\((bb)(10);/i                                                      // BlackBerry 10
            ], [[NAME, 'BlackBerry'], VERSION], [
            /(blackberry)\w*\/?([\w\.]+)*/i,                                    // Blackberry
            /(tizen)[\/\s]([\w\.]+)/i,                                          // Tizen
            /(android|webos|palm\sos|qnx|bada|rim\stablet\sos|meego|contiki)[\/\s-]?([\w\.]+)*/i,
                                                                                // Android/WebOS/Palm/QNX/Bada/RIM/MeeGo/Contiki
            /linux;.+(sailfish);/i                                              // Sailfish OS
            ], [NAME, VERSION], [
            /(symbian\s?o?s?|symbos|s60(?=;))[\/\s-]?([\w\.]+)*/i               // Symbian
            ], [[NAME, 'Symbian'], VERSION], [
            /\((series40);/i                                                    // Series 40
            ], [NAME], [
            /mozilla.+\(mobile;.+gecko.+firefox/i                               // Firefox OS
            ], [[NAME, 'Firefox OS'], VERSION], [

            // Console
            /(nintendo|playstation)\s([wids34portablevu]+)/i,                   // Nintendo/Playstation

            // GNU/Linux based
            /(mint)[\/\s\(]?(\w+)*/i,                                           // Mint
            /(mageia|vectorlinux)[;\s]/i,                                       // Mageia/VectorLinux
            /(joli|[kxln]?ubuntu|debian|[open]*suse|gentoo|(?=\s)arch|slackware|fedora|mandriva|centos|pclinuxos|redhat|zenwalk|linpus)[\/\s-]?([\w\.-]+)*/i,
                                                                                // Joli/Ubuntu/Debian/SUSE/Gentoo/Arch/Slackware
                                                                                // Fedora/Mandriva/CentOS/PCLinuxOS/RedHat/Zenwalk/Linpus
            /(hurd|linux)\s?([\w\.]+)*/i,                                       // Hurd/Linux
            /(gnu)\s?([\w\.]+)*/i                                               // GNU
            ], [[NAME, 'Linux'], VERSION], [

            /(cros)\s[\w]+\s([\w\.]+\w)/i                                       // Chromium OS
            ], [[NAME, 'Chromium OS'], VERSION],[

            // Solaris
            /(sunos)\s?([\w\.]+\d)*/i                                           // Solaris
            ], [[NAME, 'Solaris'], VERSION], [

            // BSD based
            /\s([frentopc-]{0,4}bsd|dragonfly)\s?([\w\.]+)*/i                   // FreeBSD/NetBSD/OpenBSD/PC-BSD/DragonFly
            ], [[NAME, 'Linux'], VERSION],[

            /(iphone)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i                  // iOS
            ], [[NAME, 'iPhone'], [VERSION, /_/g, '.']], [

            /(ipad)(?:.*os\s*([\w]+)*\slike\smac|;\sopera)/i                    // iOS
            ], [[NAME, 'iPad'], [VERSION, /_/g, '.']], [

            /(ip[honead]+)(?:.*os\s([\w]+)*\slike\smac|;\sopera)/i              // iOS
            ], [[NAME, 'iOS'], [VERSION, /_/g, '.']], [

            /(mac\sos\sx)\s?([\w\s\.]+\w)*/i,
            /(macintosh|mac(?=_powerpc)\s)/i                                    // Mac OS
            ], [[NAME, 'Mac'], [VERSION, /_/g, '.']], [

            // Other
            /((?:open)?solaris)[\/\s-]?([\w\.]+)*/i,                            // Solaris
            /(haiku)\s(\w+)/i,                                                  // Haiku
            /(aix)\s((\d)(?=\.|\)|\s)[\w\.]*)*/i,                               // AIX
            /(plan\s9|minix|beos|os\/2|amigaos|morphos|risc\sos|openvms)/i,
                                                                                // Plan9/Minix/BeOS/OS2/AmigaOS/MorphOS/RISCOS/OpenVMS
            /(unix)\s?([\w\.]+)*/i                                              // UNIX
            ], [NAME, VERSION]
        ]
    };


    /////////////////
    // Constructor
    ////////////////


    var UAParser = function (uastring, extensions) {

        if (!(this instanceof UAParser)) {
            return new UAParser(uastring, extensions).getResult();
        }

        var ua = uastring || ((window && window.navigator && window.navigator.userAgent) ? window.navigator.userAgent : EMPTY);
        var rgxmap = extensions ? util.extend(regexes, extensions) : regexes;

        this.getBrowser = function () {
            var browser = mapper.rgx.apply(this, rgxmap.browser);
            browser.major = util.major(browser.version);
            return browser;
        };
        this.getCPU = function () {
            return mapper.rgx.apply(this, rgxmap.cpu);
        };
        this.getDevice = function () {
            return mapper.rgx.apply(this, rgxmap.device);
        };
        this.getEngine = function () {
            return mapper.rgx.apply(this, rgxmap.engine);
        };
        this.getOS = function () {
            return mapper.rgx.apply(this, rgxmap.os);
        };
        this.getResult = function() {
            return {
                ua      : this.getUA(),
                browser : this.getBrowser(),
                engine  : this.getEngine(),
                os      : this.getOS(),
                device  : this.getDevice(),
                cpu     : this.getCPU()
            };
        };
        this.getUA = function () {
            return ua;
        };
        this.setUA = function (uastring) {
            ua = uastring;
            return this;
        };
        return this;
    };

    UAParser.VERSION = LIBVERSION;
    UAParser.BROWSER = {
        NAME    : NAME,
        MAJOR   : MAJOR, // deprecated
        VERSION : VERSION
    };
    UAParser.CPU = {
        ARCHITECTURE : ARCHITECTURE
    };
    UAParser.DEVICE = {
        MODEL   : MODEL,
        VENDOR  : VENDOR,
        TYPE    : TYPE,
        CONSOLE : CONSOLE,
        MOBILE  : MOBILE,
        SMARTTV : SMARTTV,
        TABLET  : TABLET,
        WEARABLE: WEARABLE,
        EMBEDDED: EMBEDDED
    };
    UAParser.ENGINE = {
        NAME    : NAME,
        VERSION : VERSION
    };
    UAParser.OS = {
        NAME    : NAME,
        VERSION : VERSION
    };


    ///////////
    // Export
    //////////


    // check js environment
    if ('object' !== UNDEF_TYPE) {
        // nodejs env
        if ('object' !== UNDEF_TYPE && module.exports) {
            exports = module.exports = UAParser;
        }
        exports.UAParser = UAParser;
    } else {
        // requirejs env (optional)
        if (typeof(undefined) === FUNC_TYPE && undefined.amd) {
            undefined("ua-parser-js", [], function () {
                return UAParser;
            });
        } else {
            // browser env
            window.UAParser = UAParser;
        }
    }

    // jQuery/Zepto specific (optional)
    // Note:
    //   In AMD env the global scope should be kept clean, but jQuery is an exception.
    //   jQuery always exports to global scope, unless jQuery.noConflict(true) is used,
    //   and we should catch that.
    var $ = window.jQuery || window.Zepto;
    if (typeof $ !== UNDEF_TYPE) {
        var parser = new UAParser();
        $.ua = parser.getResult();
        $.ua.get = function() {
            return parser.getUA();
        };
        $.ua.set = function (uastring) {
            parser.setUA(uastring);
            var result = parser.getResult();
            for (var prop in result) {
                $.ua[prop] = result[prop];
            }
        };
    }

})(typeof window === 'object' ? window : commonjsGlobal);
});
var uaParser_1 = uaParser.UAParser;

/* jshint bitwise: false, laxbreak: true */

/**
 * Source: [jed's gist]{@link https://gist.github.com/982883}.
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 * Used to generate UUIDs for deviceIds.
 * @private
 */
var uuid = function uuid(a) {
    return a // if the placeholder was passed, return
    ? ( // a random number from 0 to 15
    a ^ // unless b is 8,
    Math.random() // in which case
    * 16 // a random number from
    >> a / 4 // 8 to 11
    ).toString(16) // in hexadecimal
    : ( // or otherwise a concatenated string:
    [1e7] + // 10000000 +
    -1e3 + // -1000 +
    -4e3 + // -4000 +
    -8e3 + // -80000000 +
    -1e11 // -100000000000,
    ).replace( // replacing
    /[018]/g, // zeroes, ones, and eights with
    uuid // random hex digits
    );
};

var version = '4.7.0';

var getLanguage = function getLanguage() {
    return navigator && (navigator.languages && navigator.languages[0] || navigator.language || navigator.userLanguage) || undefined;
};

var language = {
    language: getLanguage()
};

// default options
var DEFAULT_OPTIONS = {
  apiEndpoint: 'api.amplitude.com',
  batchEvents: false,
  cookieExpiration: 365 * 10,
  cookieName: 'amplitude_id',
  deviceIdFromUrlParam: false,
  domain: '',
  eventUploadPeriodMillis: 30 * 1000, // 30s
  eventUploadThreshold: 30,
  forceHttps: true,
  includeGclid: false,
  includeReferrer: false,
  includeUtm: false,
  language: language.language,
  logLevel: 'WARN',
  optOut: false,
  platform: 'Web',
  savedMaxCount: 1000,
  saveEvents: true,
  saveParamsReferrerOncePerSession: true,
  secureCookie: false,
  sessionTimeout: 30 * 60 * 1000,
  trackingOptions: {
    city: true,
    country: true,
    device_model: true,
    dma: true,
    ip_address: true,
    language: true,
    os_name: true,
    os_version: true,
    platform: true,
    region: true,
    version_name: true
  },
  unsetParamsReferrerOnNewSession: false,
  unsentKey: 'amplitude_unsent',
  unsentIdentifyKey: 'amplitude_unsent_identify',
  uploadBatchSize: 100
};

/**
 * AmplitudeClient SDK API - instance constructor.
 * The Amplitude class handles creation of client instances, all you need to do is call amplitude.getInstance()
 * @constructor AmplitudeClient
 * @public
 * @example var amplitudeClient = new AmplitudeClient();
 */
var AmplitudeClient = function AmplitudeClient(instanceName) {
  this._instanceName = utils.isEmptyString(instanceName) ? constants.DEFAULT_INSTANCE : instanceName.toLowerCase();
  this._legacyStorageSuffix = this._instanceName === constants.DEFAULT_INSTANCE ? '' : '_' + this._instanceName;
  this._unsentEvents = [];
  this._unsentIdentifys = [];
  this._ua = new uaParser(navigator.userAgent).getResult();
  this.options = _extends({}, DEFAULT_OPTIONS, { trackingOptions: _extends({}, DEFAULT_OPTIONS.trackingOptions) });
  this.cookieStorage = new cookieStorage().getStorage();
  this._q = []; // queue for proxied functions before script load
  this._sending = false;
  this._updateScheduled = false;
  this._onInit = [];

  // event meta data
  this._eventId = 0;
  this._identifyId = 0;
  this._lastEventTime = null;
  this._newSession = false;
  this._sequenceNumber = 0;
  this._sessionId = null;

  this._userAgent = navigator && navigator.userAgent || null;
};

AmplitudeClient.prototype.Identify = Identify;
AmplitudeClient.prototype.Revenue = Revenue;

/**
 * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
 * This is required before any other methods can be called.
 * @public
 * @param {string} apiKey - The API key for your app.
 * @param {string} opt_userId - (optional) An identifier for this user.
 * @param {object} opt_config - (optional) Configuration options.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.
 * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
 * @example amplitudeClient.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
 */
AmplitudeClient.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
  if (type(apiKey) !== 'string' || utils.isEmptyString(apiKey)) {
    utils.log.error('Invalid apiKey. Please re-initialize with a valid apiKey');
    return;
  }

  try {
    this.options.apiKey = apiKey;
    this._storageSuffix = '_' + apiKey + this._legacyStorageSuffix;

    _parseConfig(this.options, opt_config);

    if (type(this.options.logLevel) === 'string') {
      utils.setLogLevel(this.options.logLevel);
    }

    var trackingOptions = _generateApiPropertiesTrackingConfig(this);
    this._apiPropertiesTrackingOptions = Object.keys(trackingOptions).length > 0 ? { tracking_options: trackingOptions } : {};

    this.cookieStorage.options({
      expirationDays: this.options.cookieExpiration,
      domain: this.options.domain,
      secure: this.options.secureCookie
    });
    this.options.domain = this.cookieStorage.options().domain;

    if (this._instanceName === constants.DEFAULT_INSTANCE) {
      _upgradeCookieData(this);
    }
    _loadCookieData(this);

    // load deviceId and userId from input, or try to fetch existing value from cookie
    this.options.deviceId = type(opt_config) === 'object' && type(opt_config.deviceId) === 'string' && !utils.isEmptyString(opt_config.deviceId) && opt_config.deviceId || this.options.deviceIdFromUrlParam && this._getDeviceIdFromUrlParam(this._getUrlParams()) || this.options.deviceId || uuid() + 'R';
    this.options.userId = type(opt_userId) === 'string' && !utils.isEmptyString(opt_userId) && opt_userId || type(opt_userId) === 'number' && opt_userId.toString() || this.options.userId || null;

    // load unsent events and identifies before any attempt to log new ones
    if (this.options.saveEvents) {
      this._unsentEvents = this._loadSavedUnsentEvents(this.options.unsentKey);
      this._unsentIdentifys = this._loadSavedUnsentEvents(this.options.unsentIdentifyKey);

      // validate event properties for unsent events
      for (var i = 0; i < this._unsentEvents.length; i++) {
        var eventProperties = this._unsentEvents[i].event_properties;
        var groups = this._unsentEvents[i].groups;
        this._unsentEvents[i].event_properties = utils.validateProperties(eventProperties);
        this._unsentEvents[i].groups = utils.validateGroups(groups);
      }

      // validate user properties for unsent identifys
      for (var j = 0; j < this._unsentIdentifys.length; j++) {
        var userProperties = this._unsentIdentifys[j].user_properties;
        var identifyGroups = this._unsentIdentifys[j].groups;
        this._unsentIdentifys[j].user_properties = utils.validateProperties(userProperties);
        this._unsentIdentifys[j].groups = utils.validateGroups(identifyGroups);
      }
    }

    var now = new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || now - this._lastEventTime > this.options.sessionTimeout) {
      if (this.options.unsetParamsReferrerOnNewSession) {
        this._unsetUTMParams();
      }
      this._newSession = true;
      this._sessionId = now;

      // only capture UTM params and referrer if new session
      if (this.options.saveParamsReferrerOncePerSession) {
        this._trackParamsAndReferrer();
      }
    }

    if (!this.options.saveParamsReferrerOncePerSession) {
      this._trackParamsAndReferrer();
    }

    this._lastEventTime = now;
    _saveCookieData(this);

    this._sendEventsIfReady(); // try sending unsent events
  } catch (e) {
    utils.log.error(e);
  } finally {
    if (type(opt_callback) === 'function') {
      opt_callback(this);
    }
  }

  for (var _i = 0; _i < this._onInit.length; _i++) {
    this._onInit[_i]();
  }
};

/**
 * @private
 */
AmplitudeClient.prototype._trackParamsAndReferrer = function _trackParamsAndReferrer() {
  if (this.options.includeUtm) {
    this._initUtmData();
  }
  if (this.options.includeReferrer) {
    this._saveReferrer(this._getReferrer());
  }
  if (this.options.includeGclid) {
    this._saveGclid(this._getUrlParams());
  }
};

/**
 * Parse and validate user specified config values and overwrite existing option value
 * DEFAULT_OPTIONS provides list of all config keys that are modifiable, as well as expected types for values
 * @private
 */
var _parseConfig = function _parseConfig(options, config) {
  if (type(config) !== 'object') {
    return;
  }

  // validates config value is defined, is the correct type, and some additional value sanity checks
  var parseValidateAndLoad = function parseValidateAndLoad(key) {
    if (!options.hasOwnProperty(key)) {
      return; // skip bogus config values
    }

    var inputValue = config[key];
    var expectedType = type(options[key]);
    if (!utils.validateInput(inputValue, key + ' option', expectedType)) {
      return;
    }
    if (expectedType === 'boolean') {
      options[key] = !!inputValue;
    } else if (expectedType === 'string' && !utils.isEmptyString(inputValue) || expectedType === 'number' && inputValue > 0) {
      options[key] = inputValue;
    } else if (expectedType === 'object') {
      _parseConfig(options[key], inputValue);
    }
  };

  for (var key in config) {
    if (config.hasOwnProperty(key)) {
      parseValidateAndLoad(key);
    }
  }
};

/**
 * Run functions queued up by proxy loading snippet
 * @private
 */
AmplitudeClient.prototype.runQueuedFunctions = function () {
  for (var i = 0; i < this._q.length; i++) {
    var fn = this[this._q[i][0]];
    if (type(fn) === 'function') {
      fn.apply(this, this._q[i].slice(1));
    }
  }
  this._q = []; // clear function queue after running
};

/**
 * Check that the apiKey is set before calling a function. Logs a warning message if not set.
 * @private
 */
AmplitudeClient.prototype._apiKeySet = function _apiKeySet(methodName) {
  if (utils.isEmptyString(this.options.apiKey)) {
    utils.log.error('Invalid apiKey. Please set a valid apiKey with init() before calling ' + methodName);
    return false;
  }
  return true;
};

/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */
AmplitudeClient.prototype._loadSavedUnsentEvents = function _loadSavedUnsentEvents(unsentKey) {
  var savedUnsentEventsString = this._getFromStorage(localStorage$1, unsentKey);
  var events = this._parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey);

  var savedUnsentEventsStringLegacy = this._getFromStorageLegacy(localStorage$1, unsentKey);
  var legacyEvents = this._parseSavedUnsentEventsString(savedUnsentEventsStringLegacy, unsentKey);

  var unsentEvents = legacyEvents.concat(events);

  // Migrate legacy events out of storage
  this._removeFromLegacyStorage(localStorage$1, unsentKey);
  this._setInStorage(localStorage$1, unsentKey, JSON.stringify(unsentEvents));

  return unsentEvents;
};

AmplitudeClient.prototype._removeFromLegacyStorage = function _removeFromLegacyStorage(storage, key) {
  storage.removeItem(key + this._legacyStorageSuffix);
};

/**
 * Load saved events from localStorage. JSON deserializes event array. Handles case where string is corrupted.
 * @private
 */
AmplitudeClient.prototype._parseSavedUnsentEventsString = function _parseSavedUnsentEventsString(savedUnsentEventsString, unsentKey) {
  if (utils.isEmptyString(savedUnsentEventsString)) {
    return []; // new app, does not have any saved events
  }

  if (type(savedUnsentEventsString) === 'string') {
    try {
      var events = JSON.parse(savedUnsentEventsString);
      if (type(events) === 'array') {
        // handle case where JSON dumping of unsent events is corrupted
        return events;
      }
    } catch (e) {}
  }
  utils.log.error('Unable to load ' + unsentKey + ' events. Restart with a new empty queue.');
  return [];
};

/**
 * Returns true if a new session was created during initialization, otherwise false.
 * @public
 * @return {boolean} Whether a new session was created during initialization.
 */
AmplitudeClient.prototype.isNewSession = function isNewSession() {
  return this._newSession;
};

/**
 * Store callbacks to call after init
 * @private
 */
AmplitudeClient.prototype.onInit = function (callback) {
  this._onInit.push(callback);
};

/**
 * Returns the id of the current session.
 * @public
 * @return {number} Id of the current session.
 */
AmplitudeClient.prototype.getSessionId = function getSessionId() {
  return this._sessionId;
};

/**
 * Increments the eventId and returns it.
 * @private
 */
AmplitudeClient.prototype.nextEventId = function nextEventId() {
  this._eventId++;
  return this._eventId;
};

/**
 * Increments the identifyId and returns it.
 * @private
 */
AmplitudeClient.prototype.nextIdentifyId = function nextIdentifyId() {
  this._identifyId++;
  return this._identifyId;
};

/**
 * Increments the sequenceNumber and returns it.
 * @private
 */
AmplitudeClient.prototype.nextSequenceNumber = function nextSequenceNumber() {
  this._sequenceNumber++;
  return this._sequenceNumber;
};

/**
 * Returns the total count of unsent events and identifys
 * @private
 */
AmplitudeClient.prototype._unsentCount = function _unsentCount() {
  return this._unsentEvents.length + this._unsentIdentifys.length;
};

/**
 * Send events if ready. Returns true if events are sent.
 * @private
 */
AmplitudeClient.prototype._sendEventsIfReady = function _sendEventsIfReady(callback) {
  if (this._unsentCount() === 0) {
    return false;
  }

  // if batching disabled, send any unsent events immediately
  if (!this.options.batchEvents) {
    this.sendEvents(callback);
    return true;
  }

  // if batching enabled, check if min threshold met for batch size
  if (this._unsentCount() >= this.options.eventUploadThreshold) {
    this.sendEvents(callback);
    return true;
  }

  // otherwise schedule an upload after 30s
  if (!this._updateScheduled) {
    // make sure we only schedule 1 upload
    this._updateScheduled = true;
    setTimeout(function () {
      this._updateScheduled = false;
      this.sendEvents();
    }.bind(this), this.options.eventUploadPeriodMillis);
  }

  return false; // an upload was scheduled, no events were uploaded
};

/**
 * Helper function to fetch values from storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._getFromStorage = function _getFromStorage(storage, key) {
  return storage.getItem(key + this._storageSuffix);
};

/**
 * Helper function to fetch values from storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._getFromStorageLegacy = function _getFromStorageLegacy(storage, key) {
  return storage.getItem(key + this._legacyStorageSuffix);
};

/**
 * Helper function to set values in storage
 * Storage argument allows for localStoraoge and sessionStoraoge
 * @private
 */
AmplitudeClient.prototype._setInStorage = function _setInStorage(storage, key, value) {
  storage.setItem(key + this._storageSuffix, value);
};

/**
 * cookieData (deviceId, userId, optOut, sessionId, lastEventTime, eventId, identifyId, sequenceNumber)
 * can be stored in many different places (localStorage, cookie, etc).
 * Need to unify all sources into one place with a one-time upgrade/migration.
 * @private
 */
var _upgradeCookieData = function _upgradeCookieData(scope) {
  // skip if already migrated to 4.10+
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);
  if (type(cookieData) === 'object') {
    return;
  }
  // skip if already migrated to 2.70+
  cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);
  if (type(cookieData) === 'object' && cookieData.deviceId && cookieData.sessionId && cookieData.lastEventTime) {
    return;
  }

  var _getAndRemoveFromLocalStorage = function _getAndRemoveFromLocalStorage(key) {
    var value = localStorage$1.getItem(key);
    localStorage$1.removeItem(key);
    return value;
  };

  // in v2.6.0, deviceId, userId, optOut was migrated to localStorage with keys + first 6 char of apiKey
  var apiKeySuffix = type(scope.options.apiKey) === 'string' && '_' + scope.options.apiKey.slice(0, 6) || '';
  var localStorageDeviceId = _getAndRemoveFromLocalStorage(constants.DEVICE_ID + apiKeySuffix);
  var localStorageUserId = _getAndRemoveFromLocalStorage(constants.USER_ID + apiKeySuffix);
  var localStorageOptOut = _getAndRemoveFromLocalStorage(constants.OPT_OUT + apiKeySuffix);
  if (localStorageOptOut !== null && localStorageOptOut !== undefined) {
    localStorageOptOut = String(localStorageOptOut) === 'true'; // convert to boolean
  }

  // pre-v2.7.0 event and session meta-data was stored in localStorage. move to cookie for sub-domain support
  var localStorageSessionId = parseInt(_getAndRemoveFromLocalStorage(constants.SESSION_ID));
  var localStorageLastEventTime = parseInt(_getAndRemoveFromLocalStorage(constants.LAST_EVENT_TIME));
  var localStorageEventId = parseInt(_getAndRemoveFromLocalStorage(constants.LAST_EVENT_ID));
  var localStorageIdentifyId = parseInt(_getAndRemoveFromLocalStorage(constants.LAST_IDENTIFY_ID));
  var localStorageSequenceNumber = parseInt(_getAndRemoveFromLocalStorage(constants.LAST_SEQUENCE_NUMBER));

  var _getFromCookie = function _getFromCookie(key) {
    return type(cookieData) === 'object' && cookieData[key];
  };
  scope.options.deviceId = _getFromCookie('deviceId') || localStorageDeviceId;
  scope.options.userId = _getFromCookie('userId') || localStorageUserId;
  scope._sessionId = _getFromCookie('sessionId') || localStorageSessionId || scope._sessionId;
  scope._lastEventTime = _getFromCookie('lastEventTime') || localStorageLastEventTime || scope._lastEventTime;
  scope._eventId = _getFromCookie('eventId') || localStorageEventId || scope._eventId;
  scope._identifyId = _getFromCookie('identifyId') || localStorageIdentifyId || scope._identifyId;
  scope._sequenceNumber = _getFromCookie('sequenceNumber') || localStorageSequenceNumber || scope._sequenceNumber;

  // optOut is a little trickier since it is a boolean
  scope.options.optOut = localStorageOptOut || false;
  if (cookieData && cookieData.optOut !== undefined && cookieData.optOut !== null) {
    scope.options.optOut = String(cookieData.optOut) === 'true';
  }

  _saveCookieData(scope);
};

/**
 * Fetches deviceId, userId, event meta data from amplitude cookie
 * @private
 */
var _loadCookieData = function _loadCookieData(scope) {
  var cookieData = scope.cookieStorage.get(scope.options.cookieName + scope._storageSuffix);

  if (type(cookieData) === 'object') {
    _loadCookieDataProps(scope, cookieData);
  } else {
    var legacyCookieData = scope.cookieStorage.get(scope.options.cookieName + scope._legacyStorageSuffix);
    if (type(legacyCookieData) === 'object') {
      scope.cookieStorage.remove(scope.options.cookieName + scope._legacyStorageSuffix);
      _loadCookieDataProps(scope, legacyCookieData);
    }
  }
};

var _loadCookieDataProps = function _loadCookieDataProps(scope, cookieData) {
  if (cookieData.deviceId) {
    scope.options.deviceId = cookieData.deviceId;
  }
  if (cookieData.userId) {
    scope.options.userId = cookieData.userId;
  }
  if (cookieData.optOut !== null && cookieData.optOut !== undefined) {
    scope.options.optOut = cookieData.optOut;
  }
  if (cookieData.sessionId) {
    scope._sessionId = parseInt(cookieData.sessionId);
  }
  if (cookieData.lastEventTime) {
    scope._lastEventTime = parseInt(cookieData.lastEventTime);
  }
  if (cookieData.eventId) {
    scope._eventId = parseInt(cookieData.eventId);
  }
  if (cookieData.identifyId) {
    scope._identifyId = parseInt(cookieData.identifyId);
  }
  if (cookieData.sequenceNumber) {
    scope._sequenceNumber = parseInt(cookieData.sequenceNumber);
  }
};

/**
 * Saves deviceId, userId, event meta data to amplitude cookie
 * @private
 */
var _saveCookieData = function _saveCookieData(scope) {
  scope.cookieStorage.set(scope.options.cookieName + scope._storageSuffix, {
    deviceId: scope.options.deviceId,
    userId: scope.options.userId,
    optOut: scope.options.optOut,
    sessionId: scope._sessionId,
    lastEventTime: scope._lastEventTime,
    eventId: scope._eventId,
    identifyId: scope._identifyId,
    sequenceNumber: scope._sequenceNumber
  });
};

/**
 * Parse the utm properties out of cookies and query for adding to user properties.
 * @private
 */
AmplitudeClient.prototype._initUtmData = function _initUtmData(queryParams, cookieParams) {
  queryParams = queryParams || this._getUrlParams();
  cookieParams = cookieParams || this.cookieStorage.get('__utmz');
  var utmProperties = getUtmData(cookieParams, queryParams);
  _sendParamsReferrerUserProperties(this, utmProperties);
};

/**
 * Unset the utm params from the Amplitude instance and update the identify.
 * @private
 */
AmplitudeClient.prototype._unsetUTMParams = function _unsetUTMParams() {
  var identify = new Identify();
  identify.unset(constants.REFERRER);
  identify.unset(constants.UTM_SOURCE);
  identify.unset(constants.UTM_MEDIUM);
  identify.unset(constants.UTM_CAMPAIGN);
  identify.unset(constants.UTM_TERM);
  identify.unset(constants.UTM_CONTENT);
  this.identify(identify);
};

/**
 * The calling function should determine when it is appropriate to send these user properties. This function
 * will no longer contain any session storage checking logic.
 * @private
 */
var _sendParamsReferrerUserProperties = function _sendParamsReferrerUserProperties(scope, userProperties) {
  if (type(userProperties) !== 'object' || Object.keys(userProperties).length === 0) {
    return;
  }

  // setOnce the initial user properties
  var identify = new Identify();
  for (var key in userProperties) {
    if (userProperties.hasOwnProperty(key)) {
      identify.setOnce('initial_' + key, userProperties[key]);
      identify.set(key, userProperties[key]);
    }
  }

  scope.identify(identify);
};

/**
 * @private
 */
AmplitudeClient.prototype._getReferrer = function _getReferrer() {
  return document.referrer;
};

/**
 * @private
 */
AmplitudeClient.prototype._getUrlParams = function _getUrlParams() {
  return location.search;
};

/**
 * Try to fetch Google Gclid from url params.
 * @private
 */
AmplitudeClient.prototype._saveGclid = function _saveGclid(urlParams) {
  var gclid = utils.getQueryParam('gclid', urlParams);
  if (utils.isEmptyString(gclid)) {
    return;
  }
  var gclidProperties = { 'gclid': gclid };
  _sendParamsReferrerUserProperties(this, gclidProperties);
};

/**
 * Try to fetch Amplitude device id from url params.
 * @private
 */
AmplitudeClient.prototype._getDeviceIdFromUrlParam = function _getDeviceIdFromUrlParam(urlParams) {
  return utils.getQueryParam(constants.AMP_DEVICE_ID_PARAM, urlParams);
};

/**
 * Parse the domain from referrer info
 * @private
 */
AmplitudeClient.prototype._getReferringDomain = function _getReferringDomain(referrer) {
  if (utils.isEmptyString(referrer)) {
    return null;
  }
  var parts = referrer.split('/');
  if (parts.length >= 3) {
    return parts[2];
  }
  return null;
};

/**
 * Fetch the referrer information, parse the domain and send.
 * Since user properties are propagated on the server, only send once per session, don't need to send with every event
 * @private
 */
AmplitudeClient.prototype._saveReferrer = function _saveReferrer(referrer) {
  if (utils.isEmptyString(referrer)) {
    return;
  }
  var referrerInfo = {
    'referrer': referrer,
    'referring_domain': this._getReferringDomain(referrer)
  };
  _sendParamsReferrerUserProperties(this, referrerInfo);
};

/**
 * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
 * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
 * @private
 */
AmplitudeClient.prototype.saveEvents = function saveEvents() {
  try {
    this._setInStorage(localStorage$1, this.options.unsentKey, JSON.stringify(this._unsentEvents));
  } catch (e) {}

  try {
    this._setInStorage(localStorage$1, this.options.unsentIdentifyKey, JSON.stringify(this._unsentIdentifys));
  } catch (e) {}
};

/**
 * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
 * @public
 * @param {string} domain to set.
 * @example amplitudeClient.setDomain('.amplitude.com');
 */
AmplitudeClient.prototype.setDomain = function setDomain(domain) {
  if (!utils.validateInput(domain, 'domain', 'string')) {
    return;
  }

  try {
    this.cookieStorage.options({
      domain: domain
    });
    this.options.domain = this.cookieStorage.options().domain;
    _loadCookieData(this);
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Sets an identifier for the current user.
 * @public
 * @param {string} userId - identifier to set. Can be null.
 * @example amplitudeClient.setUserId('joe@gmail.com');
 */
AmplitudeClient.prototype.setUserId = function setUserId(userId) {
  try {
    this.options.userId = userId !== undefined && userId !== null && '' + userId || null;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Add user to a group or groups. You need to specify a groupType and groupName(s).
 * For example you can group people by their organization.
 * In that case groupType is "orgId" and groupName would be the actual ID(s).
 * groupName can be a string or an array of strings to indicate a user in multiple gruups.
 * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
 * Note: this will also set groupType: groupName as a user property.
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information.
 * @public
 * @param {string} groupType - the group type (ex: orgId)
 * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
 * @example amplitudeClient.setGroup('orgId', 15); // this adds the current user to orgId 15.
 */
AmplitudeClient.prototype.setGroup = function (groupType, groupName) {
  if (!this._apiKeySet('setGroup()') || !utils.validateInput(groupType, 'groupType', 'string') || utils.isEmptyString(groupType)) {
    return;
  }

  var groups = {};
  groups[groupType] = groupName;
  var identify = new Identify().set(groupType, groupName);
  this._logEvent(constants.IDENTIFY_EVENT, null, null, identify.userPropertiesOperations, groups, null, null, null);
};

/**
 * Sets whether to opt current user out of tracking.
 * @public
 * @param {boolean} enable - if true then no events will be logged or sent.
 * @example: amplitude.setOptOut(true);
 */
AmplitudeClient.prototype.setOptOut = function setOptOut(enable) {
  if (!utils.validateInput(enable, 'enable', 'boolean')) {
    return;
  }

  try {
    this.options.optOut = enable;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.setSessionId = function setSessionId(sessionId) {
  if (!utils.validateInput(sessionId, 'sessionId', 'number')) {
    return;
  }

  try {
    this._sessionId = sessionId;
    _saveCookieData(this);
  } catch (e) {
    utils.log.error(e);
  }
};

AmplitudeClient.prototype.resetSessionId = function resetSessionId() {
  this.setSessionId(new Date().getTime());
};

/**
  * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
  * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
  * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
  * This uses src/uuid.js to regenerate the deviceId.
  * @public
  */
AmplitudeClient.prototype.regenerateDeviceId = function regenerateDeviceId() {
  this.setDeviceId(uuid() + 'R');
};

/**
  * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
  * (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
  * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
  * @public
  * @param {string} deviceId - custom deviceId for current user.
  * @example amplitudeClient.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
  */
AmplitudeClient.prototype.setDeviceId = function setDeviceId(deviceId) {
  if (!utils.validateInput(deviceId, 'deviceId', 'string')) {
    return;
  }

  try {
    if (!utils.isEmptyString(deviceId)) {
      this.options.deviceId = '' + deviceId;
      _saveCookieData(this);
    }
  } catch (e) {
    utils.log.error(e);
  }
};

/**
 * Sets user properties for the current user.
 * @public
 * @param {object} - object with string keys and values for the user properties to set.
 * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
 * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
 * @example amplitudeClient.setUserProperties({'gender': 'female', 'sign_up_complete': true})
 */
AmplitudeClient.prototype.setUserProperties = function setUserProperties(userProperties) {
  if (!this._apiKeySet('setUserProperties()') || !utils.validateInput(userProperties, 'userProperties', 'object')) {
    return;
  }
  // sanitize the userProperties dict before converting into identify
  var sanitized = utils.truncate(utils.validateProperties(userProperties));
  if (Object.keys(sanitized).length === 0) {
    return;
  }

  // convert userProperties into an identify call
  var identify = new Identify();
  for (var property in sanitized) {
    if (sanitized.hasOwnProperty(property)) {
      identify.set(property, sanitized[property]);
    }
  }
  this.identify(identify);
};

/**
 * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
 * @public
 * @example amplitudeClient.clearUserProperties();
 */
AmplitudeClient.prototype.clearUserProperties = function clearUserProperties() {
  if (!this._apiKeySet('clearUserProperties()')) {
    return;
  }

  var identify = new Identify();
  identify.clearAll();
  this.identify(identify);
};

/**
 * Applies the proxied functions on the proxied object to an instance of the real object.
 * Used to convert proxied Identify and Revenue objects.
 * @private
 */
var _convertProxyObjectToRealObject = function _convertProxyObjectToRealObject(instance, proxy) {
  for (var i = 0; i < proxy._q.length; i++) {
    var fn = instance[proxy._q[i][0]];
    if (type(fn) === 'function') {
      fn.apply(instance, proxy._q[i].slice(1));
    }
  }
  return instance;
};

/**
 * Send an identify call containing user property operations to Amplitude servers.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
 * for more information on the Identify API and user property operations.
 * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
 * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
 * Note: the server response code and response body from the identify event upload are passed to the callback function.
 * @example
 * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
 * amplitude.identify(identify);
 */
AmplitudeClient.prototype.identify = function (identify_obj, opt_callback) {
  if (!this._apiKeySet('identify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'API key is not set' });
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(constants.IDENTIFY_EVENT, null, null, identify_obj.userPropertiesOperations, null, null, null, opt_callback);
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', { reason: 'No user property operations' });
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid identify input type' });
    }
  }
};

AmplitudeClient.prototype.groupIdentify = function (group_type, group_name, identify_obj, opt_callback) {
  if (!this._apiKeySet('groupIdentify()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'API key is not set' });
    }
    return;
  }

  if (!utils.validateInput(group_type, 'group_type', 'string') || utils.isEmptyString(group_type)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid group type' });
    }
    return;
  }

  if (group_name === null || group_name === undefined) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid group name' });
    }
    return;
  }

  // if identify input is a proxied object created by the async loading snippet, convert it into an identify object
  if (type(identify_obj) === 'object' && identify_obj.hasOwnProperty('_q')) {
    identify_obj = _convertProxyObjectToRealObject(new Identify(), identify_obj);
  }

  if (identify_obj instanceof Identify) {
    // only send if there are operations
    if (Object.keys(identify_obj.userPropertiesOperations).length > 0) {
      return this._logEvent(constants.GROUP_IDENTIFY_EVENT, null, null, null, defineProperty({}, group_type, group_name), identify_obj.userPropertiesOperations, null, opt_callback);
    } else {
      if (type(opt_callback) === 'function') {
        opt_callback(0, 'No request sent', { reason: 'No group property operations' });
      }
    }
  } else {
    utils.log.error('Invalid identify input type. Expected Identify object but saw ' + type(identify_obj));
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid identify input type' });
    }
  }
};

/**
 * Set a versionName for your application.
 * @public
 * @param {string} versionName - The version to set for your application.
 * @example amplitudeClient.setVersionName('1.12.3');
 */
AmplitudeClient.prototype.setVersionName = function setVersionName(versionName) {
  if (!utils.validateInput(versionName, 'versionName', 'string')) {
    return;
  }
  this.options.versionName = versionName;
};

/**
 * Private logEvent method. Keeps apiProperties from being publicly exposed.
 * @private
 */
AmplitudeClient.prototype._logEvent = function _logEvent(eventType, eventProperties, apiProperties, userProperties, groups, groupProperties, timestamp, callback) {
  _loadCookieData(this); // reload cookie before each log event to sync event meta-data between windows and tabs
  if (!eventType) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'Missing eventType' });
    }
    return;
  }
  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'optOut is set to true' });
    }
    return;
  }

  try {
    var eventId;
    if (eventType === constants.IDENTIFY_EVENT || eventType === constants.GROUP_IDENTIFY_EVENT) {
      eventId = this.nextIdentifyId();
    } else {
      eventId = this.nextEventId();
    }
    var sequenceNumber = this.nextSequenceNumber();
    var eventTime = type(timestamp) === 'number' ? timestamp : new Date().getTime();
    if (!this._sessionId || !this._lastEventTime || eventTime - this._lastEventTime > this.options.sessionTimeout) {
      this._sessionId = eventTime;
    }
    this._lastEventTime = eventTime;
    _saveCookieData(this);

    userProperties = userProperties || {};
    var trackingOptions = _extends({}, this._apiPropertiesTrackingOptions);
    apiProperties = _extends({}, apiProperties || {}, trackingOptions);
    eventProperties = eventProperties || {};
    groups = groups || {};
    groupProperties = groupProperties || {};
    var event = {
      device_id: this.options.deviceId,
      user_id: this.options.userId,
      timestamp: eventTime,
      event_id: eventId,
      session_id: this._sessionId || -1,
      event_type: eventType,
      version_name: _shouldTrackField(this, 'version_name') ? this.options.versionName || null : null,
      platform: _shouldTrackField(this, 'platform') ? this.options.platform : null,
      os_name: _shouldTrackField(this, 'os_name') ? this._ua.browser.name || null : null,
      os_version: _shouldTrackField(this, 'os_version') ? this._ua.browser.major || null : null,
      device_model: _shouldTrackField(this, 'device_model') ? this._ua.os.name || null : null,
      language: _shouldTrackField(this, 'language') ? this.options.language : null,
      api_properties: apiProperties,
      event_properties: utils.truncate(utils.validateProperties(eventProperties)),
      user_properties: utils.truncate(utils.validateProperties(userProperties)),
      uuid: uuid(),
      library: {
        name: 'amplitude-js',
        version: version
      },
      sequence_number: sequenceNumber, // for ordering events and identifys
      groups: utils.truncate(utils.validateGroups(groups)),
      group_properties: utils.truncate(utils.validateProperties(groupProperties)),
      user_agent: this._userAgent
    };

    if (eventType === constants.IDENTIFY_EVENT || eventType === constants.GROUP_IDENTIFY_EVENT) {
      this._unsentIdentifys.push(event);
      this._limitEventsQueued(this._unsentIdentifys);
    } else {
      this._unsentEvents.push(event);
      this._limitEventsQueued(this._unsentEvents);
    }

    if (this.options.saveEvents) {
      this.saveEvents();
    }

    if (!this._sendEventsIfReady(callback) && type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'No events to send or upload queued' });
    }

    return eventId;
  } catch (e) {
    utils.log.error(e);
  }
};

var _shouldTrackField = function _shouldTrackField(scope, field) {
  return !!scope.options.trackingOptions[field];
};

var _generateApiPropertiesTrackingConfig = function _generateApiPropertiesTrackingConfig(scope) {
  // to limit size of config payload, only send fields that have been disabled
  var fields = ['city', 'country', 'dma', 'ip_address', 'region'];
  var config = {};
  for (var i = 0; i < fields.length; i++) {
    var field = fields[i];
    if (!_shouldTrackField(scope, field)) {
      config[field] = false;
    }
  }
  return config;
};

/**
 * Remove old events from the beginning of the array if too many have accumulated. Default limit is 1000 events.
 * @private
 */
AmplitudeClient.prototype._limitEventsQueued = function _limitEventsQueued(queue) {
  if (queue.length > this.options.savedMaxCount) {
    queue.splice(0, queue.length - this.options.savedMaxCount);
  }
};

/**
 * This is the callback for logEvent and identify calls. It gets called after the event/identify is uploaded,
 * and the server response code and response body from the upload request are passed to the callback function.
 * @callback Amplitude~eventCallback
 * @param {number} responseCode - Server response code for the event / identify upload request.
 * @param {string} responseBody - Server response body for the event / identify upload request.
 */

/**
 * Log an event with eventType and eventProperties
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */
AmplitudeClient.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
  return this.logEventWithTimestamp(eventType, eventProperties, null, opt_callback);
};

/**
 * Log an event with eventType and eventProperties and a custom timestamp
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {number} timesatmp - (optional) the custom timestamp as milliseconds since epoch.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
 */
AmplitudeClient.prototype.logEventWithTimestamp = function logEvent(eventType, eventProperties, timestamp, opt_callback) {
  if (!this._apiKeySet('logEvent()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'API key not set' });
    }
    return -1;
  }
  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid type for eventType' });
    }
    return -1;
  }
  if (utils.isEmptyString(eventType)) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Missing eventType' });
    }
    return -1;
  }
  return this._logEvent(eventType, eventProperties, null, null, null, null, timestamp, opt_callback);
};

/**
 * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
 * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
 * (unless you explicitly set it with setGroup).
 * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information
 * about groups and Count by Distinct on the Amplitude platform.
 * @public
 * @param {string} eventType - name of event
 * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
 * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
 * groupName can be a string or an array of strings.
 * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
 * Note: the server response code and response body from the event upload are passed to the callback function.
 * @example amplitudeClient.logEventWithGroups('Clicked Button', null, {'orgId': 24});
 */
AmplitudeClient.prototype.logEventWithGroups = function (eventType, eventProperties, groups, opt_callback) {
  if (!this._apiKeySet('logEventWithGroups()')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'API key not set' });
    }
    return -1;
  }
  if (!utils.validateInput(eventType, 'eventType', 'string')) {
    if (type(opt_callback) === 'function') {
      opt_callback(0, 'No request sent', { reason: 'Invalid type for eventType' });
    }
    return -1;
  }
  return this._logEvent(eventType, eventProperties, null, null, groups, null, null, opt_callback);
};

/**
 * Test that n is a number or a numeric value.
 * @private
 */
var _isNumber = function _isNumber(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
};

/**
 * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
 * revenueType and event properties.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue}
 * for more information on the Revenue interface and logging revenue.
 * @public
 * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
 * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
 * amplitude.logRevenueV2(revenue);
 */
AmplitudeClient.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
  if (!this._apiKeySet('logRevenueV2()')) {
    return;
  }

  // if revenue input is a proxied object created by the async loading snippet, convert it into an revenue object
  if (type(revenue_obj) === 'object' && revenue_obj.hasOwnProperty('_q')) {
    revenue_obj = _convertProxyObjectToRealObject(new Revenue(), revenue_obj);
  }

  if (revenue_obj instanceof Revenue) {
    // only send if revenue is valid
    if (revenue_obj && revenue_obj._isValidRevenue()) {
      return this.logEvent(constants.REVENUE_EVENT, revenue_obj._toJSONObject());
    }
  } else {
    utils.log.error('Invalid revenue input type. Expected Revenue object but saw ' + type(revenue_obj));
  }
};

{
  /**
   * Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2
   * @public
   * @deprecated
   * @param {number} price - price of revenue event
   * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
   * @param {string} product - (optional) product identifier
   * @example amplitudeClient.logRevenue(3.99, 1, 'product_1234');
   */
  AmplitudeClient.prototype.logRevenue = function logRevenue(price, quantity, product) {
    // Test that the parameters are of the right type.
    if (!this._apiKeySet('logRevenue()') || !_isNumber(price) || quantity !== undefined && !_isNumber(quantity)) {
      // utils.log('Price and quantity arguments to logRevenue must be numbers');
      return -1;
    }

    return this._logEvent(constants.REVENUE_EVENT, {}, {
      productId: product,
      special: 'revenue_amount',
      quantity: quantity || 1,
      price: price
    }, null, null, null, null, null);
  };
}

/**
 * Remove events in storage with event ids up to and including maxEventId.
 * @private
 */
AmplitudeClient.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
  _removeEvents(this, '_unsentEvents', maxEventId);
  _removeEvents(this, '_unsentIdentifys', maxIdentifyId);
};

/**
 * Helper function to remove events up to maxId from a single queue.
 * Does a true filter in case events get out of order or old events are removed.
 * @private
 */
var _removeEvents = function _removeEvents(scope, eventQueue, maxId) {
  if (maxId < 0) {
    return;
  }

  var filteredEvents = [];
  for (var i = 0; i < scope[eventQueue].length || 0; i++) {
    if (scope[eventQueue][i].event_id > maxId) {
      filteredEvents.push(scope[eventQueue][i]);
    }
  }
  scope[eventQueue] = filteredEvents;
};

/**
 * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
 * If batchEvents is true, then events are only sent when batch criterias are met.
 * @private
 * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
 * Note the server response code and response body are passed to the callback as input arguments.
 */
AmplitudeClient.prototype.sendEvents = function sendEvents(callback) {
  if (!this._apiKeySet('sendEvents()')) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'API key not set' });
    }
    return;
  }
  if (this.options.optOut) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'optOut is set to true' });
    }
    return;
  }
  if (this._unsentCount() === 0) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'No events to send' });
    }
    return;
  }
  if (this._sending) {
    if (type(callback) === 'function') {
      callback(0, 'No request sent', { reason: 'Request already in progress' });
    }
    return;
  }

  this._sending = true;
  var protocol = this.options.forceHttps ? 'https' : 'https:' === window.location.protocol ? 'https' : 'http';
  var url = protocol + '://' + this.options.apiEndpoint + '/';

  // fetch events to send
  var numEvents = Math.min(this._unsentCount(), this.options.uploadBatchSize);
  var mergedEvents = this._mergeEventsAndIdentifys(numEvents);
  var maxEventId = mergedEvents.maxEventId;
  var maxIdentifyId = mergedEvents.maxIdentifyId;
  var events = JSON.stringify(mergedEvents.eventsToSend);
  var uploadTime = new Date().getTime();

  var data = {
    client: this.options.apiKey,
    e: events,
    v: constants.API_VERSION,
    upload_time: uploadTime,
    checksum: md5(constants.API_VERSION + this.options.apiKey + events + uploadTime)
  };

  var scope = this;
  new Request(url, data).send(function (status, response) {
    scope._sending = false;
    try {
      if (status === 200 && response === 'success') {
        scope.removeEvents(maxEventId, maxIdentifyId);

        // Update the event cache after the removal of sent events.
        if (scope.options.saveEvents) {
          scope.saveEvents();
        }

        // Send more events if any queued during previous send.
        if (!scope._sendEventsIfReady(callback) && type(callback) === 'function') {
          callback(status, response);
        }

        // handle payload too large
      } else if (status === 413) {
        // utils.log('request too large');
        // Can't even get this one massive event through. Drop it, even if it is an identify.
        if (scope.options.uploadBatchSize === 1) {
          scope.removeEvents(maxEventId, maxIdentifyId);
        }

        // The server complained about the length of the request. Backoff and try again.
        scope.options.uploadBatchSize = Math.ceil(numEvents / 2);
        scope.sendEvents(callback);
      } else if (type(callback) === 'function') {
        // If server turns something like a 400
        callback(status, response);
      }
    } catch (e) {
      // utils.log('failed upload');
    }
  });
};

/**
 * Merge unsent events and identifys together in sequential order based on their sequence number, for uploading.
 * @private
 */
AmplitudeClient.prototype._mergeEventsAndIdentifys = function _mergeEventsAndIdentifys(numEvents) {
  // coalesce events from both queues
  var eventsToSend = [];
  var eventIndex = 0;
  var maxEventId = -1;
  var identifyIndex = 0;
  var maxIdentifyId = -1;

  while (eventsToSend.length < numEvents) {
    var event;
    var noIdentifys = identifyIndex >= this._unsentIdentifys.length;
    var noEvents = eventIndex >= this._unsentEvents.length;

    // case 0: no events or identifys left
    // note this should not happen, this means we have less events and identifys than expected
    if (noEvents && noIdentifys) {
      utils.log.error('Merging Events and Identifys, less events and identifys than expected');
      break;
    }

    // case 1: no identifys - grab from events
    else if (noIdentifys) {
        event = this._unsentEvents[eventIndex++];
        maxEventId = event.event_id;

        // case 2: no events - grab from identifys
      } else if (noEvents) {
        event = this._unsentIdentifys[identifyIndex++];
        maxIdentifyId = event.event_id;

        // case 3: need to compare sequence numbers
      } else {
        // events logged before v2.5.0 won't have a sequence number, put those first
        if (!('sequence_number' in this._unsentEvents[eventIndex]) || this._unsentEvents[eventIndex].sequence_number < this._unsentIdentifys[identifyIndex].sequence_number) {
          event = this._unsentEvents[eventIndex++];
          maxEventId = event.event_id;
        } else {
          event = this._unsentIdentifys[identifyIndex++];
          maxIdentifyId = event.event_id;
        }
      }

    eventsToSend.push(event);
  }

  return {
    eventsToSend: eventsToSend,
    maxEventId: maxEventId,
    maxIdentifyId: maxIdentifyId
  };
};

{
  /**
   * Set global user properties. Note this is deprecated, and we recommend using setUserProperties
   * @public
   * @deprecated
   */
  AmplitudeClient.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
    this.setUserProperties(userProperties);
  };
}

/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */
AmplitudeClient.prototype.__VERSION__ = version;

/**
 * Amplitude SDK API - instance manager.
 * Function calls directly on amplitude have been deprecated. Please call methods on the default shared instance: amplitude.getInstance() instead.
 * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#300-update-and-logging-events-to-multiple-amplitude-apps} for more information about this change.
 * @constructor Amplitude
 * @public
 * @example var amplitude = new Amplitude();
 */
var Amplitude = function Amplitude() {
  this.options = _extends({}, DEFAULT_OPTIONS);
  this._q = [];
  this._instances = {}; // mapping of instance names to instances
};

Amplitude.prototype.Identify = Identify;
Amplitude.prototype.Revenue = Revenue;

Amplitude.prototype.getInstance = function getInstance(instance) {
  instance = utils.isEmptyString(instance) ? constants.DEFAULT_INSTANCE : instance.toLowerCase();
  var client = this._instances[instance];
  if (client === undefined) {
    client = new AmplitudeClient(instance);
    this._instances[instance] = client;
  }
  return client;
};

{
  /**
   * Run functions queued up by proxy loading snippet
   * @private
   */
  Amplitude.prototype.runQueuedFunctions = function () {
    // run queued up old versions of functions
    for (var i = 0; i < this._q.length; i++) {
      var fn = this[this._q[i][0]];
      if (type(fn) === 'function') {
        fn.apply(this, this._q[i].slice(1));
      }
    }
    this._q = []; // clear function queue after running

    // run queued up functions on instances
    for (var instance in this._instances) {
      if (this._instances.hasOwnProperty(instance)) {
        this._instances[instance].runQueuedFunctions();
      }
    }
  };
}

{
  /**
   * Initializes the Amplitude Javascript SDK with your apiKey and any optional configurations.
   * This is required before any other methods can be called.
   * @public
   * @param {string} apiKey - The API key for your app.
   * @param {string} opt_userId - (optional) An identifier for this user.
   * @param {object} opt_config - (optional) Configuration options.
   * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#configuration-options} for list of options and default values.
   * @param {function} opt_callback - (optional) Provide a callback function to run after initialization is complete.
   * @deprecated Please use amplitude.getInstance().init(apiKey, opt_userId, opt_config, opt_callback);
   * @example amplitude.init('API_KEY', 'USER_ID', {includeReferrer: true, includeUtm: true}, function() { alert('init complete'); });
   */
  Amplitude.prototype.init = function init(apiKey, opt_userId, opt_config, opt_callback) {
    this.getInstance().init(apiKey, opt_userId, opt_config, function (instance) {
      // make options such as deviceId available for callback functions
      this.options = instance.options;
      if (type(opt_callback) === 'function') {
        opt_callback(instance);
      }
    }.bind(this));
  };

  /**
   * Returns true if a new session was created during initialization, otherwise false.
   * @public
   * @return {boolean} Whether a new session was created during initialization.
   * @deprecated Please use amplitude.getInstance().isNewSession();
   */
  Amplitude.prototype.isNewSession = function isNewSession() {
    return this.getInstance().isNewSession();
  };

  /**
   * Returns the id of the current session.
   * @public
   * @return {number} Id of the current session.
   * @deprecated Please use amplitude.getInstance().getSessionId();
   */
  Amplitude.prototype.getSessionId = function getSessionId() {
    return this.getInstance().getSessionId();
  };

  /**
   * Increments the eventId and returns it.
   * @private
   */
  Amplitude.prototype.nextEventId = function nextEventId() {
    return this.getInstance().nextEventId();
  };

  /**
   * Increments the identifyId and returns it.
   * @private
   */
  Amplitude.prototype.nextIdentifyId = function nextIdentifyId() {
    return this.getInstance().nextIdentifyId();
  };

  /**
   * Increments the sequenceNumber and returns it.
   * @private
   */
  Amplitude.prototype.nextSequenceNumber = function nextSequenceNumber() {
    return this.getInstance().nextSequenceNumber();
  };

  /**
   * Saves unsent events and identifies to localStorage. JSON stringifies event queues before saving.
   * Note: this is called automatically every time events are logged, unless you explicitly set option saveEvents to false.
   * @private
   */
  Amplitude.prototype.saveEvents = function saveEvents() {
    this.getInstance().saveEvents();
  };

  /**
   * Sets a customer domain for the amplitude cookie. Useful if you want to support cross-subdomain tracking.
   * @public
   * @param {string} domain to set.
   * @deprecated Please use amplitude.getInstance().setDomain(domain);
   * @example amplitude.setDomain('.amplitude.com');
   */
  Amplitude.prototype.setDomain = function setDomain(domain) {
    this.getInstance().setDomain(domain);
  };

  /**
   * Sets an identifier for the current user.
   * @public
   * @param {string} userId - identifier to set. Can be null.
   * @deprecated Please use amplitude.getInstance().setUserId(userId);
   * @example amplitude.setUserId('joe@gmail.com');
   */
  Amplitude.prototype.setUserId = function setUserId(userId) {
    this.getInstance().setUserId(userId);
  };

  /**
   * Add user to a group or groups. You need to specify a groupType and groupName(s).
   * For example you can group people by their organization.
   * In that case groupType is "orgId" and groupName would be the actual ID(s).
   * groupName can be a string or an array of strings to indicate a user in multiple gruups.
   * You can also call setGroup multiple times with different groupTypes to track multiple types of groups (up to 5 per app).
   * Note: this will also set groupType: groupName as a user property.
   * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information.
   * @public
   * @param {string} groupType - the group type (ex: orgId)
   * @param {string|list} groupName - the name of the group (ex: 15), or a list of names of the groups
   * @deprecated Please use amplitude.getInstance().setGroup(groupType, groupName);
   * @example amplitude.setGroup('orgId', 15); // this adds the current user to orgId 15.
   */
  Amplitude.prototype.setGroup = function (groupType, groupName) {
    this.getInstance().setGroup(groupType, groupName);
  };

  /**
   * Sets whether to opt current user out of tracking.
   * @public
   * @param {boolean} enable - if true then no events will be logged or sent.
   * @deprecated Please use amplitude.getInstance().setOptOut(enable);
   * @example: amplitude.setOptOut(true);
   */
  Amplitude.prototype.setOptOut = function setOptOut(enable) {
    this.getInstance().setOptOut(enable);
  };

  /**
    * Regenerates a new random deviceId for current user. Note: this is not recommended unless you know what you
    * are doing. This can be used in conjunction with `setUserId(null)` to anonymize users after they log out.
    * With a null userId and a completely new deviceId, the current user would appear as a brand new user in dashboard.
    * This uses src/uuid.js to regenerate the deviceId.
    * @public
    * @deprecated Please use amplitude.getInstance().regenerateDeviceId();
    */
  Amplitude.prototype.regenerateDeviceId = function regenerateDeviceId() {
    this.getInstance().regenerateDeviceId();
  };

  /**
    * Sets a custom deviceId for current user. Note: this is not recommended unless you know what you are doing
    * (like if you have your own system for managing deviceIds). Make sure the deviceId you set is sufficiently unique
    * (we recommend something like a UUID - see src/uuid.js for an example of how to generate) to prevent conflicts with other devices in our system.
    * @public
    * @param {string} deviceId - custom deviceId for current user.
    * @deprecated Please use amplitude.getInstance().setDeviceId(deviceId);
    * @example amplitude.setDeviceId('45f0954f-eb79-4463-ac8a-233a6f45a8f0');
    */
  Amplitude.prototype.setDeviceId = function setDeviceId(deviceId) {
    this.getInstance().setDeviceId(deviceId);
  };

  /**
   * Sets user properties for the current user.
   * @public
   * @param {object} - object with string keys and values for the user properties to set.
   * @param {boolean} - DEPRECATED opt_replace: in earlier versions of the JS SDK the user properties object was kept in
   * memory and replace = true would replace the object in memory. Now the properties are no longer stored in memory, so replace is deprecated.
   * @deprecated Please use amplitude.getInstance.setUserProperties(userProperties);
   * @example amplitude.setUserProperties({'gender': 'female', 'sign_up_complete': true})
   */
  Amplitude.prototype.setUserProperties = function setUserProperties(userProperties) {
    this.getInstance().setUserProperties(userProperties);
  };

  /**
   * Clear all of the user properties for the current user. Note: clearing user properties is irreversible!
   * @public
   * @deprecated Please use amplitude.getInstance().clearUserProperties();
   * @example amplitude.clearUserProperties();
   */
  Amplitude.prototype.clearUserProperties = function clearUserProperties() {
    this.getInstance().clearUserProperties();
  };

  /**
   * Send an identify call containing user property operations to Amplitude servers.
   * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#user-properties-and-user-property-operations}
   * for more information on the Identify API and user property operations.
   * @param {Identify} identify_obj - the Identify object containing the user property operations to send.
   * @param {Amplitude~eventCallback} opt_callback - (optional) callback function to run when the identify event has been sent.
   * Note: the server response code and response body from the identify event upload are passed to the callback function.
   * @deprecated Please use amplitude.getInstance().identify(identify);
   * @example
   * var identify = new amplitude.Identify().set('colors', ['rose', 'gold']).add('karma', 1).setOnce('sign_up_date', '2016-03-31');
   * amplitude.identify(identify);
   */
  Amplitude.prototype.identify = function (identify_obj, opt_callback) {
    this.getInstance().identify(identify_obj, opt_callback);
  };

  /**
   * Set a versionName for your application.
   * @public
   * @param {string} versionName - The version to set for your application.
   * @deprecated Please use amplitude.getInstance().setVersionName(versionName);
   * @example amplitude.setVersionName('1.12.3');
   */
  Amplitude.prototype.setVersionName = function setVersionName(versionName) {
    this.getInstance().setVersionName(versionName);
  };

  /**
   * This is the callback for logEvent and identify calls. It gets called after the event/identify is uploaded,
   * and the server response code and response body from the upload request are passed to the callback function.
   * @callback Amplitude~eventCallback
   * @param {number} responseCode - Server response code for the event / identify upload request.
   * @param {string} responseBody - Server response body for the event / identify upload request.
   */

  /**
   * Log an event with eventType and eventProperties
   * @public
   * @param {string} eventType - name of event
   * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
   * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
   * Note: the server response code and response body from the event upload are passed to the callback function.
   * @deprecated Please use amplitude.getInstance().logEvent(eventType, eventProperties, opt_callback);
   * @example amplitude.logEvent('Clicked Homepage Button', {'finished_flow': false, 'clicks': 15});
   */
  Amplitude.prototype.logEvent = function logEvent(eventType, eventProperties, opt_callback) {
    return this.getInstance().logEvent(eventType, eventProperties, opt_callback);
  };

  /**
   * Log an event with eventType, eventProperties, and groups. Use this to set event-level groups.
   * Note: the group(s) set only apply for the specific event type being logged and does not persist on the user
   * (unless you explicitly set it with setGroup).
   * See the [SDK Readme]{@link https://github.com/amplitude/Amplitude-Javascript#setting-groups} for more information
   * about groups and Count by Distinct on the Amplitude platform.
   * @public
   * @param {string} eventType - name of event
   * @param {object} eventProperties - (optional) an object with string keys and values for the event properties.
   * @param {object} groups - (optional) an object with string groupType: groupName values for the event being logged.
   * groupName can be a string or an array of strings.
   * @param {Amplitude~eventCallback} opt_callback - (optional) a callback function to run after the event is logged.
   * Note: the server response code and response body from the event upload are passed to the callback function.
   * Deprecated Please use amplitude.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
   * @example amplitude.logEventWithGroups('Clicked Button', null, {'orgId': 24});
   */
  Amplitude.prototype.logEventWithGroups = function (eventType, eventProperties, groups, opt_callback) {
    return this.getInstance().logEventWithGroups(eventType, eventProperties, groups, opt_callback);
  };

  /**
   * Log revenue with Revenue interface. The new revenue interface allows for more revenue fields like
   * revenueType and event properties.
   * See [Readme]{@link https://github.com/amplitude/Amplitude-Javascript#tracking-revenue}
   * for more information on the Revenue interface and logging revenue.
   * @public
   * @param {Revenue} revenue_obj - the revenue object containing the revenue data being logged.
   * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
   * @example var revenue = new amplitude.Revenue().setProductId('productIdentifier').setPrice(10.99);
   * amplitude.logRevenueV2(revenue);
   */
  Amplitude.prototype.logRevenueV2 = function logRevenueV2(revenue_obj) {
    return this.getInstance().logRevenueV2(revenue_obj);
  };

  /**
   * Log revenue event with a price, quantity, and product identifier. DEPRECATED - use logRevenueV2
   * @public
   * @param {number} price - price of revenue event
   * @param {number} quantity - (optional) quantity of products in revenue event. If no quantity specified default to 1.
   * @param {string} product - (optional) product identifier
   * @deprecated Please use amplitude.getInstance().logRevenueV2(revenue_obj);
   * @example amplitude.logRevenue(3.99, 1, 'product_1234');
   */
  Amplitude.prototype.logRevenue = function logRevenue(price, quantity, product) {
    return this.getInstance().logRevenue(price, quantity, product);
  };

  /**
   * Remove events in storage with event ids up to and including maxEventId.
   * @private
   */
  Amplitude.prototype.removeEvents = function removeEvents(maxEventId, maxIdentifyId) {
    this.getInstance().removeEvents(maxEventId, maxIdentifyId);
  };

  /**
   * Send unsent events. Note: this is called automatically after events are logged if option batchEvents is false.
   * If batchEvents is true, then events are only sent when batch criterias are met.
   * @private
   * @param {Amplitude~eventCallback} callback - (optional) callback to run after events are sent.
   * Note the server response code and response body are passed to the callback as input arguments.
   */
  Amplitude.prototype.sendEvents = function sendEvents(callback) {
    this.getInstance().sendEvents(callback);
  };

  /**
   * Set global user properties. Note this is deprecated, and we recommend using setUserProperties
   * @public
   * @deprecated
   */
  Amplitude.prototype.setGlobalUserProperties = function setGlobalUserProperties(userProperties) {
    this.getInstance().setUserProperties(userProperties);
  };
}

/**
 * Get the current version of Amplitude's Javascript SDK.
 * @public
 * @returns {number} version number
 * @example var amplitudeVersion = amplitude.__VERSION__;
 */
Amplitude.prototype.__VERSION__ = version;

/* jshint expr:true */

var old = window.amplitude || {};
var newInstance = new Amplitude();
newInstance._q = old._q || [];
for (var instance in old._iq) {
  // migrate each instance's queue
  if (old._iq.hasOwnProperty(instance)) {
    newInstance.getInstance(instance)._q = old._iq[instance]._q || [];
  }
}

return newInstance;

})));
