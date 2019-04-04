import React, { Component } from 'react';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import mapboxgl from 'mapbox-gl';
import { changeMapSetting, addGraphSelected, removeGraphSelected, updateCurrentFocusMap } from '../actions';
import rentUS from '../constants/rent_us.json';
import rentDivisions from '../constants/rent_division.json';
import rentStates from '../constants/rent_states.json';
import rentCounties from '../constants/rent_counties.json';
import moment from 'moment';
import { convDatesToList, convRentData, currentTimeToYearMonthTime } from '../utils';
import * as d3 from 'd3';
import { HEADER_HEIGHT, GRAPH_HEIGHT, SLIDER_HEIGHT, MODES } from '../constants/defaults';
import { Legend } from './';
import * as turf from '@turf/turf';

const MapDiv = styled.div`
`;

const MapContainerDiv = styled.div`
  padding: 0 20px;
  position: relative;
`;

const Fragment = React.Fragment;

const MAPBOX_TOKEN = 'pk.eyJ1Ijoic2Vuc2VhYmxlIiwiYSI6ImxSNC1wc28ifQ.hst-boAjFCngpjzrbXrShw';

class MapContainer extends Component {

  constructor(props){
    super(props);
    mapboxgl.accessToken = MAPBOX_TOKEN;
    
    this.colorScale = d3.scaleLinear().domain([800, 900, 1000, 1100, 1200, 1300, 1400, 1500, 1600]).clamp(true).range([
      '#F2F12D',
      '#EED322',
      '#E6B71E',
      '#DA9C20',
      '#CA8323',
      '#B86B25',
      '#A25626',
      '#8B4225',
      '#723122'])

    this.zoomScale = d3.scaleLinear().domain([6.25, 18]).clamp(true).range([2.5, 30])

    this.graphColorScale = d3.scaleOrdinal().domain([0, 20]).range(d3.schemeSet2);
    this.handleMouseMove = this.handleMouseMove.bind(this);
    // this.hoverId = 
    this.hoverPopup = new mapboxgl.Popup({
      closeButton: false,
      closeOnClick: false
    });

  }

  componentDidMount() {

    this.map = new mapboxgl.Map({
      container: this.refsMapContainer,
      style: 'mapbox://styles/senseable/cjtaes7qg14i91fpjk069dqfv',
      zoom: 2.8,
      minZoom: 2.8,
      maxZoom: 15.5,
      doubleClickZoom: false,
      center: [-95.3091743624725, 40.89824648650918]
      // interactive: false
    });
    window.map = this.map;

    this.map.on('style.load', this.handleStyleLoad.bind(this));
  }
  handleMouseMove(e){
    var features = this.map.queryRenderedFeatures(e.point, { layers: [this.props.currentMode.replace(/_/g, "-")] });

    if (features.length) {

      let realFeature = _.filter(features, f => { return f.sourceLayer === this.props.currentMode });


      if (realFeature.length > 0) {
        realFeature = realFeature[0];
        let label;
        if (this.props.currentMode === MODES[0].mode) {

          let id = realFeature.properties.NAME;
          label = id;
          this.map.setFilter("nation-geo-9an1r8__hover", ["==", "NAME", id]);

        } else if (this.props.currentMode === MODES[1].mode){
          
          let id = realFeature.properties.NAME;
          label = id;
          this.map.setFilter("division-geo-a4uhem__hover", ["==", "NAME", id]);
          
        } else if (this.props.currentMode === MODES[2].mode) {
          
          let id = realFeature.properties.NAME;
          label = id;
          this.map.setFilter("state-geo-c0eo4i__hover", ["==", "NAME", id]);
          
        } else if (this.props.currentMode === MODES[3].mode) {
          
          let id = realFeature.properties.GEOID;
          label = `${realFeature.properties.NAME} County`;
          this.map.setFilter("county-geo-cn1mtx__hover", ["==", "GEOID", id]);   
          
        } else if (this.props.currentMode === "cities_geo_final_02-0oxkdo") {
          
          let id = realFeature.properties.RegionID;
          label = `${realFeature.properties.name}, ${realFeature.properties.state}`;
          this.map.setFilter("cities-geo-final-02-0oxkdo__hover", ["==", "RegionID", id]);   
        }
        this.hoverPopup.setLngLat(e.lngLat)
          .setHTML(label)
          .addTo(this.map);
      }
    } else {
      
      this.map.setFilter("nation-geo-9an1r8__hover", ["==", "NAME", ""]);
      this.map.setFilter("division-geo-a4uhem__hover", ["==", "NAME", ""]);
      this.map.setFilter("state-geo-c0eo4i__hover", ["==", "NAME", ""]);
      this.map.setFilter("county-geo-cn1mtx__hover", ["==", "GEOID", ""]);
      this.map.setFilter("cities-geo-final-02-0oxkdo__hover", ["==", "RegionID", ""]);
      this.hoverPopup.remove();

    }

    this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';
  }


