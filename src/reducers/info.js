import { dict } from './../actions'

const {SET_NETWORK_INFO, SET_FILE_CHECK, SET_CONNECTION_PROBLEM, SET_GOLEM_ENGINE_STATUS} = dict

const initialState = {
    networkInfo: {},
    fileCheckModal: {
        status: false,
        files: []
    },
    connectionProblem: false,
    isEngineOn: true
}
const setInfo = (state = initialState, action) => {
    switch (action.type) {
    case SET_NETWORK_INFO:
        return Object.assign({}, state, {
            networkInfo: action.payload
        });

    case SET_FILE_CHECK:
        const {status, files} = action.payload
        return Object.assign({}, state, {
            fileCheckModal: {
                status,
                files: files || []
            }
        });

    case SET_CONNECTION_PROBLEM:
        return Object.assign({}, state, {
            connectionProblem: action.payload
        });

    case SET_GOLEM_ENGINE_STATUS:
        return Object.assign({}, state, {
            isEngineOn: action.payload
        });

    default:
        return state;
    }
}

export default setInfo