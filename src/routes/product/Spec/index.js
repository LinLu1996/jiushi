import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import { Button } from 'antd-mobile';
import styles from './index.less';

@connect(({ detail }) => ({ detail }))
export default class Spec extends Component {
  constructor(props) {
    super(props);
    this.state = {
      categoryType: props.categoryType,
      skuId: '',
      selected: {},
      buttonFlag: true,
      showPrice: null,
      deductionCredit: null,
      quantity: 1,
      limitNum: 1,
      btnText: '下一步',
      stock: 0,
    };
  }

  componentWillMount() {
    // console.log(props);
    const { detail: { current } } = this.props;
    const { skuList } = current;
    let spec = [];
    if (current.specificationUsed) {
      spec = JSON.parse(current.specificationUsed);
    }
    const arr = [];
    spec.forEach((element) => {
      arr.push(element.name);
    });
    let defaultSku = {};
    let defaultList = [];
    let flag = true;
    let defaultSelected = {};
    if (skuList) {
      skuList.forEach((element) => {
        if (flag) {
          if (element.isDefault) {
            defaultList = JSON.parse(element.specificationValues);
            // console.log(defaultList);
            defaultSku = element;
            this.setState({
              skuId: defaultSku.skuId,
            });
            arr.forEach((element2, index) => {
              const obj = { [element2]: defaultList[index] };
              defaultSelected = Object.assign(defaultSelected, obj);
            });
            flag = false;
          }
        }
      });
    }

    // 判断默认的库存
    const { stock } = defaultSku;
    if (stock === 0) {
      flag = true;
      this.setState({
        btnText: '缺货',
      });
    } else {
      this.setState({
        stock,
      });
    }
    const buttonFlag = flag;
    if (defaultSku.deductionCredit) {
      this.setState({
        // skuData: defaultSku,
        // buyType: current.buyType,
        limitNum: current.limitNum,
        // ticketDelivery: current.ticketDelivery,
        buttonFlag,
        deductionCredit: defaultSku.deductionCredit,
        selected: defaultSelected,
        showPrice: defaultSku.showPrice,
      });
    } else {
      this.setState({
        // skuData: defaultSku,
        // buyType: current.buyType,
        limitNum: current.limitNum,
        // ticketDelivery: current.ticketDelivery,
        buttonFlag,
        selected: defaultSelected,
        showPrice: defaultSku.showPrice,
      });
    }
  }

  // 确认订单
  goConfirm = () => {
    const { dispatch, detail: { current } } = this.props;
    const skuKeyList = [];
    let spec = {};
    if (current && current.specificationUsed) {
      spec = JSON.parse(current.specificationUsed);
    }
    spec.forEach((element) => {
      skuKeyList.push(element.name);
    });
    // 跳转前查询有没有错
    const postData = {
      skuId: this.state.skuId,
      quantity: this.state.quantity,
    };
    const url = this.state.categoryType === '1' ? 'detail/fetchConfirmSubmitError' : 'detail/fetchNormalConfirmSubmitError';
    // 首先把confirmSubmitError清空
    dispatch({
      type: 'detail/fetchClearError',
      payload: '',
    }).then(() => {
      dispatch({
        type: url,
        payload: postData,
      }).then(() => {
        // console.log(this.props);
        const { detail: { confirmSubmitError } } = this.props;
        if (confirmSubmitError === 'error') {
          return false;
        }
        dispatch(routerRedux.push(
          `/confirm?skuId=${this.state.skuId}&quantity=${this.state.quantity}&skuKeyList=${skuKeyList}&productId=${current.id}&categoryType=${this.state.categoryType}`
        ));
      });
    });
  }

  /** ****************增加/减少/删除方法************************ */
  handleAdd = () => {
    const { limitNum, quantity, stock } = this.state;
    if (quantity === limitNum) {
      return false;
    }
    if (quantity >= stock) {
      this.setState({
        btnText: '库存不足',
        buttonFlag: true,
      });
    }
    this.setState({
      quantity: quantity + 1,
    });
  }

  handleReduce = () => {
    if (this.state.quantity > 1) {
      this.setState({
        quantity: this.state.quantity - 1,
      }, () => {
        if (this.state.quantity <= this.state.stock) {
          this.setState({
            btnText: '下一步',
            buttonFlag: false,
          });
        }
      });
    }
  }