  handleViewClick(e) {
    var features = this.map.queryRenderedFeatures(e.point, { layers: ["nation-geo-9an1r8", "division-geo-a4uhem", "state-geo-c0eo4i", "county-geo-cn1mtx", "cities-geo-final-02-0oxkdo"] });

    if (features.length) {

      let realFeature = _.filter(features, f => { return f.sourceLayer === this.props.currentMode });

      if (realFeature.length > 0) {
        realFeature = realFeature[0];
        let { graphSelected } = this.props;
        let lastIdx = _.values(graphSelected).length;
        let id;
        let graphInfo;
        if (this.props.currentMode === "county_geo-cn1mtx") {
          try {
           
            let graphData = this.getData({
              id: realFeature.properties.GEOID, 
              type: this.props.currentMode
            });
            if (!_.isUndefined(graphData)) {
              // debugger;
              id = realFeature.properties.GEOID;
              graphInfo = { id: realFeature.properties.GEOID, center: turf.center(realFeature.geometry), color: this.graphColorScale(lastIdx), graph: graphData,
              type: this.props.currentMode};
            }
          } catch(e){
            console.log(e);
          }
          


        } else if (this.props.currentMode === "cities_geo_final_02-0oxkdo") {
          id = realFeature.properties.RegionID;
          
          graphInfo = {
            id: realFeature.properties.RegionID, center: turf.center(realFeature.geometry), color: this.graphColorScale(lastIdx), graph: convDatesToList(realFeature.properties),
          type: this.props.currentMode};
          

          
        } else {
          try {
            id = realFeature.properties.NAME;
            graphInfo = {
              id: realFeature.properties.NAME, center: turf.center(realFeature.geometry), color: this.graphColorScale(lastIdx), graph: this.getData({
              id: realFeature.properties.NAME, 
              type: this.props.currentMode
              }),
            type: this.props.currentMode };

          } catch (e) {
            console.log(e);

          }

        }

        if (!_.isUndefined(graphInfo)) {
          this.props.dispatch(addGraphSelected(id, graphInfo));
        }
        
      }
      
    }

    this.map.getCanvas().style.cursor = features.length ? 'pointer' : '';

  }

  handleZoom(e){

    let zoom = this.map.getZoom();
    let center = this.map.getCenter();
    let currentMode;
    this.hoverPopup.remove();
    if (zoom < 3.5) {
      currentMode = "nation_geo-9an1r8";
    } else if (zoom >= 3.5 && zoom < 4.2) {
      currentMode = "division_geo-a4uhem";
    } else if (zoom >= 4.2 && zoom < 4.8) {
      currentMode = "state_geo-c0eo4i";
    } else if (zoom >= 4.8 && zoom < 6.2) {
      currentMode = "county_geo-cn1mtx";
    } else {
      currentMode = "cities_geo_final_02-0oxkdo";
    }
    
    this.map.setPaintProperty("cities-geo-final-02-0oxkdo", 'circle-radius', this.zoomScale(zoom));
    this.map.setPaintProperty("cities-geo-final-02-0oxkdo__clicked", 'circle-radius', this.zoomScale(zoom) + 3);

    this.props.dispatch(changeMapSetting(zoom, center, currentMode));
  }

