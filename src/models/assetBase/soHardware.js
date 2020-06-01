import api from '@services/api'

export default {

  namespace: 'soHardware',

  state: {
    soHardwareList: {}, //软硬件列表查询
    soHardwareStorage: {}, //软硬件入库
    soHardwareDel: null, //软硬件删除
    soHardwareDetail: {}, //软硬件详情上半部分
    sohardwareAddCompList: {}, //添加组件列表
    checkExist: null, //检查数据是否存在

    // hardwareDetail: {}, //硬件详情查询
    hardwareDetailList: {}, //查询硬件资产对应的组件列表
    hardwareDetaliDel: null, //硬件详情删除
    hardwareSave: null, //硬件关系组件保存

    // softwareList: '', //软件详情列表查询
    softwareDetailListComp: {}, //查询软件资产对应的组件列表
    softwareDelComp: null, //软件关联组件删除
    softwareSaveComp: null, //软件关联组件保存
    softwareDetailListPort: {}, //查询软件资产依赖的端口列表
    softwareDelPort: null, //软件依赖的端口删除
    softwareSavePort: null, //软件依赖的端口保存
    softwareDetailListLation: {}, //查询软件资产依赖的服务列表
    softwareAddListLation: {}, //添加依赖的服务列表
    softwareDelLation: null, //软件依赖的服务删除
    softwareSaveLation: null, //软件依赖的服务保存
    softwareDetailListProtocol: {}, //查询软件资产对应的依赖的协议列表
    softwareAddListProtocol: {}, //添加依赖的协议列表
    softwareDelProtocol: null, //软件依赖的协议删除
    softwareSaveProtocol: null, //软件依赖的协议保存
    softwareDetailListLib: {}, //查询软件资产提供的服务列表
    softwareDelLib: null, //软件关联提供的服务删除
    softwareSaveLib: null //软件关联提供的服务保存

  },

  effects: {
    * soHardwareList ({ payload }, { call, put }) {
      const data = yield call(api.soHardwareList, payload)
      yield put({ type: 'save', payload: { soHardwareList: data.body } })
    },
    * soHardwareStorage ({ payload }, { call, put }) {
      const data = yield call(api.soHardwareStorage, payload)
      yield put({ type: 'save', payload: { soHardwareStorage: data.body } })
    },
    * soHardwareDel ({ payload }, { call, put }) {
      const data = yield call(api.soHardwareDel, payload)
      yield put({ type: 'save', payload: { soHardwareDel: data.body } })
    },
    * soHardwareDetail ({ payload }, { call, put }) {
      const data = yield call(api.soHardwareDetail, payload)
      yield put({ type: 'save', payload: { soHardwareDetail: data.body } })
    },
    * sohardwareAddCompList ({ payload }, { call, put }) {
      const data = yield call(api.sohardwareAddCompList, payload)
      yield put({ type: 'save', payload: { sohardwareAddCompList: data.body } })
    },
    * checkExist ({ payload }, { call, put }) {
      const data = yield call(api.checkExist, payload)
      yield put({ type: 'save', payload: { checkExist: data.body } })
    },

    // * hardwareDetail ({ payload }, { call, put }) {
    //   const data = yield call(api.hardwareDetail, payload)
    //   yield put({ type: 'save', payload: { hardwareDetail: data.body } })
    // },
    * hardwareDetailList ({ payload }, { call, put }) {
      const data = yield call(api.hardwareDetailList, payload)
      yield put({ type: 'save', payload: { hardwareDetailList: data.body } })
    },
    * hardwareDetaliDel ({ payload }, { call, put }) {
      const data = yield call(api.hardwareDetaliDel, payload)
      yield put({ type: 'save', payload: { hardwareDetaliDel: data.body } })
    },
    * hardwareSave ({ payload }, { call, put }) {
      const data = yield call(api.hardwareSave, payload)
      yield put({ type: 'save', payload: { hardwareSave: data.body } })
    },
    // * softwareList ({ payload }, { call, put }) {
    //   const data = yield call(api.softwareList, payload)
    //   yield put({ type: 'save', payload: { softwareList: data.body } })
    // },
    * softwareDetailListComp ({ payload }, { call, put }) {
      const data = yield call(api.softwareDetailListComp, payload)
      yield put({ type: 'save', payload: { softwareDetailListComp: data.body } })
    },
    * softwareDelComp ({ payload }, { call, put }) {
      const data = yield call(api.softwareDelComp, payload)
      yield put({ type: 'save', payload: { softwareDelComp: data.body } })
    },
    * softwareSaveComp ({ payload }, { call, put }) {
      const data = yield call(api.softwareSaveComp, payload)
      yield put({ type: 'save', payload: { softwareSaveComp: data.body } })
    },
    * softwareDetailListPort ({ payload }, { call, put }) {
      const data = yield call(api.softwareDetailListPort, payload)
      yield put({ type: 'save', payload: { softwareDetailListPort: data.body } })
    },
    * softwareDelPort ({ payload }, { call, put }) {
      const data = yield call(api.softwareDelPort, payload)
      yield put({ type: 'save', payload: { softwareDelPort: data.body } })
    },
    * softwareSavePort ({ payload }, { call, put }) {
      const data = yield call(api.softwareSavePort, payload)
      yield put({ type: 'save', payload: { softwareSavePort: data.body } })
    },
    * softwareDetailListLation ({ payload }, { call, put }) {
      const data = yield call(api.softwareDetailListLation, payload)
      yield put({ type: 'save', payload: { softwareDetailListLation: data.body } })
    },
    * softwareAddListLation ({ payload }, { call, put }) {
      const data = yield call(api.softwareAddListLation, payload)
      yield put({ type: 'save', payload: { softwareAddListLation: data.body } })
    },
    * softwareDelLation ({ payload }, { call, put }) {
      const data = yield call(api.softwareDelLation, payload)
      yield put({ type: 'save', payload: { softwareDelLation: data.body } })
    },
    * softwareSaveLation ({ payload }, { call, put }) {
      const data = yield call(api.softwareSaveLation, payload)
      yield put({ type: 'save', payload: { softwareSaveLation: data.body } })
    },
    * softwareDetailListProtocol ({ payload }, { call, put }) {
      const data = yield call(api.softwareDetailListProtocol, payload)
      yield put({ type: 'save', payload: { softwareDetailListProtocol: data.body } })
    },
    * softwareAddListProtocol ({ payload }, { call, put }) {
      const data = yield call(api.softwareAddListProtocol, payload)
      yield put({ type: 'save', payload: { softwareAddListProtocol: data.body } })
    },
    * softwareDelProtocol ({ payload }, { call, put }) {
      const data = yield call(api.softwareDelProtocol, payload)
      yield put({ type: 'save', payload: { softwareDelProtocol: data.body } })
    },
    * softwareSaveProtocol ({ payload }, { call, put }) {
      const data = yield call(api.softwareSaveProtocol, payload)
      yield put({ type: 'save', payload: { softwareSaveProtocol: data.body } })
    },
    * softwareDetailListLib ({ payload }, { call, put }) {
      const data = yield call(api.softwareDetailListLib, payload)
      yield put({ type: 'save', payload: { softwareDetailListLib: data.body } })
    },
    * softwareDelLib ({ payload }, { call, put }) {
      const data = yield call(api.softwareDelLib, payload)
      yield put({ type: 'save', payload: { softwareDelLib: data.body } })
    },
    * softwareSaveLib ({ payload }, { call, put }) {
      const data = yield call(api.softwareSaveLib, payload)
      yield put({ type: 'save', payload: { softwareSaveLib: data.body } })
    }
  },

  reducers: {
    save (state, action) {
      return { ...state, ...action.payload }
    }
  }

}
