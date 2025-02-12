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
      <Module />
    </ThemeProvider>
  );
}
// Wait for the DOM to load before rendering
document.addEventListener('DOMContentLoaded', () => {
  const element = document.getElementById('iframe_root');
  if (element) {
    ReactDOM.render(<IframeApp />, element);
  }
});