  handleStyleLoad(e) {
    
    this.map.setLayerZoomRange("nation-geo-9an1r8", 2.8, 3.5);
    this.map.setLayerZoomRange("division-geo-a4uhem", 3.5, 4.2);
    this.map.setLayerZoomRange("state-geo-c0eo4i", 4.2, 4.8);
    this.map.setLayerZoomRange("county-geo-cn1mtx", 4.8, 6.2);
    this.map.setLayerZoomRange("cities-geo-final-02-0oxkdo", 6.2, 15.5);

    this.map.addLayer({
      id: "nation-geo-9an1r8__hover",
      maxzoom: 3.5,
      minzoom: 2.8,
      source: "composite",
      "source-layer": "nation_geo-9an1r8",
      type: "line",
      "filter": ["==", "NAME", ""],
      "paint": {
        'line-color': "#FFFFFF",
        'line-opacity': 0.8,
        'line-width': 1
      }
    });

    this.map.addLayer({
      id: "nation-geo-9an1r8__clicked",
      maxzoom: 3.5,
      minzoom: 2.8,
      source: "composite",
      "source-layer": "nation_geo-9an1r8",
      type: "line",
      "paint": {
        'line-opacity': 1,
        'line-width': 2,
        'line-color': "rgba(0, 0, 0, 0)"
      }
    });




    this.map.addLayer({
      id: "division-geo-a4uhem__hover",
      maxzoom: 4.2,
      minzoom: 3.5,
      source: "composite",
      "source-layer": "division_geo-a4uhem",
      type: "line",
      "filter": ["==", "NAME", ""],
      "paint": {
        'line-color': "#FFFFFF",
        'line-opacity': 0.8,
        'line-width': 1
      }
    })


    this.map.addLayer({
      id: "division-geo-a4uhem__clicked",
      maxzoom: 4.2,
      minzoom: 3.5,
      source: "composite",
      "source-layer": "division_geo-a4uhem",
      type: "line",
      "paint": {
        'line-opacity': 0,
        'line-width': 2,
        'line-color': "rgba(0, 0, 0, 0)"
      }
    },)

    this.map.addLayer({
      id: "state-geo-c0eo4i__hover",
      maxzoom: 4.8,
      minzoom: 4.2,
      source: "composite",
      "source-layer": "state_geo-c0eo4i",
      type: "line",
      "filter": ["==", "NAME", ""],
      "paint": {
        'line-color': "#FFFFFF",
        'line-opacity': 1,
        'line-width': 1
      }
    })


    this.map.addLayer({
      id: "state-geo-c0eo4i__clicked",
      maxzoom: 4.8,
      minzoom: 4.2,
      source: "composite",
      "source-layer": "state_geo-c0eo4i",
      type: "line",
      "paint": {
        'line-opacity': 1,
        'line-width': 2,
        'line-color': "rgba(0, 0, 0, 0)"
      }
    })

    this.map.addLayer({
      "filter": ["==", "GEOID", ""],
      id: "county-geo-cn1mtx__hover",
      maxzoom: 6.2,
      minzoom: 4.8,
      source: "composite",
      "source-layer": "county_geo-cn1mtx",
      type: "line",
      "paint": {
        'line-color': "#FFFFFF",
        'line-opacity': 1,
        'line-width': 1
      }
    })

    this.map.addLayer({
      id: "county-geo-cn1mtx__clicked",
      maxzoom: 6.2,
      minzoom: 4.8,
      source: "composite",
      "source-layer": "county_geo-cn1mtx",
      type: "line",
      "paint": {
        'line-opacity': 1,
        'line-width': 2,
        'line-color': "rgba(0, 0, 0, 0)"
      }
    })

    this.map.addLayer({
      id: "cities-geo-final-02-0oxkdo__hover",
      maxzoom: 15.5,
      minzoom: 6.2,
      source: "composite",
      "source-layer": "cities_geo_final_02-0oxkdo",
      type: "circle",
      "filter": ["==", "RegionID", ""],
      "paint": {
        'circle-color': "#FFFFFF",
        'circle-radius': 5
      }
    });

    this.map.addLayer({
      id: "cities-geo-final-02-0oxkdo__clicked",
      maxzoom: 15.5,
      minzoom: 6.2,
      source: "composite",
      "source-layer": "cities_geo_final_02-0oxkdo",
      type: "circle",
      "paint": {
        'circle-color': "rgba(0, 0, 0, 0)",
        'circle-radius': 5
      }
    })

    this.map.setLayoutProperty("nation-geo-9an1r8", "visibility", "visible");
    this.map.setLayoutProperty("division-geo-a4uhem", "visibility", "visible");

    let { currentTime } = this.props;

    this.usMapSetting(currentTime);
    this.divisionMapSetting(currentTime);
    this.stateMapSetting(currentTime);
    this.countyMapSetting(currentTime);
    this.cityMapSetting(currentTime);

    this.map.on('zoom', this.handleZoom.bind(this));
    this.map.on('click', this.handleViewClick.bind(this));
    this.map.on('mousemove', this.handleMouseMove);
    this.map.on('moveend', this.handleMoveEnd.bind(this));
  }

