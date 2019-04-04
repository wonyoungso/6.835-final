import { DEFAULT_STATE } from '../constants/defaults';
import _ from 'lodash';

export default function screenReducer(state = DEFAULT_STATE, action){
  switch(action.type) {
    case "WINDOW_RESIZE":
      return {
        ...state,
        windowWidth: action.payload.windowWidth,
        windowHeight: action.payload.windowHeight
      }
    case 'CHANGE_CURRENT_TIME':
      return {
        ...state,
        currentTime: action.payload.currentTime
      }
    case 'UPDATE_DATA': 
      return {
        ...state,
        rentData: action.payload.rentData,
        buyData: action.payload.buyData,
        dataLoaded: true
      }
    case 'CHANGE_MAP_LOADED':
      return {
        ...state,
        mapLoaded: action.payload.mapLoaded
      }
    case 'CHANGE_MAP_SETTING':
      return {
        ...state,
        zoom: action.payload.zoom,
        center: action.payload.center,
        currentMode: action.payload.currentMode
      }
    case 'UPDATE_CURRENT_FOCUS_MAP':
      return {
        ...state,
        currentFocusMap: action.payload.currentFocusMap
      }
    case 'ADD_GRAPH':
      return {
        ...state,
        graphSelected: {
          ...state.graphSelected,
          [action.payload.id]: action.payload.graphInfo
        }
      }
    case 'REMOVE_GRAPH':
      let removeGraphSelected = {...state.graphSelected};

      delete removeGraphSelected[action.payload.id]
      return {
        ...state,
        graphSelected: removeGraphSelected
      }
    default:
      return state;
  }
};


