import { getServeTypes } from '@services/assetServices'
export default {
  namespace: 'assetServices',
  state: {
    serveTypes: []
  },
  effects: {
    * getServiceTypes ({ payload }, { call, put }) {
      const data = yield call(getServeTypes, payload)
      console.log(data)
      yield put({ type: 'save', payload: { serveTypes: data.body || [] } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  },
  subscriptions: {
    setup ({ dispatch, history }) {
    }
  }
}
