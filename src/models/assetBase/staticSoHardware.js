import { TooltipFn } from '@u/common'
import { STATUS, SOFT_SEARCHTYPE } from '@a/js/enume'
import moment from 'moment'

const sHhead = [
  { type: 'input', label: '厂商', placeholder: '请输入', key: 'supplier', maxLength: 64 },
  { type: 'input', label: '名称', placeholder: '请输入', key: 'productName', maxLength: 64 },
  { type: 'input', label: '版本', placeholder: '请输入', key: 'version', maxLength: 64 }
]

const seatchHead = [
  { type: 'select', label: '状态', placeholder: '请选择', key: 'isStorage', data: STATUS },
  { type: 'dateRange', label: '收录时间', placeholder: ['开始时间', '结束时间'], key: 'gmtCreate' }
]
const sysVersion = { type: 'input', label: '系统版本', placeholder: '请输入', key: 'sysVersion', maxLength: 64 }

const language = { type: 'input', label: '语言', placeholder: '请输入', key: 'language', maxLength: 64 }

const soHardwareColumns = [ //软硬件表格
  {
    title: '厂商',
    dataIndex: 'supplier',
    key: 'supplier',
    isShow: true,
    render: text=>TooltipFn(text)
  }, {
    title: '名称',
    dataIndex: 'productName',
    key: 'productName',
    isShow: true,
    render: text=>TooltipFn(text)
  }, {
    title: '版本',
    dataIndex: 'version',
    key: 'version',
    isShow: true,
    render: text=>TooltipFn(text)
  }, {
    title: '收录时间',
    dataIndex: 'gmtCreate',
    key: 'gmtCreate',
    isShow: true,
    sorter: true,
    sortDirections: ['ascend', 'descend'],
    render: text => <span className="tabTimeCss">{TooltipFn(moment(text).format('YYYY-MM-DD HH:mm:ss'))}</span>
  }, {
    title: '状态',
    dataIndex: 'isStorage',
    key: 'isStorage',
    isShow: true,
    render: text=> TooltipFn((STATUS.find((e=>e.value === text)) || {}).name)
  }, {
    title: '系统版本',
    dataIndex: 'sysVersion',
    key: 'sysVersion',
    isShow: false,
    render: text=>TooltipFn(text)
  }
]

const hardColumns = [
  {
    title: '软件版本',
    dataIndex: 'softVersion',
    key: 'softVersion',
    isShow: false,
    render: text=>TooltipFn(text)
  }, {
    title: '软件平台',
    dataIndex: 'softPlatform',
    key: 'softPlatform',
    isShow: false,
    render: text=>TooltipFn(text)
  }, {
    title: '硬件平台',
    dataIndex: 'hardPlatform',
    key: 'hardPlatform',
    isShow: false,
    render: text=>TooltipFn(text)
  }, {
    title: '更新信息',
    dataIndex: 'upgradeMsg',
    key: 'upgradeMsg',
    isShow: false,
    render: text=>TooltipFn(text)
  }
]

const suppleColumns = [
  {
    title: '语言',
    dataIndex: 'language',
    key: 'language',
    isShow: false,
    render: text=>TooltipFn(text)
  }, {
    title: '其它',
    dataIndex: 'other',
    key: 'other',
    isShow: false,
    render: text=>TooltipFn(text)
  }
]

const soHardDetailHead = [ //软硬件详情lebal
  { name: '厂商', key: 'supplier' },
  { name: '名称', key: 'productName' },
  { name: '版本', key: 'version' },
  { name: '系统版本', key: 'sysVersion' },
  { name: '语言', key: 'language' },
  { name: '软件版本', key: 'softVersion' },
  { name: '软件平台', key: 'softPlatform' },
  { name: '硬件平台', key: 'hardPlatform' },
  { name: '其它', key: 'other', overFlow: 'visible' },
  { name: '更新信息', key: 'upgradeMsg' }
]

export default {
  namespace: 'staticSoHardware',

  state: {
    hardSearchHead: [ //硬件搜索lebal
      ...sHhead,
      ...seatchHead
    ],
    softSearchHead: [ //软件搜索lebal
      { type: 'select', label: '类型', placeholder: '请选择', key: 'softType', data: SOFT_SEARCHTYPE },
      ...sHhead,
      ...seatchHead
    ],
    hardSenior: [
      sysVersion,
      { type: 'input', label: '软件版本', placeholder: '请输入', key: 'softVersion', maxLength: 64 },
      { type: 'input', label: '软件平台', placeholder: '请输入', key: 'softPlatform', maxLength: 64 },
      { type: 'input', label: '硬件平台', placeholder: '请输入', key: 'hardPlatform', maxLength: 64 },
      language
    ],
    softSenior: [
      sysVersion,
      language
    ],
    hardDetailHead: [ //硬件详情lebal
      ...soHardDetailHead
    ],
    softDetailHead: [ //软件详情lebal
      { name: '类型', key: 'typeName' },
      ...soHardDetailHead
    ],
    soHardSearch: [  //软硬件弹窗leabal
      ...sHhead
      // sysVersion,
      // language
    ],
    hardwareColumns: [ //硬件表格
      ...soHardwareColumns,
      ...hardColumns,
      ...suppleColumns
    ],
    softwareColumns: [ //软件表格
      {
        title: '类型',
        dataIndex: 'typeName',
        key: 'typeName',
        isShow: true,
        render: text=>TooltipFn(text)
      },
      ...soHardwareColumns,
      ...suppleColumns
    ],
    soHardwareCompColumns: [{ //软硬件add弹窗表格第一个
      title: '厂商',
      dataIndex: 'supplier',
      key: 'supplier',
      render: text=>TooltipFn(text)
    }, {
      title: '名称',
      dataIndex: 'productName',
      key: 'productName',
      render: text=>TooltipFn(text)
    }, {
      title: '版本',
      dataIndex: 'version',
      key: 'version',
      render: text=>TooltipFn(text)
    }, {
      title: '系统版本',
      dataIndex: 'sysVersion',
      key: 'sysVersion',
      render: text=>TooltipFn(text)
    }, {
      title: '语言',
      dataIndex: 'language',
      key: 'language',
      render: text=>TooltipFn(text)
    }, {
      title: '其它',
      dataIndex: 'other',
      key: 'other',
      render: text=>TooltipFn(text)
    }]
  },
  effects: {

    // * getCategoryModelNode ({ payload }, { call, put }) {
    //     const data = yield call(asset.getCategoryModelNode, payload)
    //     yield put({ type: 'save', payload: { categoryModelNode: data.body } })
    //   },

  },
  reducers: {
    save (state, action) {
      return { ...state, data: action.payload }
    }
  }

}
