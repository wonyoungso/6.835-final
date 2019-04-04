import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';
import moment from 'moment';

const Box = styled.div`
  padding: 20px;
`;

class GraphToolTip extends Component {
  constructor(props) {
    super(props);

    this.svgRef = React.createRef();
    this.xScale = d3.scaleTime();
    this.yScale = d3.scaleLinear();
    this.margin = { top: 5, right: 5, bottom: 5, left: 5 };
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
  }

  handleMouseEnter(e){

    var svg = d3.select(this.svgRef.current);
    svg.select('.axis.y')
      .style('opacity', 1);
    svg.select('.axis.x')
      .style('opacity', 1);
  }

  handleMouseLeave(e){

    var svg = d3.select(this.svgRef.current);
    svg.select('.axis.y')
      .style('opacity', 0);
    svg.select('.axis.x')
      .style('opacity', 0);
  }

  componentDidMount() {
    this.d3Render();
  }

  componentDidUpdate() {
    this.d3Render();
  }

  getDomains(rentData) {
    let xExtent = d3.extent(rentData.houseValues, hv => hv[0]);
    let yExtent = d3.extent(rentData.houseValues, hv => hv[1]);

    return {
      x: xExtent,
      y: [500, yExtent[1]]
    };
  }

  d3Render() {
    let { containerWidth, containerHeight, rentData } = this.props;

    var width = containerWidth - this.margin.left - this.margin.right,
      height = containerHeight - this.margin.top - this.margin.bottom;

  
    let domains = this.getDomains(rentData);
    
    this.xScale.domain(domains.x).range([0, width]);
    this.yScale.domain(domains.y).clamp(true).range([height, 0]);
    var format = d3.timeFormat("%Y");

    var line = d3.line()
      .x(d => {
        return this.xScale(d[0]);
      })
      .y(d => { return this.yScale(d[1]); })
      .curve(d3.curveMonotoneX)

    var svg = d3.select(this.svgRef.current);


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(20," + height + ")")
      .call(d3.axisBottom(this.xScale).tickFormat(format))
      .style('opacity', 0)

    
    
    svg.append("g")
      .attr("class", "y axis")
      .attr("transform", "translate(30, 0)")
      .call(d3.axisLeft(this.yScale))
      .style('opacity', 0)
      

    svg.append("g")
      .attr("transform", "translate(30, 0)").selectAll("path")
      .data([rentData])
      .enter().append("path")
      .attr('class', 'line')
      .attr("d", d => {
        return line(d.houseValues)
      });


  }


  render() {
    let { containerWidth, containerHeight } = this.props;
    return (
      <Box onMouseEnter={this.handleMouseEnter} onMouseLeave={this.handleMouseLeave}>

        <svg
          width={containerWidth + this.margin.left + this.margin.right}
          height={containerHeight + this.margin.top + this.margin.bottom}>
          <g ref={this.svgRef} transform={`translate(${this.margin.left}, ${this.margin.top})`}>
          </g>
        </svg>
      </Box>
    );
  }
}

export default GraphToolTip;