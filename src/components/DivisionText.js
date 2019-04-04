import React, { Component } from 'react'
import styled from 'styled-components';
import { connect } from 'react-redux';
import mixins from '../stylesheets/mixins';

const TextArea = styled.div`
  ${mixins.BOLD_TYPE}
  color:#555;
  font-size:1.2em;
  transition: all 0.4s;
`;

class DivisionText extends Component {
  render() {
    let { mode, currentMode } = this.props;

    let selected = mode === currentMode;
    return (
      <TextArea style={{ color: `${selected ? "white" : "#555"}`}}>
        {this.props.children}{selected ? "?" : ""}
      </TextArea>
    )
  }
}

let mapStateToProps = state => {
  return {
    currentMode: state.currentMode
  }
}

export default connect(mapStateToProps)(DivisionText);
