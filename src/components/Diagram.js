import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import MarkerDef from './svg/MarkerDef';
import Actor from './svg/Actor';
import Message from './svg/Message';
import CandidateMessage from './svg/CandidateMessage';
import Point from './svg/Point';

import {stepActor, backActor} from '../actions/vm';
import {moveToFront, scrollTo} from '../actions/diagram';

import store from '../store';

const CONFIG = {
    margin: 40,
    timeSpan: 50
}

function sortElement(index, elements){
  if(index !== -1) {
    var top = elements.splice(index, 1)[0];
    elements.push(top);
  }
  return elements;
}

// Hell, there are bullshit paramerters
// I must fix it <- did it.

class Diagram extends Component {
    render() {
        var {actors, messageLog, messageQueue, frontIndex, scrollTo, width, height} = this.props;
        var {moveToFront} = this.props;
        var {margin} = CONFIG;
        var timeSpan = width / 8;
        return (<div id="canvas" style={{height, width}} onScroll={() => scrollTo(ReactDOM.findDOMNode(this).scrollTop)}>
            <svg width="100%" height={(messageLog.length + 1) * timeSpan + margin + 10}>
              {
                actors.map((actor, i) => 
                  <Actor x={width / actors.length * actor.pid}
                         textY={18}
                         lineStartY={actor._up * timeSpan + margin}
                         lineEndY={actor._down ? actor._down * timeSpan + margin
                                               : (messageLog.length + 1) * timeSpan + margin}
                         text={actor.constructor.name + "\n#" + actor.pid} 
                         key={i} />
                )
              }{
                /* this is a little bloated so should be separated from Diagram */
                sortElement(frontIndex, messageLog
                .concat(messageQueue.map((m, i) => 
                  Object.assign({}, m, {candidate: true, originalIndex: i }))
                )
                .map((msg, index) => { 
                  var xSpan = width / actors.length;
                  var props = {
                    fromX : xSpan * msg.from,
                    fromY : msg.timestamp * timeSpan + margin,
                    toX : xSpan * msg.to,
                    toY : msg.candidate ? (messageLog.length + 1) * timeSpan + margin
                                          : (index + 1) * timeSpan + margin,
                    className : msg.candidate ? 'candidate' : 'log',
                    onMouseOver: () => { moveToFront(index) }
                  };
                  if(msg.candidate)
                    return <CandidateMessage {...props} id={msg.uid} index={msg.originalIndex} key={msg.uid} text={JSON.stringify(msg.data)} />;
                  else
                    return <Message {...props} id={msg.uid} key={msg.uid} text={JSON.stringify(msg.data)} />;
                }))
              }{
                messageLog.map((msg, index) =>  
                  <Point cx={width / actors.length * msg.to}
                         cy={(index + 1) * timeSpan + margin} 
                         backCount={messageLog.length - index - 1}
                         actorPid={msg.to} key={index} />
                )
              }
              <defs>
                <MarkerDef color="#000" id="arrowhead-normal" />
                <MarkerDef color="#F00" id="arrowhead-hover" />
                <MarkerDef color="#777" id="arrowhead-candidate" />
              </defs>
            </svg>
       </div>);
    }
    componentDidUpdate() {
      var node = ReactDOM.findDOMNode(this);
      node.scrollTop = this.props.scrollValue;
    }
}

function mapStateToProps(state) {
    return {
        actors: state.vm.actors,
        messageLog: state.vm.messageLog,
        messageQueue: state.vm.messageQueue,
        frontIndex: state.diagram.frontElementIndex,
        scrollValue: state.diagram.scrollValue,
        width: state.panels['root-panel'] || 400,
        height: state.panels['vis-panel'] || 500
    };
}

function mapDispatchToProps(dispatch) {
  return {
    moveToFront: id => dispatch(moveToFront(id)),
    scrollTo: value => dispatch(scrollTo(value))
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Diagram);