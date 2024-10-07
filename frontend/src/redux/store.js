import { combineReducers, applyMiddleware } from 'redux'
import { configureStore } from '@reduxjs/toolkit'

// Reducers
import template from './reducers/template'

// Setup Reducers For Store
let Reducers = {
    template: template
}

const rootReducer = combineReducers(Reducers) // Combining Reducer To Redux

// ## Default 1 ##
const Store = configureStore({
    reducer: rootReducer,
})

export { Store }