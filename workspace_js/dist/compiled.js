import ReactDOM from 'react-dom';
import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { cityflow } from './cityflow';
export default function AreaChart() {
  var ref = useRef();
  var _cityflow$module = cityflow.module,
    input = _cityflow$module.input,
    config = _cityflow$module.config,
    setConfig = _cityflow$module.setConfig,
    setOutput = _cityflow$module.setOutput;
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
var element = document.getElementById('root');
ReactDOM.render(/*#__PURE__*/React.createElement(AreaChart), element);