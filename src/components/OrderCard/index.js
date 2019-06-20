import React from 'react';
import { Card, Button } from 'antd-mobile';
import style from './index.less';

const orderStatus = {
  1: '待支付',
  6: '已取消',
  7: '已完成',
};

const renderListFooter = (status, quantity, id, showPrice, creditCount,
  orderNo, cancelHandle, goPay) => {
  let btnText = '';
  let showEscOrder = false;
  switch (status) {
    case 1:
      btnText = '支付';
      showEscOrder = true;
      break;
    case 7:
      btnText = '再次购买';
      break;
    default:
      break;
  }

  return (
    <div style={{ display: status === 6 ? 'none' : 'flex', flexDirection: 'column', padding: '0 .5rem' }} className={style.listFooter}>
      <div style={{ margin: '1rem 0' }}>
        共{quantity}件商品 实付款￥
        <span style={{ margin: '0 .2rem' }}>{showPrice}</span>
        元(含积分{creditCount})
      </div>
      <div>
        {
          showEscOrder &&
          (
            <a
              onClick={(e) => { if (cancelHandle) { cancelHandle(e, id); } }}
              className={style.checkDelivery}
            >
              取消订单
            </a>
          )
        }
        {
          btnText !== '再次购买' &&
          (
            <Button
              onClick={(e) => { if (goPay) { goPay(e, orderNo, showPrice); } }}
              activeStyle={false}
            >
              {btnText}
            </Button>
          )
        }
      </div>
    </div>
  );
};

const renderSpecification = (specification) => {
  return specification.map((item) => {
    return (
      <span key={item.id}>
        <i>{item.name}</i>:<u>{item.value}</u>
      </span>
    );
  });
};

const OrderCardItem = ({ orders = [], itemClick, onCancel, goPay }) => {
  return orders.map((item) => {
    return (
      <div key={item.orderNo} onClick={() => { if (itemClick) { itemClick(item); } }} >
        <Card
          full="true"
        >
          <Card.Header
            title={`订单号: ${item.orderNo}`}
            extra={<span>{orderStatus[+item.status]}</span>}
          />
          <Card.Body>
            <div className={style.cardBody}>
              <img src={item.thumbnail} alt={item.priductName} />
              <div className={style.orderInfoSum}>
                <h4>{item.priductName}</h4>
                <div className={style.specificationWrapper} style={{ marginBottom: '.1rem' }}>
                  {renderSpecification(item.specification)}
                </div>
                { item.tokenCode ? (
                  <div>
                    <div style={{ marginBottom: '.1rem' }}><span>兑换码: {item.tokenCode}</span></div>
                    <div><span>兑换状态: {item.isWriteOff ? '已兑换' : '未兑换'}</span></div>
                  </div>
                ) : null }
              </div>
            </div>
          </Card.Body>
          <Card.Footer extra={renderListFooter(item.status, item.quantity,
            item.id, item.discountPrice,
            item.creditCount, item.orderNo, onCancel, goPay)}
          />
        </Card >
      </div>
    );
  });
};

export default OrderCardItem;
