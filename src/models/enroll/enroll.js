// import { Toast } from 'antd-mobile';
// import { routerRedux } from 'dva/router';
// import {
//   // queryEventDetail,
//   queryNormalDetail,
//   getConfirmSubmit,
//   getNormalConfirmSubmit,
//   getConfirmInfo,
//   getTicketConfirmInfo,
//   getProvinces,
//   addressAdd,
//   addressUpdate,
//   addressDelete,
//   getSettlementInfo,
//   getNormalSettlementInfo,
//   orderTime,
//   orderUrl,
//   getCardTypeApi,
//   authorize,
//   jsapi,
//   payStatus,
// } from '../../services/product/detailService';

// import {
//   queryEnrollDetail,
//   queryTemplateId,
//   enrollSubmit,
//   orderSubmit,
// } from '../../services/enroll/detailService';

// export default {
//   namespace: 'enroll',

//   state: {
//     current: {},
//     gunnimabi: null,
//     ionviceData: null,
//     defaultAddress: null,
//     payData: null,
//     orderUrl: null,
//     cardType: null,
//     memoData: '',
//     checkedData: '1',
//     channel: '',
//     authorize: null,
//     jsapi: null,
//     confirmSubmitError: '',
//     payStatus: null,
//     templateList: null,
//   },

//   effects: {
//     // 提交
//     *fetchSubmit({ payload }, { call, put }) { // eslint-disable-line
//       try {
//         const response = yield call(enrollSubmit, payload);
//         if (response && response.code === 200) {
//           console.log(response.data);
//           yield call(orderSubmit, response.data.orderNo);
//         }
//       } catch (e) {
//         console.log(e);
//       }
//     },
//     // 活动
//     *fetchEnrollOne({ payload }, { call, put }) { // eslint-disable-line
//       try {
//         const response = yield call(queryEnrollDetail, payload);
//         if (response && response.code === 200) {
//           yield put({
//             type: 'saveOne',
//             payload: response.data || {},
//           });
//         } else {
//           Toast.fail(response.message, 1);
//         }
//       } catch (e) {
//         Toast.fail(e.message, 1);
//       }
//     },
//     // 模板
//     *fetchTemplateId({ payload }, { call, put }) { // eslint-disable-line
//       console.log(payload);
//       try {
//         const response = yield call(queryTemplateId, payload);
//         if (response && response.code === 200) {
//           yield put({
//             type: 'saveTemplateList',
//             payload: response.data || {},
//           });
//         }
//       } catch (e) {
//         console.log(e);
//       }
//     },
//     // 普通商品
//     *fetchNormalOne({ payload }, { call, put }) {
//       const response = yield call(queryNormalDetail, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'saveOne',
//           payload: response.data || {},
//         });
//       }
//     },
//     // 清空缓存
//     *clearCurrent({ payload }, { put }) {
//       yield put({
//         type: 'saveOne',
//         payload,
//       });
//     },

//     /** ***********************购买渠道************* */
//     *fetchChannel({ payload }, { put }) {
//       yield put({
//         type: 'channel',
//         payload,
//       });
//     },
//     /** ***********************订单结算页面信息************* */
//     // 票务
//     *fetchConfirmSubmit({ payload }, { call, put }) {
//       const response = yield call(getConfirmSubmit, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'confirmSubmit',
//           payload: response.data,
//         });
//       } else if (response && response.code !== 200) {
//         Toast.fail(response.message);
//         yield put(routerRedux.replace('/credit'));
//       }
//     },
//     // 普通商品
//     *fetchNormalConfirmSubmit({ payload }, { call, put }) {
//       const response = yield call(getNormalConfirmSubmit, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'confirmSubmit',
//           payload: response.data,
//         });
//       } else if (response && response.code !== 200) {
//         Toast.fail(response.message);
//         yield put(routerRedux.replace('/credit'));
//       }
//     },

