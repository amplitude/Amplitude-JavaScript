var fs = require('fs');
var path = require('path');

// Update the README with the minified snippet.
var cwd = process.cwd();
var filename = path.join(cwd, "README.md");
var readme = fs.readFileSync(filename, 'utf-8');

var snippet = fs.readFileSync("amplitude-snippet.min.js", 'utf-8');
var script =
'        <script type="text/javascript">\n' +
snippet.trim().replace(/^/gm, '          ') + '\n\n' +
'          amplitude.init("YOUR_API_KEY_HERE");\n' +
'        </script>';

var updated = readme.replace(/ +<script[\s\S]+?script>/, script);
fs.writeFileSync(filename, updated);

console.log('Updated README.md');
