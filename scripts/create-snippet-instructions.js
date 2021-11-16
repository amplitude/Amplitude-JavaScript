var fs = require('fs');
var path = require('path');

// Update the README with the minified snippet.
var cwd = process.cwd();
var instructionsFileName = path.join(cwd, 'amplitude-snippet-instructions.js');

var snippetFilename = path.join(cwd, 'amplitude-snippet.min.js');
var snippet = fs.readFileSync(snippetFilename, 'utf-8');

var script = `<script type="text/javascript">
${snippet}
amplitude.getInstance().init("YOUR_API_KEY_HERE")
</script>
`;
fs.writeFileSync(instructionsFileName, script);

console.log('Updated amplitude-snippet-instructions.js');
