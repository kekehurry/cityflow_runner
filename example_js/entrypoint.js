import React, { useState, useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Hello } from './hello';

export default function AreaChart(props) {
  // const { input, config, setOutput, setConfig } = props;
  const input = {
    input: [
      [
        [0, 0.36],
        [0, 0.2],
        [0, 0.3],
        [0, 2.96],
        [0, 1.17],
        [0, 0.02],
        [0, 0],
        [0, 0.75],
        [0, 0],
        [0, 0],
      ],
      [
        [0.36, 0.97],
        [0.2, 0.26],
        [0.3, 0.58],
        [2.96, 3.93],
        [1.17, 1.51],
        [0.02, 0.04],
        [0, 0],
        [0.75, 0.75],
        [0, 0],
        [0, 0],
      ],
      [
        [0.97, 5.4],
        [0.26, 2.18],
        [0.58, 0.73],
        [3.93, 3.93],
        [1.51, 1.51],
        [0.04, 0.04],
        [0, 0],
        [0.75, 0.77],
        [0, 2.81],
        [0, 1.01],
      ],
      [
        [5.4, 5.43],
        [2.18, 3.6],
        [0.73, 2.75],
        [3.93, 4.36],
        [1.51, 1.52],
        [0.04, 0.04],
        [0, 0],
        [0.77, 0.77],
        [2.81, 2.81],
        [1.01, 1.01],
      ],
      [
        [5.43, 5.43],
        [3.6, 3.63],
        [2.75, 4.27],
        [4.36, 7.64],
        [1.52, 3.08],
        [0.04, 1.94],
        [0, 0.24],
        [0.77, 0.78],
        [2.81, 2.81],
        [1.01, 1.01],
      ],
    ],
  };
  const config = {
    title: 'AreaChart',
    width: 800,
    height: 400,
  };
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
