import { PureComponent } from 'react'
import { Form } from 'antd'
import { connect } from 'dva'
import AddEdit from '@c/assetBase/protocol/AddEdit'

class ProtocolAdd extends PureComponent {
  render (){
    return(
      <AddEdit onSubmit={this.onSubmit}/>
    )
  }
}
const mapStateToProps = () => {
  return {
  }
}
const ProtocolAdds = Form.create()(ProtocolAdd)
export default connect(mapStateToProps)(ProtocolAdds)