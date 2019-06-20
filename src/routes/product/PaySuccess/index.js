import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Flex, Button, Icon } from 'antd-mobile';
import styles from './index.less';
import MyHeader from '../../../components/MyHeader';

@connect(({ detail }) => ({ detail }))
export default class AddressList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '支付成功',
    };
  }

  componentWillMount() {
    // 清空paydata
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/clearPayData',
      payload: null,
    });
  }

  goIndex = () => {
    this.props.dispatch(routerRedux.replace('/'));
  }
  goOrders = () => {
    this.props.dispatch(routerRedux.replace({ pathname: '/member/orders', query: { backStep: -2 } }));
  }

  render() {
    return (
      <Flex direction="column" className={styles.addressList}>
        <MyHeader title={this.state.title} goBackStep={-2} />
        <div className={styles.detail}>
          <p className={styles.a}><Icon type="check-circle" style={{ fill: '#4BB837', width: '5rem', height: '5rem' }} /></p>
          <p className={styles.b}>支付成功</p>
          {/* <p className={styles.c}>订单号：3195330519636</p> */}
          <div className={styles.d}>
            <div><Button onClick={this.goIndex}>返回首页</Button></div>
          </div>
          <div style={{ marginTop: 15 }}><a style={{ textDecoration: 'underline' }} onClick={this.goOrders}>我的订单</a></div>
        </div>
      </Flex>
    );
  }
}
