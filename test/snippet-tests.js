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

});