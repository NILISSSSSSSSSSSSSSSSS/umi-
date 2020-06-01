export default {
  namespace: 'parts',
  state: {
    manufacturer: []
  },
  effects: {

  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  },
  subscriptions: {
    setup({ dispatch, history }) {  // eslint-disable-line
      // dispatch({ type: 'getManufacturerList' })
    }
  }
}
