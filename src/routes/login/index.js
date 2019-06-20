/* eslint-disable */
import { List, InputItem, Flex, Toast, Button } from 'antd-mobile';
import { createForm, formShape } from 'rc-form';
import { connect } from 'dva';
import { routerRedux, Link } from 'dva/router';
import React, { PureComponent } from 'react';
import styles from './login.less';
// import { ENGINE_METHOD_NONE } from 'constants';

const links = [
  { url: 'http://www.meclub.org', img: 'link_img/a.jpg', txt: '菁英俱乐部' },
  { url: 'http://www.meclub.org', img: 'link_img/b.jpg', txt: '久事票务' },
  { url: 'http://www.meclub.org', img: 'link_img/c.jpg', txt: '锐速俱乐部' },
];

@createForm()
@connect(({ login, loading, global }) => (
  {
    login,
    global,
    loadingData: loading.effects['login/login'],
  })
)
class Form extends React.Component {
  state = {
    type: 'account',
    // activityKey: 'login',
  };
  static propTypes = {
    form: formShape,
  };
  submits = () => {
    const { type } = this.state;
    this.props.form.validateFields((error, value) => {
      if (error) {
        Object.keys(error).forEach(function (key) {
          Toast.fail(error[key].errors[0].message, 1)
          return
        });
      } else if (!error) {
        const mobile = this.props.form.getFieldValue('mobile').replace(/\s/g, '');
        const password = this.props.form.getFieldValue('password')
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
  render() {
    let errors;
    const { getFieldProps, getFieldError } = this.props.form;
    const { loadingData } = this.props;
    return (
      <div className={styles.codes} >
        <InputItem
          {...getFieldProps('mobile', {
            initialValue: null,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写手机号' }, {
              // pattern: /^1\d{2}\s\d{4}\s\d{4}$/,
              // message: '手机号格式错误！',
            }],
          })}
          type="text"
          placeholder="手机"
          autocomplete="off"
        />
        <InputItem
          {...getFieldProps('password', {
            initialValue: null,
            validateTrigger: 'onBlur',
            rules: [{ required: true, message: '请填写密码' }, {
              pattern: /^\S{6,}$/,
              message: '密码长度至少6位',
            }],
          })}
          type="password"
          placeholder="密码"
          autocomplete="off"
        />
        <Button loading={loadingData} className={styles.loginBtn} onClick={this.submits}>
          <span >登&nbsp;&nbsp;&nbsp;录</span>
        </Button>
        <Link to="/register" className={styles.span}>
          注&nbsp;&nbsp;&nbsp;册
            <span className={styles.line}></span>
        </Link>
        <Link to="/forget" className={styles.span}>
          忘记密码
            <span className={styles.line2}></span>
        </Link>
      </div>
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
  renderLinks = () => {
    const arr = [];
    links.forEach(element => {
      arr.push(
        <a href={element.url}>
          <img src={element.img} alt={element.txt} />
        </a>
      )
    });
    return arr;
  }
  //顶部
  topLayout() {
    return (
      <div className={styles.topFrame}>
        <div className={styles.title}>
          {this.renderLinks()}
        </div>
        {/* <div className={styles.loginWord}>登录</div>
        <div className={styles.dotted}> </div> */}
      </div>
    )
  }
  render() {
    const { loadingData } = this.props;
    return (
      <Flex className={`${styles.home}`} style={{ height: document.documentElement.clientHeight }}>
        {this.topLayout()}
        <Form loadingData={loadingData} />
      </Flex>
    );
  }
}

// Login.propTypes = {
// };

// export default connect()(IndexPage);
