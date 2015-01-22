var fs = require('fs');
var path = require('path');
var package = require('../package');
var component = require('../component');

var version = package.version;
component.version = version;

var cwd = process.cwd();

console.log('Updating to version ' + version);
fs.writeFileSync(path.join(cwd, 'component.json'), JSON.stringify(component, null, 2) + '\n');
console.log('Updated component.json');

fs.writeFileSync(path.join(cwd, 'src', 'version.js'), "module.exports = '" + version + "';\n");
console.log('Updated src/version.js');
