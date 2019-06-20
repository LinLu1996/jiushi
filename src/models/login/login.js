/* eslint-disable */
import { routerRedux } from 'dva/router';
import { Toast } from 'antd-mobile';
import { fakeAccountLogin, fakeLoginOut, sendResetPwdVerifyCode, resetPwd } from '../../services/login/loginService';
import { sendVerifyCode, fakeRegister } from '../../services/register/registerService.js';
import { setAuthority } from '../../utils/authority';
import { reloadAuthorized } from '../../utils/Authorized';

export default {
  namespace: 'login',
  state: {
    status: undefined,
    verifySendStatus: null,
    resetSuccess: false,//修改密码
  },
  effects: {
    *login({ payload }, { call, select, put }) {
      try {
        const response = yield call(fakeAccountLogin, payload);
        // Login successfully
        if (response.code === 200) {
          yield put({
            type: 'changeLoginStatus',
            payload: { status: 'ok', currentAuthority: 'user' },
          });
          reloadAuthorized();
          const search = yield select((state) => {
            return `${state.routing.location.search}`;
          });
          yield put(routerRedux.replace(`/${search}`));
        } else {
          Toast.fail('用户名密码错误', 1);
        }
      } catch (e) {
        yield put({
          type: 'changeLoginStatus',
          payload: { status: 'error', type: 'account', currentAuthority: 'guest' },
        });
      }
    },
    *registertoinfo({ payload }, { call, select, put }) {
      try {
        const response = yield call(fakeAccountLogin, payload);
        if (response.code === 200) {
          yield put({
            type: 'changeLoginStatus',
            payload: { status: 'ok', currentAuthority: 'user' },
          });
          reloadAuthorized();
          yield put(routerRedux.push('/member/info'));
        } else {
          Toast.fail('用户名密码错误', 1);
        }
      } catch (e) {
        yield put({
          type: 'changeLoginStatus',
          payload: { status: 'error', type: 'account', currentAuthority: 'guest' },
        });
      }
    },
    *logout(_, { put, select, call }) {
      try {
        yield call(fakeLoginOut);
        // get location pathname
        const urlParams = new URL(window.location.href);
        const pathname = yield select((state) => {
          return `${state.routing.location.pathname}${state.routing.location.search}`;
        });
        // add the parameters in the url
        urlParams.searchParams.set('redirect', pathname);
        window.history.replaceState(null, 'login', urlParams.href);
      } finally {
        yield put({
          type: 'changeLoginStatus',
          payload: {
            status: false,
            currentAuthority: 'guest',
          },
        });
        reloadAuthorized();
        yield put(routerRedux.push('/user/login'));
      }
    },
    // 验证码
    *onsendVerifyCode({ payload }, { call, put }) {
      const response = yield call(sendVerifyCode, payload);
      if (response && response.code !== 200) {
        Toast.fail(response.message, 1);
      } else {
        Toast.success('验证码已发送', 1);
      }
      yield put({ type: 'changeVerifyStatus', payload: { status: response && response.code === 200 || false } });
    },
    //提交
    *submit({ payload }, { call, put }) {
      try {
        const response = yield call(fakeRegister, payload);
        if (response.code !== 200) {
          Toast.fail(response.message, 1);
        } else if (response.code == 200) {
          Toast.success('注册成功', 1);
          sessionStorage.setItem('sessionInitialPage', 1);//初始化注册后的登录页
          return Promise.resolve(true)
        }
        yield put({
          type: 'registerHandle',
          payload: { status: response.code === 200 ? 'ok' : 'error' },
        });

      } catch (e) {
        console.log(e);
      }
    },
    //重置密码 验证码
    *sendResetPwdVerifyCode({ payload }, { call, put }) {
      const response = yield call(sendResetPwdVerifyCode, payload);
      if (response && response.code !== 200) {
        Toast.fail(response.message, 1);
      } else if (response.code == 200) {
        Toast.success('验证码已发送', 1);
        // return Promise.resolve(true)
      }
      yield put({ type: 'changeVerifyStatus', payload: { status: response && response.code === 200 || false } });
    },
    //重置密码
    *resetPwd({ payload }, { call, put }) {
      try {
        const response = yield call(resetPwd, payload);
        if (response.code !== 200) {
          Toast.fail(response.message, 1);
        } else {
          yield put({ type: 'changeStatus' })
          return Promise.resolve(true)
        }
      } catch (e) {
        console.log(e);
      }
    },
    // eslint-disable-next-line
    *resetState({ _ }, { put }) {
      yield put({ type: 'reset' });
    },
  },
  reducers: {
    changeLoginStatus(state, { payload }) {
      setAuthority(payload.currentAuthority);
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
    registerHandle(state, { payload }) {
      setAuthority('user');
      reloadAuthorized();
      return {
        ...state,
        status: payload.status,
      };
    },
    changeStatus(state) {
      return {
        ...state,
        resetSuccess: true,
      }
    },
    changeVerifyStatus(state, { payload }) {
      return {
        ...state,
        verifySendStatus: payload.status,
      };
    },
    reset() {
      return {
        status: undefined,
        verifySendStatus: null,
        resetSuccess: false,//修改密码
      };
    },
  },
};
