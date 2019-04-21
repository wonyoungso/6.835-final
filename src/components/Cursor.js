import React, { Component } from 'react'
import styled from 'styled-components';

const CursorComp = styled.div`
  position:absolute;
  left: 0;
  top: 0;
  z-index: 5;
  width: 10px;
  height: 10px;
  background:white;
  border-radius: 10px;
  transform: ${props => props.clicked ? "scale(1.5)" : "scale(1)"};
`;

class Cursor extends Component {
  render() {

    let { cursorPosition, clicked } = this.props;
    // console.log(clicked);
    return (
      <CursorComp clicked={clicked} style={{ left: cursorPosition[0] + 15, top: cursorPosition[1] + 170}}>
      </CursorComp>
    )
  }
}

export default Cursor;