import { createStore } from 'redux'
import { combineReducers, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import mainData from './reducers/mainData.js'

const middleware = applyMiddleware(thunk);
export const rootReducer = combineReducers({
    mainData
})
let store = createStore(
  rootReducer,
  middleware
  )
export default store;