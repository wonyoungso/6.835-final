import React, { Component } from 'react'
import { connect } from 'react-redux';
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import styled from 'styled-components';
import { SLIDER_HEIGHT, CURRENT_TIMES } from '../constants/defaults';
import { changeCurrentTime } from '../actions';
import moment from 'moment';

let Container = styled.div`
  width: calc(100% - 50px);
  height: ${SLIDER_HEIGHT - 40}px;
  padding: 20px;
  padding-left:10px;
  display:flex;
  align-items: center;

  h3 {
    font-size:0.8em;
    margin-right: 10px;x
  }

  h3.date {
    font-size:0.8em;
    width: 100px;
    margin-right: 0;
    padding-left: 20px;
  }
`;

class SliderContainer extends Component {
  handleChange(e){
    this.props.dispatch(changeCurrentTime(e));
  }
  componentDidMount(){

    var handle = document.querySelector(".rc-slider.slider-current-time .rc-slider-handle");
    handle.style.transition = "0.4s box-shadow";
  }
  componentDidUpdate(prevProps){
    console.log("this.props.screenGrabbing:", this.props.sliderGrabbing);
    var handle = document.querySelector(".rc-slider.slider-current-time .rc-slider-handle");
    handle.style.boxShadow = this.props.sliderGrabbing ? "0 0 5px 5px #fff, 0 0 5px 5px #ffd712, 0 0 5px 5px #f0ff08" : "none";
  }

  render() {
    let { currentTime } = this.props;
    return (
      <Container>
        <h3>
          Date
        </h3>
        <Slider 
          className="slider-current-time"
          min={1}
          value={currentTime}
          max={98}
          onChange={this.handleChange.bind(this)}
        />
        <h3 className="date">
          { moment(CURRENT_TIMES[currentTime]).format("MMM") }<br />
          {moment(CURRENT_TIMES[currentTime]).format("YYYY")}
        </h3>
      </Container>
    )
  }
}

let mapStateToProps = state => {
  return {
    currentTime: state.currentTime,
    sliderGrabbing: state.sliderGrabbing
  }
}

export default connect(mapStateToProps)(SliderContainer);