  /** ****************规格按钮点击事件************************ */
  handleSpecItemClick = (e) => {
    // 购买数重置
    this.setState({
      quantity: 1,
    });
    // 把默认选择关闭
    // console.log(e.currentTarget);
    const { detail: { current: { skuList } } } = this.props;
    // console.log(e);
    let item = JSON.parse(e.currentTarget.dataset.item);
    // console.log(item);
    const { selected } = this.state;
    // console.log(selected);
    const key = Object.keys(item)[0];
    const valobj = selected[key];
    if (valobj && valobj.id === item[key].id) {
      delete selected[key];
      item = {};
    }
    this.setState(
      {
        selected: {
          ...selected,
          ...item,
        },
      },
      () => {
        // 对比选择的商品
        const chooseArr = [];
        const keyArr = Object.keys(this.state.selected);
        keyArr.forEach((element) => {
          chooseArr.push(this.state.selected[element]);
        });
        let flag = true;
        skuList.forEach((element, index) => {
          if (flag) {
            const arr = JSON.parse(element.specificationValues);
            const maxLength = arr.length;
            let addLength = 0;
            if (arr.length === chooseArr.length) {
              for (let i = 0; i <= maxLength - 1; i += 1) {
                for (let k = 0; k <= maxLength - 1; k += 1) {
                  if (arr[i].id === chooseArr[k].id) {
                    addLength += 1;
                  }
                }
              }

              if (addLength === maxLength) {
                // 退出循环
                flag = false;
                // 查库存
                const { stock } = skuList[index];
                let flag2 = false;
                let text = '下一步';
                if (stock === 0) {
                  flag2 = true;
                  text = '缺货';
                } else {
                  this.setState({
                    stock,
                  });
                }
                // 有积分
                if (skuList[index].deductionCredit) {
                  this.setState({
                    showPrice: skuList[index].showPrice,
                    buttonFlag: flag2,
                    deductionCredit: skuList[index].deductionCredit,
                    btnText: text,
                    skuId: skuList[index].skuId,
                  });
                } else {
                  this.setState({
                    showPrice: skuList[index].showPrice,
                    buttonFlag: flag2,
                    btnText: text,
                    skuId: skuList[index].skuId,
                    deductionCredit: null,
                  });
                }
              } else {
                this.setState({
                  showPrice: null,
                  buttonFlag: true,
                });
              }
            } else {
              this.setState({
                showPrice: null,
                buttonFlag: true,
              });
            }
          }
        });
      }
    );
  };

  /** ****************渲染规格按钮************************ */
  renderSpecItem = () => {
    const { detail: { current } } = this.props;
    if (current && current.specificationUsed && current.skuList) {
      const spec = JSON.parse(current.specificationUsed);
      return (
        (spec &&
          spec.map((s) => {
            const row = [];
            s.entries.map((item) => {
              const { selected } = this.state;
              const checked = (selected[s.name] && selected[s.name].id === item.id) || false;
              return row.push(
                <Button
                  key={item.value}
                  data-item={JSON.stringify({ [s.name]: item })}
                  className={`${styles.specBox} ${checked && styles.checked}`}
                  onClick={this.handleSpecItemClick}
                >
                  {/* {checked && <Icon type="check" />} */}
                  {item.value}
                </Button>
              );
            });
            return (
              <div key={s.name}>
                <p ref={s.name} style={{ margin: '.5rem 0', textAlign: 'left', fontSize: '.8rem' }}>
                  {`${s.name}:`}
                </p>
                <div className={styles.btnBox2}>{row}</div>
              </div>
            );
          })) ||
        null
      );
    }
  };

  /** ****************渲染价格积分************************ */
  renderMoney = () => {
    const { showPrice, deductionCredit } = this.state;
    if (showPrice) {
      return (
        <div className={styles.priceBox}>
          <span className={styles.price}>金额:￥{showPrice}</span>
          { deductionCredit &&
            (
              <span>
                <span style={{ fontSize: '1rem' }}> + 积分</span>
                <span className={styles.credit}>{deductionCredit}</span>
              </span>
            )
          }
        </div>
      );
    } else {
      return (
        <div className={styles.priceBox}>
          <span className={styles.price}>￥0</span>
          <span style={{ fontSize: '.6rem' }}>+积分</span>
          <span className={styles.credit}>0</span>
        </div>
      );
    }
  };

  render() {
    return (
      <div className={styles.box}>
        <div className={styles.btnBox}>
          {this.renderSpecItem()}
        </div>
        <div className={styles.count}>
          <div className={styles.change}>
            <span>购买数量</span>
            <div className={styles.changeBox}>
              <span style={{ marginRight: '.5rem' }} onClick={this.handleReduce}>-</span>
              {this.state.quantity}
              <span style={{ marginLeft: '.5rem' }} onClick={this.handleAdd}>+</span>
            </div>
          </div>
          {this.renderMoney()}
          <Button onClick={this.goConfirm} disabled={this.state.buttonFlag}>
            {this.state.btnText}
          </Button>
        </div>
      </div>
    );
  }
}
