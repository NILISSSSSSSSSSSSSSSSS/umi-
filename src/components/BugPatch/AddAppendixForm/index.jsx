import { Component } from 'react'
import { Form, Input, Message, Modal, Button, Popover, Upload, Icon } from 'antd'
import { func, bool } from 'prop-types'
import AddCatgoryModal from '@c/BugPatch/AddCatgoryModal'
import { beforeUpload, createHeaders } from '@/utils/common'
import * as regExp from '@u/validate'
import './index.less'

const { Item } = Form
const formItemLayout = {
  labelCol: {
    span: 7
  },
  wrapperCol: {
    span: 12
  }
}
@Form.create()
class AddAppendixForm extends Component {
  static propTypes = {
    visible: bool,
    onClose: func,
    onSubmit: func
  }
  constructor (props) {
    super(props)
    this.state = {
      fileList: [],
      modalVisible: false,
      categoryId: null
    }
  }
  componentDidMount () {

  }

  render () {
    const { fileList, modalVisible } = this.state
    const { visible } = this.props
    const { getFieldDecorator } = this.props.form
    const uploadProps = {
      accept: '.exe,.msu,.rar,.zip,.7z',
      action: '/api/v1/patch/file/upload',
      headers: createHeaders(),
      onChange: this.uploadChange,
      name: 'fileList',
      fileList,
      beforeUpload: ((file, fileLists) => beforeUpload(file, fileLists, fileList, 2048, 'MB', 1, regExp.appendixPattern))
    }
    return (
      <Modal
        className="over-scroll-modal"
        title="补丁关联附件信息"
        width={650}
        visible={visible}
        maskClosable={false}
        footer={null}
        onCancel={this.handleCancel}>
        <div className="content-wrap">
          <Form>
            <div className="form-wrap">
              <Item {...formItemLayout} label="补丁版本号">
                {
                  getFieldDecorator('patchVersion', {
                    rules: [
                      { required: true, message: '请输入补丁版本号！' },
                      { message: '最多32个字符！', max: 32 },
                      { whitespace: true, message: '不能为空字符！' }
                    ]
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
              <Item {...formItemLayout} label="品类型号">
                {
                  getFieldDecorator('categoryId', {
                    rules: [{ required: true, message: '请添加品类型号' }]
                  })(
                    <Input autoComplete="off" placeholder="请添加" disabled />
                  )
                }
                <div className="patch-category-box">
                  <Icon className="patch-add-btn" type="plus-circle" onClick={() => this.setState({ modalVisible: true })} />
                </div>
              </Item>
              <Item {...formItemLayout} label="上传附件">
                {
                  getFieldDecorator('attachment', {
                    rules: [{ required: true, message: '请上传附件！' }]
                  })(
                    <Upload
                      {...uploadProps}
                      multiple
                      onRemove={this.onRemove}>
                      <div className='bug-analyze-upload'>
                        <Icon type='plus' />
                        &nbsp;&nbsp;上传附件&nbsp;&nbsp;
                        <Popover content='支持扩展名：.exe，.msu，.rar，.zip，.7z，只能上传1个文件'>
                          <Icon type='question-circle' />
                        </Popover>
                      </div>
                    </Upload>
                  )
                }
              </Item>
              <Item {...formItemLayout} label="附件MD5码">
                {
                  getFieldDecorator('fileMd5', {
                    rules: [
                      { required: true, message: '请输入附件MD5码！' },
                      { message: '最多64个字符！', max: 64 },
                      { whitespace: true, message: '不能为空字符！' }
                    ]
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
              <Item {...formItemLayout} label="原始下载链接">
                {
                  getFieldDecorator('originalUrl', {
                    rules: [
                      { message: '最多256个字符！', max: 256 },
                      { whitespace: true, message: '不能为空字符！' }
                    ]
                  })(
                    <Input autoComplete="off" placeholder="请输入" allowClear />
                  )
                }
              </Item>
              <div className="button-center">
                <div>
                  <Button type="primary" onClick={this.handleSubmit}>提交</Button>
                  <Button type="primary" ghost onClick={this.handleCancel}>取消</Button>
                </div>
              </div>
            </div>
          </Form>
          {
            modalVisible && <AddCatgoryModal
              url="patchHardsoftlib"
              param={{ isStorage: 1 }}
              single
              visible={modalVisible}
              onClose={() => this.setState({ modalVisible: false })}
              onConfirm={this.onConfirm} />
          }
        </div>
      </Modal>
    )
  }

  //提交
  handleSubmit = () => {
    this.props.form.validateFields((err, values) => {
      if (!err) {
        const fileData = values.attachment.file.response.body[0]
        const { fileSize, fileUrl } = fileData
        const { categoryId } = this.state
        values.fileMd5 = values.fileMd5.toLowerCase()
        if (values.fileMd5 !== fileData.md5) {
          Message.info('附件MD5码输入不正确！')
          return false
        }
        values.categoryId = categoryId
        values.fileName = values.attachment.file.name
        values.fileLink = fileUrl
        values.fileSize = fileSize
        delete values.attachment
        const { form, onSubmit } = this.props
        onSubmit(values, () => {
          this.setState({
            fileList: []
          })
          form.resetFields()
        })
      }
    })
  }

  //上传文件
  uploadChange = (info) => {
    let fileList = info.fileList
    this.setState({ fileList: fileList })
    if (info.file.status === 'done' && info.file.response.head.code !== '200') {
      Message.error(info.file.response.body)
    }
  }

  //取消
  handleCancel = () => {
    const { onClose, form } = this.props
    form.resetFields()
    this.setState({
      fileList: [],
      categoryId: null
    })
    onClose()
  }

  //删除文件
  onRemove = () => {
    this.props.form.setFieldsValue({
      attachment: null
    })
    this.setState({
      fileList: []
    })
  }

  //添加品类型号
  onConfirm = (data) => {
    const { businessId, productName } = data[0]
    this.setState({
      modalVisible: false,
      categoryId: businessId
    })
    this.props.form.setFieldsValue({
      categoryId: productName
    })
  }
}

export default AddAppendixForm