import { Tabs, Flex } from 'antd-mobile';
import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { urlParse } from '../utils/urlParse';
import styles from './Home.less';
import Product from './product';
import My from './my';

@connect(({ info, user }) => ({
  defaultUserInfo: info.defaultUserInfo,
  currentUser: user.currentUser,
}))
export default class Home extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      sessionInitialPage: 0,
    };
    this.tabs = [
      {
        title: (
          <div className={styles.homeIcon}>
            <div className="icomoon-icon-home" />
            首页
          </div>
        ),
      },
      {
        title: (
          <div className={styles.homeIcon}>
            <div className="icomoon-icon-my" />
            我
          </div>
        ),
      },
    ];
  }
  componentWillMount() {
    // 获取sessionInitaial中的page值
    this.getSessionInitialPage();
    const { location } = this.props;
    const param = urlParse(location.search);
    const oldChannel = this.getCookie('channel');
    const newChannel = param.channel ? param.channel : '';
    if (oldChannel !== newChannel && newChannel !== '') {
      this.setCookie('channel', newChannel);
    }
  }

  componentDidMount() {
    this.props.dispatch({
      type: 'user/fetchCurrent',
    });
  }
  componentWillUnmount() {
    // 重置page值为0
    this.setSessionDefaultPage();
  }

  setCookie = (name, value) => {
    const Days = 30;
    const exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie = `${name}=${escape(value)};expires=${exp.toGMTString()}`;
  }

  getCookie = (name) => {
    if (document.cookie.length > 0) {
      let begin = document.cookie.indexOf(`${name}=`);
      if (begin !== -1) {
        begin += name.length + 1; // cookie值的初始位置
        let end = document.cookie.indexOf(';', begin); // 结束位置
        if (end === -1) {
          end = document.cookie.length; // 没有;则end为字符串结束位置
        }
        return unescape(document.cookie.substring(begin, end));
      }
    }
    return null;
  }

  // 请求用户数据
  getDefaultUserInfo = () => {
    // const { username } = this.props.currentUser;
    // if (!username) return;
    this.props.dispatch({
      type: 'info/getDefaultUserInfoEffec',
    });
  }
  /* ***************重置page值为0******************* */
  setSessionDefaultPage = () => {
    sessionStorage.setItem('sessionInitialPage', 0);
  }
  /* **************获取sessionStorage中的initialPage**************** */
  getSessionInitialPage = () => {
    const sessionInitialPage = sessionStorage.getItem('sessionInitialPage');
    if (sessionInitialPage) {
      this.setState({
        sessionInitialPage: sessionInitialPage === '1' ? 1 : 0,
      });
    }
  }

  // 退出登录
  logoutHandle = () => {
    this.props.dispatch({
      type: 'login/logout',
    });
  }

  // tab change
  changeTabHandle = (tab, index) => {
    if (!index && index !== 0) return;
    switch (index) {
      case 0:
        sessionStorage.setItem('sessionInitialPage', 0);
        this.setState({ sessionInitialPage: 0 });
        break;
      case 1:
        // console.log(index);
        this.setState({ sessionInitialPage: 1 });
        break;
      case 2:
        // console.log(index);
        break;
      default:
        // console.log(index);
        break;
    }
  }

  render() {
    const { credit, mobile } = this.props.defaultUserInfo;
    // console.log(this.props.defaultUserInfo);
    const { username, avatar, actualName } = this.props.currentUser;
    console.log(this.props.currentUser);
    const { sessionInitialPage } = this.state;

    return (
      <Flex className={`${styles.home}`} style={{ height: '100%' }}>
        <Tabs
          tabs={this.tabs}
          tabBarPosition="bottom"
          initialPage={sessionInitialPage}
          swipeable={false}
          onChange={this.changeTabHandle}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#fff' }}>
            <Product />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', backgroundColor: '#fff' }}>
            {this.state.sessionInitialPage !== 0 &&
              (<My logoutHandle={this.logoutHandle} username={username} mobile={mobile} avatar={avatar} actualName={actualName} credit={credit} getDefaultUserInfo={this.getDefaultUserInfo} />)} {/* eslint-disable-line */}
          </div>
        </Tabs>
      </Flex>
    );
  }
}

Home.propTypes = {
};

// export default connect()(IndexPage);
