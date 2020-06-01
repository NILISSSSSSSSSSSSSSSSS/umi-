import { getRelationService, getRelationOs } from '@services/settingServices'
export default {
  namespace: 'baseSetting',
  state: {
    serveList: [],
    osList: []
  },
  effects: {
    * getRelationService ({ payload }, { call, put }) {
      const data = yield call(getRelationService, payload)
      yield put({ type: 'save', payload: { serveList: data.body } })
    },
    * getRelationOs ({ payload }, { call, put }) {
      const data = yield call(getRelationOs, payload)
      yield put({ type: 'save', payload: { osList: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }
}
