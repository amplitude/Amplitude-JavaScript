describe('Snippet', function() {

  it('amplitude object should exist', function() {
    assert.isObject(window);
    assert.isObject(window.amplitude);
    assert.isFunction(window.amplitude.init);
    assert.isFunction(window.amplitude.logEvent);
  });

  it('amplitude object should proxy functions', function() {
    amplitude.init("API_KEY");
    amplitude.logEvent("Event", {prop: 1});
    assert.lengthOf(amplitude._q, 2);
    assert.deepEqual(amplitude._q[0], ["init", "API_KEY"]);
  });

  it('amplitude object should proxy Identify object and calls', function() {
    amplitude._q = [];

    var emptyProxyObject = new amplitude.Identify();
    assert.deepEqual(
      emptyProxyObject.p,
      {'a':{},'s':{},'u':{},'so':{}}
    );

    var proxyObject = new amplitude.Identify().add('key1', 'value1').unset('key1');
    proxyObject.set('key2', 'value3').set('key4', 'value5').setOnce('key2', 'value4');
    assert.deepEqual(
      proxyObject.p,
      {
        'a':{'key1': 'value1'},
        'u':{'key1': '-'},
        's':{'key2': 'value3', 'key4': 'value5'},
        'so':{'key2': 'value4'}
      }
    );
    amplitude.identify(proxyObject);
    assert.lengthOf(amplitude._q, 1);
    assert.deepEqual(amplitude._q[0], ['identify', proxyObject]);
  });

});
