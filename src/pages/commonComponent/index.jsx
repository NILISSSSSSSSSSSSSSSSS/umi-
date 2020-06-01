import React, { PureComponent } from 'react'
import { connect } from 'dva'
import { Form, Button, Table } from 'antd'
import {
  Atable,
  DateRange,
  DetailFiedls,
  Search,
  TableBtns,
  CommonModal,
  CommonForm
} from '@c/index'  //引入方式
import { generateRules } from '@u/common'
import moment from 'moment'
import './style.less'

const { Item } = Form

class CommonComponent extends PureComponent {
  urlParams = this.props
  state = {
    formModalVisible: false,
    nomalModalVisible: false,
    confirmModalVisible: false,
    modalFormValue: {},
    columns: [{
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      render: (text) => {
        return (
          <span></span>
        )
      }
    }, {
      title: '关键字',
      dataIndex: 'keyWords',
      key: 'keyWords',
      render: (text) => {
        return (
          <span></span>
        )
      }
    }, {
      title: '操作',
      dataIndex: 'operate',
      key: 'operate',
      render: (text, record)=>{
        return(
          <div className="operate-wrap">
          </div>
        )
      }
    }
    ]
  };
  /**
   * 设置modal是否显示
   * @param  {string} modalVisible   当前设置的modal
   * @param  {boolean} type          是否显示
   */
  setModalVisible = (modalVisible, type) => {
    this.setState({
      [modalVisible]: type
    })
  }

  /**
   * 生成验证规则
   * @param max 最多字符数
   * @param rules {Array} 验证规则
   * @returns {*[]}
   */
  generateRules = (max = 30, rules = []) => {
    return [
      { max, message: `最多输入${max}字符！` },
      { whitespace: true, message: '不能为空字符！' },
      ...rules
    ]
  }
  modalHandleSubmit = value => {
    this.setState({
      modalFormValue: value
    }, () => {
      console.log(this.state.modalFormValue)
    })
  }
  formHandleSubmit = (e) => {
    e.preventDefault()
    this.props.form.validateFields((err, values) => {
      if (!err) {
        console.log(values)
      }
    })
  }
  onConfirm = () => {
    console.log('ok')
  }

