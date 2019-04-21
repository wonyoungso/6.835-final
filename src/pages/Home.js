import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MapContainer, GraphContainer, Header, SliderContainer, Cursor, LeapManipulation } from '../components';
import { windowResize  } from '../actions';
import styled from 'styled-components';
import { HEADER_HEIGHT } from '../constants/defaults';

const Divider = styled.div`
  position:relative;
`;

const DataArea = styled.div`
  position: fixed;
  left: calc(60% + 20px);
  font-size:0.8em;
  bottom: 20px;
  width: 30%;
  font-size:0.7em;
`;

const GraphArea = styled.div`
  transform: ${props => props.mapOrGraph === "Map" ? "scale(0.8)" : "scale(1.2)" };
  opacity: ${props => props.mapOrGraph === "Map" ? 0.5: 1 };
  transform-origin: center left;
  transition: 0.4s all;
  position: absolute;
  left:   ${props => props.mapOrGraph === "Map" ? "60%" : "50%" };
  top: 0;
  background: black;
  z-index:0;
`;

const Fragment = React.Fragment;
class Home extends Component {
  constructor(props){
    super(props);

  }
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
    let { windowWidth, windowHeight, mapOrGraph, screenPosition } = this.props;
    // console.log(mapOrGraph);

    return (
      <Fragment>
        <LeapManipulation />
        <Header />
        <Divider>
          <MapContainer />
          <GraphArea mapOrGraph={mapOrGraph}>
            <SliderContainer />
            <GraphContainer containerWidth={windowWidth * 0.4} containerHeight={windowHeight - HEADER_HEIGHT - 100} />
          </GraphArea>
        </Divider>
        <Cursor clicked={this.props.clicked} cursorPosition={screenPosition} />
      </Fragment>
    );
  }
}

let mapStateToProps = state => {
  return {
    windowWidth: state.windowWidth,
    windowHeight: state.windowHeight,
    screenPosition: state.screenPosition,
    mapOrGraph: state.mapOrGraph,
    clicked: state.clicked
  }
}

export default connect(mapStateToProps)(Home);