import React, { Component } from 'react';
import classnames from 'classnames';
import PropTypes from 'prop-types';
import './index.scss';

/**
 * 这个组件主要是为了模拟路由页面，
 */

class FullPage extends Component {
  static propTypes = {
    visible: PropTypes.bool, // 控制页面的显示和隐藏
    toggleVisible: PropTypes.func, // 控制状态，浏览器的前进后退需要用到
    id: PropTypes.string, // 页面标识（如果组件有多个fullPage时需要传此参数）
  }

  static defaultProps = {
    visible: false,
    toggleVisible: () => { },
    id: '',
  }

  componentDidMount() {
    this.handleHistoryChange();
    window.addEventListener('popstate', this.handleHistoryChange); // 浏览器的前进后退时需要手动设置visible
  }

  componentDidUpdate(prevProps) {
    if (this.props.visible !== prevProps.visible && this.props.visible && !this.historyChange) {
      // 进入页面时设置id，id为空也不要紧，只要有id属性我们就知道当前进入了页面,浏览器前进按钮时也会触发，导致前进按钮和下面的代码会推两次state进去
      console.log(999);
      history.pushState({ id: this.props.id }, '');
    }
  }

  componentWillUnmount() {
    window.removeEventListener('popstate', this.handleHistoryChange);
  }

  handleHistoryChange = () => {
    console.log(777)
    this.historyChange = true;
    const state = history.state || {};
    if (state.id !== undefined) {
      if (state.id === '' || state.id === this.props.id) {
        this.props.toggleVisible(true);
      }
    } else {
      this.props.toggleVisible(false);
    }
    setTimeout(() => {
      this.historyChange = false;
      console.log(888);
    });
  }

  render() {
    const { visible, className, style = {} } = this.props;
    return (
      <div style={{ ...style, left: visible ? 0 : '100%' }} className={classnames('full-page', className)}>
        {this.props.children}
      </div>
    );
  }
}

export default FullPage;
