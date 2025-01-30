function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
import ReactDOM from 'react-dom';
import React, { useEffect, useState } from 'react';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';

// Create a dark theme
var darkTheme = createTheme({
  palette: {
    mode: 'dark'
  }
});
import { useRef } from 'react';
import * as d3 from 'd3';
export default function AreaChart(props) {
  var input = props.input,
    config = props.config,
    setOutput = props.setOutput,
    setConfig = props.setConfig;
  var ref = useRef();
  var data = input === null || input === void 0 ? void 0 : input.input;
  var offset = d3.stackOffsetNone;
  useEffect(function () {
    var _data$;
    if (!data) return;
    var width = config.width;
    var height = config.height;
    var m = (_data$ = data[0]) === null || _data$ === void 0 ? void 0 : _data$.length;
    var n = data.length;
    var flatData = data.flat(2);
    var maxY = d3.max(flatData);
    var x = d3.scaleLinear().domain([0, m - 1]).range([0, width]);
    var y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    var z = d3.interpolateCool;
    var area = d3.area().x(function (d, i) {
      return x(i);
    }).y0(function (d) {
      return y(d[0]);
    }).y1(function (d) {
      return y(d[1]);
    });
    var stack = d3.stack().keys(d3.range(n)).offset(offset).order(d3.stackOrderNone);
    var svg = d3.select(ref.current).attr('viewBox', [0, 0, width, height]).attr('width', width).attr('height', height).attr('style', 'max-width: 100%; max-height: 100%;');
    svg.selectAll('path').data(data).join('path').attr('d', area).attr('fill', function (d, i) {
      return z(i / n);
    });
  }, [data]);
  setOutput({
    "output": "hello world"
  });
  return /*#__PURE__*/React.createElement("svg", {
    ref: ref
  });
}

// Define a wrapper component for the dynamically injected module
var IframeApp = function IframeApp() {
  var _useState = useState(window.input || null),
    _useState2 = _slicedToArray(_useState, 2),
    input = _useState2[0],
    setInput = _useState2[1];
  var _useState3 = useState(window.config || null),
    _useState4 = _slicedToArray(_useState3, 2),
    config = _useState4[0],
    setConfig = _useState4[1];
  var _useState5 = useState(null),
    _useState6 = _slicedToArray(_useState5, 2),
    output = _useState6[0],
    setOutput = _useState6[1];
  var _useState7 = useState({}),
    _useState8 = _slicedToArray(_useState7, 2),
    props = _useState8[0],
    setProps = _useState8[1];
  var sendToParent = function sendToParent(config, output) {
    window.parent.postMessage({
      id: window.iframeId,
      config: config,
      output: output
    }, '*');
  };

  // Listen for messages from the parent
  useEffect(function () {
    var handleMessage = function handleMessage(event) {
      if (event.data && event.data.id === window.iframeId) {
        if (event.data.input !== undefined) setInput(event.data.input);
        if (event.data.config !== undefined) setConfig(event.data.config);
      }
    };
    window.addEventListener('message', handleMessage);
    return function () {
      window.removeEventListener('message', handleMessage);
    };
  }, []);
  useEffect(function () {
    sendToParent(config, output);
    window.props = {
      output: output
    };
  }, [config, output]);
  useEffect(function () {
    setProps({
      input: input,
      config: config,
      setConfig: setConfig,
      setOutput: setOutput
    });
  }, [input, config, setConfig, setOutput]);
  var module = /*#__PURE__*/React.createElement(AreaChart, props);
  return /*#__PURE__*/React.createElement(ThemeProvider, {
    theme: darkTheme
  }, /*#__PURE__*/React.createElement(CssBaseline, null), props && props.config && module);
};

// Render the iframe app
var element = document.getElementById('iframe_root');
ReactDOM.render(/*#__PURE__*/React.createElement(IframeApp, null), element);