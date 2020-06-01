import { Component } from 'react'
import RegisterForm from '../../components/BaseSetting/RegisterForm'

class RegisterForms extends Component {
  constructor (props) {
    super(props)
    this.state = {
    }
  }
  componentDidMount () {
  }
  UNSAFE_componentWillReceiveProps (nextProps) {
  }
  render () {
    return (
      <RegisterForm history={this.props.history}/>
    )
  }
}
export default RegisterForms