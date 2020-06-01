import { routerRedux } from 'dva/router'

export default {

  namespace: 'common',
  state: {
    count: 0,
    getHistory: ''
  },

  effects: {
    * logout ({ payload }, { call, put, select }) {
      yield put({ type: 'save' })
      yield put(routerRedux.push('/login'))
    }
  },

  reducers: {
    save (state, { payload }) {
      return { ...state, data: payload }
    },
    save2 (state, { payload }) {
      return { ...state, data: payload }
    },
    add (state) {
      return { ...state, count: state.count + 1 }
    }
  }
}