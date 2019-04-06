import React, { Component } from 'react'
import { connect } from 'react-redux';
import Leap from 'leapjs';
import { MODES } from '../constants/defaults';
import { changeMapOrGraph, changeMapSetting, changeScreenPosition } from '../actions';
import { screenPosition, angleBetween } from '../utils/';
import * as d3 from 'd3';
import _ from 'lodash';

const Fragment = React.Fragment;
class LeapManipulation extends Component {
  constructor(props){
    super(props);

    this.zoomScale = d3.scaleLinear().domain([20, 800]).clamp(true);
    this.panHands = [];
    this.recordLimit = 20;
    this.dragClickCount = 0;
    this.dragClickThreshold = 20;

  }

  componentDidMount(){

    this.controller = Leap.loop({ enableGestures: true }, (frame) => {
      let { mapOrGraph } = this.props;
      this.detectMapOrGraph(frame);

      if (mapOrGraph === "Map") {
        if (frame.hands.length === 1) {
          this.detectPan(frame);
        } else if (frame.hands.length === 2) {
          this.detectZoom(frame);
        }

      }      
    });


    this.controller.connect();

  }

  recordHands(hand){
    this.panHands.push(hand);
    if (this.panHands.length > this.recordsLimit) {
      this.panHands.shift();
    }
  }

  detectMapOrGraph(frame) {
    if (frame.hands.length > 1) {
      var leftHand = _.find(frame.hands, h => { return h.type === "left" });
      var rightHand = _.find(frame.hands, h => { return h.type === "right" });
      // debugger;

      //TODO: 모든 손가락이 펴져있어야
      try {
        var leftPalmAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], leftHand.palmNormal), [0, -1, 0]));
        var rightPalmAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], rightHand.palmNormal), [0, -1, 0]));
        var leftSpeed = Leap.vec3.length(leftHand.palmVelocity);
        var rightSpeed = Leap.vec3.length(rightHand.palmVelocity);

        // if leftPalmAngle
        // console.log("leftPalmAngle: ", leftPalmAngle,  "leftSpeed:", leftSpeed);

        if (leftPalmAngle < 90 && leftSpeed > 100 && rightPalmAngle > 90 && rightSpeed > 100) {

          this.props.dispatch(changeMapOrGraph("Graph"));

        } else if (leftPalmAngle > 90 && leftSpeed > 100 && rightPalmAngle < 90 && rightSpeed > 100) {

          this.props.dispatch(changeMapOrGraph("Map"));

        }
      } catch (e) {
      }

    }
  }

  getAvgPos(hands) {
    
    let len = hands.length;
    let sumPos = [0, 0, 0];
    for (let i = 0; i < len; i++){
      debugger;
      sumPos[0] += sumPos[0] + hands[i].tipPosition[0];
      sumPos[1] += sumPos[1] + hands[i].tipPosition[1];
      sumPos[2] += sumPos[2] + hands[i].tipPosition[2];
    }

    return [sumPos[0] / len, sumPos[1] / len, sumPos[2] / len];

  }  

  detectPan(frame){
    var hand = frame.hands[0];
    if (hand.indexFinger.extended && hand.middleFinger.extended && !hand.thumb.extended && !hand.ringFinger.extended && !hand.pinky.extended) {
      this.recordHands(hand);
      var avgTipPos = this.getAvgPos(this.panHands);
      debugger;
      
      // var velocity = [-hand.indexFinger.tipVelocity[0], -hand.indexFinger.tipVelocity[1]]
      
    
      // else {
      //   this.dragClickCount++;
      // }



      // if (this.dragClickCount >= this.dragClickThreshold){
    
      // }
      
      // window.map.panBy(velocity);


    }

  }

  detectZoom(frame) {
    if (frame.hands.length > 1) {
      var leftHand = _.find(frame.hands, h => { return h.type === "left" });
      var rightHand = _.find(frame.hands, h => { return h.type === "right" });

      if (!_.isUndefined(leftHand) && !_.isUndefined(rightHand)) {

        try {
            
          var leftIndexFinger = leftHand.indexFinger;
          var rightIndexFinger = rightHand.indexFinger;

          if (leftIndexFinger.extended && rightIndexFinger.extended) {
            
            // console.log("leftVelocity:", leftIndexFinger.tipVelocity);
            var leftIndexFingerPositiveAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], leftIndexFinger.tipVelocity), [-1, -1, 0])); 
            var rightIndexFingerPositiveAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], rightIndexFinger.tipVelocity), [1, 1, 0]))

            var leftIndexFingerNegativeAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], leftIndexFinger.tipVelocity), [1, 1, 0]));
            var rightIndexFingerNegativeAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], rightIndexFinger.tipVelocity), [-1, -1, 0]))


            var { zoom, currentMode, center } = this.props;
            var velocityAvg;

            if (leftIndexFingerPositiveAngle < 50 && rightIndexFingerPositiveAngle < 50) {
            
              velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;

              if (velocityAvg > 30) {
                var d2 = 4 / (60 * 4),
                    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
                    d4 = d3,
                    delta = Math.max(2.8, Math.min(18, zoom + d4)) - zoom;
                
                // console.log(delta);
                this.props.dispatch(changeMapSetting(zoom + delta, center, currentMode));
              }

            
            } else if (leftIndexFingerNegativeAngle < 50 && rightIndexFingerNegativeAngle < 50) {
            

              velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;

              if (velocityAvg > 30) {
                var d2 = -4 / (60 * 4),
                  d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
                  d4 = d3,
                  delta = Math.max(2.8, Math.min(18, zoom - d4)) - zoom;

                // console.log(delta);
                this.props.dispatch(changeMapSetting(zoom + delta, center, currentMode));
              }

              // velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;
              
              // this.props.dispatch(changeMapSetting(finalZoom, center, currentMode));
            }


          }
          
        } catch(e){
        }
        
      }
      
    }


    // detect the number of extened fingers
    // let numberOfExtended = _.filter(hand.fingers, f => { return f.extended; }).length;
    // if (numberOfExtended === 3) {
    //   let { currentMode, center } = this.props;

    //   this.zoomScale.range(_.filter(MODES, m => { return m.mode === currentMode })[0].range);

    //   this.props.dispatch(changeMapSetting(this.zoomScale(hand.palmPosition[2]), center, currentMode));

    // }

  }

  render() {
    return (
      <Fragment>
      </Fragment>
    )
  }
}

let mapStateToProps = state => {
  return {
    windowWidth: state.windowWidth,
    mapOrGraph: state.mapOrGraph,
    currentMode: state.currentMode,
    zoom: state.zoom,
    center: state.center
  }
}

export default connect(mapStateToProps)(LeapManipulation);