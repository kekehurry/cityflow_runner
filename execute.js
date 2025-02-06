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
  // Match default export patterns first
  const defaultPatterns = [
    /export\s+default\s+function\s+([A-Z][a-zA-Z0-9]*)\s*\(/, // export default function Component()
    /export\s+default\s+const\s+([A-Z][a-zA-Z0-9]*)\s*=/, // export default const Component =
    /export\s+default\s+([A-Z][a-zA-Z0-9]*);?\s*$/, // export default Component; or export default ComponentComponent
  ];

  // Check for default exports
  for (const pattern of defaultPatterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  return 'CustomModule'; // Fallback name
};

const wrappedCode = (entryFile) => {
  const collectedImports = new Map(); // 存储合并后的导入 {source: {specifiers}}
  const processImports = (code) => {
    const result = transformSync(code, {
      presets: ['@babel/preset-react'],
      plugins: [
        () => ({
          visitor: {
            ImportDeclaration(path) {
              const source = path.node.source.value;
              const specifiers = path.node.specifiers.map((s) => {
                if (s.type === 'ImportDefaultSpecifier') {
                  return { type: 'default', local: s.local.name };
                } else if (s.type === 'ImportNamespaceSpecifier') {
                  return { type: 'namespace', local: s.local.name };
                } else {
                  return {
                    type: 'named',
                    imported: s.imported ? s.imported.name : null,
                    local: s.local.name,
                  };
                }
              });

              if (!collectedImports.has(source)) {
                collectedImports.set(source, []);
              }
              collectedImports.get(source).push(...specifiers);
              path.remove();
            },
          },
        }),
      ],
    });
    return result.code;
  };

  // 处理所有文件
  let moduleCode = processImports(`
  import ReactDOM from 'react-dom';
  import React, { useEffect, useState } from 'react';
  import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
  `);
  entryCode = fs.readFileSync(entryFile, 'utf8');
  moduleCode += processImports(entryCode) + '\n';

  // handle local import
  collectedImports.forEach((specifiers, source) => {
    if (source.includes('./')) {
      const sourcePath = path.join(path.dirname(entryFile), `${source}.js`);
      const code = fs.readFileSync(sourcePath, 'utf8');
      moduleCode += processImports(code) + '\n';
    }
  });

  let mergedImports = '';
  collectedImports.forEach((specifiers, source) => {
    if (!source.includes('./')) {
      const merged = new Map();

      // Merge imports
      specifiers.forEach((s) => {
        let key;
        if (s.type === 'default') {
          key = 'default';
        } else if (s.type === 'namespace') {
          key = `namespace:${s.local}`;
        } else {
          key = `${s.imported}->${s.local}`;
        }
        if (!merged.has(key)) merged.set(key, s);
      });

      // Build import statement
      const defaultImport = [...merged.values()].find(
        (s) => s.type === 'default'
      );
      const namespaceImport = [...merged.values()].find(
        (s) => s.type === 'namespace'
      );
      const namedImports = [...merged.values()]
        .filter((s) => s.type === 'named')
        .map((s) => {
          if (s.imported === s.local) return s.imported;
          return `${s.imported} as ${s.local}`;
        });

      let importStatement = 'import ';
      if (defaultImport) {
        importStatement += defaultImport.local;
        if (namespaceImport || namedImports.length > 0) importStatement += ', ';
      }
      if (namespaceImport) {
        importStatement += `* as ${namespaceImport.local}`;
        if (namedImports.length > 0) importStatement += ', ';
      }
      if (namedImports.length > 0) {
        importStatement += `{ ${namedImports.join(', ')} }`;
      }
      importStatement += ` from '${source}';\n`;

      mergedImports += importStatement;
    }
  });

  const moduleName = extractComponentName(moduleCode);

  return `
  ${mergedImports}
  ${moduleCode}
  // Define a wrapper component for the dynamically injected module
  const IframeApp = () => {

    const [input, setInput] = useState(window.input||null);
    const [config, setConfig] = useState(window.config||null);
    const [output, setOutput] = useState(null);
    const [props, setProps] = useState({});

    const sendToParent = (config, output) => {
      window.parent.postMessage({ id:window.iframeId, config, output }, '*');
    };

    // Listen for messages from the parent
    useEffect(() => {
      const handleMessage = (event) => {
        if (event.data && event.data.id === window.iframeId) {
          if (event.data.input !== undefined) setInput(event.data.input);
          if (event.data.config !== undefined) setConfig(event.data.config);
    }
      };
      window.addEventListener('message', handleMessage);
      return () => {
        window.removeEventListener('message', handleMessage);
      };
    }, []);

    useEffect(() => { 
      sendToParent(config, output);
      window.props = { output };
    }, [config, output]);

    useEffect(() => {
      setProps({ input, config, setConfig, setOutput });
    }, [input, config, setConfig, setOutput]);

    const module = React.createElement(${moduleName}, props);

    const theme = createTheme({
      typography: window.typography,
      palette: window.palette,
    });

    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {props && props.config && module}
      </ThemeProvider>
    );
  };

  // Render the iframe app
  const element = document.getElementById('iframe_root');
  ReactDOM.render(<IframeApp />, element);
  `;
};

const createHtml = (bundleFile) => {
  const bundle = fs.readFileSync(bundleFile, 'utf8');
  const distFolder = path.dirname(bundleFile);
  const html = `
    <div id="iframe_root"></div>
    <script>
      ${bundle}
    </script>
    `;
  fs.writeFileSync(path.join(distFolder, '../index.html'), html);
  return html;
};

const compile = async (entryFile) => {
  // create cityflow.js
  const dirName = path.dirname(entryFile);
  const distFolder = path.join(dirName, 'dist');
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }
  // Compile React code
  const compiledCode = compileReactCode(wrappedCode(entryFile));

  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }
  const compiledFilePath = path.join(distFolder, 'compiled.js');
  fs.writeFileSync(compiledFilePath, compiledCode);
  // console.log('compiled code written to:', compiledFilePath);

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
          const errors = stats.compilation.errors
            .map((e) => e.message || e)
            .join('\n');
          reject(new Error(errors));
        } else {
          const bundleFilePath = path.join(distFolder, 'bundle.js');
          const html = createHtml(bundleFilePath);
          resolve(html);
        }
      });
    });
  };

  const bundleFile = await runWebpack(webpackConfig).catch((error) => {
    throw new Error(`Webpack error: ${error.message}`);
  });
  return bundleFile;
};

const args = process.argv.slice(2);
const workdir = path.resolve(args.find((arg) => !arg.startsWith('--')) || './');
const compileFlag = args.includes('--compile');

const entryFile = path.join(workdir, 'entrypoint.js');

if (compileFlag) {
  try {
    compile(entryFile);
  } catch (error) {
    console.log(error);
    const htmlFile = path.join(workdir, 'index.html');
    fs.writeFileSync(
      htmlFile,
      `<div id="iframe_root">Compile Error: ${error.message}</div>`
    );
  }
}
