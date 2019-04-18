import React, { Component } from 'react';
import { connect } from 'react-redux';
import * as d3 from 'd3';
import _ from 'lodash';
import styled from 'styled-components';
import { getLabel, numberWithDelimiter, wrap } from '../utils';
import mixins from '../stylesheets/mixins';
import { removeGraphSelected, updateCurrentFocusMap } from '../actions';
const GraphBox = styled.div`
  position: relative;
`;

const CenterAddText = styled.div`
  position:absolute;
  left: calc(50% - 35px);
  top: 50%;
  ${mixins.REGULAR_TYPE}
  ${mixins.ABSOLUTE_CENTER_MIDDLE}
  text-align:center;
  font-size:0.9em;
  color: #555;
`;

class GraphContainer extends Component {
  constructor(props){
    super(props);

    this.svgRef = React.createRef();
    this.xScale = d3.scaleTime();
    this.yScale = d3.scaleLinear().clamp(true);
    this.margin = {top: 20, right: 125, bottom: 50, left: 50};
    this.zoomed = this.zoomed.bind(this);
    this.zoomTransform = d3.zoomIdentity;
  }
  componentDidMount() {
    let { containerWidth, containerHeight } = this.props;

    var width = containerWidth - this.margin.left - this.margin.right,
      height = containerHeight - this.margin.top - this.margin.bottom;

    var svg = d3.select(this.svgRef.current);


    this.xScale.domain([new Date(2010, 10, 2), new Date(2019, 1, 2)]).range([0, width]);
    this.yScale.domain([500, 1400]).range([height, 0]);
    var clip = svg.append("defs").append("svg:clipPath")
      .attr("id", "clip")
      .append("svg:rect")
      .attr("width", width)
      .attr("height", height)
      .attr("x", 0)
      .attr("y", 0);

    this.zoom = d3.zoom()
      .scaleExtent([1, 6])
      // .translateExtent([[0, 0], [width + 100, height + 100]])
      .on("zoom", this.zoomed);
    svg.append("g")
      .attr("class", "grid xgrid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(this.xScale)
        .tickSize(-height)
        .tickFormat("")
      )

    svg.append("g")
      .attr("class", "grid ygrid")
      .call(d3.axisLeft(this.yScale)
        .tickSize(-width)
        .tickFormat("")
      )
    this.rectArea = svg.append("rect");

    this.rectArea.attr('class', "event-area")
      .attr("width", width)
      .attr("height", height)
      .style("fill", "none")
      .style("pointer-events", "all")
      .call(this.zoom)

      // .duration(5500)
      // .call(this.zoom.transform, d3.zoomIdentity.scale(5))


    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .transition()
      .call(d3.axisBottom(this.xScale)); // Create an axis component with d3.axisBottom

    svg.append("g")
      .attr("class", "y axis")
      .transition()
      .call(d3.axisLeft(this.yScale)); // Create an axis component with d3.axisLeft
    
   

    svg.append("g").attr("class", "grapharea")
      .attr("clip-path", "url(#clip)")

    // svg.call(this.zoom)
    // this.d3Render();
  }

  zoomed(e){
    if (d3.event.transform.k === 1) {
      this.zoomTransform = d3.zoomIdentity;
      d3.select(".select-area").call(this.zoom.transform, d3.zoomIdentity);

    } else {
      this.zoomTransform = d3.event.transform;
      // d3.event
    }

    let { containerWidth, containerHeight } = this.props;
    var width = containerWidth - this.margin.left - this.margin.right,
        height = containerHeight - this.margin.top - this.margin.bottom;
    var svg = d3.select(this.svgRef.current);

    // recover the new scale
    var newX = this.zoomTransform.rescaleX(this.xScale);
    var newY = this.zoomTransform.rescaleY(this.yScale);


    // update axes with these new boundaries
    svg.select(".x.axis")
      .call(d3.axisBottom(newX)); // Create an axis component with d3.axisBottom

    svg.select(".y.axis")
      .call(d3.axisLeft(newY));

    svg.select(".grid.xgrid")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(newX)
        .tickSize(-height)
        .tickFormat("")
      )

