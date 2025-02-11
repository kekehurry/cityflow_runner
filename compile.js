const webpack = require('webpack');
const path = require('path');
const fs = require('fs');

const wrap = (entryFile) => {
  const dirName = path.dirname(entryFile);
  const appPath = path.join(dirName, 'app.js');
  const app = `
    import ReactDOM from 'react-dom';
    import React, { useEffect, useState } from 'react';
    import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
    import Module from './entrypoint';
    
    // Define a wrapper component for the dynamically injected module
    export default function IframeApp() {
      const [input, setInput] = useState(null);
      const [config, setConfig] = useState(null);
      const [output, setOutput] = useState(null);
      const [props, setProps] = useState({});
    
      const sendToParent = (config, output) => {
        window.parent.postMessage({ id: window?.iframeId, config, output }, '*');
      };
    
      // Listen for messages from the parent
      useEffect(() => {
        const handleMessage = (event) => {
          if (event.data && event.data.id === window?.iframeId) {
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
    
      const theme = createTheme({
        typography: window.typography,
        palette: window.palette,
      });
    
      return (
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Module 
            input={input}
            config={config}
            setConfig={setConfig}
            setOutput={setOutput}
          />
        </ThemeProvider>
      );
    }
    // Wait for the DOM to load before rendering
    document.addEventListener('DOMContentLoaded', () => {
      const element = document.getElementById('iframe_root');
      if (element) {
        console.log('Rendering iframe app');
        ReactDOM.render(<IframeApp />, element);
      }
    });
`;
  fs.writeFileSync(appPath, app);
  return appPath;
};

const createHtml = (bundleFile) => {
  const htmlPath = path.join(path.dirname(bundleFile), '../index.html');
  const bundleCode = fs.readFileSync(bundleFile, 'utf8');
  const html = `
          <!DOCTYPE html>
          <html>
          <head>
          <style>
              ::-webkit-scrollbar {
                  display: none;
              }
              html {
                  scrollbar-width: none; /* For Firefox */
                  -ms-overflow-style: none; /* For Internet Explorer and Edge */
              }
              body {
              font-family: 'Roboto Mono', 'Arial', 'Kalam', sans-serif;
              }
          </style>
          <script>
            ${bundleCode}   
          </script>
          </head>
          <body>
          <div id="iframe_root"></div>
          </body>
          </html>
          `;
  fs.writeFileSync(htmlPath, html);
  return html;
};

const pack = async (workdir) => {
  // create cityflow.js
  const entryFile = path.join(workdir, 'entrypoint.js');
  const appPath = wrap(entryFile);
  const distFolder = path.join(workdir, 'dist');
  // Basic webpack config
  const webpackConfig = {
    mode: 'production',
    entry: appPath,
    output: {
      path: distFolder,
      filename: 'bundle.js',
      library: 'cityflow', // Attach your bundle to this global variable
      libraryTarget: 'umd', // UMD build format for broad compatibility
      globalObject: 'this', // Ensure compatibility in different environments
    },
    module: {
      rules: [
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader'],
        },
        {
          test: /\.(js|jsx)$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env', '@babel/preset-react'],
            },
          },
        },
      ],
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
          resolve(path.join(distFolder, 'bundle.js'));
        }
      });
    });
  };

  const bundleFile = await runWebpack(webpackConfig).catch((error) => {
    throw new Error(error);
  });
  const html = createHtml(bundleFile);
  return html;
};

const args = process.argv.slice(2);
const workdir = path.resolve(args.find((arg) => !arg.startsWith('--')) || './');

pack(workdir);
