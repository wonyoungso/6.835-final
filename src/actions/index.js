export const windowResize = (dimension) => {
  return {
    type: 'WINDOW_RESIZE',
    payload: {
      windowWidth: dimension.width,
      windowHeight: dimension.height
    }
  }
}

export const changeGraphSetting = (zoom, center) => {
  return {
    type: 'CHANGE_GRAPH_SETTING',
    payload: {
      graphZoom: zoom,
      graphCenter: center,
    }
  }
}

export const changeClicked = (clicked) => {
  return {
    type: "CHANGE_CLICKED",
    payload: {
      clicked: clicked
    }
  }
}

export const changeScreenPosition = (screenPosition) => {
  return {
    type: "CHANGE_SCREEN_POSITION",
    payload: {
      screenPosition: screenPosition
    }
  }
}
export const changeMapOrGraph = (mapOrGraph) => {
  return {
    type: "CHANGE_MAP_OR_GRAPH",
    payload: {
      mapOrGraph: mapOrGraph
    }
  }
}

export const updateData = (rentData, buyData) => {
  return {
    type: 'UPDATE_DATA',
    payload: {
      rentData: rentData,
      buyData: buyData,
      dataLoaded: true
    }
  }
}

export const changeMapSetting = (zoom, center, currentMode) => {
  return {
    type: 'CHANGE_MAP_SETTING',
    payload: {
      zoom: zoom,
      center: center,
      currentMode: currentMode
    }
  }
}

export const changeCurrentTime = (currentTime) => {
  return {
    type: 'CHANGE_CURRENT_TIME',
    payload: {
      currentTime: currentTime
    }
  }
}

export const addGraphSelected = (id, graphInfo) => {
  return {
    type: 'ADD_GRAPH',
    payload: {
      id: id,
      graphInfo: graphInfo
    }
  }
}

export const removeGraphSelected = (id) => {
  return {
    type: 'REMOVE_GRAPH',
    payload: {
      id: id
    }
  }
}

export const updateCurrentFocusMap = (currentFocusMap) => {
  return {
    type: 'UPDATE_CURRENT_FOCUS_MAP',
    payload: {
      currentFocusMap: currentFocusMap
    }
  };
}