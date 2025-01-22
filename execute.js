const puppeteer = require('puppeteer');
const { createHtml, compile } = require('./compile');
const path = require('path');
const fs = require('fs');

async function executeHtml(bundleFile) {
  const dirName = path.dirname(bundleFile);
  const outputFile = path.join(dirName, '../output');
  const htmlFile = path.join(dirName, '../index.html');

  const html = createHtml(bundleFile);
  fs.writeFileSync(htmlFile, html);
  console.log('html written to:', htmlFile);
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
    await page.setContent(html);
    //get console output
    const props = await page.evaluate(() => {
      return cityflow?.module || {};
    });
    if (props?.output) {
      fs.writeFileSync(outputFile, JSON.stringify(props?.output, null, 2));
      console.log('output written to:', outputFile);
    }
    if (props?.config) {
      fs.writeFileSync(configFile, JSON.stringify(props?.config, null, 2));
    }
  } catch (error) {
    console.error(error);
  } finally {
    await browser.close();
  }
}

// Default paths
const DEFAULT_WORKDIR = './workspace';

const workdir = path.resolve(process.argv[2] || DEFAULT_WORKDIR);
const codeFile = path.join(workdir, 'entrypoint');
const inputFile = path.join(workdir, 'input');
const configFile = path.join(workdir, 'config');

compile(inputFile, configFile, codeFile).then((bundleFile) =>
  executeHtml(bundleFile)
);
