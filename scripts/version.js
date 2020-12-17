const fs = require('fs');
const path = require('path');
const { version } = require('../package');
const { format } = require('date-fns');
const crypto = require('crypto');

const cwd = process.cwd();

function replaceTextInFile(filepath, match, replacement) {
  var filename = path.join(cwd, filepath);

  const updatedText = fs.readFileSync(filename, 'utf-8').replace(match, replacement);

  if (updatedText.indexOf(replacement) === -1) {
    throw new Error(`Failed to update text in ${filepath}`);
  }

  fs.writeFileSync(filename, updatedText);

  console.log(`Updated ${filepath}: ${replacement}`);
}

// Update version in snippet
replaceTextInFile(
  path.join('src', 'amplitude-snippet.js'),
  /cdn\.amplitude\.com\/libs\/amplitude-[0-9]+\.[0-9]+\.[0-9]+-min\.gz\.js/,
  `cdn.amplitude.com/libs/amplitude-${version}-min.gz.js`,
);

// Update integrity hash in snippet
// Provides extra layer of security. If script changes, it will fail to load
const sdkText = fs.readFileSync(path.join('.', `amplitude.min.js`), 'utf-8');
const hash = crypto.createHash('sha384').update(sdkText).digest('base64');
replaceTextInFile(
  path.join('src', 'amplitude-snippet.js'),
  /as.integrity = 'sha384-[a-zA-Z0-9+\/]+';/,
  `as.integrity = 'sha384-${hash}';`,
);

console.log(`Updated version to ${version}`);
