import React, { Component } from 'react';
import { connect } from 'dva';
import { Flex, Button, Toast, Icon, InputItem, List, Picker, TextareaItem } from 'antd-mobile';
import { routerRedux } from 'dva/router';
import { urlParse } from '../../../utils/urlParse';
import styles from './index.less';
// import link from '../../../assets/link.png';
import MyHeader from '../../../components/MyHeader';

@connect(({ detail }) => ({ detail }))
export default class Confirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      title: '确认订单',
      categoryType: '1',
      checked: '0',
      // id地址
      address: '',
      // 所有物流地址
      dataAddress: null,
      // 第一条地址
      firstAddress: null,
      // 提交的物流地址信息
      actualName: '',
      phone: '',
      areaId: '',
      detailedAddress: '',
      skuId: '',
      quantity: 1,
      skuKeyList: [],
      specificationValues: '',
      imageUrl: '',
      productName: '',
      showPrice: '',
      deductionCredit: '',
      memberCredit: '',
      memo: '',
      // 发票信息
      ionviceData: null,
      ticketDelivery: [],
      // 证件号
      errorIdCard: false,
      idCard: '',
      // 证件类型
      cardType: null,
      cardTypeValue: [],
      cardTypeError: false,
      // 发票
      isInvoice: false,
      // 物流标识
      isLogistics: true,
    };
  }

  componentWillMount() {
    const { dispatch, location, detail: { ionviceData, memoData } } = this.props;
    const param = urlParse(location.search);
    this.setState({
      ionviceData,
      categoryType: param.categoryType,
    });
    const postData = {
      skuId: param.skuId,
      quantity: param.quantity,
      categoryType: param.categoryType,
    };
    const url = param.categoryType === '1' ? 'detail/fetchConfirmSubmit' : 'detail/fetchNormalConfirmSubmit';
    // console.log(url);
    dispatch({
      type: url,
      payload: postData,
    }).then(() => {
      const { detail: { confirmInfo } } = this.props;
      if (confirmInfo) {
        this.setState({
          skuKeyList: param.skuKeyList,
          imageUrl: confirmInfo.imageUrl,
          ticketDelivery: confirmInfo.ticketDelivery ?
            confirmInfo.ticketDelivery.split(',') : [],
          // 默认为WINDOWTICKET
          // ticketDeliveryType: 'WINDOWTICKET',
          productName: confirmInfo.name,
          price: parseFloat(confirmInfo.price),
          showPrice: parseFloat(confirmInfo.showPrice),
          deductionCredit: confirmInfo.deductionCredit || 0,
          memberCredit: confirmInfo.memberCredit || 0,
          skuId: param.skuId,
          quantity: parseInt(param.quantity, 10),
          specificationValues: confirmInfo.specificationValues,
          buyType: confirmInfo.buyType,
          productId: confirmInfo.productid,
          cardTypeValue: confirmInfo.idCardTypeValue && [confirmInfo.idCardTypeValue] || [],
          idCard: confirmInfo.idCard && confirmInfo.idCard || '',
          isInvoice: confirmInfo.isInvoice,
          memo: memoData,
          isLogistics: confirmInfo.isLogistics,
          // checked: checkedData,
        }, () => {
          const { ticketDelivery, isLogistics } = this.state;
          if (param.categoryType === '2' && isLogistics) {
            this.setState({
              checked: '1',
            });
          }
          let hadLog = false;
          ticketDelivery.forEach((element) => {
            if (element === 'LOGISTICS') {
              hadLog = true;
              this.setState({
                checked: '1',
              });
            }
          });
          if (!hadLog) {
            const tab = ticketDelivery[0];
            if (tab === 'DOORTICKET') {
              this.setState({
                checked: '3',
              });
            }
            if (tab === 'WINDOWTICKET') {
              this.setState({
                checked: '2',
              });
            }
          }
        });
      }
    });

    this.freshAddress();
    this.getCardType();
  }

  componentWillUnmount() {
    // console.log(this.state.memo);
    const { dispatch } = this.props;
    // 保存订单备注
    dispatch({
      type: 'detail/fetchMemo',
      payload: this.state.memo,
    });
    // 保存物流信息
    dispatch({
      type: 'detail/fetchChecked',
      payload: this.state.checked,
    });
  }


  // 每列数据变化
  onPickerChange = (value) => {
    this.setState({
      cardTypeValue: value,
      cardTypeError: false,
      errorIdCard: false,
      idCard: '',
    });
  }

  // 获取证件类型列表
  getCardType = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'detail/getCardTypeEffec',
    }).then(() => {
      // console.log(this.props);
      const { detail: { cardType } } = this.props;
      const arr = [];
      if (cardType) {
        cardType.forEach((element) => {
          arr.push(
            {
              label: element.dictName,
              value: element.dictValue,
            }
          );
        });
      }
      // console.log(arr);
      this.setState({
        cardType: arr,
      });
    });
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

  // 编辑发票
  goInvoice = () => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/invoice',
      })
    );
  }

  /** ***********************提交订单************* */
  goPay = () => {
    // 判断取票方式.
    const { checked, categoryType } = this.state;
    // console.log(checked);
    // 用户
    const { userAgent } = navigator;
    let ticketDelivery = '';
    if (checked === '1') {
      ticketDelivery = 'LOGISTICS';
    } else if (checked === '2') {
      ticketDelivery = 'WINDOWTICKET';
    } else if (checked === '3') {
      ticketDelivery = 'DOORTICKET';
    } else {
      ticketDelivery = 'ETICKET';
    }

    // 判断物流收货地址是不是为空
    if (!this.state.firstAddress && checked === '1') {
      Toast.fail('请新增收货地址', 1);
      return false;
    }

    // 判断积分是否足够
    const residue = this.state.memberCredit - this.state.deductionCredit * this.state.quantity;
    if (residue < 0) {
      Toast.fail('您的积分不足', 1);
      return false;
    }

    // 当为票务且为现场取票
    if (categoryType === '1' && checked === '2') {
      // 判断是否选了证件类型
      if (this.state.cardTypeValue.length === 0 || this.state.cardTypeError) {
        this.setState({
          cardTypeError: true,
        });
        return false;
      }
      // 判断是否填了idcard
      if (this.state.idCard === '' || this.state.errorIdCard) {
        this.setState({
          errorIdCard: true,
        });
        return false;
      }
    }

    const { ionviceData } = this.state;
    let isEnterprise2 = '';
    let invoiceTitle2 = '';
    let invoiceContext2 = '';
    let texNo2 = '';
    let companyName2 = '';
    // 个人或企业
    // console.log(ionviceData);
    if (ionviceData) {
      // 个人为false
      isEnterprise2 = ionviceData.invoiceTitle !== '个人';
      invoiceTitle2 = ionviceData.invoiceTitle;
      invoiceContext2 = ionviceData.invoiceContext;
      texNo2 = ionviceData.texNo ? ionviceData.texNo : '';
      companyName2 = ionviceData.companyName ? ionviceData.companyName : '';
    }
    let orderData = {
      productId: this.state.productId,
      orderPrice: this.state.quantity * this.state.price,
      contcats: '',
      creditCount: this.state.quantity * this.state.deductionCredit,
      buyType: this.state.buyType,
      memo: this.state.memo,
      ticketDelivery,
      // sku信息
      skuId: this.state.skuId,
      quantity: this.state.quantity,
      specificationValues: this.state.specificationValues,
      // 发票信息:个人false  商品明细0,商品类别1
      isEnterprise: isEnterprise2,
      invoiceTitle: invoiceTitle2,
      invoiceContext: invoiceContext2,
      texNo: texNo2,
      companyName: companyName2,
      // 收货信息
      actualName: this.state.actualName,
      phone: this.state.phone,
      areaId: this.state.areaId,
      address: this.state.address,
      // 购买渠道
      channel: this.getCookie('channel'),
      userAgent,
    };
    // console.log(orderData);
    if (categoryType === '1' && checked === '2') {
      orderData = {
        ...orderData,
        // idCard
        idCard: this.state.idCard,
        idCardTypeValue: this.state.cardTypeValue[0],
      };
    }
    // console.log(categoryType === '1');
    const url = categoryType === '1' ? 'detail/fetchSubmitOrder' : 'detail/fetchNormalSubmitOrder';
    this.props.dispatch({
      type: url,
      payload: orderData,
    }).then(() => {
      // orderNo orderPrice orderStatus
      const { detail: { payData } } = this.props;
      // console.log(this.props);
      if (payData) {
        // isFinish。跳转到支付完成页面
        if (payData && payData.isFinish) {
          this.props.dispatch(routerRedux.push(
            `/paySuccess?orderNo=${payData.orderNo}&orderPrice=${this.state.quantity * this.state.showPrice}`
          ));
          return false;
        }
        const ua = navigator.userAgent.toLowerCase();
        if (!ua.match(/micromessenger/i)) {
          this.props.dispatch(routerRedux.push(
            `/pay?orderNo=${payData.orderNo}&orderPrice=${this.state.quantity * this.state.showPrice}
            &orderStatus=${payData.orderStatus}`
          ));
        } else {
          this.props.dispatch({
            type: 'detail/getAuthorize',
            payload: payData.orderNo,
          }).then(() => {
            const { detail: { authorize } } = this.props;
            if (authorize) {
              window.location.href = authorize;
            }
          });
        }
      }
    });
  }

  // 新增物流地址
  goAddAddress = () => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/addAddress',
      })
    );
  }

  // 收货地址
  goAddressList = () => {
    const { dispatch } = this.props;
    dispatch(
      routerRedux.push({
        pathname: '/member/address',
      })
    );
  }

  /** ***********************刷新地址************* */
  freshAddress = () => {
    const { dispatch, location } = this.props;
    const param = urlParse(location.search);
    const url = param.categoryType === '1' ? 'detail/fetchTicketConfirmInfo' : 'detail/fetchConfirmInfo';
    const payload2 = param.categoryType === '1' ? param.productId : '';
    dispatch({
      type: url,
      payload: payload2,
    }).then(() => {
      // console.log(this.props);
      const { detail: { confirmInfoData, defaultAddress } } = this.props;
      if (confirmInfoData) {
        this.setState({
          dataAddress: confirmInfoData,
        });
        // 如果有默认地址就显示默认
        if (defaultAddress) {
          this.setState({
            firstAddress: defaultAddress,
            actualName: defaultAddress.receiver,
            phone: defaultAddress.phone,
            areaId: defaultAddress.areaId,
            detailedAddress: defaultAddress.detailedAddress,
            address: defaultAddress.address,
          });
          return false;
        }
        // 初始化第一个物流地址
        const a = confirmInfoData.addList;
        const firstAddress = a && a.length > 0 ? confirmInfoData.addList[0] : null;
        if (firstAddress) {
          this.setState({
            firstAddress,
            actualName: firstAddress.receiver,
            phone: firstAddress.phone,
            areaId: firstAddress.areaId,
            detailedAddress: firstAddress.detailedAddress,
            address: firstAddress.address,
          });
        }
      }
    });
  }

  /** **********切换收货方式***************** */
  changeReceive = (tab) => {
    this.setState({
      checked: tab,
    });
  }

  /** **********创建收货方式***************** */
  ReceiveWay = () => {
    const { ticketDelivery, isLogistics } = this.state;
    const { location } = this.props;
    const param = urlParse(location.search);
    // console.log(this.state.checked);
    // ticketDelivery为数组
    let doorTicket = false;
    let windowTicket = false;
    let logistics = false;
    ticketDelivery.forEach((element) => {
      switch (element) {
        case 'DOORTICKET':
          doorTicket = true;
          break;
        case 'WINDOWTICKET':
          windowTicket = true;
          break;
        case 'LOGISTICS':
          logistics = true;
          break;
        default:
          break;
      }
    });
    const { categoryType } = param;
    return (
      <div className={styles.icons}>
        {categoryType === '2' && isLogistics &&
          (
            <div className={styles.checked}>
              <span className="icomoon-icon-wl" />
              <span>物流</span>
            </div>
          )
        }
        {logistics && categoryType === '1' &&
          (
            <div className={this.state.checked === '1' ? styles.checked : ''} onClick={() => { this.changeReceive('1'); }} >
              <span className="icomoon-icon-wl" />
              <span>物流</span>
            </div>
          )
        }
        {windowTicket && categoryType === '1' &&
          (
            <div className={this.state.checked === '2' ? styles.checked : ''} onClick={() => { this.changeReceive('2'); }}>
              <span className="icomoon-icon-window" />
              <span>现场取票</span>
            </div>
          )
        }
        {doorTicket && categoryType === '1' &&
          (
            <div className={this.state.checked === '3' ? styles.checked : ''} onClick={() => { this.changeReceive('3'); }}>
              <span className="icomoon-icon-door" />
              <span>上门取票</span>
            </div>
          )
        }
      </div>
    );
  }

  /** ***********************输入idCard************* */
  changeIdCard = (value) => {
    const { cardTypeValue } = this.state;
    this.setState({
      idCard: value,
    });
    const IDValidator = require('id-validator');
    // const regex = /^[A-Za-z0-9]+$/;
    // 护照
    const checkPassport1 = /^[a-zA-Z]{5,17}$/;
    const checkPassport2 = /^[a-zA-Z0-9]{5,17}$/;
    // 港澳台
    const regexHongKong1 = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/;
    const regexHongKong2 = /^[CWcw]{1}([0-9]{10}|[0-9]{8})$/;
    const regexMacau1 = /^[0-9]{8}$/;
    const regexMacau2 = /^[0-9]{10}$/;
    // 如果有值
    if (value) {
      // 身份证
      if (cardTypeValue[0] === '1') {
        if (new IDValidator().isValid(value)) {
          this.setState({
            errorIdCard: false,
          });
        } else {
          this.setState({
            errorIdCard: true,
          });
        }
        return false;
      } else if (cardTypeValue[0] === '2') {
        // 护照
        if (checkPassport1.test(value) || checkPassport2.test(value)) {
          this.setState({
            errorIdCard: false,
          });
        } else {
          this.setState({
            errorIdCard: true,
          });
        }
        return false;
      } else if (cardTypeValue[0] === '3') {
        // 港澳台
        if (regexHongKong1.test(value) ||
          regexHongKong2.test(value) || regexMacau1.test(value) || regexMacau2.test(value)) {
          this.setState({
            errorIdCard: false,
          });
        } else {
          this.setState({
            errorIdCard: true,
          });
        }
        return false;
      }
      // if (!regex.test(value)) {
      //   this.setState({
      //     errorIdCard: true,
      //   });
      // } else {
      //   this.setState({
      //     errorIdCard: false,
      //   });
      // }
    } else if (value === '') {
      return false;
      // this.setState({
      //   errorIdCard: true,
      // });
    }
  }

  /** ***********************输入订单备注************* */
  changeMemo = (value) => {
    this.setState({
      memo: value,
    });
  }

  renderTicket = () => {
    const { skuKeyList, specificationValues } = this.state;
    // console.log(skuKeyList);
    if (skuKeyList && specificationValues) {
      const skuChooseList = JSON.parse(specificationValues);
      const skuKeyListArr = skuKeyList.split(',');
      const items = [];
      for (let index = 0; index < skuKeyListArr.length; index += 1) {
        const element = <p style={{ fontSize: '.8rem' }} key={index}>{skuKeyListArr[index]}：{skuChooseList[index].value}</p>;
        items.push(element);
      }
      return items;
    }
  };

  render() {
    const { ionviceData, dataAddress, isInvoice, categoryType } = this.state;
    // 判断积分是否足够
    const residue = this.state.memberCredit - this.state.deductionCredit * this.state.quantity;
    return (
      <Flex direction="column" className={styles.detail}>
        <MyHeader title={this.state.title} />
        <div className={styles.product}>
          <img src={this.state.imageUrl} alt="商品图片" />
          <div>
            <h2>{this.state.productName}</h2>
            <div style={{ paddingBottom: '1rem', borderBottom: '1px solid #333' }}>
              {this.renderTicket()}
            </div>
            <p style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ fontSize: '.8rem' }}>￥{this.state.showPrice} {this.state.deductionCredit !== 0 && `+${this.state.deductionCredit}积分`}</span><span style={{ fontSize: '.8rem' }}>数量{this.state.quantity}</span></p>
            <p className={styles.time} style={{ textAlign: 'right' }}>总价：<span className={styles.price}>￥{this.state.showPrice * this.state.quantity}</span></p>
            <p className={styles.time} style={{ textAlign: 'right' }}>积分：<span style={{ display: 'inline-block', minWidth: '2.5rem', fontSize: '1rem', fontWeight: 'bold', color: '#e00' }}>{this.state.deductionCredit * this.state.quantity}</span></p>
            <p className={styles.time} style={{ textAlign: 'right' }}>总积分：<span style={{ display: 'inline-block', minWidth: '2.5rem' }}>{this.state.memberCredit}</span></p>
            {residue >= 0 &&
              (
                <p className={styles.time} style={{ textAlign: 'right' }}>
                  {'剩余积分：'}
                  <span style={{ display: 'inline-block', minWidth: '2.5rem' }}>
                    {residue}
                  </span>
                </p>
              )
            }
            {residue < 0 &&
              (
                <p className={styles.time} style={{ textAlign: 'right' }}>
                  {'您的积分不足'}
                </p>
              )
            }
          </div>
        </div>
        <div className={styles.details}>
          <h2 style={{ textAlign: 'center' }}>选择配送方式</h2>
          {this.ReceiveWay()}
        </div>
        {this.state.firstAddress && this.state.checked === '1' &&
          (
            <div className={styles.details}>
              <p className={styles.time}>收件人：{this.state.actualName}
                <a style={{ color: '#999', fontSize: '.6rem', float: 'right', textDecoration: 'underline' }} onClick={this.goAddressList}>修改信息</a>
              </p>
              <p className={styles.time}>手机：{this.state.phone}</p>
              <p className={styles.time}>地址：{this.state.detailedAddress} {this.state.address}</p>
            </div>
          )
        }
        {!this.state.firstAddress && this.state.checked === '1' &&
          (
            <div className={styles.details}>
              <p className={styles.time}>
                <a style={{ color: '#999', fontSize: '.6rem', float: 'right', textDecoration: 'underline' }} onClick={this.goAddAddress}>新建物流地址</a>
              </p>
            </div>
          )
        }
        {this.state.checked === '2' && this.state.categoryType === '1' &&
          (
            <div className={styles.details}>
              <p className={styles.time}>
                {dataAddress && dataAddress.windowTicketAddress}
              </p>
              <List style={{ marginTop: '.5rem' }}>
                <Picker
                  data={this.state.cardType}
                  cols={1}
                  value={this.state.cardTypeValue}
                  onChange={this.onPickerChange}
                >
                  <List.Item className={styles.required} arrow="horizontal" last="true" error={this.state.cardTypeError}>
                    取票人证件类型：
                  </List.Item>
                </Picker>
                <InputItem
                  clear
                  placeholder="请输入取票人证件号!"
                  onChange={this.changeIdCard}
                  value={this.state.idCard}
                  error={this.state.errorIdCard}
                  maxLength={50}
                  style={{ fontSize: '.8rem', paddingLeft: '1rem', textAlign: 'right' }}
                >
                  取票人证件号：
                </InputItem>
              </List>
              <div style={{ marginTop: '.5rem', color: '#f5222d', fontSize: '.8rem' }}>
                需要凭此证件号进行现场取票，请确认无误
              </div>
            </div>
          )
        }
        {this.state.checked === '3' && this.state.categoryType === '1' &&
          (
            <div className={styles.details}>
              <p className={styles.time}>
                {dataAddress && dataAddress.doorTicketAddress}
              </p>
            </div>
          )
        }
        {categoryType === '1' && isInvoice &&
          (
            <div className={`${styles.invoice} ${styles.details}`} onClick={this.goInvoice}>
              <div className={styles.time}>
                开具发票
                {!ionviceData && <span style={{ marginLeft: 20, fontSize: '.8rem' }}>无</span>}
                {ionviceData && ionviceData.invoiceTitle &&
                  (
                    <span style={{ marginLeft: 20, marginRight: 20, fontSize: '.8rem' }}>
                      {ionviceData.invoiceTitle}
                    </span>
                  )
                }
                {ionviceData &&
                  (
                    <span style={{ fontSize: '.8rem' }}>
                      {ionviceData.invoiceContext === 0 ? '商品明细' : '商品类别'}
                    </span>
                  )
                }
                {ionviceData && ionviceData.companyName &&
                  (
                    <p style={{ margin: 0, fontSize: '.8rem', lineHeight: '1.5rem' }}>
                      企业名称：{ionviceData.companyName}
                    </p>
                  )
                }
                {ionviceData && ionviceData.texNo &&
                  (
                    <p style={{ margin: 0, fontSize: '.8rem', lineHeight: '1.5rem' }}>
                      纳税人识别码：{ionviceData.texNo}
                    </p>
                  )
                }
              </div>
              <Icon type="right" className={styles.link} />
            </div>
          )
        }
        {categoryType === '2' &&
          (
            <div className={`${styles.invoice} ${styles.details}`} onClick={this.goInvoice}>
              <div className={styles.time}>
                开具发票
                {!ionviceData && <span style={{ marginLeft: 20, fontSize: '.8rem' }}>无</span>}
                {ionviceData && ionviceData.invoiceTitle &&
                  (
                    <span style={{ marginLeft: 20, marginRight: 20, fontSize: '.8rem' }}>
                      {ionviceData.invoiceTitle}
                    </span>
                  )
                }
                {ionviceData &&
                  (
                    <span style={{ fontSize: '.8rem' }}>
                      {ionviceData.invoiceContext === 0 ? '商品明细' : '商品类别'}
                    </span>
                  )
                }
                {ionviceData && ionviceData.companyName &&
                  (
                    <p style={{ margin: 0, fontSize: '.8rem', lineHeight: '1.5rem' }}>
                      企业名称：{ionviceData.companyName}
                    </p>
                  )
                }
                {ionviceData && ionviceData.texNo &&
                  (
                    <p style={{ margin: 0, fontSize: '.8rem', lineHeight: '1.5rem' }}>
                      纳税人识别码：{ionviceData.texNo}
                    </p>
                  )
                }
              </div>
              <Icon type="right" className={styles.link} />
            </div>
          )
        }
        <div className={styles.details}>
          <TextareaItem
            clear
            rows={3}
            placeholder="请输入订单备注"
            onChange={this.changeMemo}
            value={this.state.memo}
            maxLength={100}
          />
        </div>
        <div className={styles.btn}>
          <Button onClick={() => { this.goPay(); }}>确认下单</Button>
        </div>
      </Flex>
    );
  }
}
