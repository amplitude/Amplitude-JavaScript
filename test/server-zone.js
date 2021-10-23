import { AmplitudeServerZone, getEventLogApi, getDynamicConfigApi } from '../src/server-zone';
import Constants from '../src/constants';

describe('AmplitudeServerZone', function () {
  it('getEventLogApi should return correct event log url', function () {
    assert.equal(Constants.EVENT_LOG_URL, getEventLogApi(AmplitudeServerZone.US));
    assert.equal(Constants.EVENT_LOG_EU_URL, getEventLogApi(AmplitudeServerZone.EU));
    assert.equal(Constants.EVENT_LOG_URL, getEventLogApi(''));
  });

  it('getDynamicConfigApi should return correct dynamic config url', function () {
    assert.equal(Constants.DYNAMIC_CONFIG_URL, getDynamicConfigApi(AmplitudeServerZone.US));
    assert.equal(Constants.DYNAMIC_CONFIG_EU_URL, getDynamicConfigApi(AmplitudeServerZone.EU));
    assert.equal(Constants.DYNAMIC_CONFIG_URL, getDynamicConfigApi(''));
  });
});
