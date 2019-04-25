import React, { Component } from 'react'
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';
import moment from 'moment';
import { numberWithDelimiter } from '../utils';
import Typist from 'react-typist';

const SummaryContainer = styled.div`
  padding: 20px;
`;

const Summary = styled.div`
  
  .Typist {

    font-family: 'Styrene A';
    font-weight: 700;
    font-size: 4.0em;
    color:#555;
  }
`;

class BackFaceSummary extends Component {
  constructor(props){
    super(props);

    this.state = {
      idx: -1
    };
  }
  
  componentDidMount(){
    this.setState({
      idx: 0
    });
  }

  componentDidUpdate(prevProps){
    if (prevProps.flipMode === "front" && this.props.flipMode === "back") {
      this.setState({
        idx: 0
      });
    } else if (prevProps.flipMode === "back" && this.props.flipMode === "front") { 
      _.delay(() => {

        this.setState({
          idx: -1
        });
      }, 1000);

    }
  }
  handleDone(e){
    _.delay(() => {
      this.setState({
        idx: this.state.idx + 1
      })
    }, 3000);
  }
  render() {
    let { graphSelected } = this.props;
    let graphSelectedValues = _.values(graphSelected);
    
    let summaryElements = _.map(graphSelectedValues, (info, i) => {
      let firstRent = _.first(info.graph.houseValues);
      let lastRent = _.last(info.graph.houseValues);
      let maxRent = _.maxBy(info.graph.houseValues, v => v[1]);
      let minRent = _.minBy(info.graph.houseValues, v => v[1]);

      return (
        <Summary key={info.id}>
          <Typist avgTypingDelay={5} onTypingDone={this.handleDone.bind(this)}>
            {i + 1}.<br />
            The rent of <span style={{ color: info.color }}>{info.id}</span> was <span style={{ color: info.color }}>${numberWithDelimiter(firstRent[1])}</span> per month at {moment(firstRent[0]).format("YYYY MMMM")}. The lowest rent was <span style={{ color: info.color }}>${numberWithDelimiter(minRent[1])}</span> at {moment(minRent[0]).format("YYYY MMMM")} and the highest rent was <span style={{ color: info.color }}>${numberWithDelimiter(maxRent[1])}</span> at {moment(maxRent[0]).format("YYYY MMMM")}. Now, it's <span style={{ color: info.color }}>${numberWithDelimiter(lastRent[1])}.</span>
          </Typist>
        </Summary>
      )
    });
    return (
      <SummaryContainer>
        {
          graphSelectedValues.length > 0 ?
          summaryElements[this.state.idx % summaryElements.length] :
          <Summary>
            Please select country / states / counties / cities to show information in here.
          </Summary>
        }
      </SummaryContainer>
    )
  }
}

let mapStateToProps = state => {
  return {
    graphSelected: state.graphSelected,
    flipMode: state.flipMode

  }
}

export default connect(mapStateToProps)(BackFaceSummary);