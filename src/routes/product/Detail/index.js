import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import moment from 'moment';
import { Flex, Button, Modal, Tabs } from 'antd-mobile';
import { urlParse } from '../../../utils/urlParse';
import Spec from '../Spec';
import styles from './index.less';
import MyHeader from '../../../components/MyHeader';
import timeBg from '../../../assets/time.jpg';


@connect(({ detail }) => ({ detail }))
export default class Detail extends Component {
  constructor(props) {
    super(props);
    this.param = { ...urlParse(props.location.search), categoryType: '1' };
    this.state = {
      title: '商品详情',
      introduction: {
        __html: '订单详情',
      },
      parameter: null,
      categoryType: '1',
      image: '',
      // validStartDateStr: '',
      // validEndDateStr: '',
      startDate: '',
      endDate: '',
      venueName: '',
      buttonFlag: true,
      validStartDate: '',
      // 倒计时时间
      day: 0,
      hour: 0,
      minute: 0,
      second: 0,
      // 规格弹出框
      modalPopup: false,
      // 最低价
      lowerPrice: 0,
      upperPrice: 0,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    // 先清空缓存
    dispatch({
      type: 'detail/clearCurrent',
      payload: {},
    });
    // const param = { ...urlParse(location.search), categoryType: '1' };
    const productType = this.param.categoryType === '1' ? 'detail/fetchOne' : 'detail/fetchNormalOne';
    dispatch({
      type: productType,
      payload: this.param.id,
    }).then(() => {
      // console.log(this.props);
      const { detail: { current, current: { skuList } } } = this.props;
      const {
        image,
        // validStartDateStr,
        // validEndDateStr,
        startDate,
        endDate,
        venueName,
        introduction,
        validStartDate,
      } = current;
      let parameter = null;
      if (current.notes) {
        parameter = current.notes;
      } else {
        parameter = current.parameterValues;
      }
      this.setState({
        image,
        // validStartDateStr,
        // validEndDateStr,
        startDate,
        endDate,
        venueName,
        introduction: {
          __html: introduction,
        },
        validStartDate,
        parameter,
      });
      if (this.param.categoryType === '1') {
        this.setState({
          buttonFlag: current.validStatus,
        });
      }
      // 价格区间
      this.getPrice(skuList);
    });
    this.getType();
    const oldChannel = this.getCookie('channel');
    const newChannel = this.param.channel ? this.param.channel : '';
    if (oldChannel !== newChannel && newChannel !== '') {
      this.setCookie('channel', newChannel);
    }
  }

  componentWillUnmount() {
    clearInterval(this.state.timer);
  }

  onClose = key => () => {
    this.setState({
      [key]: false,
    });
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

  getType = () => {
    // const { location } = this.props;
    // const param = urlParse(location.search);
    this.setState({
      categoryType: this.param.categoryType,
    });
  }

  getPrice = (skuList) => {
    if (skuList) {
      const arr = [];
      skuList.forEach((element) => {
        arr.push(parseFloat(element.showPrice));
      });
      const priceArr = arr.sort(this.compareNum);
      if (priceArr.length === 1) {
        this.setState({
          lowerPrice: priceArr[0],
        });
        return false;
      }
      if (priceArr.length > 1) {
        this.setState({
          lowerPrice: priceArr[0],
          upperPrice: priceArr[priceArr.length - 1],
        });
        return false;
      }
    }
  }

  compareNum = (x, y) => {
    return x - y;
  };

  // 选择规格
  goSpec = () => {
    this.setState({
      modalPopup: true,
    });
    // const { dispatch } = this.props;
    // dispatch(
    //   routerRedux.push({
    //     pathname: '/spec',
    //   })
    // );
  }

  // 规格参数
  parameter = () => {
    const { parameter, categoryType } = this.state;
    // console.log(parameter);
    if (parameter && parameter.length > 0 && categoryType === '1') {
      const obj = JSON.parse(this.state.parameter);
      return obj.map((item, index) => {
        const i = index;
        return (
          <div className={styles.parameter} style={{ marginTop: '1rem' }} key={i}>
            <div className={styles.parameterTitle}>{item.title}</div>
            <div style={{ padding: '20px' }}>{item.value}</div>
          </div>
        );
      });
    } else if (parameter && parameter.length > 0 && categoryType === '2') {
      const obj = JSON.parse(this.state.parameter);
      return obj.map((item, index) => {
        const i = index;
        return (
          <div className={styles.parameter} style={{ marginTop: '1rem' }} key={i}>
            <div className={styles.parameterTitle}>{item.name}</div>
            {this.renderParameter(item.parameters)}
          </div>
        );
      });
    }
  };
  /** ****************渲染倒计时************************ */
  countDownTime = (timeData) => {
    const times = timeData.replace(new RegExp('-', 'gm'), '/');
    const start = (new Date(times)).getTime();
    this.state.timer = setInterval(() => {
      clearInterval(this.state.timer);
      const now = Date.parse(new Date());
      let leftsecond = Math.floor((start - now) / 1000);
      let day = 0;
      let hour = 0;
      let minute = 0;
      let second = 0;
      if (leftsecond > 0) {
        day = Math.floor(leftsecond / 3600 / 24);
        hour = Math.floor(leftsecond / 3600 % 24);
        minute = Math.floor(leftsecond / 60 % 60);
        second = Math.floor(leftsecond % 60);
      }
      if (hour <= 9) hour = `0${hour}`;
      if (minute <= 9) minute = `0${minute}`;
      if (second <= 9) second = `0${second}`;
      // console.log(second);
      this.setState({
        day,
        hour,
        minute,
        second,
      });
      leftsecond -= 1;
      if (leftsecond <= 0) {
        clearInterval(this.state.timer);
      }
    }, 1000);
  }
  renderTime = () => {
    const { validStartDate, day, hour, minute, second } = this.state;
    if (validStartDate) {
      this.countDownTime(validStartDate);
    }
    return (
      <div className={styles.timeItem}>
        <img src={timeBg} alt="时间" />
        <div className={styles.text}>
          <p style={{ fontSize: '.6rem' }}>开售日期：{validStartDate}</p>
          <p className={styles.time}>{`${day}天${hour}小时${minute}分${second}秒`}</p>
          <p><span>剩余时间</span></p>
        </div>
      </div>
    );
  }

  /** ****************渲染价格时间************************ */
  renderMoney = () => {
    const { startDate, endDate } = this.state;
    return (
      <div>
        <p className={styles.time}>
          {/* 比赛日期：{validStartDateStr &&
          moment(validStartDateStr).format('YYYY-MM-DD')} ~ {validEndDateStr &&
          moment(validEndDateStr).format('YYYY-MM-DD')} */}
          时间：{startDate &&
            moment(startDate).format('YYYY-MM-DD')} {endDate && '~'} {endDate &&
              moment(endDate).format('YYYY-MM-DD')}
        </p>
        <p className={styles.price}>￥{this.state.lowerPrice}{this.state.upperPrice !== '0' && this.state.upperPrice !== 0 && this.state.upperPrice && `~${this.state.upperPrice}`}</p>
        <p className={styles.address}>{this.state.venueName}</p>
      </div>
    );
  }

  renderEventInfo = () => {
    const { detail: { current } } = this.props;
    const { categoryType } = this.state;
    // console.log(categoryType === '2');
    if (categoryType === '1' && typeof current.validStatus !== 'boolean') return;
    return (
      <div>
        <h2>{current.productName}</h2>
        {current && !current.validStatus && categoryType === '1' && this.renderTime()}
        {current && current.validStatus && categoryType === '1' && this.renderMoney()}
        {/* {current && categoryType === '2' && this.renderMoney()} */}
      </div>
    );
  };

  renderParameter = (parameters) => {
    return parameters.map((item) => {
      return (
        <div key={item.key}><span style={{ display: 'inline-block', width: '200px', borderRight: '1px solid #ddd', textAlign: 'right', paddingRight: '10px', fontSize: '.8rem' }}>{item.name}</span><span style={{ paddingLeft: '10px', fontSize: '.8rem' }}>{item.value}</span></div>
      );
    });
  };

  render() {
    const { categoryType } = this.state;
    let tabs = [];
    if (categoryType && categoryType === '1') {
      tabs = [
        { title: '票务信息', sub: '1' },
        { title: '购票须知', sub: '2' },
      ];
    } else if (categoryType && categoryType === '2') {
      tabs = [
        { title: '商品信息', sub: '1' },
        { title: '商品参数', sub: '2' },
      ];
    }
    const navBack = this.props.history.length <= 2 && (() => this.props.dispatch(routerRedux.push('/credit')));
    return (
      <Flex direction="column" className={styles.detail} style={{ height: `${document.documentElement.clientHeight}px` }}>
        <MyHeader
          title={this.state.title}
          onBack={navBack}
        />
        <div className={styles.product}>
          <img src={this.state.image} alt="商品图片" />
          {this.renderEventInfo()}
        </div>
        <div className={styles.details}>
          <Tabs
            tabs={tabs}
            initialPage={0}
            swipeable={false}
          >
            <div style={{ backgroundColor: '#fff', marginBottom: '3rem' }}>
              <div dangerouslySetInnerHTML={this.state.introduction} />
            </div>
            <div style={{ backgroundColor: '#fff' }}>
              {this.parameter()}
            </div>
          </Tabs>
        </div>
        <div className={styles.btn}>
          <Button onClick={this.goSpec} disabled={!this.state.buttonFlag}>立即购买</Button>
        </div>
        <Modal
          popup
          visible={this.state.modalPopup}
          onClose={this.onClose('modalPopup')}
          animationType="slide-up"
        >
          <Spec
            categoryType={this.state.categoryType}
          />
        </Modal>
      </Flex>
    );
  }
}