//     /** ***********************获取收货地址************* */
//     // 普通商品
//     *fetchConfirmInfo({ payload }, { call, put }) {
//       const response = yield call(getConfirmInfo, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'confirmInfoData',
//           payload: response.data,
//         });
//       }
//     },
//     // 票务商品
//     *fetchTicketConfirmInfo({ payload }, { call, put }) {
//       const response = yield call(getTicketConfirmInfo, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'confirmInfoData',
//           payload: response.data,
//         });
//       }
//     },
//     /** ***********************添加收货人地址************* */
//     *fetchAddressAdd({ payload }, { call }) {
//       const response = yield call(addressAdd, payload);
//       if (response && response.code === 200) {
//         Toast.success('新增成功');
//       }
//     },
//     /** ***********************编辑收货人地址************* */
//     *fetchAddressUpdate({ payload }, { call }) {
//       const response = yield call(addressUpdate, payload);
//       if (response && response.code === 200) {
//         Toast.success('编辑成功');
//       }
//     },
//     /** ***********************编辑************* */
//     *fetchEditAddress({ payload }, { put }) {
//       yield put({
//         type: 'editAddress',
//         payload,
//       });
//     },
//     /** ***********************删除收货人地址************* */
//     *fetchAddressDelete({ payload }, { call }) {
//       const response = yield call(addressDelete, payload);
//       if (response && response.code === 200) {
//         Toast.success('删除成功');
//       }
//     },
//     /** ***********************默认收货人地址************* */
//     *fetchDefaultAddress({ payload }, { put }) {
//       yield put({
//         type: 'defaultAddress',
//         payload,
//       });
//       Toast.success('设置成功');
//     },

//     /** ***********************获取省市区数据************* */
//     *fetchGetAreaTree({ payload }, { call, put }) {
//       const response = yield call(getProvinces, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'areaTree',
//           payload: response.data || [],
//         });
//       }
//     },

//     /** ***********************发票信息************* */
//     *fetchInvoiceSubmit({ payload }, { put }) {
//       yield put({
//         type: 'ionviceData',
//         payload,
//       });
//     },

//     /** ***********************提交订单************* */
//     // 票务
//     *fetchSubmitOrder({ payload }, { call, put }) {
//       const response = yield call(getSettlementInfo, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'payData',
//           payload: response.data || null,
//         });
//       } else if (response) {
//         Toast.fail(response.message, 1);
//       }
//     },
//     *fetchNormalSubmitOrder({ payload }, { call, put }) {
//       const response = yield call(getNormalSettlementInfo, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'payData',
//           payload: response.data || null,
//         });
//       } else if (response) {
//         Toast.fail(response.message, 1);
//       }
//     },
//     *fetchMemo({ payload }, { put }) {
//       yield put({
//         type: 'memoData',
//         payload,
//       });
//     },
//     *fetchChecked({ payload }, { put }) {
//       yield put({
//         type: 'checkedData',
//         payload,
//       });
//     },
//     /** ***********************授权************* */
//     *getAuthorize({ payload }, { call, put }) {
//       const response = yield call(authorize, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'authorize',
//           payload: response.data || null,
//         });
//       }
//     },
//     *getJsapi({ payload }, { call, put }) {
//       const response = yield call(jsapi, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'jsapi',
//           payload: response.data || null,
//         });
//       }
//     },
//     // *fetchOrderDetail({ payload }, { call, put }) {
//     //   const response = yield call(getOrderDetail, payload);
//     //   if (response && response.code === 200) {
//     //     yield put({
//     //       type: 'orderDetail',
//     //       payload: response.data || null,
//     //     });
//     //   }
//     // },
//     // 获取订单状态
//     *fetchPayStatus({ payload }, { call, put }) {
//       const response = yield call(payStatus, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'payStatus',
//           payload: response.data,
//         });
//       }
//     },
//     *clearPayStatus({ payload }, { put }) {
//       yield put({
//         type: 'payStatus',
//         payload,
//       });
//     },
//     // 订单时间
//     *fetchOrderTime({ payload }, { call, put }) {
//       const response = yield call(orderTime, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'orderTime',
//           payload: response.data || {},
//         });
//       }
//     },
//     // h5订单地址
//     *fetchOrderUrl({ payload }, { call, put }) {
//       const response = yield call(orderUrl, payload);
//       if (response && response.code === 200) {
//         yield put({
//           type: 'orderUrl',
//           payload: response.data || null,
//         });
//       }
//     },
//     // 清空h5订单地址
//     *clearOrderUrl({ payload }, { put }) {
//       yield put({
//         type: 'orderUrl',
//         payload,
//       });
//     },
//     *getCardTypeEffec(_, { call, put }) {
//       try {
//         const response = yield call(getCardTypeApi);
//         if (response.code === 200) {
//           yield put({
//             type: 'cardType',
//             payload: response.data || null,
//           });
//         }
//       } catch (e) {
//         console.log(e);
//       }
//     },

