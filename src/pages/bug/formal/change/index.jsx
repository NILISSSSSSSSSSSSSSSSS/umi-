import { Component } from 'react'
import BugChangeForm from '@c/BugPatch/BugChangeForm'
import BugTabsDetailAndChange from '@c/BugPatch/BugTabsDetailAndChange'
import { analysisUrl } from '@u/common'

class Change extends Component {
  constructor (props) {
    super(props)
    this.state = {

    }
  }
  componentDidMount () {

  }
  render () {
    return (
      <section className="information-register">
        <div className="main-detail-content">
          <BugChangeForm />
          <BugTabsDetailAndChange props={{ page: 'formal', type: 'change', from: 'bug', id: analysisUrl(this.props.location.search).id }} />
        </div>
      </section>
    )
  }
}

export default Change