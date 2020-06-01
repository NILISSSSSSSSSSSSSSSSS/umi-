import { Component } from 'react'
import BaseDetailInfo from '@/components/BaseSetting/BaseDetail'
import { analysisUrl } from '@u/common'
import api from '@/services/api'

class BaseDetail extends Component {
  constructor (props) {
    super(props)
    let { stringId } = analysisUrl(this.props.location.search)
    this.state = {
      detailData: {},
      stringId
    }
  }

  componentDidMount () {
    this.getDetail(this.state.stringId)
  }

  UNSAFE_componentWillReceiveProps ( nextProps ) {

  }

  render () {
    const { detailData } = this.state
    return (
      <div className="main-detail-content">
        <BaseDetailInfo body={detailData} history={this.props.history}/>
      </div>
    )
  }
  getDetail=(id)=>{
    api.queryBaseline({ stringId: id }).then(res => {
      this.setState({
        detailData: res.body
      })
    })
  }
}

export default BaseDetail
