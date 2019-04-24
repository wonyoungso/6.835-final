import _ from 'lodash';
import moment from 'moment';
import { MODES, CURRENT_TIMES } from '../constants/defaults';
import * as d3 from 'd3';
Math.radians = function (degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
Math.degrees = function (radians) {
  return radians * 180 / Math.PI;
};

export const constrain = (n, low, high) => {
  return Math.max(Math.min(n, high), low);
};

export const isWithIn = (p1, bp) => {
  
  var margin = 30;

  let leftTopBoundary = [bp[0] - (margin / 2), bp[1] - (margin / 2)];
  let rightBottomBoundary = [bp[0] + (margin / 2), bp[1] + (margin / 2)];

  console.log(p1, leftTopBoundary, rightBottomBoundary)
  return (p1[0] >= leftTopBoundary[0] && p1[0] <= rightBottomBoundary[0] && p1[1] >= leftTopBoundary[1] && p1[1] <= rightBottomBoundary[1]);
}

export const angleBetween = (v1, v2) => {

  if (v1[0] === 0 && v1[1] === 0 && v1[2] === 0) {
    return 0.0;
  }
  if (v2[0] === 0 && v2[1] === 0 && v2[2] === 0) {
    return 0.0;
  }

  var dot = v1[0] * v2[0] + v1[1] * v2[1] + v1[2] * v2[2];
  var v1mag = Math.sqrt(v1[0] * v1[0] + v1[1] * v1[1] + v1[2] * v1[2]);
  var v2mag = Math.sqrt(v2[0] * v2[0] + v2[1] * v2[1] + v2[2] * v2[2]);
  var amt = dot / (v1mag * v2mag);

  if (amt <= -1) {
    return Math.PI;
  } else if (amt >= 1) {
    return 0;
  }
  return Math.acos(amt);
}

export const screenPosition = (vec3, memoize) => {
  var baseScale, baseVerticalOffset, position, positioningMethods;
  var options = {};
  options.positioning || (options.positioning = 'absolute');
  options.scale || (options.scale = 1);
  options.scaleX || (options.scaleX = 1);
  options.scaleY || (options.scaleY = 1);
  options.scaleZ || (options.scaleZ = 1);
  options.verticalOffset || (options.verticalOffset = 0);
  baseScale = 6;
  baseVerticalOffset = -100;
  positioningMethods = {
    absolute: function (positionVec3) {
      return [(window.innerWidth / 2) + (positionVec3[0] * baseScale * options.scale * options.scaleX), window.innerHeight + baseVerticalOffset + options.verticalOffset - (positionVec3[1] * baseScale * options.scale * options.scaleY), positionVec3[2] * baseScale * options.scale * options.scaleZ];
    }
  };

  var screenPositionVec3;
  if (memoize == null) {
    memoize = false;
  }
  screenPositionVec3 = typeof options.positioning === 'function' ? options.positioning.call(this, vec3) : positioningMethods[options.positioning].call(this, vec3);
  if (memoize) {
    this.screenPositionVec3 = screenPositionVec3;
  }
  return screenPositionVec3;
}

export const numberWithDelimiter = (number, delimiter, separator) => {
  try {
    delimiter = delimiter || ",";
    separator = separator || ".";

    var parts = number.toString().split('.');
    parts[0] = parts[0].replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + delimiter);
    return parts.join(separator);
  } catch (e) {
    return number
  }
};

export const currentTimeToYearMonthTime = (currentTime) => {
  let yearMonthTime = moment(CURRENT_TIMES[currentTime]).format("YYYY-MM");
  return yearMonthTime;

}

export const convDatesToList = function(data) {
  data.houseValues = [];
  _.each(data, (v, k) => {
    if (!_.isNaN(+v) && k !== "GEOID") {
      data[k] = +v;

      if (k.split("-").length === 2) {
        let date = moment(k, "YYYY-MM");
        data.houseValues.push([date.toDate(), +v]);
      }

    }
  });
  return data;
}

export const wrap = (text, width) => {
  debugger;
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.1, // ems
        y = text.attr("y"),
        dy = parseFloat(text.attr("dy")),
        tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
}

export const convRentData = function (data) {
  _.each(data, (d, i)  => {
    data[i] = convDatesToList(data[i]);
  });

  return data;
}

export const getLabel = (d) => {

  switch(d.type) {
    case MODES[0].mode:
      return "United States";
    case MODES[1].mode:
      return d.id;// + " Division";
    case MODES[2].mode:
      return d.id;// + " State";
    case MODES[3].mode:
      return d.graph.RegionName + " County";
    case MODES[4].mode:
      return d.graph.fullName;
    default:
      return;
  }
}