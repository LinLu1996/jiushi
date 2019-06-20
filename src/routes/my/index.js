import React, { Component } from 'react';
import { List } from 'antd-mobile';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import FullScreenFlex from 'components/Flex';
import store from '../../index';

import style from './index.less';

const { Item } = List;

@connect(({ info }) => ({ info }))
export default class My extends Component {
  constructor(props) {
    super(props);
    this.state = {
      complementFlag: true,
    };
  }
  componentDidMount() {
    const { getDefaultUserInfo } = this.props;
    getDefaultUserInfo();
    this.props.dispatch({
      type: 'info/getMemberInfoIsComplement',
    }).then(() => {
      const { info: { memberInfoIsComplement } } = this.props;
      console.log(memberInfoIsComplement);
      this.setState({
        complementFlag: memberInfoIsComplement,
      });
    });
  }
  // 头像显示
  showAvatar = (avatar) => {
    return avatar ? <img src={avatar} alt="用户头像" /> : <img src={require('../../assets/defaultAvatar.png')} alt="用户头像" />;
  };
  routerHandle = (router) => {
    const { dispatch } = store;
    dispatch(routerRedux.push(router));
  }
  // 跳转到登录页面
  linkToLogin = () => {
    this.routerHandle('/user/login');
  }

  goInfo = () => {
    this.routerHandle('/member/info');
  }

  render() {
    const { username, credit, mobile, logoutHandle } = this.props;
    const { defaultUserInfo } = this.props.info;
    const { complementFlag } = this.state;
    // const Avatar = (
    //   <div className={style.avatar}>
    //     {this.showAvatar(avatar)}
    //   </div>
    // );
    // 用户简介
    const userInfo = (
      <div className={style.userInfoWrapper}>
        {/* 头像 */}
        {/* {Avatar} */}
        {/* 名字 */}
        <h1>{defaultUserInfo.actualName || username}</h1>
        {/* 积分 */}
        <span><i>{credit || 0}</i><i>积分</i></span>
      </div>
    );
    // 用户信息列表
    const userInfoList = (
      <div className={style.userInfoListWrapper}>
        <List>
          <Item extra={defaultUserInfo.actualName || username}>真实姓名</Item>
          <Item extra={username}>用户名</Item>
          <Item extra={mobile}>绑定手机</Item>
        </List>
      </div >
    );
    // 完善个人信息
    const user = (
      <div className={style.userInfoListWrapper}>
        <List>
          <Item className={style.user} onClick={this.goInfo}>
            完善个人信息
            {!complementFlag &&
              (
                <span style={{ color: '#E00', fontSize: '1rem', marginLeft: '1rem', fontWeight: 'bold' }}>(+300积分)</span>
              )
            }
            <span className="icomoon-icon-rt" />
          </Item>
        </List>
      </div >
    );
    // 用户积分信息列表
    const userOrderInfo = (
      <div className={style.userOrderInfoWrapper}>
        <List>
          <Item arrow="horizontal" onClick={() => this.routerHandle('/member/orders')}>我的订单</Item>
          <Item arrow="horizontal" onClick={() => this.routerHandle('/member/scores')}>我的积分</Item>
          <Item arrow="horizontal" onClick={() => this.routerHandle('/member/address?type=1')}>收货地址</Item>
        </List>
      </div>
    );
    // 底部按钮
    const btn = (
      <a onClick={logoutHandle}>退出</a>
    );
    const Content = (
      <div className={style.contentWrapper}>
        <div className={style.content}>
          {userInfo}
          {userInfoList}
          {user}
          {userOrderInfo}
          <div className={style.btnWrapper}>
            {btn}
          </div>
        </div>
      </div>
    );
    // const ContentNoLogin = (
    //   <div className={`${style.contentWrapper} ${style.noContentWrapper}`}>
    //     {/* 头像 */}
    //     {Avatar}
    //     {/* 跳转登录 */}
    //     <div className={style.linkToLogin} onClick={this.linkToLogin}>
    //       前往登录
    //       <span className="icomoon-icon-right" />
    //     </div>
    //   </div>
    // );
    return (
      <FullScreenFlex className="myWrapper" style={{ hieght: '100%' }}>
        {/* {username ? Content : ContentNoLogin} */}
        {Content}
      </FullScreenFlex>
    );
  }
}
