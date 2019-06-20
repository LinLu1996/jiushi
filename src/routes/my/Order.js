import { Icon, Modal, NavBar, Tabs, Toast } from 'antd-mobile';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import React, { PureComponent } from 'react';
import OrderCard from '../../components/OrderCard';
import store from '../../index';
import PullLoadRefresh from '../../components/PullLoadRefresh';
import style from './Order.less'; // eslint-disable-line

const { alert } = Modal;

function successToast(content) {
  Toast.success(content, 1);
}

function failToast(content) {
  Toast.fail(content, 1);
}

@connect(({ order, detail, loading }) => ({
  orderAll: order.orderAll,
  orderToPay: order.orderToPay,
  orderCompleted: order.orderCompleted,
  orderEsc: order.orderEsc,
  cancelStatus: order.cancelStatus,
  detail,
  loading: loading.effects['order/fetchProduct'],
}))
export default class Order extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      0: true,
      1: false,
      7: false,
      6: false,
      sub: 0,
      initializing: 1,
    };
  }

  componentDidMount() {
    this.fetchOrderHandle(4, 0, 0).then(() => { this.setState({ initializing: 2 }); });
    this.setTabMounted(0);
    // 设置底部菜单的page值为1
    this.setSessionStorage();
  }

  /* ***************设置底部菜单的page值为1**************** */
  setSessionStorage = () => {
    sessionStorage.setItem('sessionInitialPage', 1);
  }

  // 根据状态值获取hasMore
  getHasMore = (status) => { // status: Tab sub 状态值
    const { orderAll, orderToPay, orderCompleted, orderEsc } = this.props;
    switch (status) {
      case 0:
        return orderAll.hasMore;
      case 1:
        return orderToPay.hasMore;
      case 2:
        return orderCompleted.hasMore;
      case 3:
        return orderEsc.hasMore;
      default:
        return '';
    }
  }

  // 根据指定状态order的page  return page：number
  getOrderPage = (sub) => { // status: Tab sub 状态值
    const { orderAll, orderToPay, orderCompleted, orderEsc } = this.props;
    switch (sub) {
      case 0:
        return orderAll.page;
      case 1:
        return orderToPay.page;
      case 2:
        return orderCompleted.page;
      case 3:
        return orderEsc.page;
      default:
        return '';
    }
  }

  // 设置tab页已经点击加载完毕
  setTabMounted = (sub) => {
    this.setState({
      [sub]: true,
    });
  }

  // 滑动刷新页面
  getPullToRefreshData = (resolve) => {
    const flag = true;
    const { sub } = this.state;
    const hasMore = this.getHasMore(sub);
    const page = this.getOrderPage(sub);
    if (!hasMore) {
      return false;
    }
    this.fetchOrderHandle(4, this.subToStatus(sub),
      page, 10, flag).then(() => resolve && resolve());
  }

  pullRefresh = (resolve) => {
    const { sub } = this.state;
    this.fetchOrderHandle(4, this.subToStatus(sub),
      0, 10, false).then(() => resolve && resolve());
  }

  // tab标签页切换
  tabsChangeHandle(cancelStatus) { // key:标签页的key number；cancelFlassh:是否是取消订单后的刷新列表 boolearn
    if (cancelStatus) {
      this.fetchOrderHandle(4, 0, 0);
      this.fetchOrderHandle(4, '1', 0);
      this.fetchOrderHandle(4, '6', 0);
      this.fetchOrderHandle(4, '7', 0);
    }
  }

  // 标签页onChange事件
  tabsOnChangeHandle = (tab, index) => {
    // this.mountOrderTab(tab);
    this.setState({
      sub: index,
    }, () => this.mountOrderTab(tab));
  }

  // 将orderNo保存到sessionStorage中
  saveOrderNoToSession = (item) => {
    sessionStorage.setItem('orderNo', item.orderNo);
    sessionStorage.setItem('status', item.status);
  }

  // 跳转订单详情
  linkToOrderDetail = (expireTime) => {
    const { dispatch } = store;
    // 路由跳转
    dispatch(routerRedux.push(`/order/detail?expireTime=${expireTime}`));
  }
  // 列表点击事件方法
  listOnclick = (item) => {
    this.linkToOrderDetail(item.expireTime);
    this.saveOrderNoToSession(item);
  }

  cancelCallback = (cancelStatus) => {
    // const { cancelStatus } = this.props;
    if (cancelStatus === 'OK') {
      successToast('取消订单成功');
      this.tabsChangeHandle(cancelStatus);
    } else {
      failToast('取消订单失败');
    }
  }

  /* ***************取消订单Handle**************** */
  cancelHandle = (e, orderid) => {
    e.stopPropagation();
    const that = this;
    alert('提示', '是否确认取消该订单', [
      { text: '取消', onPress: () => { } },
      {
        text: '确定',
        onPress: () => {
          that.props.dispatch({
            type: 'order/cancelOrder',
            payload: {
              orderid,
            },
          }).then((val) => {
            let status = '';
            if (val.code === 200) {
              status = 'OK';
            } else {
              status = 'NO';
            }
            this.cancelCallback(status);
          });
        },
      },
    ]);
  }

  subToStatus = (sub) => {
    switch (sub) {
      case 1:
        return '1';
      case 2:
        return '7';
      case 3:
        return '6';
      default:
        return 0;
    }
  }

  // 发起order请求数据方法
  // timeInterval:时间段；status：订单状态；page：页数
  fetchOrderHandle = (timeInterval, status, page, limit = 10, flag = false) => {
    return this.props.dispatch({
      type: 'order/fetchProduct',
      payload: {
        timeInterval,
        status: status === 0 ? status : status.toString(),
        page: page + 1,
        limit,
        flag,
      },
    });
  }

  // tab页加载请求数据
  mountOrderTab = (tab) => {
    const { sub } = tab;
    // if (!tab || !sub) return null;
    // if (!this.getHasMore(sub)) {
    //   return false;
    // }
    if (!this.state[sub]) {
      this.fetchOrderHandle(4, sub, 0, 10);
      this.setTabMounted(sub);
    }
    // 设置tab页已经点击
  }

  // 支付
  goPay = (e, orderNo, showPrice) => {
    e.stopPropagation();
    // const { dispatch } = store;
    const ua = navigator.userAgent.toLowerCase();
    if (!ua.match(/micromessenger/i)) {
      this.props.dispatch(routerRedux.push(`/pay?orderNo=${orderNo}&orderPrice=${showPrice}`));
    } else {
      this.props.dispatch({
        type: 'detail/getAuthorize',
        payload: orderNo,
      }).then(() => {
        const { detail: { authorize } } = this.props;
        console.log(authorize);
        if (authorize) {
          window.location.href = authorize;
        }
      });
    }
  }

  render() {
    console.log('render is again start!!!!!');
    const { orderAll, orderToPay, orderCompleted, orderEsc } = this.props;
    const { sub } = this.state;
    const tabs = [
      { title: '全部', sub: 0 },
      { title: '待付款', sub: 1 },
      { title: '已完成', sub: 7 },
      { title: '已取消', sub: 6 },
    ];

    const Nav = ({ goBackStep = -1 }) => (
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => history.go(goBackStep)}
      >
        我的订单
      </NavBar>
    );

    const TabOrder = (  // eslint-disable-line
      <div className="orderGlobal" style={{ width: '100%', height: '100%' }}>
        <Nav />
        <Tabs
          tabs={tabs}
          page={sub}
          swipeable={false}
          onChange={this.tabsOnChangeHandle}
          tabBarPosition="top"
        >
          <div style={{ backgroundColor: '#f8f8f8' }}>
            <PullLoadRefresh
              hasMore={orderAll.hasMore}
              refresh={this.pullRefresh}
              loadMore={this.getPullToRefreshData}
            >
              <OrderCard
                orders={orderAll.rows}
                itemClick={this.listOnclick}
                onCancel={this.cancelHandle}
                goPay={this.goPay}
              />
            </PullLoadRefresh>
          </div>
          <div style={{ display: 'flex', marginBottom: '20px', backgroundColor: '#fff' }}>
            <PullLoadRefresh
              hasMore={orderToPay.hasMore}
              refresh={this.pullRefresh}
              loadMore={this.getPullToRefreshData}
            >
              <OrderCard
                orders={orderToPay.rows}
                itemClick={this.listOnclick}
                onCancel={this.cancelHandle}
                goPay={this.goPay}
              />
            </PullLoadRefresh>
          </div>
          <div style={{ display: 'flex', backgroundColor: '#fff' }}>
            <PullLoadRefresh
              hasMore={orderCompleted.hasMore}
              refresh={this.pullRefresh}
              loadMore={this.getPullToRefreshData}
            >
              <OrderCard
                orders={orderCompleted.rows}
                itemClick={this.listOnclick}
                onCancel={this.cancelHandle}
                goPay={this.goPay}
              />
            </PullLoadRefresh>
          </div>
          <div style={{ display: 'flex', backgroundColor: '#fff' }}>
            <PullLoadRefresh
              hasMore={orderEsc.hasMore}
              refresh={this.pullRefresh}
              loadMore={this.getPullToRefreshData}
            >
              <OrderCard
                orders={orderEsc.rows}
                itemClick={this.listOnclick}
                onCancel={this.cancelHandle}
                goPay={this.goPay}
              />
            </PullLoadRefresh>
          </div>
        </Tabs>
      </div >
    );
    return (
      <div style={{ width: '100%' }}>
        {/* {<ActivityIndicator animating={loading} toast />} */}
        {TabOrder}
      </div>
    );
  }
}
