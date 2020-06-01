import user from '@services/user'
export default {
  namespace: 'user',
  state: {
    userList: []
  },
  effects: {
    * getUserList ({ payload }, { call, put }) {
      const data = yield call(user.getUserList, payload)
      yield put({ type: 'save', payload: { userList: data.body } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, data: action.payload }
    }
  }
}
