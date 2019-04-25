import React, { Component } from 'react';
import { connect } from 'react-redux';
import { MapContainer, GraphContainer, Header, SliderContainer, Cursor, LeapManipulation, BackFaceSummary} from '../components';
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
  transform: ${props => props.mapOrGraph === "Map" ? "scale(0.8)" : "scale(1)" };
  opacity: ${props => props.mapOrGraph === "Map" ? 0.5: 1 };
  transform-origin: center left;
  transition: 0.4s all;
  position: absolute;
  left:   ${props => props.mapOrGraph === "Map" ? "60%" : "50%" };
  top: 0;
  background: black;
  z-index:0;
`;

const FlipCard = styled.div`
  background-color: transparent;
  perspective: 1000px;
  .inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s;
    transform-style: preserve-3d;
  }
`;

const FlipCardFront = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
`;

const FlipCardBack = styled.div`

  position: absolute;
  width: 100%;
  height: 100%;
  z-index:5;
  backface-visibility: hidden;
  background-color:black;
  transform: rotateY(180deg);
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
    let { windowWidth, windowHeight, mapOrGraph, screenPosition, flipMode } = this.props;
    // console.log(mapOrGraph);

    return (
      <Fragment>
        <LeapManipulation />
        <Header />
        <FlipCard style={{ width: windowWidth, height: windowHeight - 165 }}>
          <div className="inner" style={{ transform: flipMode === "back" ? "rotateY(180deg)" : "none" }}>
            <FlipCardFront>
              <Divider>
                <MapContainer />
                <GraphArea mapOrGraph={mapOrGraph}>
                  <SliderContainer />
                  <GraphContainer containerWidth={windowWidth * 0.4} containerHeight={windowHeight - HEADER_HEIGHT - 100} />
                </GraphArea>
              </Divider>
            </FlipCardFront>
            <FlipCardBack>  
              
              <BackFaceSummary />
            </FlipCardBack>
          </div>
        </FlipCard>
        
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
    clicked: state.clicked,
    flipMode: state.flipMode
  }
}

export default connect(mapStateToProps)(Home);