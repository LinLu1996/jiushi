import { message } from 'antd';
import { routerRedux } from 'dva/router';
import {
  getProductList,
  contactAdd,
  getConfirmSubmit,
  getNormalConfirmSubmit,
  getConfirmInfo,
  getTicketConfirmInfo,
  addressAdd,
  addressUpdate,
  addressDelete,
  getSettlementInfo,
  getNormalSettlementInfo,
  getProvinces,
  getCities,
  getDistrict,
  paymentCallback,
  toPay,
  payStatus,
  getOrderDetail,
  cancelOrderApi,
} from '../services/order';

const parseData = (data) => {
  const jsonString = [];
  const rows = data.rows || [];
  if (Array.isArray(rows)) {
    rows.map((item) => {
      const itemResult = { ...item };
      if (item.specification) {
        itemResult.specification = JSON.parse(item.specification);
      }
      return jsonString.push(itemResult);
    });
    return jsonString;
  }

  const dataResult = { ...data };
  dataResult.rows = jsonString;
  return data;
};
/* 设置order数据
* param
*   data：response
*   payload: 请求参数
* return data
*/
const setOrderData = (data, payload) => {
  const { total } = data;
  const { limit, page } = payload;
  const hasMore = limit * page < total;
  return {
    ...data,
    hasMore,
    page,
  };
};

const mergeNewAndOldData = (OldDataList, newData) => {
  const rows = [...OldDataList, ...newData.rows];
  return {
    ...newData,
    rows,
  };
};


