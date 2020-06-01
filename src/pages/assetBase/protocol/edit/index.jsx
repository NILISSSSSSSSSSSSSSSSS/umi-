import { PureComponent } from 'react'
import {  Form } from 'antd'
import { connect } from 'dva'
import { analysisUrl } from '@u/common'
import AddEdit from '@c/assetBase/protocol/AddEdit'

class ProtocolEdit extends PureComponent {
  render (){
    return(
      <AddEdit businessId = {analysisUrl(this.props.location.search).stringId}/>
    )
  }
}
const mapStateToProps = ({ Alarms }) => {
  return {
  }
}
const ProtocolEdits = Form.create()(ProtocolEdit)
export default connect(mapStateToProps)(ProtocolEdits)