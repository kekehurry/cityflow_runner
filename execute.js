const puppeteer = require('puppeteer');
const { createHtml, compile } = require('./compile');
const path = require('path');
const fs = require('fs');

async function execute(codeFile) {
  const dirName = path.dirname(codeFile);
  const outputFile = path.join(dirName, './output');
  const inputFile = path.join(dirName, './input');
  const configFile = path.join(dirName, './config');

  const input = fs.readFileSync(inputFile, 'utf8');
  const config = fs.readFileSync(configFile, 'utf8');
  const head = `
    <script>
      window.input = ${input}
      window.config = ${config}
    </script>
  `;

  const html = await compile(codeFile);
  const executeHtml = head + html;

  const browser = await puppeteer.launch({
    headless: 'new',
    args: [
      '--disable-gpu',
      '--no-sandbox',
      '-no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
    ],
  });
  try {
    const page = await browser.newPage();
    await page.setContent(executeHtml);
    //get console output
    const props = await page.evaluate(() => {
      try {
        return props;
      } catch (e) {
        console.error(e);
        return;
      }
    });
    if (props?.output) {
      fs.writeFileSync(outputFile, JSON.stringify(props?.output, null, 2));
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Default paths
const args = process.argv.slice(2);
const workdir = path.resolve(args.find((arg) => !arg.startsWith('--')) || './');
const compileFlag = args.includes('--compile');
const codeFile = path.join(workdir, 'entrypoint');

if (compileFlag) {
  compile(codeFile);
} else {
  execute(codeFile);
}
