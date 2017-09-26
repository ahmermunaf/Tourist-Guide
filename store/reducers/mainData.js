import Main_Action from '../actions/main_action.js'
function mainData(state = [], action) {
  switch (action.type) {
  case Main_Action.mapData:
    return Object.assign([], action.data);
  default:
    return state
  }
}

export default mainData;