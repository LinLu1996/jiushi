/* eslint-disable */
import { Button, List, InputItem, Flex, Toast, Steps } from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import React, { PureComponent } from 'react';
import styles from './forget.less';

import jussLogo from '../../../public/juss_logo.png';
import jinyinLogo from '../../../public/jingying_logo_huge.jpeg';

@createForm()
@connect(({ login, loading, global }) => (
  {
    login,
    global,
    loadingData: loading.effects['login/reset'],
  })
)
class Form extends React.Component {
  state = {
    type: 'mobile',
    count: 0,
    prefix: '86',
    mobile: null,
    captcha: null,
  };
  static propTypes = {
    form: formShape,
  };

  componentWillReceiveProps(nextProps) {
    const { login: { verifySendStatus } } = nextProps;
    const { count } = this.state;
    if (verifySendStatus && count <= 0) { // 验证码发送成功，开始倒计时
      let count = 59;
      this.setState({ count }); // eslint-disable-line
      this.interval = setInterval(() => {
        count -= 1;
        this.setState({ count }); // eslint-disable-line
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

  onGetVerifyCode = () => {
    this.props.form.validateFields(['mobile'], (error, value) => {
      if (error) {
        Toast.fail(error.mobile.errors[0].message, 1)
      } else {
        this.props.dispatch({
          type: 'login/sendResetPwdVerifyCode',
          payload: {
            enterpriseId: this.props.global.enterpriseId,
            mobile: this.props.form.getFieldValue('mobile').replace(/\s/g, ''),
          },
        });
      }
    })
  }

  submit = () => {
    const { dispatch } = this.props;
    this.props.form.validateFields((error, value) => {
      if (error) {
        Object.keys(error).forEach(function (key) {
          Toast.fail(error[key].errors[0].message, 1)
          return
        });
      } else if (value.encodedPassword != value.encodedTwicePassword) {
        Toast.fail('两次输入的密码不一致', 1)
        return
      } else {
        const submitData = {
          mobile: this.props.form.getFieldValue('mobile').replace(/\s/g, ''),
          captcha: this.props.form.getFieldValue('captcha'),
          encodedTwicePassword: this.props.form.getFieldValue('encodedTwicePassword'),
          encodedPassword: this.props.form.getFieldValue('encodedPassword')
        }
        console.log(submitData);
        dispatch({
          type: 'login/resetPwd',
          payload: submitData,
        }).then((resolve) => {
          if (resolve) {
            Toast.success('修改成功', 1)
            this.onReturn()
          }
        })
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
    let errors;
    const { getFieldProps, getFieldError } = this.props.form;
    const { count } = this.state;
    const { loadingData } = this.props;
    const { current } = this.props
    return (
      <List renderHeader={() => ''} className={`${styles.formList}`}>
        <InputItem
          {...getFieldProps('mobile', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写手机号' }, {
              pattern: /^1\d{2}\d{4}\d{4}$/,
              message: '手机号格式错误！',
            }],
          })}
          type="number"
          placeholder="11位手机号"
          maxLength = "11"
        ></InputItem>
        <InputItem
          {...getFieldProps('encodedPassword', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请设填写新密码' }, {
              pattern: /^\S{6,}$/,
              message: '密码长度至少6位',
            }],
          })}
          type="password"
          placeholder="请输入新密码，至少6位"
          maxLength="30"
        ></InputItem>
        <InputItem
          {...getFieldProps('encodedTwicePassword', {
            initialValue: '',
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请确认新密码' }, {
              pattern: /^\S{6,}$/,
              message: '密码长度至少6位',
            }],
          })}
          type="password"
          placeholder="请确认新密码"
          maxLength="30"
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
            className={styles.getCaptcha}
            onClick={this.onGetVerifyCode}
            style={{ width: '68%' }}
          >
            {count ? `${count} s` : '获取验证码'}
          </Button>
        </div>
        <Button loading={loadingData} className={styles.loginBtn} onClick={this.submit}>
          <span >确&nbsp;&nbsp;&nbsp;认</span>
        </Button>
        <Link to="/user/login" className={styles.span}>
          返回登录
          {/* <span className={styles.line}></span> */}
        </Link>
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
export default class Login extends PureComponent {
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
        <div className={styles.loginWord}>忘记密码</div>
        <div className={styles.dotted}> </div>
      </div>
    )
  }

  render() {
    const { loadingData } = this.props;
    return (
      <Flex className={`${styles.register}`}>
        {this.topLayout()}
        <Form loadingData={loadingData} />
      </Flex>
    );
  }
}