export default {
  namespace: 'order',

  state: {
    contactData: [],
    confirmInfo: {},
    routerParams: {},
    confirmInfoData: {},
    // 去结算时，联系人和票数
    confirmSubmitInfo: {},
    // 详情页数据
    event: {},
    // 省市区数据
    provinceData: [],
    citiesData: [],
    districtData: [],
    // 订单信息
    payData: null,
    qrcode: null,
    paySuccess: null,
    // 订单详情
    orderDetailReducers: {},
    // 删除是否成功状态ok  no
    cancelStatus: null,
    // 全部订单 {}
    orderAll: {
      rows: [],
      total: 0,
      hasMore: true,
      page: 0,
    },
    // 已完成订单 {}
    orderCompleted: {
      rows: [],
      total: 0,
      hasMore: true,
      page: 0,
    },
    // 待支付订单 {}
    orderToPay: {
      rows: [],
      total: 0,
      hasMore: true,
      page: 0,
    },
    // 已取消订单 {}
    orderEsc: {
      rows: [],
      total: 0,
      hasMore: true,
      page: 0,
    },
  },

  effects: {
    *fetchProduct({ payload }, { select, call, put }) {
      // 获取原有数据
      const OldData = yield select((state) => {
        const { status } = payload;
        switch (status) {
          case 0:
            return state.order.orderAll.rows;
          case '1':
            return state.order.orderToPay.rows;
          case '7':
            return state.order.orderCompleted.rows;
          case '6':
            return state.order.orderEsc.rows;
          default:
            return [];
        }
      });
      try {
        const response = yield call(getProductList, payload);
        if (response.code === 200) {
          const dataList = parseData(response.data);
          const data = { total: response.data.total, rows: dataList };
          const { status, flag } = payload;
          switch (status) {
            case 0:
              yield put({
                type: 'ProductReducers',
                payload: {
                  orderAll: flag ?
                    setOrderData(mergeNewAndOldData(OldData, data), payload) :
                    setOrderData(data, payload) || {},
                },
              });
              break;
            case '1':
              yield put({
                type: 'ProductReducers',
                payload: {
                  orderToPay: flag ?
                    setOrderData(mergeNewAndOldData(OldData, data), payload) :
                    setOrderData(data, payload) || {},
                },
              });
              break;
            case '7':
              yield put({
                type: 'ProductReducers',
                payload: {
                  orderCompleted: flag ?
                    setOrderData(mergeNewAndOldData(OldData, data), payload) :
                    setOrderData(data, payload) || {},
                },
              });
              break;
            case '6':
              yield put({
                type: 'ProductReducers',
                payload: {
                  orderEsc: flag ?
                    setOrderData(mergeNewAndOldData(OldData, data), payload) :
                    setOrderData(data, payload) || {},
                },
              });
              break;
            default:
              console.log('无状态数据');
              break;
          }
        }
      } catch (e) {
        console.log(e);
      }
    },
    // 地址传参
    *fetchRouterParams({ payload }, { put }) {
      yield put({
        type: 'routerParams',
        payload,
      });
    },
    *fetchEvent({ payload }, { put }) {
      yield put({
        type: 'event',
        payload,
      });
    },
    // 联系人和票数
    *fetchConfirmSubmitInfo({ payload }, { put }) {
      yield put({
        type: 'confirmSubmitInfo',
        payload,
      });
    },
    *fetchContactAdd({ payload }, { call }) {
      const response = yield call(contactAdd, payload);
      if (response && response.code === 200) {
        message.success('添加成功');
      }
    },

    /** ***********************订单结算页面信息************* */
    // 票务
    *fetchConfirmSubmit({ payload }, { call, put }) {
      const response = yield call(getConfirmSubmit, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'confirmSubmit',
          payload: response.data,
        });
      } else if (response && response.code !== 200) {
        message.fail(response.message);
        yield put(routerRedux.replace('/credit'));
      }
    },
    // 普通商品
    *fetchNormalConfirmSubmit({ payload }, { call, put }) {
      const response = yield call(getNormalConfirmSubmit, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'confirmSubmit',
          payload: response.data,
        });
      } else if (response && response.code !== 200) {
        message.fail(response.message);
        yield put(routerRedux.replace('/credit'));
      }
    },

    /** ***********************获取收货地址************* */
    // 普通商品
    *fetchConfirmInfo({ payload }, { call, put }) {
      const response = yield call(getConfirmInfo, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'confirmInfoData',
          payload: response.data,
        });
      }
    },
    // 票务商品
    *fetchTicketConfirmInfo({ payload }, { call, put }) {
      const response = yield call(getTicketConfirmInfo, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'confirmInfoData',
          payload: response.data,
        });
      }
    },

    /** ***********************添加收货人地址************* */
    *fetchAddressAdd({ payload }, { call }) {
      const response = yield call(addressAdd, payload);
      if (response && response.code === 200) {
        message.success('新增成功');
      }
    },
    /** ***********************编辑收货人地址************* */
    *fetchAddressUpdate({ payload }, { call }) {
      const response = yield call(addressUpdate, payload);
      if (response && response.code === 200) {
        message.success('编辑成功');
      }
    },
    /** ***********************删除收货人地址************* */
    *fetchAddressDelete({ payload }, { call }) {
      const response = yield call(addressDelete, payload);
      if (response && response.code === 200) {
        message.success('删除成功');
      }
    },


    /** ***********************提交订单************* */
    // 票务
    *fetchSubmitOrder({ payload }, { call, put }) {
      const response = yield call(getSettlementInfo, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'payData',
          payload: response.data || null,
        });
      }
    },
    *fetchNormalSubmitOrder({ payload }, { call, put }) {
      const response = yield call(getNormalSettlementInfo, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'payData',
          payload: response.data || null,
        });
      }
    },

    *fetchOrderDetail({ payload }, { call, put }) {
      const response = yield call(getOrderDetail, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'orderDetail',
          payload: response.data || {},
        });
      }
    },

    /** ***********************立刻支付************* */
    *fetchPaymentCallback({ payload }, { call }) {
      yield call(paymentCallback, payload);
    },
    // 订单取消
    *cancelOrder({ payload }, { call /* put */ }) {
      try {
        const response = yield call(cancelOrderApi, payload);
        return response;
        // if (response.code === 200) {
        //   yield put({
        //     type: 'cancelStatus',
        //     payload: {
        //       cancelStatus: 'OK',
        //     },
        //   });
        // } else {
        //   yield put({
        //     type: 'cancelStatus',
        //     payload: {
        //       cancelStatus: 'NO',
        //     },
        //   });
        // }
      } catch (e) {
        console.log(e);
      }
    },
    *fetchPayStatus({ payload }, { call, put }) {
      const response = yield call(payStatus, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'paySuccess',
          payload: true,
        });
      }
    },

    /** ***********************获取二维码************* */
    // 初始化清除二维码
    *fetchClearQrcode({ payload }, { put }) {
      yield put({
        type: 'qrcode',
        payload,
      });
    },
    *fetchToPay({ payload }, { call, put }) {
      const response = yield call(toPay, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'qrcode',
          payload: response.data || null,
        });
      }
    },


    /** ***********************获取省市区数据************* */
    *fetchGetProvinces({ payload }, { call, put }) {
      const response = yield call(getProvinces, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'provinceData',
          payload: response.data || [],
        });
      }
    },
    *fetchGetCities({ payload }, { call, put }) {
      const response = yield call(getCities, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'citiesData',
          payload: response.data || [],
        });
      }
    },
    *getDistricts({ payload }, { call, put }) {
      const response = yield call(getDistrict, payload);
      if (response && response.code === 200) {
        yield put({
          type: 'districtData',
          payload: response.data || [],
        });
      }
    },
  },

  reducers: {
    ProductReducers(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    contactList(state, { payload }) {
      return {
        ...state,
        contactData: payload,
      };
    },
    event(state, { payload }) {
      return {
        ...state,
        event: payload,
      };
    },
    confirmSubmit(state, { payload }) {
      return {
        ...state,
        confirmInfo: payload,
      };
    },
    routerParams(state, { payload }) {
      return {
        ...state,
        routerParams: payload,
      };
    },
    confirmInfoData(state, { payload }) {
      return {
        ...state,
        confirmInfoData: payload,
      };
    },
    confirmSubmitInfo(state, { payload }) {
      return {
        ...state,
        confirmSubmitInfo: payload,
      };
    },
    provinceData(state, { payload }) {
      return {
        ...state,
        provinceData: payload,
      };
    },
    citiesData(state, { payload }) {
      return {
        ...state,
        citiesData: payload,
      };
    },
    districtData(state, { payload }) {
      return {
        ...state,
        districtData: payload,
      };
    },
    payData(state, { payload }) {
      return {
        ...state,
        payData: payload,
      };
    },
    qrcode(state, { payload }) {
      return {
        ...state,
        qrcode: payload,
      };
    },
    paySuccess(state, { payload }) {
      return {
        ...state,
        paySuccess: payload,
      };
    },
    orderDetail(state, { payload }) {
      return {
        ...state,
        orderDetailReducers: payload,
      };
    },
    cancelStatus(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
