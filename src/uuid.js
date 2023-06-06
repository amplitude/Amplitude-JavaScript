/**
 * Source: [jed's gist's comment]{@link https://gist.github.com/jed/982883?permalink_comment_id=3223002#gistcomment-3223002}.
 * Returns a random v4 UUID of the form xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx,
 * where each x is replaced with a random hexadecimal digit from 0 to f, and
 * y is replaced with a random hexadecimal digit from 8 to b.
 * Used to generate UUIDs for deviceIds.
 * @private
 */

// hoist hex table out of the function to avoid re-calculation
const hex = [...Array(256).keys()].map((index) => index.toString(16).padStart(2, '0'));

var uuid = () => {
  const r = crypto.getRandomValues(new Uint8Array(16));

  r[6] = (r[6] & 0x0f) | 0x40;
  r[8] = (r[8] & 0x3f) | 0x80;

  return [...r.entries()].map(([index, int]) => ([4, 6, 8, 10].includes(index) ? `-${hex[int]}` : hex[int])).join('');
};

export default uuid;
