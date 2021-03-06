// @flow
import * as ProvisionGen from '../../actions/provision-gen'
import * as LoginGen from '../../actions/login-gen'
import * as Constants from '../../constants/provision'
import HiddenString from '../../util/hidden-string'
import Password from '.'
import React, {Component} from 'react'
import {connect} from '../../util/container'
import {type RouteProps} from '../../route-tree/render-route'
import * as WaitingConstants from '../../constants/waiting'
import flags from '../../util/feature-flags'

type OwnProps = {|
  ...$Exact<RouteProps<{}, {}>>,
  prompt: string,
  username: ?string,
  waitingForResponse: boolean,
|}

type State = {
  showTyping: boolean,
  password: ?string,
}

type Props = {
  prompt: string,
  onSubmit: (password: string) => void,
  onBack: () => void,
  onForgotPassword: () => void,
  waitingForResponse: boolean,
  error?: ?string,
  username: ?string,
}

// TODO remove this class
class _Password extends Component<Props, State> {
  state: State

  constructor(props: Props) {
    super(props)
    this.state = {password: null, showTyping: false}
  }

  onChange(password: string) {
    this.setState({password})
  }

  render() {
    return (
      <Password
        error={this.props.error}
        onBack={this.props.onBack}
        prompt={this.props.prompt}
        username={this.props.username}
        waitingForResponse={this.props.waitingForResponse}
        onForgotPassword={() => {
          this.props.onForgotPassword()
          this.props.onBack()
        }}
        password={this.state.password}
        onSubmit={() => this.props.onSubmit(this.state.password || '')}
        onChange={p => this.onChange(p)}
        showTyping={this.state.showTyping}
        toggleShowTyping={showTyping => this.setState({showTyping})}
      />
    )
  }
}

const mapStateToProps = state => ({
  error: state.provision.error.stringValue(),
  waitingForResponse: WaitingConstants.anyWaiting(state, Constants.waitingKey),
})

const mapDispatchToProps = (dispatch, ownProps: OwnProps) => ({
  onBack: () => {
    !flags.useNewRouter && dispatch(ownProps.navigateUp())
  },
  onForgotPassword: () => dispatch(LoginGen.createLaunchForgotPasswordWebPage()),
  onSubmit: (password: string) =>
    dispatch(ProvisionGen.createSubmitPassword({password: new HiddenString(password)})),
})

export default connect<OwnProps, _, _, _, _>(
  mapStateToProps,
  mapDispatchToProps,
  (s, d, o) => ({...o, ...s, ...d})
)(_Password)
