import api from '@/services/api'
export default {
  namespace: 'bugPatch',
  state: {
    //漏洞类型
    bugTypeList: [],
    //补丁详情
    patchDetail: {},
    //漏洞详情
    bugDetail: {},
    //漏洞关联链接列表
    bugLinkList: {},
    //漏洞关联服务列表
    bugServerList: {},
    //漏洞关联端口列表
    bugPortList: {},
    //漏洞关联方案列表
    bugPlanList: {},
    //补丁关联前置补丁列表
    patchPrevList: {},
    //补丁关联附件列表
    patchAppendixList: {},
    //补丁关联漏洞列表
    patchBugList: {}
  },
  effects: {
    * getPatchPrevList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { patchPrevList: data.body || {} } })
    },
    * getPatchAppendixList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { patchAppendixList: data.body || {} } })
    },
    * getPatchBugList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { patchBugList: data.body || {} } })
    },
    * getBugLinkList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { bugLinkList: data.body || {} } })
    },
    * getBugServerList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { bugServerList: data.body || {} } })
    },
    * getBugPortList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { bugPortList: data.body || {} } })
    },
    * getBugPlanList ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { bugPlanList: data.body || {} } })
    },
    * listVulType ({ payload }, { call, put }) {
      const data = yield call(api.listVulType, payload)
      yield put({ type: 'save', payload: { bugTypeList: data.body || [] } })
    },
    * getPatchDetail ({ payload }, { call, put }) {
      const data = yield call(api.getPatchDetail, payload)
      const body = data.body
      body.hotfix = body.hotfix === true ? '1' : body.hotfix === false ? '0' :  null
      body.userInteraction = body.userInteraction === true ? '1' : body.userInteraction === false ? '0' :  null
      body.exclusiveInstall = body.exclusiveInstall === true ? '1' : body.exclusiveInstall === false ? '0' :  null
      body.networkStatus = body.networkStatus === true ? '1' : body.networkStatus === false ? '0' :  null
      yield put({ type: 'save', payload: { patchDetail: data.body || {} } })
    },
    * getBugDetail ({ payload }, { call, put }) {
      const data = yield call(api.getPatchDetail, payload)
      yield put({ type: 'save', payload: { bugDetail: data.body || {} } })
    }
  },
  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }

}