  render () {
    const { formModalVisible, nomalModalVisible, confirmModalVisible, columns } = this.state
    const onChange = (range) =>{
      console.log(range)
    }
    const fields = [
      { name: '品类型号', key: 'categoryModelName' },
      { name: '资产名称', key: 'name' },
      { name: '厂商', key: 'manufacturer' },
      { name: '设备编号', key: 'number' },
      { name: 'IP地址', key: 'ip', showTips: false },
      { name: 'MAC地址', key: 'mac', showTips: false },
      { name: '首次入网时间', key: 'firstEnterNett', showTips: false,
        render: (timestamp) => {
          const num = Number(timestamp)
          // const text = num > 0 ? moment(num).format('YYYY-MM-DD HH:mm:ss') : ''
          return timestamp
        } },
      { name: '网络连接', key: 'networkState', showTips: false },
      { name: '归属区域', key: 'area' },
      { name: '机房位置', key: 'houseLocation' },
      { name: '物理位置', key: 'location' },
      { name: '描述', key: 'memo', overFlow: 'visible', showTips: false }
    ]
    const data = { 'stringId': '2QYRJzuRIJb/4v1hyASM8g==', 'mac': 'AA:AA:AA:AA:AA:AA', 'assetId': 'Yip1xAuWvJH0w9fs0qwRnQ==', 'safetyId': '2QYRJzuRIJb/4v1hyASM8g==', 'name': '探海联调真实设备', 'maxPackageVersion': '1.1.2', 'registTime': null, 'categoryModel': '/TrSt3u3xr1xuvfaePQTXw==', 'categoryModelId': null, 'categoryModelName': '探海', 'avlxVersion': null, 'commandControlChannel': null, 'manage': true, 'newVersion': '1.1.2', 'ip': '192.168.1.163', 'url': 'https://10.250.129.10', 'firmwareVersion': null, 'memo': null, 'houseLocation': null, 'location': '四川省成都市武侯区xx', 'number': 'fds787668', 'area': '四川', 'areaId': 'ydl3l3pVER2RjBmKD/KkVg==', 'manufacturer': 'antiy', 'maxFeatureLibrary': '1.1.1', 'featureLibrary': '1.1.1', 'firstEnterNett': 1559550407557, 'networkState': '正常', 'packageVersion': null, 'assetGroup': '开发资产组', 'responsibleUserName': 'mmmqq', 'responsibleUserId': null }
    const defaultFields = [{ key: 'allCondition', label: '综合查询', type: 'input', maxLength: 30, placeholder: '名称/IP' }, { key: 'stringId', label: '品类型号', placeholder: '全部', type: 'treeSelect', data: {}, config: { name: 'name', value: 'stringId' } }]
    const searchChange = (filter) => {
      console.log('searchChange===>filter', filter)
    }
    const onSubmit = (filter) => {
      console.log('onSubmit===>filter', filter)
    }
    const filterFields = [
      { label: '品类型号',  key: 'categoryModels', className: '', multiple: true, getChildrenKeys: true, config: { name: 'name', value: 'stringId' }, type: 'treeSelect', placeholder: '全部', data: {} },
      { label: '首次入网时间', key: 'time', type: 'dateRange', placeholder: ['开始日期', '结束日期'], data: [ ] }
    ]

    const { type } = this.urlParams
    const disabledTypes = ['again', 'isChange']
    function disabledPublishDate (current) {
      return current > moment().endOf('day')
    }
    // form字段定义
    const modalFormFields = [
      { type: 'hidden', key: 'status', name: '' },
      { type: 'input', key: 'name', name: '名称', rules: [{ required: true,  message: '请输入名称' },  ...generateRules()] },
      { type: 'select', key: 'installType', name: '安装方式', placeholder: '请选择', defaultValue: 'MANUAL',  data: [ { label: '人工', value: 'MANUAL' }, { label: '自动', value: 'AUTO_MATIC' }] },
      { type: 'selectTree', key: 'categoryModel', disabled: disabledTypes.includes(type), onChange: this.categorChange, name: '关联设备型号', config: { name: 'name', value: 'stringId' },  placeholder: '请选择', data: [] },
      { type: 'select', key: 'manufacturer', name: '厂商', placeholder: '请选择厂商', data: [] },
      { type: 'date', key: 'publishDate', name: '发布时间', disabledDate: disabledPublishDate },
      { type: 'dateRange', key: 'rangeDate', name: '时间段', disabledDate: disabledPublishDate, initialValue: [moment(), moment()], onChange: this.dateRangeChange },
      { type: 'textArea', key: 'describ', rows: 4, name: '摘要', placeholder: '请输入摘要(不能超过300个字符)', rules: [...generateRules(300)] }
    ]
    const formFields = [
      { type: 'input', key: 'names', name: '名称', rules: [{ required: true,  message: '请输入名称' },  ...generateRules()] },
      { type: 'input', key: 'codes', name: '编号', rules: [{ required: true,  message: '请输入编号' },  ...generateRules()] },
      { type: 'select', key: 'types', name: '类型', placeholder: '请选择', defaultValue: 'MANUAL',  data: [ { label: '人工', value: 'MANUAL' }, { label: '自动', value: 'AUTO_MATIC' }] }
    ]

    const formLayout = {
      labelCol: {
        span: 8
      },
      wrapperCol: {
        span: 12
      }
    }
    return (
      <div className="commonComponent">
        <div>
          <fieldset>
            <legend>查询组件</legend>
            <Search defaultFields={defaultFields} fieldList={filterFields} onChange={searchChange} onSubmit={onSubmit}/>
          </fieldset>
          <fieldset>
            <legend>详情组件</legend>
            <DetailFiedls fields={fields} data={data} column='auto'/>
          </fieldset>
          <fieldset>
            <legend>表格上部按钮</legend>
            <TableBtns leftBtns={[{ label: '导出', onClick: ()=> {alert('你点击了我')} }]} rightBtns={[{ label: '清除', confirm: { text: '是否清除', onOk: ()=>{}, onCancel: () => {} } }]}/>
          </fieldset>
          <fieldset>
            <legend>其他按钮</legend>
            <Button type="primary">查询</Button>
            <br /><br />
            <Button type="primary" ghost>重置</Button>
          </fieldset>
          <fieldset>
            <legend>日期区间选择</legend>
            <div className="fieldset-flex">
              <div className="fieldset-flex-item">
               没有默认时间
                <DateRange style={{ width: 300 }} onChange={onChange}/>
              </div>
              <div className="fieldset-flex-item">
               默认时间
                <DateRange style={{ width: 300 }} initialValue={[moment(), moment()]} onChange={onChange}/>
              </div>
            </div>
          </fieldset>
          <fieldset>
            <legend>弹窗</legend>
            <div className="modal-item">
              <Button
                type="primary"
                onClick={() => {this.setModalVisible('formModalVisible', true)}}
              >
                formModal
              </Button>
              <Button
                type="primary"
                onClick={() => {this.setModalVisible('nomalModalVisible', true)}}
              >
                nomalModal
              </Button>
              <Button
                type="primary"
                onClick={() => {this.setModalVisible('confirmModalVisible', true)}}
              >
                confirmModal
              </Button>
            </div>
          </fieldset>
          <fieldset>
            <legend>表单</legend>
            <CommonForm
              oktext="提交"
              fields={formFields}
              column={3}
              form={this.props.form}
              FormItem={Item}
              formLayout={formLayout}
            >
            </CommonForm>
            <div className="button-center">
              <div>
                <Button
                  type="primary"
                  onClick={this.formHandleSubmit}
                >
                  确认
                </Button>
                <Button
                  type="primary"
                  ghost
                >
                  取消
                </Button>
              </div>
            </div>
          </fieldset>
          {/* Atable */}
          <fieldset>
            <legend>表格</legend>
            <Atable/>
          </fieldset>
        </div>
        <CommonModal
          type="form"
          visible={formModalVisible}
          title="表单弹窗"
          width={650}
          oktext="提交"
          value={this.modalHandleSubmit}
          onClose={() => {this.setModalVisible('formModalVisible', false)}}
          fields={modalFormFields}
          column={1}
          FormItem={Item}
          formLayout={formLayout}
        >
        </CommonModal>
        <CommonModal
          type="normal"
          visible={nomalModalVisible}
          title="普通弹窗"
          width={650}
          onClose={() => {this.setModalVisible('nomalModalVisible', false)}}
        >
          <Table rowKey="id" columns={columns} dataSource={[]} />
        </CommonModal>
        <CommonModal
          type="confirm"
          visible={confirmModalVisible}
          onConfirm={this.onConfirm}
          onClose={() => {this.setModalVisible('confirmModalVisible', false)}}
        >
          <p className="confirm-text">是否剔除选中数据？</p>
        </CommonModal>
      </div>
    )
  }
}

const productsForm = Form.create()(CommonComponent)
export default connect(({ productsModel })=>({ count: productsModel.count }))(productsForm)
