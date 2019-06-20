import React, { Component } from 'react';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import { Flex, Button, Radio, List, Toast, Modal } from 'antd-mobile';
import { routerRedux } from 'dva/router';
import wx from 'weixin-js-sdk';
import { urlParse } from '../../../utils/urlParse';
import styles from './index.less';
import MyHeader from '../../../components/MyHeader';

const { RadioItem } = Radio;
const { alert } = Modal;

@connect(({ detail }) => ({ detail }))
export default class Pay extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '支付订单',
      orderNo: '',
      showPrice: 0,
      hour: 0,
      minute: 0,
      second: 0,
    };
  }

  componentWillMount() {
    clearInterval(this.timer2);
    const { dispatch, location } = this.props;
    const param = urlParse(location.search);
    this.setState({
      orderNo: param.orderNo,
      showPrice: param.orderPrice,
    });

    // 清空h5支付地址
    dispatch({
      type: 'detail/clearOrderUrl',
      payload: null,
    });

    // 清空paydata
    dispatch({
      type: 'detail/clearPayData',
      payload: null,
    });

    // 获取订单时间
    dispatch({
      type: 'detail/fetchOrderTime',
      payload: param.orderNo,
    }).then(() => {
      const { detail: { orderTime } } = this.props;
      // console.log(this.props);
      if (orderTime && orderTime.createTime && orderTime.expireTime) {
        this.countDownTime(orderTime.createTime, orderTime.expireTime);
      }
    });

    // 获取配置信息
    const codes = window.location.href.split('?');
    const codeUrl = codes[1].split('&')[0];
    const code = codeUrl.split('=')[1];
    const postparam = {
      orderNo: param.orderNo,
      code,
    };
    dispatch({
      type: 'detail/getJsapi',
      payload: postparam,
    }).then(() => {
      const { detail: { jsapi } } = this.props;
      wx.config({
        appId: jsapi.appId,
        timestamp: jsapi.timeStamp,
        nonceStr: jsapi.nonceStr,
        signature: jsapi.paySign,
        jsApiList: ['chooseWXPay'],
      });
    });
  }

  componentWillUnmount() {
    clearInterval(this.timer2);
  }

  getPayStatus = (count, orderNo) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/clearPayStatus',
      payload: null,
    });
    dispatch({
      type: 'detail/fetchPayStatus',
      payload: orderNo,
    }).then(() => {
      const { detail: { payStatus } } = this.props;
      if (payStatus) {
        if (payStatus === 7 || payStatus === '7') {
          dispatch(routerRedux.replace('/paySuccess'));
          return false;
        } else if (payStatus === 6 || payStatus === '6') {
          dispatch(routerRedux.replace('/order/payClose'));
          return false;
        } else if (count < 5) {
          this.timer = setTimeout(() => {
            clearTimeout(this.timer);
            this.getPayStatus(count + 1);
          }, 1000);
        } else if (count >= 5) {
          dispatch(routerRedux.push('/payTimeOut'));
        }
      }
    });
  }

  weixinPay = () => {
    const { detail: { jsapi } } = this.props;
    if (jsapi) {
      wx.chooseWXPay({
        timestamp: jsapi.timeStamp,
        nonceStr: jsapi.nonceStr,
        package: jsapi.package,
        signType: 'MD5',
        paySign: jsapi.paySign,
        success: () => {
          this.props.dispatch(
            routerRedux.replace({
              pathname: '/paySuccess',
            })
          );
        },
        fail: () => {
          this.props.dispatch(
            routerRedux.replace({
              pathname: '/order/payClose',
            })
          );
        },
      });
    }
  }

  countDownTime = (createTime, expireTime) => {
    const times = createTime.replace(new RegExp('-', 'gm'), '/');
    const start = (new Date(times)).getTime();
    const that = this;
    this.timer2 = setInterval(() => {
      console.log(1);
      const now = Date.parse(new Date());
      let leftsecond = Math.floor((start + expireTime * 60 * 1000 - now) / 1000);
      // let day = 0;
      let hour = 0;
      let minute = 0;
      let second = 0;
      if (leftsecond > 0) {
        // day = Math.floor( leftsecond / 3600 / 24);
        hour = Math.floor(leftsecond / 3600 % 24);
        minute = Math.floor(leftsecond / 60 % 60);
        second = Math.floor(leftsecond % 60);
      }
      if (hour <= 9) hour = `0${hour}`;
      if (minute <= 9) minute = `0${minute}`;
      if (second <= 9) second = `0${second}`;
      this.setState({
        hour,
        minute,
        second,
      });
      leftsecond -= 1;
      if (leftsecond < 0) {
        clearInterval(this.timer2);
        Toast.info('订单已取消', 2);
        const times2 = setTimeout(() => {
          clearTimeout(times2);
          that.props.dispatch(
            routerRedux.push({
              pathname: '/order/payClose',
            })
          );
        }, 2000);
      }
    }, 1000);
  }

  handelSubmit = () => {
    const ua = navigator.userAgent.toLowerCase();
    if (!ua.match(/micromessenger/i)) {
      const { dispatch } = this.props;
      // window.location.href = 'https://wx.tenpay.com/cgi-bin/mmpayweb-bin/checkmweb?prepay_id=wx072326305244552bc3e5a2e11561392194&package=78400509&redirect_url=https%3A%2F%2Fpay.intellisports.cn%2Fcallback%2Fweixin';
      dispatch({
        type: 'detail/fetchOrderUrl',
        payload: this.state.orderNo,
      }).then(() => {
        console.log(this.props);
        const { detail: { orderUrl } } = this.props;
        if (orderUrl) {
          window.location.href = orderUrl;
        }
        alert('请确认', <div>微信支付是否已完成</div>, [
          { text: '已完成支付', onPress: () => this.getPayStatus(0, this.state.orderNo) },
          { text: '支付遇到问题，重新支付', onPress: () => console.log('第1个按钮被点击了') },
        ]);
      });
    } else {
      this.weixinPay();
    }
  }

  render() {
    const { hour, minute, second } = this.state;
    return (
      <Flex direction="column" className={styles.addressList}>
        <MyHeader title={this.state.title} />
        <div className={styles.detail}>
          <p className={styles.a}>距离支付时间还剩：{`${hour}时${minute}分${second}秒`}</p>
          <p className={styles.b}>订单号：{this.state.orderNo}</p>
          <p className={styles.c}>￥{this.state.showPrice}</p>
        </div>
        <div className={styles.detail}>
          <p className={styles.d}>选择支付方式</p>
          <List>
            <RadioItem key={1} checked>
              <div className="icomoon-icon-wx">
                <span className="path1" />
                <span className="path2" />
                <span className="path3" />
                <span className="path4" />
              </div>
            </RadioItem>
          </List>
        </div>
        <div className={styles.btn}>
          <Button onClick={this.handelSubmit} disabled={this.state.btnDisable}>立即支付</Button>
        </div>
      </Flex>
    );
  }
}