//     /** ***********************判断订单是否有错误信息************* */
//     // 票务
//     *fetchConfirmSubmitError({ payload }, { call, put }) {
//       const response = yield call(getConfirmSubmit, payload);
//       if (response && response.message) {
//         Toast.fail(response.message, 1);
//         yield put({
//           type: 'confirmSubmitError',
//           payload: 'error',
//         });
//       }
//     },
//     // 普通商品
//     *fetchNormalConfirmSubmitError({ payload }, { call, put }) {
//       const response = yield call(getNormalConfirmSubmit, payload);
//       if (response && response.message) {
//         Toast.fail(response.message, 1);
//         yield put({
//           type: 'confirmSubmitError',
//           payload: 'error',
//         });
//       }
//     },
//     // 清空错误
//     *fetchClearError({ payload }, { put }) {
//       yield put({
//         type: 'confirmSubmitError',
//         payload,
//       });
//     },
//   },

//   reducers: {
//     saveOne(state, action) {
//       return {
//         ...state,
//         current: action.payload,
//       };
//     },
//     saveTemplateList(state, action) {
//       return {
//         ...state,
//         templateList: action.payload,
//       };
//     },
//     confirmSubmit(state, { payload }) {
//       return {
//         ...state,
//         confirmInfo: payload,
//       };
//     },
//     confirmInfoData(state, { payload }) {
//       return {
//         ...state,
//         confirmInfoData: payload,
//       };
//     },
//     areaTree(state, { payload }) {
//       return {
//         ...state,
//         areaTree: payload,
//       };
//     },
//     ionviceData(state, { payload }) {
//       return {
//         ...state,
//         ionviceData: payload,
//       };
//     },
//     editAddress(state, { payload }) {
//       return {
//         ...state,
//         editAddress: payload,
//       };
//     },
//     defaultAddress(state, { payload }) {
//       return {
//         ...state,
//         defaultAddress: payload,
//       };
//     },
//     payData(state, { payload }) {
//       return {
//         ...state,
//         payData: payload,
//       };
//     },
//     orderTime(state, { payload }) {
//       return {
//         ...state,
//         orderTime: payload,
//       };
//     },
//     orderUrl(state, { payload }) {
//       return {
//         ...state,
//         orderUrl: payload,
//       };
//     },
//     cardType(state, { payload }) {
//       return {
//         ...state,
//         cardType: payload,
//       };
//     },
//     memoData(state, { payload }) {
//       return {
//         ...state,
//         memoData: payload,
//       };
//     },
//     checkedData(state, { payload }) {
//       return {
//         ...state,
//         checkedData: payload,
//       };
//     },
//     channel(state, { payload }) {
//       return {
//         ...state,
//         channel: payload,
//       };
//     },
//     confirmSubmitError(state, { payload }) {
//       return {
//         ...state,
//         confirmSubmitError: payload,
//       };
//     },
//     authorize(state, { payload }) {
//       return {
//         ...state,
//         authorize: payload,
//       };
//     },
//     jsapi(state, { payload }) {
//       return {
//         ...state,
//         jsapi: payload,
//       };
//     },
//     payStatus(state, { payload }) {
//       return {
//         ...state,
//         payStatus: payload,
//       };
//     },
//   },
// };

