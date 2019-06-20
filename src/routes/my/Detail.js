import { connect } from 'dva';
import React, { PureComponent } from 'react';
import FullScreenFlex from 'components/Flex';
import { NavBar, Icon, TextareaItem } from 'antd-mobile';
import { urlParse } from '../../utils/urlParse';

import style from './Detail.less';

@connect(({ order, info }) => ({
  info,
  orderDetailReducers: order.orderDetailReducers,
}))
export default class Detail extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      orderNo: '', // 订单编号
      status: null, // 订单状态
    };
  }
  componentWillMount() {
    const orderNo = sessionStorage.getItem('orderNo');
    const status = sessionStorage.getItem('status');
    const { location } = this.props;
    const param = urlParse(location.search);
    this.setState({
      orderNo,
      status,
      expireTime: param.expireTime,
    });
    // 获取证件类型列表
    this.props.dispatch({
      type: 'info/getCardTypeEffec',
    });
    this.getDetailInfo(orderNo);
  }
  // 请求详情数据
  getDetailInfo = (orderNo) => {
    this.props.dispatch({
      type: 'order/fetchOrderDetail',
      payload: { orderNo },
    });
  }

  outTime = (createTime, expireTime) => {
    if (createTime && expireTime) {
      const times = createTime.replace(new RegExp('-', 'gm'), '/');
      const timesStr = (new Date(times)).getTime();
      const outTimeStr = new Date(timesStr + expireTime * 60 * 1000);
      const year = outTimeStr.getFullYear();
      let month = outTimeStr.getMonth() + 1;
      if (month < 10) {
        month = `0${month}`;
      }
      let day = outTimeStr.getDate();
      if (day < 10) {
        day = `0${day}`;
      }
      let hour = outTimeStr.getHours();
      if (hour < 10) {
        hour = `0${hour}`;
      }
      let min = outTimeStr.getMinutes();
      if (min < 10) {
        min = `0${min}`;
      }
      let second = outTimeStr.getSeconds();
      if (second < 10) {
        second = `0${second}`;
      }
      const outTime = `${year}-${month}-${day} ${hour}:${min}:${second}`;
      return outTime;
    }
  }

  /** **********普通发票显示***************** */
  normalInvoice = () => {
    const { invoiceTitle, invoiceContext } = this.props.orderDetailReducers;
    const content = invoiceContext ? '商品类别' : '商品明细';
    return (
      <div className={style.contentBoxWrapper}>
        <div className={style.title}>发票信息</div>
        <div className={style.memberInfoWrapper}>
          <span>普通发票</span>
          <span>个人： {invoiceTitle}</span>
          <span>{content}</span>
        </div>
      </div>
    );
  }

  /** **********增值税发票显示***************** */
  valueAddInvoice = () => {
    const { companyName, texNo } = this.props.orderDetailReducers;
    return (
      <div className={style.contentBoxWrapper}>
        <div className={style.title}>发票信息</div>
        <div className={style.memberInfoWrapper}>
          <div>
            {companyName &&
              (
                <div>{companyName}</div>
              )
            }
            <div>企业： 商品明细</div>
            {texNo &&
              (
                <div>{texNo}</div>
              )
            }
          </div>
        </div>
      </div>
    );
  }

  renderMapShopping = (items) => {
    // console.log(this.props);
    if (!items || !Array.isArray(items) || items.lenght < 1) return;
    const { info: { cardTypeReducers } } = this.props;
    const row = [];
    let idCardTypeValue = null;
    items.forEach((element) => {
      cardTypeReducers.forEach((ele) => {
        if (ele.dictValue === element.idCardTypeValue) {
          idCardTypeValue = ele.dictName;
          return false;
        }
      });
      row.push(
        <div className={style.shopCard} key={element.id}>
          <img src={element.image} alt="商品图片" />
          <div className={style.cardDetail}>
            <div className={style.titleBox}>
              <h3>{element.productName}</h3>
              <div style={{ marginTop: '10px' }}>{this.renderMapSpecification(JSON.parse(element.specification))}</div>
              {idCardTypeValue && <div style={{ marginTop: '10px', fontSize: '1rem' }}>取票人证件类型: {idCardTypeValue}</div>}
              {element.idCard && <div style={{ marginTop: '10px', fontSize: '1rem' }}>取票人证件号: {element.idCard}</div>}
            </div>
            <div className={style.priceBox}>
              <span><u>数量：</u> <i className={style.price}>{element.quantity}</i></span>
              <span>
                <u>总价：</u>
                <i className={style.price}>￥{element.showPrice * element.quantity}</i>
              </span>
              <span>
                <u>应扣除积分：</u>
                <i className={style.price}>{element.credit * element.quantity}</i>
              </span>
            </div>
          </div>
        </div>
      );
    });
    return row;
  }
  renderMapSpecification = (list) => {
    return list.map(item => (
      <div key={item.id}>{item.name}: {item.value}</div>
    ));
  }

  render() {
    const { items, address, createTime, ticketDelivery, memo, invoiceTitle, tokenCode, isWriteOff }
    = this.props.orderDetailReducers;
    console.log(tokenCode, isWriteOff);
    // console.log(this.props.orderDetailReducers);
    let memoFlag = false;
    if (memo !== '') {
      memoFlag = true;
    }
    let name = '';
    let phone = '';
    let detailAddress = '';
    if (ticketDelivery === 'LOGISTICS') {
      // const arr = address.split(' ');
      const detailAddress2 = address.split(' ')[0];
      detailAddress = detailAddress2;
      const name2 = address.split(' ')[1];
      name = name2;
      const phone2 = address.split(' ')[2];
      phone = phone2;
    } else {
      detailAddress = address;
    }
    const { orderNo, status } = this.state;
    console.log(orderNo);
    // 映射订单状态
    let detailsStatus;
    switch (status) {
      case '1':
        detailsStatus = '待支付';
        break;
      case '6':
        detailsStatus = '已取消';
        break;
      case '7':
        detailsStatus = '已完成';
        break;
      default:
        detailsStatus = '';
        break;
    }
    // 导航栏组件
    const navbar = (
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => history.go(-1)}
      >
        订单详情
      </NavBar>
    );
    // content box
    const ContentBox = ({ children }) => (
      <div className={style.contentBoxWrapper}>
        {children}
      </div>
    );

    let addressType = '';
    switch (ticketDelivery) {
      case 'DOORTICKET':
        addressType = '上门取票';
        break;
      case 'WINDOWTICKET':
        addressType = '现场取票';
        break;
      case 'LOGISTICS':
        addressType = '物流取票';
        break;
      default:
        break;
    }
    return (
      <FullScreenFlex className="detail">
        <div className={style.detailWrapper}>
          {navbar}
          <ContentBox>
            <div className={style.detailItem}>
              <div>
                <span>订单编号：</span>
                <i>{orderNo}</i>
              </div>
              <div>
                <i style={{ color: '#E00' }}>{detailsStatus}</i>
              </div>
            </div>
            <div className={style.detailItem} style={{ marginBottom: '.5rem' }}>
              <span>下单时间：</span>
              <i>{createTime}</i>
            </div>
            {this.state.status === '1' &&
              (
                <div className={style.detailItem}>
                  <span>失效时间：</span>
                  <i>{this.outTime(createTime, this.state.expireTime)}</i>
                </div>
              )
            }
          </ContentBox>
          { tokenCode ? (
            <ContentBox>
              <div>
                <div style={{ marginBottom: '.5rem' }}><span>兑换码: {tokenCode}</span></div>
                <div><span>兑换状态: {isWriteOff ? '已兑换' : '未兑换'}</span></div>
              </div>
            </ContentBox>
          ) : null }
          <ContentBox>
            {this.renderMapShopping(items)}
          </ContentBox>
          {/* Member Info */}
          <ContentBox>
            <div className={style.memberInfoWrapper}>
              <div className={style.title}>{`收货方式：(${addressType})`}</div>
              <ul>
                {name !== '' &&
                  (
                    <li><span>收件人：</span>{name}</li>
                  )
                }
                {phone !== '' &&
                  (
                    <li><span>手机：</span>{phone}</li>
                  )
                }
                <li><span>地址：</span>{detailAddress}</li>
              </ul>
            </div>
          </ContentBox>
          {invoiceTitle && invoiceTitle === '个人' && this.normalInvoice()}
          {invoiceTitle && invoiceTitle === '企业' && this.valueAddInvoice()}
          {memoFlag &&
            (
              <ContentBox>
                <div className={style.memberInfoWrapper}>
                  <div className={style.title}>订单备注</div>
                  <TextareaItem
                    disabled
                    rows={3}
                    defaultValue={memo}
                  />
                </div>
              </ContentBox>
            )
          }
        </div>
      </FullScreenFlex>
    );
  }
}
