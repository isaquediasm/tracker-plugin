import { createStore, applyMiddleware, compose, combineReducers } from 'redux';
import thunkMiddleware from 'redux-thunk';
import { createLogger } from 'redux-logger';
import promise from 'redux-promise-middleware';
import { reducer as events } from '@isaquediasm/services/events';

const loggerMiddleware = createLogger();

// TODO: Dummy endpoint, change to the real thing, or even better, get it from the environment at runtime
// TODO: This can change within a single application
const API_BASE_URL = 'http://api.sellics.com';

const middlewares = [thunkMiddleware, promise, loggerMiddleware];

const devToolsShouldLoad =
  typeof window === 'object' &&
  typeof window.__REDUX_DEVTOOLS_EXTENSION__ !== 'undefined' &&
  process.env.ENV !== 'production';

export function createApplicationStore(reducers, middleware, initialData = {}) {
  const createStoreWithMiddleware = compose(
    applyMiddleware(...middleware),
    devToolsShouldLoad ? window.__REDUX_DEVTOOLS_EXTENSION__() : f => f
  )(createStore);

  const store = createStoreWithMiddleware(reducers, initialData);

  return store;
}

export default function configureStore() {
  const rootReducer = combineReducers({ events });
  const store = createApplicationStore(rootReducer, middlewares, {}); // We can pass initial data to be laoded into the state here

  /*  if (module.hot) {
    // Enable Webpack hot module replacement for reducers
    module.hot.accept('./reducers', () => {
      const nextRootReducer = require('./reducers/index');
      store.replaceReducer(nextRootReducer);
    });
  } */

  return store;
}
