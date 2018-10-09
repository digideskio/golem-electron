import React from 'react';
import {Tooltip} from 'react-tippy';
import { TransitionMotion, spring, presets } from 'react-motion'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import * as Actions from '../../../actions'

import SingleFrame from './Single'
import { timeStampToHR } from './../../../utils/secsToHMS'
import {taskStatus as statusDict} from './../../../constants/statusDicts'

const routesDict = Object.freeze({
    COMPLETE: 'complete',
    ALL: 'all',
    SINGLE: 'single'
})

const statusClassDict = Object.freeze({
    'notStarted': 'frame--undone',
    'computing': 'frame--progress',
    'finished': 'frame--done',
    'aborted': 'frame--error',
    'sending': 'frame--progress',
    'waiting': 'frame--progress',
    'timeout': 'frame--error',
    'restarted': 'frame--undone'
})

/*################### HELPER FUNCTIONS #################*/

function sortById(a, b) {
    return a.data.id - b.data.id
}


const mapStateToProps = state => ({
    details: state.details.detail,
    frameList: state.all.frameList
})

const mapDispatchToProps = dispatch => ({
    actions: bindActionCreators(Actions, dispatch)
})

export class All extends React.Component {

    constructor(props) {
        super(props);
    }

    /**
     * [_handleClick func. will redirect related single frame]
     * @param       {[type]} item          [clicked item]
     * @param       {[type]} index         [index of clicked item]
     * @return nothing
     */
    _handleClick(item, index) {
        const {setFrameId, setFrameIndex} = this.props.actions
        if (item.status !== statusDict.NOTREADY && this.props.details.status !== statusDict.WAITING) {
            setFrameId(item.id)
            setFrameIndex(index)
            window.routerHistory.push(`/preview/${routesDict.SINGLE}/`)
        }
    }

    _handleResubmit(_, frameID) {
        this.props.actions.restartFrame(frameID)
    }

    /**
     * [getDefaultStyles func. actual animation-related logic]
     * @return  {Array}    [default style list of the animated item]
     */
    getDefaultStyles() {
        const {frameList} = this.props
        return frameList.map((item, index) => {
            return {
                key: item[0].toString(),
                data: {
                    id: item[0],
                    status: item[1][0],
                    created: item[1][1]
                },
                style: {
                    width: 0,
                    opacity: 1
                }
            }
        })
            .sort(sortById);
    }

    /**
     * [getStyles func. updated style list]
     * @return {Array} [style list of the animated item]
     */
    getStyles() {
        const {show, frameList} = this.props;
        return frameList.filter((item, index) => {
            return show == routesDict.COMPLETE ? item[1][0] === statusDict.FINISHED : true
        })
            .map((item, i) => {
                return {
                    key: item[0].toString(),
                    data: {
                        id: item[0],
                        status: item[1][0],
                        created: item[1][1]
                    },
                    style: {
                        width: spring(71.6, {
                            stiffness: 300,
                            damping: 32
                        }),
                        opacity: spring(1, {
                            stiffness: 300,
                            damping: 32
                        }),
                    }
                };
            })
            .sort(sortById);
    }

    /**
     * [willEnter func. DOM elements enter animation]
     * @return {Object} [Style object]
     */
    willEnter() {
        return {
            width: 0,
            opacity: 1,
        };
    }

    /**
     * [willLeave DOM elements leave animation]
     * @return {Object} [Style object]
     */
    willLeave() {
        return {
            width: spring(0, {
                stiffness: 300,
                damping: 32
            }),
            opacity: spring(0, {
                stiffness: 300,
                damping: 32
            }),
        };
    }

    _getIndexById(_id){
        const {frameList} = this.props;
        return frameList.findIndex(obj => obj[0] === _id)
    }
    // show == 'complete' && 
    render() {
        const {show, details} = this.props
        return (
            <div>
                <TransitionMotion
            defaultStyles={::this.getDefaultStyles()}
            styles={::this.getStyles()}
            willLeave={::this.willLeave}
            willEnter={::this.willEnter}>
            {styles => <div className="container__all-frame">
                    {styles.map(({key, data, style}, index) => <div className="item__all-frame" key={index.toString()} style={style}>
                <Tooltip
                      html={<div className="content__tooltip">
                            {data.status === statusDict.FINISHED && <p className="status__tooltip">Completed</p>}
                            <p className={`time__tooltip ${data.status === statusDict.FINISHED && 'time__tooltip--done'}`}>{data.created ? timeStampToHR(data.created) : 'Not started'}</p>
                            <button 
                                className="btn btn--primary" 
                                onClick={this._handleResubmit.bind(this, data, data.id)} 
                                disabled={
                                    (data.status === statusDict.NOTREADY
                                    ||
                                    data.status === statusDict.RESTART
                                    ||
                                    details.status === statusDict.RESTART)
                                }>Resubmit</button>
                        </div>}
                      position="bottom"
                      trigger="mouseenter"
                      interactive={true}
                      arrow={true}
                      width="500"
                      size="regular">
                    <div className={`${statusClassDict[data.status]}`} onClick={this._handleClick.bind(this, data, this._getIndexById(data.id))} onKeyDown={(event) => {
                        event.keyCode === 13 && (this._handleClick.call(this, data, index))
                    }} role="button" tabIndex="0" aria-label="Preview of Frame"></div>
                </Tooltip>
            </div>
                )}
                </div>
            }
          </TransitionMotion>
            </div>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(All)
