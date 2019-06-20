import { queryProduct } from '../../services/product/productService';

export default {
  namespace: 'product',

  state: {
    list: [],
    page: 0,
    limit: 8,
    total: 0,
    hasMore: true,
    creditSort: 'asc',
    categoryType: '0',
    filters: {},
    /** 刷新 状态 */
    refreshing: false,
    loadFlag: true,
  },

  effects: {
    *query({ payload, reset }, { call, put, select }) { // eslint-disable-line
      const filters = yield select(state => state.product.filters);
      // loadFlag = true
      yield put({ type: 'loadFlag', payload: true });
      try {
        yield put({ type: 'changeRefreshStatus', payload: true });
        const response = yield call(queryProduct, { ...payload, ...filters });
        yield put({ type: 'changeRefreshStatus', payload: false });
        if (response && response.code === 200) {
          yield put({
            type: 'save',
            payload: { data: response.data, reqParam: payload, reset },
          });
          yield put({ type: 'loadFlag', payload: false });
        } else {
          yield put({ type: 'loadFlag', payload: false });
          throw Error('');
        }
      } catch (e) {
        console.log(e);
        yield put({ type: 'loadFlag', payload: false });
        yield put({ type: 'noMore' });
      }
    },
  },

  reducers: {
    save(state, { payload }) {
      const { data: { total, rows = [] }, reqParam, reset } = payload;
      let { limit, page } = state;
      limit = reqParam.limit || limit;
      page = reqParam.page || page;
      const hasMore = page * limit < total;
      return {
        ...state,
        list: reset ? rows : [...state.list, ...rows],
        page,
        limit,
        total,
        hasMore,
      };
    },
    updateFilters(state, { payload }) {
      const { filters } = state;
      return {
        ...state,
        filters: { ...filters, ...payload },
      };
    },
    reset() {
      return {
        list: [],
        page: 0,
        limit: 8,
        total: 0,
        hasMore: true,
        creditSort: 'asc',
        categoryType: '0',
        filters: {},
      };
    },
    noMore(state) {
      return {
        ...state,
        hasMore: false,
      };
    },
    changeRefreshStatus(state, { payload }) {
      return {
        ...state,
        refreshing: payload,
      };
    },
    loadFlag(state, { payload }) {
      return {
        ...state,
        loadFlag: payload,
      };
    },
  },
};