  handleMoveEnd(e) {
    console.log(e);
    if (e.command === "popupFromGraph") {
      this.hoverPopup.setHTML(e.popupName).setLngLat(e.center).addTo(this.map);
      this.props.dispatch(updateCurrentFocusMap(null));//this.props.currentFocusMap)

    }
  }

  getData(gInfo){
    let info;
    switch (gInfo.type) {
      case "nation_geo-9an1r8":
        info = rentUS;
        break;
      case "division_geo-a4uhem":
        info = _.find(rentDivisions, r => { return r.DivisionName === gInfo.id });
        break;
      case "state_geo-c0eo4i":
        info = _.find(rentStates, r => { return r.StateName === gInfo.id });
        break;
      case "county_geo-cn1mtx":
        info = _.find(rentCounties, r => { return r.GEOID === gInfo.id });
        break;
      default:
        break;
    }
    return info;
  }



  usMapSetting(currentTime) {
    // let rentData = convDatesToList(rentUS);
    // console.log(rentUS.houseValues);
    this.map.setPaintProperty("nation-geo-9an1r8", "fill-color", this.colorScale(rentUS.houseValues[currentTime][1]));
    this.map.setPaintProperty("nation-geo-9an1r8", "fill-opacity", ["case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0.5
    ]);  
  }

  divisionMapSetting(currentTime) {

    // let rentDivisions = convRentData(rentDivision);
    //   debugger;
  
    var expression = ["match", ["get", "NAME"]];

    _.each(rentDivisions, division => {
      expression.push(division.DivisionName, this.colorScale(division.houseValues[currentTime][1])); 

    });
    expression.push("rgba(0, 0, 0, 0.5)");

    this.map.setPaintProperty("division-geo-a4uhem", "fill-color", expression);
    this.map.setPaintProperty("division-geo-a4uhem", "fill-opacity", ["case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0.5
    ]);  
    
  }

  stateMapSetting(currentTime){

    // let rentStates = convRentData(rentStatesRaw);
    // debugger;
    var expression = ["match", ["get", "NAME"]];

    _.each(rentStates, state => {
      expression.push(state.StateName, this.colorScale(state.houseValues[currentTime][1]));
    });

    expression.push("rgba(0, 0, 0, 0.5)");

    this.map.setPaintProperty("state-geo-c0eo4i", "fill-color", expression);
    this.map.setPaintProperty("state-geo-c0eo4i", "fill-opacity", ["case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0.5
    ]);  

    // county-geo-cn1mtx
  }

  cityMapSetting(currentTime){
    var expression = [
      'interpolate',
      ['linear'],
      ['get', currentTimeToYearMonthTime(currentTime)]
    ];

    _.map(this.colorScale.domain(), (v, i) => {
      expression.push(v, this.colorScale(v))
    });

    // console.log(expression);
    this.map.setPaintProperty("cities-geo-final-02-0oxkdo", "circle-color", expression);
    this.map.setPaintProperty("cities-geo-final-02-0oxkdo", "circle-opacity", 0.7);


  }

  countyMapSetting(currentTime) {

    // let rentCounties = convRentData(rentCountiesRaw);
    // debugger;
    var expression = ["match", ["get", "GEOID"]];

    _.each(rentCounties, county => {
      expression.push(String(county.GEOID), this.colorScale(county.houseValues[currentTime][1]));
    });
    expression.push("rgba(0, 0, 0, 0.5)");

    // console.log(expression);
    this.map.setPaintProperty("county-geo-cn1mtx", "fill-color", expression);
    this.map.setPaintProperty("county-geo-cn1mtx", "fill-opacity", ["case",
      ["boolean", ["feature-state", "hover"], false],
      1,
      0.5
    ]);
  }



