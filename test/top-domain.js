import topDomain from '../src/top-domain.js';
import { mockCookie, restoreCookie } from './mock-cookie';

describe('topDomain', () => {
  it('should return an empty string for localhost',() => {
    assert.equal(topDomain('http://localhost:9000'), '');
  });

  it('should return an empty string for an ip address',() => {
    assert.equal(topDomain('http://192.168.2.4:9000'), '');
  });

  it('should return an empty string for a domain it cannot write to',() => {
    assert.equal(topDomain('https://www.example.com'), '');
  });

  it('should return the smallest domain it can write to', () => {
    mockCookie();
    assert.equal(topDomain('https://foo.www.example.com'), 'example.com');
    restoreCookie();
  });
});
