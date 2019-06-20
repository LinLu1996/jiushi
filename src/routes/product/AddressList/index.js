import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Flex, Button, Modal } from 'antd-mobile';
import { urlParse } from '../../../utils/urlParse';
import styles from './index.less';
import MyHeader from '../../../components/MyHeader';


@connect(({ detail }) => ({ detail }))
export default class AddressList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '收货地址',
      addList: [],
      hideFlag: false,
    };
  }

  componentWillMount() {
    const { location } = this.props;
    const param = urlParse(location.search);
    // 隐藏选择
    if (param.type === '1') {
      this.setState({
        hideFlag: true,
      });
    }
    this.getNormalAddress();
  }

  componentDidMount() {
    sessionStorage.setItem('sessionInitialPage', 1);
  }

  // 获取收货地址
  getNormalAddress = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/fetchConfirmInfo',
    }).then(() => {
      const { detail: { confirmInfoData: { addList } } } = this.props;
      this.setState({
        addList,
      });
    });
  }

  // 收货地址
  goAddAddress = () => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/addAddress',
      })
    );
  }

  // 编辑地址
  editAddress = (item) => {
    const { dispatch } = this.props;
    // 保存编辑的数据
    dispatch({
      type: 'detail/fetchEditAddress',
      payload: item,
    });
    dispatch(routerRedux.push('/addAddress?type=edit'));
  }

  // 删除地址
  delAddress = (item) => {
    Modal.alert('删除地址', '确定删除此地址?', [
      { text: '取消', onPress: () => console.log('cancel'), style: 'default' },
      { text: '确定', onPress: () => this.del(item.id) },
    ]);
  }
  del = (id) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/fetchAddressDelete',
      payload: id,
    }).then(() => {
      this.getNormalAddress();
    });
  }

  // 默认地址
  defaultAddress = (item) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/fetchDefaultAddress',
      payload: item,
    });
    const timer = setTimeout(() => {
      window.history.go(-1);
      clearTimeout(timer);
    }, 1000);
  }

  /** **********创建地址***************** */
  RenderAddress = () => {
    const { addList } = this.state;
    const arr = [];
    addList.map((item) => {
      return arr.push(
        <div className={styles.detail}>
          <div className={styles.title}>
            <span>姓名：{item.receiver}</span>
            <span>
              {!this.state.hideFlag &&
                <a className={styles.default} onClick={() => { this.defaultAddress(item); }}>选择</a>
              }
              <a className={styles.edit} onClick={() => { this.editAddress(item); }}>编辑</a>
              <a onClick={() => { this.delAddress(item); }}>删除</a>
            </span>
          </div>
          <div className={styles.content}>
            <p>地址：{item.detailedAddress} {item.address}</p>
            <p>电话：{item.phone}</p>
            <p>邮箱：{item.email}</p>
          </div>
        </div>
      );
    });
    return arr;
  };

  render() {
    return (
      <Flex direction="column" className={styles.addressList}>
        <MyHeader title={this.state.title} />
        {this.RenderAddress()}
        <div className={styles.btn}>
          <Button onClick={this.goAddAddress}>新增地址</Button>
        </div>
      </Flex>
    );
  }
}
