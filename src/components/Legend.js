import React, { Component } from 'react'
import styled from 'styled-components';
import mixins from '../stylesheets/mixins';
import { numberWithDelimiter } from '../utils';
import _ from 'lodash';
const LegendContainer = styled.div`
  position: absolute;
  left: 20px;
  bottom: 0;
  padding: 10px;
  background-color: black;
  border: 1px solid #555;
  z-index: 20;
  h3 {
    ${mixins.MEDIUM_TYPE}
    font-size:0.7em;
    color:white;
    margin-bottom: 5px;
  }
`;

const LegendArea = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 3px;
  div.color-box {
    width: 10px;
    height: 10px;
    margin-right: 10px;
  }

  div.label {
    ${mixins.REGULAR_TYPE}
    color: #555;
    font-size:0.7em;
  }
`;
class Legend extends Component {
  render() {
    let { colorScale } = this.props;
    return (
      <LegendContainer>
        <h3>
          Legend
        </h3>
        {
          _.map(colorScale.domain(), (v, i) => {
            return (
              <LegendArea key={i}>
                <div className="color-box" style={{ backgroundColor: colorScale(v)}}>
                </div>
                {
                  i === colorScale.domain().length - 1 ? 
                  <div className="label">
                    ${numberWithDelimiter(v)}-
                  </div> :
                  <div className="label">
                    ${numberWithDelimiter(v)}-{numberWithDelimiter(colorScale.domain()[i + 1] - 1)}
                  </div> 
                }
                
              </LegendArea>
            )
          })
        } 
      </LegendContainer>
    )
  }
}

export default Legend;