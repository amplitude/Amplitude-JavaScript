const jsdoc2md = require("jsdoc-to-markdown");
const fs = require("fs");
const path = require("path");
const prettier = require("prettier");
const publicFiles = [
  "amplitude-client.js",
  "amplitude.js",
  "identify.js",
  "revenue.js",
];
const srcDir = path.join(__dirname, "../", "src");
const outputDir = path.join(__dirname, "docs");
function generateMarkdown(inputFile) {
  const inputFilePath = path.join(srcDir, inputFile);
  const data = jsdoc2md.getTemplateDataSync({ files: inputFilePath });
  const className = data.find((e) => e.kind === "class").name;
  const filteredData = data.filter(
    (e) =>
      e.kind === "constructor" ||
      (e.access === "public" && (e.kind === "function" || e.kind === "member"))
  );
  const outputFilePath = path.join(outputDir, `${className}.md`);

  const markdownOutput = filteredData
    .map((item) => documentItem(item))
    .join("\n");
  fs.writeFileSync(
    path.join(outputDir, `${className}.md`),
    prettier.format(markdownOutput, { parser: "markdown" })
  );
}

function documentItem(data) {
  return `## \`${data.id}\`

${data.examples ? documentExamples(data) : ""}

${data.description || ""} 

${data.params ? documentParams(data) : ""}

${data.returns ? documentReturn(data) : ""}
`;
}

function documentExamples(data) {
  return `\`\`\`
${data.examples}
\`\`\`
`;
}

function documentParams(data) {
  const params = data.params.map(
    (param) => `- \`${param.name}\` (\`${param.type.names[0]}\`)
${param.description}
`
  );
  return `### Parameters
${params.join("\n")}
`;
}

function documentReturn(data) {
  return `### Return Value
- (\`${data.returns[0].type.names[0]}\`)
${data.returns[0].description}
`;
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

for (const file of publicFiles) {
  generateMarkdown(file);
}
