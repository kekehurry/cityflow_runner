import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Hello } from './hello';

export default function AreaChart(props) {
  // const { input, config, setOutput, setConfig } = props;
  const input = window.input;
  const config = window.config;
  const ref = useRef();
  const data = input?.input;
  const offset = d3.stackOffsetNone;

  useEffect(() => {
    if (!data) return;
    const width = config.width;
    const height = config.height;
    const m = data[0]?.length;
    const n = data.length;
    const flatData = data.flat(2);

    const maxY = d3.max(flatData);
    const x = d3
      .scaleLinear()
      .domain([0, m - 1])
      .range([0, width]);
    const y = d3.scaleLinear().domain([0, maxY]).range([height, 0]);
    const z = d3.interpolateCool;

    const area = d3
      .area()
      .x((d, i) => x(i))
      .y0((d) => y(d[0]))
      .y1((d) => y(d[1]));

    const stack = d3
      .stack()
      .keys(d3.range(n))
      .offset(offset)
      .order(d3.stackOrderNone);

    const svg = d3
      .select(ref.current)
      .attr('viewBox', [0, 0, width, height])
      .attr('width', width)
      .attr('height', height)
      .attr('style', 'max-width: 100%; max-height: 100%;');

    svg
      .selectAll('path')
      .data(data)
      .join('path')
      .attr('d', area)
      .attr('fill', (d, i) => z(i / n));
  }, [data]);

  // setOutput({ output: 'hello world' });

  return (
    <>
      <Hello />
      <svg ref={ref}></svg>
    </>
  );
}
