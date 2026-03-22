import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

import template from './reducers/template'
import auth from './reducers/auth'

const rootReducer = combineReducers({
    template,
    auth,
})

const Store = configureStore({
    reducer: rootReducer,
})

export { Store }
