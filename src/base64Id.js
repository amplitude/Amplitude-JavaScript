// A URL safe variation on the the list of Base64 characters
const base64Chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

const base64Id = () => {
  const randomValues = crypto.getRandomValues(new Uint8Array(22));

  let str = '';

  for (let i = 0; i < 22; ++i) {
    str += base64Chars.charAt(randomValues[i] % 64);
  }

  return str;
};

export default base64Id;
