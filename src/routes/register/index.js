/* eslint-disable */
import { List, InputItem, Flex, Button, Toast } from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import React, { PureComponent } from 'react';
import styles from './register.less';
import { ENGINE_METHOD_NONE } from 'constants';

import jussLogo from '../../../public/juss_logo.png';
import jinyinLogo from '../../../public/jingying_logo_huge.jpeg';

@createForm()
@connect(({ login, loading, global }) => (
  {
    login,
    global,
    loadingData: loading.effects['login/submit'],
  })
)
class Form extends React.Component {

  state = {
    type: 'account',
    count: 0,
    prefix: '86',
  };

  static propTypes = {
    form: formShape,
  };

  componentWillReceiveProps(nextProps) {
    const { login: { verifySendStatus } } = nextProps;
    const { count } = this.state;
    if (verifySendStatus && count <= 0) { // 验证码发送成功，开始倒计时
      let count = 59;
      this.setState({ count });
      this.interval = setInterval(() => {
        count -= 1;
        this.setState({ count });
        if (count <= 0) {
          clearInterval(this.interval);
          // 修改验证码状态为false
          this.props.dispatch({ type: 'login/changeVerifyStatus', payload: { status: false } })
        }
      }, 1000);
    }
  }

  componentWillUnmount() {
    if (this.interval) {
      clearInterval(this.interval);
    }
    this.props.dispatch({ type: 'login/resetState' });
  }

  submits = () => {
    const { type } = this.state;
    const mobile = this.props.form.getFieldValue('mobile').replace(/\s/g, '');
    const password = this.props.form.getFieldValue('encodedPassword');
    this.props.form.validateFields((error, value) => {
      // console.log(value.encodedPassword,value.confirm)
      if (error) {
        Object.keys(error).forEach(function (key) {
          Toast.fail(error[key].errors[0].message, 1)
          return
        });
      } else if (value.encodedPassword != value.confirm) {
        Toast.fail('两次输入的密码不一致', 1)
        return
      } else if (!error) {
        this.props.dispatch({
          type: 'login/submit',
          payload: {
            ...value,
            mobile,
            enterpriseId: this.props.global.enterpriseId,
            // prefix: this.state.prefix,
          },
        }).then((val) => {
          if (val) {
            this.props.dispatch({
              type: 'login/login',
              payload: {
                password,
                username: mobile,
                type
              },
            });
          }
        });
      }
    });
  }

  //验证码
  onGetCaptcha = () => {
    this.props.form.validateFields(['mobile'], (error, value) => {
      if (error) {
        Toast.fail(error.mobile.errors[0].message, 1)
      } else {
        this.props.dispatch({
          type: 'login/onsendVerifyCode',
          payload: {
            enterpriseId: this.props.global.enterpriseId,
            mobile: this.props.form.getFieldValue('mobile').replace(/\s/g, ''),
          },
        });
      }
    })
  }

  onReturn = () => {
    this.props.dispatch(
      routerRedux.push({
        pathname: '/user/login',
      })
    );
  }

  render() {
    const { getFieldProps } = this.props.form;
    const { count } = this.state;
    const { loadingData } = this.props;
    return (
      <List renderHeader={() => ''} className={`${styles.formList}`}>
        <InputItem
          {...getFieldProps('mobile', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写手机号' }, {
              pattern: /^1\d{2}\s\d{4}\s\d{4}$/,
              message: '手机号格式错误！',
            }],
          })}
          type="phone"
          placeholder="11位手机号"
        // maxLength = "11"
        ></InputItem>
        <InputItem
          {...getFieldProps('encodedPassword', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写密码' }, {
              pattern: /^\S{6,}$/,
              message: '密码长度至少6位',
            }],
          })}
          type="password"
          placeholder="至少6位，区分大小写"
          maxLength="30"
        ></InputItem>
        <InputItem
          {...getFieldProps('confirm', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请确认密码' }],
          })}
          type="password"
          placeholder="确认密码"
        ></InputItem>
        <div className={styles.cymaFrame}>
          <InputItem
            {...getFieldProps('captcha', {
              initialValue: '',
              validateTrigger: 'onBlur',
              rules: [{ required: true, message: '请填写验证码' }],
            })}
            type="number"
            placeholder="验证码"
            maxLength="6"
          ></InputItem>
          <Button
            size="large"
            disabled={count}
            onClick={this.onGetCaptcha}
            style={{ width: '68%' }}
          >
            {count ? `${count} s` : '获取验证码'}
          </Button>
        </div>
        <Button loading={loadingData} className={styles.loginBtn} onClick={this.submits}>
          <span >注&nbsp;&nbsp;&nbsp;册</span>
        </Button>
        <Link className={styles.already} to="/user/login">使用已有账户登录</Link>
      </List>
    );
  }
}
@connect(({ login, loading }) => (
  {
    login,
    loadingData: loading.effects['login/query'],
  })
)
export default class Register extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      type: 'account',
      autoLogin: true,
    };
  }
  goHome = () => {
    this.props.dispatch(routerRedux.push('/credit'));
  }
  //顶部
  topLayout() {
    return (
      <div className={styles.topFrame}>
        <div className={styles.title}>
          <img src={jussLogo} alt="久事赛事" onClick={this.goHome} />
          <img src={jinyinLogo} alt="" onClick={this.goHome} />
        </div>
        <div className={styles.loginWord}>注册</div>
        <div className={styles.dotted}> </div>
      </div>
    )
  }
  render() {
    const { loadingData } = this.props;
    return (
      <Flex className={`${styles.register}`} style={{ height: document.documentElement.clientHeight }}>
        {this.topLayout()}
        <Form loadingData={loadingData} />
      </Flex>
    );
  }
}
