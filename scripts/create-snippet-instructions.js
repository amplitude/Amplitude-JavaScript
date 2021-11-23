const fs = require('fs');
const path = require('path');

const cwd = process.cwd();
const instructionsFileName = path.join(cwd, 'amplitude-snippet-instructions.js');

const snippetFilename = path.join(cwd, 'amplitude-snippet.min.js');
const snippet = fs.readFileSync(snippetFilename, 'utf-8');

const script = `<script type="text/javascript">
${snippet}
amplitude.getInstance().init("YOUR_API_KEY_HERE")
</script>
`;
fs.writeFileSync(instructionsFileName, script);

console.log('Created amplitude-snippet-instructions.js');
