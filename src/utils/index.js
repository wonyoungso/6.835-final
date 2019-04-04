import _ from 'lodash';
import moment from 'moment';
import { MODES, CURRENT_TIMES } from '../constants/defaults';
import * as d3 from 'd3';

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