import sinon from 'sinon';
import ConfigManager from '../src/config-manager';
import { AmplitudeServerZone } from '../src/server-zone';
import Constants from '../src/constants';

describe('ConfigManager', function () {
  let server;
  beforeEach(function () {
    server = sinon.fakeServer.create();
  });

  afterEach(function () {
    server.restore();
  });

  it('ConfigManager should support EU zone', function () {
    ConfigManager.refresh(AmplitudeServerZone.EU, true, function () {
      assert.equal(Constants.EVENT_LOG_EU_URL, ConfigManager.ingestionEndpoint);
    });
    server.respondWith('{"ingestionEndpoint": "api.eu.amplitude.com"}');
    server.respond();
  });
});
