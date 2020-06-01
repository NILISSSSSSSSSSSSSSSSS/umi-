import { TooltipFn } from '@u/common'
import { ALL_STATUS, SERVE_TYPE } from '@a/js/enume'

export default {

  namespace: 'staticSoftware',

  state: {
    // portSearch: [ //软件add弹窗搜索端口 不要了
    //   { type: 'input', label: '端口号', placeholder: '请输入', key: 'port' },
    //   { type: 'input', label: '描述', placeholder: '请输入', key: 'memo' }
    // ],
    depSeriveSearch: [ //软件add弹窗搜索依赖服务
      { type: 'input', label: '服务名', placeholder: '请输入', key: 'service', maxLength: 128 },
      { type: 'input', label: '显示名', placeholder: '请输入', key: 'displayName', maxLength: 128 },
      { type: 'select', label: '服务类型', placeholder: '请输入', key: 'serviceClasses', data: SERVE_TYPE }
    ],
    protocolSearch: [ //软件add弹窗搜索依赖协议
      { type: 'input', label: '协议名称', placeholder: '请输入', key: 'protocolName', maxLength: 128 },
      { type: 'input', label: '备注', placeholder: '请输入', key: 'memo', maxLength: 300 }
    ],
    // proSeriveSearch: [ //软件add弹窗搜索提供服务

    // ],

    portColumns: [ //软件add弹窗表格端口
      { dataIndex: 'port', width: '33%', title: '端口号' },
      { dataIndex: 'memo', width: '33%', title: '端口号' },
      { dataIndex: 'idxx', width: '33%', title: '端口号' }
    ],
    depSeriveColumns: [ //软件add弹窗表格依赖服务
      {
        title: '服务名',
        dataIndex: 'service',
        key: 'service',
        render: text=>TooltipFn(text)
      }, {
        title: '显示名',
        dataIndex: 'displayName',
        key: 'displayName',
        render: text=>TooltipFn(text)
      }, {
        title: '服务类型',
        dataIndex: 'serviceClassesStr',
        key: 'serviceClassesStr',
        render: text=>TooltipFn(text)
      }, {
        title: '启动参数',
        dataIndex: 'startupParameter',
        key: 'startupParameter',
        render: text=>TooltipFn(text)
      }, {
        title: '描述',
        dataIndex: 'describ',
        key: 'describ',
        render: text=>TooltipFn(text)
      }
    ],
    protocolColumns: [ //软件add弹窗表格依赖协议
      {
        title: '协议名称',
        dataIndex: 'name',
        key: 'name',
        render: text=>TooltipFn(text)
      }, {
        title: '备注',
        dataIndex: 'memo',
        key: 'memo',
        render: text=>TooltipFn(text)
      }
    ],
    proSeriveColumns: [ //软件add弹窗表格提供服务

    ]
  },
  effects: {

  },
  reducers: {
    save (state, action) {
      return { ...state, data: action.payload }
    }
  }

}