  componentDidUpdate(prevProps) {
    this.map.resize();


    if (prevProps.currentTime !== this.props.currentTime) {
      // debugger;
      let { currentTime, currentMode } = this.props;

      if (currentMode === MODES[0].mode) {
        this.usMapSetting(currentTime);
      } else if (currentMode === MODES[1].mode) {
        this.divisionMapSetting(currentTime);
      } else if (currentMode === MODES[2].mode) {
        this.stateMapSetting(currentTime);
      } else if (currentMode === MODES[3].mode) {
        this.countyMapSetting(currentTime); 
      } else {
        this.cityMapSetting(currentTime);
      }

    } else if (_.values(this.props.graphSelected).length !== _.values(prevProps.graphSelected).length) {

      this.map.setPaintProperty("nation-geo-9an1r8__clicked", "line-color", null);
      this.map.setPaintProperty("division-geo-a4uhem__clicked", "line-color", null);
      
      var expressions = {};

      _.each(_.values(this.props.graphSelected), g => {
        let nameValue = "";
        let matchValue = "NAME";

        if (g.type === MODES[0].mode) {
          nameValue = "RegionName";
        } else if (g.type === MODES[1].mode) {
          nameValue = "DivisionName";
        } else if (g.type === MODES[2].mode) {
          nameValue = "StateName";
        } else if (g.type === MODES[3].mode) {
          nameValue = "GEOID";
          matchValue = "GEOID"
        } else {
          nameValue = "RegionID";
          matchValue = "RegionID";
        }

        if (_.isUndefined(expressions[g.type])) {
          expressions[g.type] = ["match", ["get", matchValue]];
        }

        
        // debugger;
        expressions[g.type].push(g.graph[nameValue], g.color);
      });

      _.each(expressions, (v, k) => {
        expressions[k].push("rgba(0, 0, 0, 0.0)");
        if (k.indexOf('cities') > -1) {

          this.map.setPaintProperty(`${k.replace(/_/g, "-")}__clicked`, "circle-color", v);
          this.map.setPaintProperty(`${k.replace(/_/g, "-")}__clicked`, "circle-opacity", 1);
          
        } else {

          this.map.setPaintProperty(`${k.replace(/_/g, "-")}__clicked`, "line-color", v);
          this.map.setPaintProperty(`${k.replace(/_/g, "-")}__clicked`, "line-opacity", 1);
        }
      });


    } else if (!_.isNull(this.props.currentFocusMap)) {
      
      var g = this.props.graphSelected[this.props.currentFocusMap];
      // debugger;
      let center = g.id === "United States" ? [-95.3091743624725, 40.89824648650918] : g.center.geometry.coordinates;
    
      var popupName;
      if (g.type === MODES[3].mode) {
        popupName = g.graph.RegionName + " County";
      } else if (g.type === MODES[4].mode) {
        popupName = g.graph.fullName;
      } else {
        popupName = g.id;
      }
      console.log(g.type);
      
      this.map.easeTo({
        center: center,
        zoom: _.find(MODES, m => { return m.mode === g.type }).zoom
      }, { command: 'popupFromGraph', popupName: popupName, center: center });
    }

  }



  render() {
    let { windowWidth, windowHeight } = this.props;
    return (
      <MapContainerDiv>


        <MapDiv ref={c => { this.refsMapContainer = c; }} className="map-container" style={{ width: windowWidth * 0.6 - 40, height: windowHeight - HEADER_HEIGHT - 20 }}>
        </MapDiv>

        <Legend colorScale={this.colorScale}/>
      </MapContainerDiv>
    );
  }
}

let mapStateToProps = state => {
  // console.log(state.graphSelected);
  return {
    graphSelected: state.graphSelected,
    windowWidth: state.windowWidth,
    windowHeight: state.windowHeight,
    data: state.data,
    currentTime: state.currentTime,
    zoom: state.zoom,
    center: state.center,
    currentMode: state.currentMode,
    currentFocusMap: state.currentFocusMap
  }
}

export default connect(mapStateToProps)(MapContainer);