    svg.select(".grid.ygrid")
      .call(d3.axisLeft(newY)
        .tickSize(-width)
        .tickFormat("")
      )
    
    var g = svg.select(".grapharea").selectAll("g");
      
    g.selectAll("path").attr("transform", this.zoomTransform);
    
    g.selectAll("text.title")
      .attr("x", d => {
        return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 5;
      })
      .attr("y", d => {
        return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 5;
      })
      
    
    g.selectAll("text.price")
      .attr("x", d => {
        return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 5;
      })
      .attr("y", d => {
        return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 17;
      })

    g.selectAll("text.close-btn")
      .attr("x", d => {
        return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 45;
      })
      .attr("y", d => {
        return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 17;
      })

  }

  componentDidUpdate(prevProps){
    this.d3Render(prevProps);
    this.zoomUpdate(prevProps);
  }

  zoomUpdate(prevProps){
    this.rectArea.call(this.zoom.transform, d3.zoomIdentity.scale(this.props.graphZoom).translate(this.props.graphCenter[0], this.props.graphCenter[1]));
  }

  getDomains(graphSelected){
    var yDomainMax = -9999999999;
    _.each(graphSelected, g => {
      _.each(g.graph.houseValues, houseValue => {
        // houseValue[0]
        if (yDomainMax < houseValue[1]) {
          yDomainMax = houseValue[1]
        }
      });

    });

    return {
      x: [new Date(2010, 10, 2), new Date(2019, 1, 2)],
      y: [500, yDomainMax]
    };
  }


  d3Render(prevProps){
    let { containerWidth, containerHeight, graphSelected, currentTime } = this.props;

    if (containerWidth !== prevProps.containerWidth || containerHeight !== prevProps.containerHeight){

      let width = containerWidth - this.margin.left - this.margin.right,
        height = containerHeight - this.margin.top - this.margin.bottom;

      this.xScale.range([0, width]);
      this.yScale.range([height, 0]);

      let newX = this.zoomTransform.rescaleX(this.xScale);
      let newY = this.zoomTransform.rescaleY(this.yScale);

      var svg = d3.select(this.svgRef.current);
      svg.select("#clip rect")
        .attr("width", width + this.margin.left + this.margin.right)
        .attr("height", height);

      svg.select("rect.event-area")
        .attr("width", width + this.margin.left + this.margin.right)
        .attr("height", height);

      svg.select(".x.axis")
        .transition()
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(newX)); // Create an axis component with d3.axisBottom

      svg.select(".y.axis")
        .transition()
        .call(d3.axisLeft(newY)); // Create an axis component with d3.axisLeft
        
      svg.select(".grid.xgrid")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(newX)
          .tickSize(-height)
          .tickFormat("")
        )

      svg.select(".grid.ygrid")
        .call(d3.axisLeft(newY)
          .tickSize(-width)
          .tickFormat("")
        )

      var line = d3.line()
        .x(d => {
          return this.xScale(d[0]);
        })
        .y(d => { return this.yScale(d[1]); })
      svg.select(".grapharea").selectAll("path")
        .data(graphSelected)
        .enter().append("path")
        .attr('class', 'line')
        .attr('stroke', d => d.color)
        .attr("d", d => {
          return line(d.graph.houseValues)
        })
        .attr("transform", this.zoomTransform);
    }

    var graphSelectedValues = _.values(graphSelected);

    if (graphSelectedValues.length !== _.values(prevProps.graphSelected).length || prevProps.currentTime !== this.props.currentTime) {

      var svg = d3.select(this.svgRef.current);
      let width = containerWidth - this.margin.left - this.margin.right,
        height = containerHeight - this.margin.top - this.margin.bottom;

      // let rentDatas = this.getData(graphSelected);
      // console.log(rentDatas[0].houseValues.length)
      
        let domains = this.getDomains(graphSelectedValues);

      if (graphSelectedValues.length > 0) {

        this.xScale.domain(domains.x).range([0, width]);
        this.yScale.domain(domains.y).range([height, 0]);

      }
        let newX = this.zoomTransform.rescaleX(this.xScale);
        let newY = this.zoomTransform.rescaleY(this.yScale);

        svg.select(".x.axis")
          .transition()
          .attr("transform", "translate(0," + height + ")")
          .call(d3.axisBottom(newX)); // Create an axis component with d3.axisBottom

        svg.select(".y.axis")
          .transition()
          .call(d3.axisLeft(newY)); // Create an axis component with d3.axisLeft


        
        _.each(graphSelectedValues, (g, i) => { 
          graphSelectedValues[i].graph.p_houseValues = _.slice(g.graph.houseValues, 0, currentTime);
        });
        var line = d3.line()
          .x(d => {
            return this.xScale(new Date(d[0]));
          })
          .y(d => { return this.yScale(d[1]); })


        svg.select(".grapharea").selectAll("g").remove();

        let g = svg.select(".grapharea").selectAll("g")
          .data(graphSelectedValues)
        .enter().append("g")
          

        g.append("path")
          .attr('class', 'line')
          .style('stroke', (d, i) => { 
            return d.color;

          })
          .attr("d", d => {
            return line(d.graph.p_houseValues)
          })
          .attr("transform", this.zoomTransform)
          .on('click', e => {
            this.props.dispatch(updateCurrentFocusMap(e.id));
          });
        
        g.append("text")
          .attr("class", "graph-text title")
          .style('fill', (d, i) => d.color)
          .attr("x", d => {
            return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 5;
          })
          .attr("y", d => {
            return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 5;
          })
          .text(d => { return getLabel(d); })
          .on('click', e => {
            this.props.dispatch(updateCurrentFocusMap(e.id));
          });

        g.append("text")
          .attr("class", "graph-text price")
          .style('fill', (d, i) => d.color)
          .attr("x", d => {
            return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 5;
          })
          .attr("y", d => {
            return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 17;
          })
          .text(d => { return `$${numberWithDelimiter(_.last(d.graph.p_houseValues)[1])}`; })
          .on('click', e => {
            this.props.dispatch(updateCurrentFocusMap(e.id));
          });
      
        g.append("text")
          .attr("class", "graph-text close-btn")
          .style('fill', "white")
          .attr("x", d => {
            return this.xScale(new Date(_.last(d.graph.p_houseValues)[0])) * this.zoomTransform.k + this.zoomTransform.x + 45;
          })
          .attr("y", d => {
            return this.yScale(_.last(d.graph.p_houseValues)[1]) * this.zoomTransform.k + this.zoomTransform.y + 17;
          })
          .text("x")
          .on('click', e => {
            this.props.dispatch(removeGraphSelected(e.id))
          });
      
      
      svg.select(".x.axis")
        .transition()
        .call(d3.axisBottom(newX)); // Create an axis component with d3.axisBottom

      svg.select(".y.axis")
        .call(d3.axisLeft(newY)); // Create an axis component with d3.axisLeft

     

    }



  }


  render() {
    let { containerWidth, containerHeight, graphSelected} = this.props;



    return (
      <GraphBox>
        {
          _.values(graphSelected).length > 0 ?
          null : 
          <CenterAddText>
            Please click any region on the map to add the area to the graph.
          </CenterAddText> 
        }
        <svg
          width={containerWidth}
          height={containerHeight}>
          <g ref={this.svgRef} transform={`translate(${this.margin.left}, ${this.margin.top})`}>
          </g>
        </svg>
      </GraphBox>
     
    );
  }
}

let mapStateToProps = state => {
  return {
    graphSelected: state.graphSelected,
    currentTime: state.currentTime,
    graphCenter: state.graphCenter,
    graphZoom: state.graphZoom
  }
};

export default connect(mapStateToProps)(GraphContainer);