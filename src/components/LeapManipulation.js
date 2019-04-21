import React, { Component } from 'react'
import { connect } from 'react-redux';
import Leap from 'leapjs';
import { MODES } from '../constants/defaults';
import { changeMapOrGraph, changeMapSetting, changeGraphSetting, changeScreenPosition, changeClicked, changeCurrentTime } from '../actions';
import { screenPosition, angleBetween, isWithIn } from '../utils/';
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
    this.dragClickThreshold = 10;
    this.clickTime = 0;
    this.isGrabbing = false;
    this.maxX = -999;
    this.minX = 999;
    this.sliderScale = d3.scaleLinear().domain([-200, 200]).clamp(true).range([1, 98]);

  }

  componentDidMount(){

    this.controller = Leap.loop({ enableGestures: true }, (frame) => {
      let { mapOrGraph } = this.props;
      let detection = this.detectMapOrGraph(frame);

      if (!detection){
        if (mapOrGraph === "Map") {
          if (frame.hands.length === 1) {
            let hand = frame.hands[0];

            if (hand.indexFinger.extended && !hand.middleFinger.extended && !hand.thumb.extended && !hand.ringFinger.extended && !hand.pinky.extended) {
              this.selectMode(frame, this.controller.frame(1), hand);
            } else if (hand.pinchStrength < 0.1 && hand.grabStrength < 0.1) {
              this.detectPan(frame);
            }


          } else if (frame.hands.length === 2) {
            this.detectZoom(frame);
          }

        } else {

          if (frame.hands.length === 1) {
            let hand = frame.hands[0];

            this.isGrabbing = hand.pinchStrength > 0.9;

            if (hand.indexFinger.extended && !hand.middleFinger.extended && !hand.thumb.extended && !hand.ringFinger.extended && !hand.pinky.extended) {

              this.graphSelectMode(frame, this.controller.frame(1), hand);
            } else if (this.isGrabbing) {
              this.detectSlider(hand);
            } else if (hand.pinchStrength < 0.1 && hand.grabStrength < 0.1) {

              this.detectGraphPan(hand);
            } 


          } else if (frame.hands.length === 2) {
            this.detectGraphZoom(frame);
          }

        }   
      }
     
    });


    this.controller.connect();

  }

  detectGraphPan(hand){
    
    var normVector = Leap.vec3.normalize([0, 0, 0], hand.indexFinger.tipVelocity);
    var magScale = d3.scaleLinear().domain([1, 5]).clamp(true).range([3, 0.7]);
    var mag = magScale(this.props.graphZoom);
    var revisedCenter = [this.props.graphCenter[0] + normVector[0] * mag, this.props.graphCenter[1] + normVector[1] * mag];

    this.props.dispatch(changeGraphSetting(this.props.graphZoom, revisedCenter));

  }

  detectSlider(hand){

    var palmAngleToPositive = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], hand.palmVelocity), [1, 0, 0]));
    var palmAngleToNegative = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], hand.palmVelocity), [-1, 0, 0]));
  
    if (palmAngleToPositive < 20 || palmAngleToNegative < 20) {
      this.props.dispatch(changeCurrentTime(Math.round(this.sliderScale(hand.palmPosition[0]))));

    }
  }
  graphSelectMode(frame, lastFrame, hand){

    var scrPos = screenPosition(hand.palmPosition);
    this.props.dispatch(changeScreenPosition(scrPos));
    
    if (!lastFrame.valid) {
      return;
    }
    
    // if (this.props.clicked) {
    //   this.props.dispatch(changeClicked(false));
    // }

    for (var i = 0; i < frame.pointables.length; i++) {
      let pN = frame.pointables[i];
      let pN_prev = _.find(lastFrame.pointables, p => p.id === pN.id);
      if (!_.isUndefined(pN_prev)) {
        if (!pN_prev.valid) {
          continue;
        }

        // console.log("pN_prev.touchDistance:", pN_prev.touchDistance, "pN.touchDistance:", pN.touchDistance);
        if (pN_prev.touchDistance >= 0 && pN.touchDistance < 0) {
          this.props.dispatch(changeClicked(true)); 
        } else {
          this.props.dispatch(changeClicked(false));
        }
      }


    }
  }

  selectMode(frame, lastFrame, hand){
    var scrPos = screenPosition(hand.palmPosition);
    this.props.dispatch(changeScreenPosition(scrPos));
    
    if (!lastFrame.valid) {
      return;
    }
    

    for (var i = 0; i < frame.pointables.length; i++) {
      let pN = frame.pointables[i];
      let pN_prev = _.find(lastFrame.pointables, p => p.id === pN.id);
      if (!_.isUndefined(pN_prev)) {
        if (!pN_prev.valid) {
          continue;
        }

        // console.log("pN_prev.touchDistance:", pN_prev.touchDistance, "pN.touchDistance:", pN.touchDistance);
        if (pN_prev.touchDistance >= 0 && pN.touchDistance < 0) {
         
          this.props.dispatch(changeClicked(true));
          
        } else {
          this.props.dispatch(changeClicked(false));
        }
      }


    }
  }

  recordHands(hand){
    this.panHands.push(hand);
    if (this.panHands.length >= this.recordLimit) {
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
            return true;

          } else if (leftPalmAngle > 90 && leftSpeed > 100 && rightPalmAngle < 90 && rightSpeed > 100) {

            this.props.dispatch(changeMapOrGraph("Map"));
            return true;

          }

          return false;
      } catch (e) {
      }

    }
  }

  getAvgPos(hands) {
    
    var len = hands.length;
    var sumPos = [0, 0, 0];
    for (let i = 0; i < len; i++){
      sumPos[0] += hands[i].indexFinger.tipPosition[0];
      sumPos[1] += hands[i].indexFinger.tipPosition[1];
      sumPos[2] += hands[i].indexFinger.tipPosition[2];
    }
    return [sumPos[0] / len, sumPos[1] / len, sumPos[2] / len];

  }  

  detectPan(frame){
    var hand = frame.hands[0];
    var normVector = Leap.vec3.normalize([0, 0, 0], hand.indexFinger.tipVelocity);
    var mag = 3;
    
    window.map.panBy([normVector[0] * mag, -normVector[1] * mag], {
      animate: false
    });
  

  }

  detectGraphZoom(frame) {
    if (frame.hands.length > 1) {
      var leftHand = _.find(frame.hands, h => { return h.type === "left" });
      var rightHand = _.find(frame.hands, h => { return h.type === "right" });

      if (!_.isUndefined(leftHand) && !_.isUndefined(rightHand)) {

        try {
            
          var leftIndexFinger = leftHand.indexFinger;
          var rightIndexFinger = rightHand.indexFinger;
          if (leftIndexFinger.extended && rightIndexFinger.extended && !leftHand.middleFinger.extended && !leftHand.thumb.extended && !leftHand.ringFinger.extended && !leftHand.pinky.extended && !rightHand.middleFinger.extended && !rightHand.thumb.extended && !rightHand.ringFinger.extended && !rightHand.pinky.extended) {
            
            // console.log("leftVelocity:", leftIndexFinger.tipVelocity);
            var leftIndexFingerPositiveAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], leftIndexFinger.tipVelocity), [-1, -1, 0])); 
            var rightIndexFingerPositiveAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], rightIndexFinger.tipVelocity), [1, 1, 0]))

            var leftIndexFingerNegativeAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], leftIndexFinger.tipVelocity), [1, 1, 0]));
            var rightIndexFingerNegativeAngle = Math.degrees(angleBetween(Leap.vec3.normalize([0, 0, 0], rightIndexFinger.tipVelocity), [-1, -1, 0]))


            var { graphZoom, graphCenter } = this.props;
            var velocityAvg;

            if (leftIndexFingerPositiveAngle < 50 && rightIndexFingerPositiveAngle < 50) {
            
              velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;

              if (velocityAvg > 30) {
                var d2 = 4 / (60 * 4),
                    d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
                    d4 = d3,
                  delta = Math.max(1, Math.min(18, graphZoom + d4)) - graphZoom;
                
                // console.log(delta);
                this.props.dispatch(changeGraphSetting(graphZoom + delta, graphCenter));
              }

            
            } else if (leftIndexFingerNegativeAngle < 50 && rightIndexFingerNegativeAngle < 50) {
            

              velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;

              if (velocityAvg > 30) {
                var d2 = -4 / (60 * 4),
                  d3 = 4 * Math.log(2 / (1 + Math.exp(-Math.abs(d2)))) / Math.LN2,
                  d4 = d3,
                  delta = Math.max(1, Math.min(18, graphZoom - d4)) - graphZoom;

                // console.log(delta);
                this.props.dispatch(changeGraphSetting(graphZoom + delta, graphCenter));
              }

              // velocityAvg = (Leap.vec3.length(leftIndexFinger.tipVelocity) + Leap.vec3.length(rightIndexFinger.tipVelocity)) * 0.5;
              
              // this.props.dispatch(changeMapSetting(finalZoom, center, currentMode));
            }


          }
          
        } catch(e){
        }
        
      }
      
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
    center: state.center,
    graphZoom: state.graphZoom,
    graphCenter: state.graphCenter,
    clicked: state.clicked
  }
}

export default connect(mapStateToProps)(LeapManipulation);