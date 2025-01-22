const { transformSync } = require('@babel/core'); // Destructure transformSync from @babel/core
const fs = require('fs');
const webpack = require('webpack');
const path = require('path');

const compileReactCode = (code) => {
  try {
    // Transpile JSX/ES6 code to browser-compatible JavaScript
    const result = transformSync(code, {
      presets: [
        '@babel/preset-react',
        ['@babel/preset-env', { modules: false }],
      ],
    });
    return result.code;
  } catch (error) {
    throw new Error(`Compilation error: ${error.message}`);
  }
};

const extractComponentName = (code) => {
  // Match common React component patterns
  const patterns = [
    /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/, // function Component()
    /const\s+([A-Z][a-zA-Z0-9]*)\s*=/, // const Component =
  ];

  for (const pattern of patterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return 'CustomModule'; // Fallback name
};

const wrappedCode = (codeFile) => {
  let moduleCode = fs.readFileSync(codeFile, 'utf8');
  const moduleName = extractComponentName(moduleCode);
  return `
  import ReactDOM from 'react-dom';
  ${moduleCode}
  const element = document.getElementById('root');
  ReactDOM.render(React.createElement(${moduleName}), element);
  `;
};

const createHtml = (bundleFile) => {
  const bundle = fs.readFileSync(bundleFile, 'utf8');
  const html = `
  <!DOCTYPE html>
  <html>
  <body>
    <div>
        <div id="root"></div>
        <script>
          ${bundle}
        </script>
    </div>
  </body>
  </html>
  `;
  return html;
};

const compile = async (inputFile, configFile, codeFile) => {
  // create cityflow.js
  const dirName = path.dirname(codeFile);
  const distFolder = path.join(dirName, 'dist');
  const input = fs.readFileSync(inputFile, 'utf8');
  const config = fs.readFileSync(configFile, 'utf8');
  const cityflowJS = `
  export const cityflow = {
      module: {
        input: ${input},
        config: ${config},
        output: {},
        setOutput: (newOutput) => {
          cityflow.module.output = newOutput;
        },
        setConfig: (newConfig) => {
          cityflow.module.config = { ...cityflow.module.config, ...newConfig };
        },
      },
    };
  window.cityflow = cityflow;
  `;
  const cityflowJSPath = path.join(distFolder, 'cityflow.js');
  fs.writeFileSync(cityflowJSPath, cityflowJS);

  // Compile React code
  const compiledCode = compileReactCode(wrappedCode(codeFile));
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }
  const compiledFilePath = path.join(distFolder, 'compiled.js');
  fs.writeFileSync(compiledFilePath, compiledCode);
  console.log('compiled code written to:', compiledFilePath);

  // Basic webpack config
  const webpackConfig = {
    mode: 'production',
    entry: compiledFilePath,
    output: {
      path: distFolder,
      filename: 'bundle.js',
    },
    optimization: {
      minimize: true,
    },
  };

  // Run webpack
  const runWebpack = (config) => {
    return new Promise((resolve, reject) => {
      webpack(config, (err, stats) => {
        if (err) {
          reject(err);
        } else if (stats.hasErrors()) {
          reject(stats.compilation.errors);
        } else {
          const bundleFilePath = path.join(distFolder, 'bundle.js');
          console.log('bundle created:', bundleFilePath);
          resolve(bundleFilePath);
        }
      });
    });
  };

  const bundleFile = await runWebpack(webpackConfig);
  return bundleFile;
};

module.exports = {
  compile,
  createHtml,
};
