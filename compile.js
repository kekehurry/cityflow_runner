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

  // Check for default exports first
  for (const pattern of defaultPatterns) {
    const match = code.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  // Fallback to checking non-default patterns
  // const patterns = [
  //   /function\s+([A-Z][a-zA-Z0-9]*)\s*\(/, // function Component()
  //   /const\s+([A-Z][a-zA-Z0-9]*)\s*=/, // const Component =
  // ];

  // for (const pattern of patterns) {
  //   const match = code.match(pattern);
  //   if (match && match[1]) {
  //     return match[1];
  //   }
  // }
  return 'CustomModule'; // Fallback name
};

const wrappedCode = (codeFile) => {
  let moduleCode = fs.readFileSync(codeFile, 'utf8');
  // Replace `import React, { ... } from 'react';` with only necessary imports
  moduleCode = moduleCode.replace(
    /import\s+React,\s*\{([^}]*)\}\s+from\s+['"]react['"];/g,
    (match, imports) => {
      // Filter out `useEffect` and `useState` but keep others
      const filteredImports = imports
        .split(',')
        .map((imp) => imp.trim())
        .filter((imp) => imp !== 'useEffect' && imp !== 'useState')
        .join(', ');

      // Handle cases where no curly braces are needed
      return filteredImports
        ? `import { ${filteredImports} } from 'react';`
        : '';
    }
  );

  // Handle cases where `import { ... } from 'react';` exists without React
  moduleCode = moduleCode.replace(
    /import\s+\{([^}]*)\}\s+from\s+['"]react['"];/g,
    (match, imports) => {
      const filteredImports = imports
        .split(',')
        .map((imp) => imp.trim())
        .filter((imp) => imp !== 'useEffect' && imp !== 'useState')
        .join(', ');

      return filteredImports
        ? `import { ${filteredImports} } from 'react';`
        : '';
    }
  );

  const moduleName = extractComponentName(moduleCode);

  return `
  import ReactDOM from 'react-dom';
  import React, { useEffect, useState } from 'react';
  import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

  // Create a dark theme
  const darkTheme = createTheme({
    palette: {
      mode: 'dark',
    },
  });

  ${moduleCode}

  // Define a wrapper component for the dynamically injected module
  const IframeApp = () => {
    const [input, setInput] = useState(null);
    const [config, setConfig] = useState(null);
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
    }, [config, output]);

    useEffect(() => {
      setProps({ input, config, setConfig, setOutput });
    }, [input, config, setConfig, setOutput]);

    const module = React.createElement(${moduleName}, props);

    return (
      <ThemeProvider theme={darkTheme}>
        <CssBaseline />
        {config && module}
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
  const html = `
    <div id="iframe_root"></div>
    <script>
      ${bundle}
    </script>
  `;
  return html;
};

const compile = async (inputFile, configFile, codeFile) => {
  // create cityflow.js
  const dirName = path.dirname(codeFile);
  const distFolder = path.join(dirName, 'dist');
  if (!fs.existsSync(distFolder)) {
    fs.mkdirSync(distFolder);
  }
  // const input = fs.readFileSync(inputFile, 'utf8');
  // const config = fs.readFileSync(configFile, 'utf8');
  // const cityflowJS = `
  // export const cityflow = {
  //     module: {
  //       input: ${input},
  //       config: ${config},
  //       output: {},
  //       setOutput: (newOutput) => {
  //         cityflow.module.output = newOutput;
  //       },
  //       setConfig: (newConfig) => {
  //         cityflow.module.config = { ...cityflow.module.config, ...newConfig };
  //       },
  //     },
  //   };
  // window.cityflow = cityflow;
  // `;
  // const cityflowJSPath = path.join(distFolder, 'cityflow.js');
  // fs.writeFileSync(cityflowJSPath, cityflowJS);

  // Compile React code
  const compiledCode = compileReactCode(wrappedCode(codeFile));
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
          reject(stats.compilation.errors);
        } else {
          const bundleFilePath = path.join(distFolder, 'bundle.js');
          // console.log('bundle created:', bundleFilePath);
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
