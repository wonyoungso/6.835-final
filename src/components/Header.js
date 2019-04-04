import React, { Component } from 'react'
import { connect } from 'react-redux';
import styled from 'styled-components';
import { DivisionText } from './';
import mixins from '../stylesheets/mixins';
import { MODES, HEADER_HEIGHT } from '../constants/defaults';
import _ from 'lodash';

const HeaderContainer = styled.header`
  position: relative;
  height: ${HEADER_HEIGHT}px;
`;

const DivisionArea = styled.div`
  position:absolute;
  left: 236px;
  top: 30px;
  z-index: 1;
  background-color:black;
  padding-right: 15px;
`;

const Mover = styled.div`
  position: absolute;
  left: 20px;
  top: 15px;
  width: calc(100% - 40px);
  display:flex;
  justify-content:space-between;
  transition: top 0.4s;
`;
const Line = styled.hr`
  border: none;
  border-bottom: 1px solid #333;
  min-width: calc(100% - 450px);
  height: 20px;

`;

const CreditArea = styled.div`
  ${mixins.REGULAR_TYPE}
  font-size:0.8em;
  width: 180px;
  margin-top:12px;
  h4 {
    color:white;
  }
`;

const TitleArea = styled.div`
  width: auto;
  p {
    ${mixins.REGULAR_TYPE}
    color: #555;
    font-size:0.8em;
  }
  h1 {

    ${mixins.BOLD_TYPE}
    color:white;
    font-size: 1.2em;
  }
`;

class Header extends Component {
  render() {
    let { currentMode } = this.props;
    let currentIdx = _.findIndex(_.values(MODES), m => m.mode === currentMode);

    return (
      <HeaderContainer>
        <DivisionArea>
          { 
            _.map(MODES, m => {
              return (
                <DivisionText key={m.id} {...m}>{m.label}</DivisionText>
              )
            })
          }
        </DivisionArea>
        <Mover style={{ top: 15 + currentIdx * 23 }}>
          <TitleArea>
            <p>
              What has been happening in
            </p>
            <h1>
               The rent of the U.S.
            </h1>
          </TitleArea>
          <Line />
          <CreditArea>
            <h4>Wonyoung So</h4>
            wso@mit.edu—6.894 · A3
          </CreditArea>
        </Mover>
      </HeaderContainer>
    )
  }
}

let mapStateToProps = state => {
  return {
    currentMode: state.currentMode
  }
}
export default connect(mapStateToProps)(Header);
