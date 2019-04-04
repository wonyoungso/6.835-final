import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MapContainer, GraphContainer, Header, SliderContainer } from '../components';
import { windowResize, updateData } from '../actions';
import styled from 'styled-components';
import * as d3 from 'd3';
import _ from 'lodash';
import moment from 'moment';
import { GRAPH_HEIGHT, HEADER_HEIGHT } from '../constants/defaults';

const Divider = styled.div`
  display:flex;
  justify-content: space-between;
`;

const DataArea = styled.div`
  position: fixed;
  left: calc(60% + 20px);
  font-size:0.8em;
  bottom: 20px;
  width: 30%;
  font-size:0.7em;
`;

const Fragment = React.Fragment;
class Home extends Component {
  componentDidMount(){

    window.addEventListener('resize', this.resizeHandler.bind(this));

    this.resizeHandler();
  }

  resizeHandler(e){
    this.props.dispatch(windowResize({
      width: window.innerWidth,
      height: window.innerHeight
    }));
    
  }


  render() {
    let { windowWidth, windowHeight } = this.props;
    
    return (
      <Fragment>
        <Header />
        <Divider>

          <MapContainer />
          <div>
            <SliderContainer />
            <GraphContainer containerWidth={windowWidth * 0.4} containerHeight={windowHeight - HEADER_HEIGHT - 100 } />
          </div>
        </Divider>

        <DataArea>
          * Data: Zillow Rent Index (ZRI): A smoothed measure of the median estimated market rate rent across a given region and housing type. Zillow Research (2019).
        </DataArea>
      </Fragment>
    );
  }
}

let mapStateToProps = state => {
  return {
    windowWidth: state.windowWidth,
    windowHeight: state.windowHeight
  }
}

export default connect(mapStateToProps)(Home);