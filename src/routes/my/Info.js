import { connect } from 'dva';
import React, { PureComponent } from 'react';
import FullScreenFlex from 'components/Flex';
import { Checkbox, Toast, Button, List, InputItem, NavBar, Icon, Picker } from 'antd-mobile';
import { createForm } from 'rc-form';
import {
  checkIdCard,
  checkPassport,
  checkHongKongAndMacauPass,
  checkEmail2,
} from '../../utils/validateUtils';

import style from './Info.less';

const { Brief } = List.Item;
const { CheckboxItem } = Checkbox;
// const { RadioItem } = Radio;
const failToast = (contentText = '') => {
  Toast.fail(contentText, 2);
};

const successToast = (contentText = '') => {
  Toast.success(contentText, 3);
};

@connect(({ info }) => ({
  defaultUserInfo: info.defaultUserInfo,
  message: info.message,
  memberInfoIsComplement: info.memberInfoIsComplement,
}))
@createForm()
export default class Info extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      genderList: [{ label: '男', value: 1 }, { label: '女', value: 2 }],
      // genderListError: false,
      cardTypeReducers: [],
      questionnaireSurvey1: [],
      // questionnaireSurvey2: [],
      // questionnaireSurvey3: [],
      // questionnaireSurvey4: [],
      // genderValue: '',
      cardTypeValue: [],
      question1Value: '',
    };
  }
  componentDidMount() {
    this.getDefaultUserInfo();
  }
  // 选择性别
  // onGenderChange = (value) => {
  //   this.setState({
  //     genderValue: value,
  //     genderListError: false,
  //   });
  // }
  // 向this.props.form中添加元素 name:属性，value：值
  setDataToForm = (name, value) => {
    this.props.form.setFieldsValue({
      [name]: value,
    });
  }
  // 获取默认信息
  getDefaultUserInfo = () => {
    this.props.dispatch({
      type: 'info/getDefaultUserInfoEffec',
    }).then(() => {
      const { defaultUserInfo } = this.props;
      this.setState({
        cardTypeValue: defaultUserInfo.idCardTypeValue && [defaultUserInfo.idCardTypeValue] || [],
      });
    });
    this.props.dispatch({
      type: 'info/getMemberInfoIsComplement',
    });

    // 字典查询
    const dicval = ['STATUS', 'QUESTION1'];
    // 获取一共到现场看过几次上海劳力士大师赛
    this.props.dispatch({
      type: 'dictionary/get',
      key: dicval[1],
    }).then((val) => {
      this.setState({ questionnaireSurvey1: this.formatCardTypeData(val) || [] });
    });


    // 获取从哪里了解到会员票务产品信息
    // this.props.dispatch({
    //   type: 'dictionary/get',
    //   key: dicval[2],
    // }).then((val) => {
    //   this.setState({ questionnaireSurvey2: this.formatCardTypeData(val) || [] });
    // });

    // 获取对哪些会员产品感兴趣
    // this.props.dispatch({
    //   type: 'dictionary/get',
    //   key: dicval[3],
    // }).then((val) => {
    //   this.setState({ questionnaireSurvey3: this.formatCardTypeData(val) || [] });
    // });


    // 获取你通常跟谁一起现场看球
    // this.props.dispatch({
    //   type: 'dictionary/get',
    //   key: dicval[4],
    // }).then((val) => {
    //   this.setState({ questionnaireSurvey4: this.formatCardTypeData(val) || [] });
    // });
    // 获取卡类型
    this.props.dispatch({
      type: 'info/getCardTypeEffec',
    }).then((val) => {
      this.setState({
        cardTypeReducers: this.formatCardTypeData(val) || [],
      });
    });
  }
  // 选择证件类型
  handleChangeIdCard = (value) => {
    this.setState({
      cardTypeValue: value,
    });
    this.props.form.setFieldsValue({
      idCard: '',
    });
  }
  // updata defaultUserInfo reducers
  putDefaultUserInfoEffect = (DefaultUserInfo, name, value, dispatch) => {
    const defaultUserInfo = {
      ...DefaultUserInfo,
      question1: DefaultUserInfo.question1 || '',
      question2: DefaultUserInfo.question2 || '',
      question3: DefaultUserInfo.question3 || '',
      question4: DefaultUserInfo.question4 || '',
    };
    const itemValueInPorps = defaultUserInfo[name];
    const itemValueToSet = new Set(itemValueInPorps.split(','));
    let resultStringForPorps = '';
    let resultDefaultUserInfoForPorps = {};
    if (itemValueToSet.has(value)) {
      itemValueToSet.delete(value);
    } else {
      itemValueToSet.add(value);
      if (itemValueToSet.has('')) {
        itemValueToSet.delete('');
      }
    }
    resultStringForPorps = [...itemValueToSet].toString();
    resultDefaultUserInfoForPorps = {
      ...defaultUserInfo,
      [name]: resultStringForPorps,
    };
    dispatch({
      type: 'info/putDefaultUserInfoEffect',
      payload: resultDefaultUserInfoForPorps,
    });
  }
  question1Onchange = (name, value) => {
    this.setState({
      [name]: value,
    });
  }
  formatCardTypeData = (data) => {
    return data && data.map((item) => {
      return { label: item.dictName, value: item.dictValue };
    });
  }
  // 发起submit请求
  effectSubmit = (value) => { // value: obj
    this.props.dispatch({
      type: 'info/setMemberInfoEffect',
      payload: value,
    }).then(() => {
      if (!this.props.message) {
        this.getDefaultUserInfo();
        sessionStorage.setItem('sessionInitialPage', 1);
        successToast('个人信息修改完成');
        setTimeout(() => { history.go(-1); }, 1000);
        this.props.dispatch({
          type: 'info/getMemberInfoIsComplement',
        });
      } else {
        failToast(this.props.message || '个人信息修改失败');
      }
    });
  }
  /* ****************提交方法******************* */
  submitHandle = () => {
    const { defaultUserInfo } = this.props;
    this.props.form.setFieldsValue({
      // gender: this.state.genderValue[0] || defaultUserInfo.gender,
      // idCardTypeValue: this.state.cardTypeValue[0] || defaultUserInfo.idCardTypeValue,
      question1: this.state.question1Value || defaultUserInfo.question1,
      question2: defaultUserInfo.question2,
      question3: defaultUserInfo.question3,
      question4: defaultUserInfo.question4,
    });
    this.props.form.validateFields((error, value) => {
      if (error) {
        // const errorInfo = error[Object.keys(error)[0]].error[0].message;
        const errorInfo = Object.keys(error)[0];
        console.log(errorInfo);
        const errorContent = error.actualName ||
          error.gender || error.idCardTypeValue || error.idCard || error.email
          || error.question1 || error.question2 || error.question3 || error.question4;
        const errorArray = errorContent.errors;
        const errorObj = errorArray[0];
        const errMsg = errorObj.message;
        failToast(errMsg);
        return null;
      } else if (this.state.cardTypeValue.length === 0 && !error) {
        Toast.fail('请选择证件类型', 2);
      } else if (this.state.cardTypeValue.length !== 0 && !error) {
        const datas = {
          ...value,
          isMaster: 'branch',
          gender: value.gender[0],
          idCardTypeValue: this.state.cardTypeValue[0],
        };
        this.effectSubmit({ ...datas, form: '完善' });
      }
    });
  }
  render() {
    const { getFieldProps } = this.props.form;
    const { defaultUserInfo, memberInfoIsComplement, dispatch } = this.props;
    const {
      // genderValue,
      cardTypeValue,
      question1Value,
    } = this.state;
    const caseCardTypeValue = cardTypeValue.length === 0 ?
      defaultUserInfo.idCardTypeValue : cardTypeValue[0];
    let validatorType;
    switch (caseCardTypeValue) {
      case '1':
        validatorType = checkIdCard;
        break;
      case '2':
        validatorType = checkPassport;
        break;
      case '3':
        validatorType = checkHongKongAndMacauPass;
        break;
      default:
        break;
    }

    // 导航栏组件
    const navbar = (
      <NavBar
        mode="light"
        icon={<Icon type="left" />}
        onLeftClick={() => {
          sessionStorage.setItem('sessionInitialPage', 1);
          history.go(-1);
        }}
      >
        个人信息
      </NavBar>
    );
    return (
      <FullScreenFlex className="info" >
        <div className={style.infoWrapper}>
          {/* 导航栏 */}
          {navbar}
          <List>
            <div style={{ display: memberInfoIsComplement && 'none' }} className={style.showInfoTitle}>完善个人信息后，赠送300积分</div>
            <InputItem
              {...getFieldProps('actualName', {
                initialValue: defaultUserInfo.actualName,
                rules: [{ required: true, message: '请输入姓名!' }],
              })}
              placeholder="请输入姓名"
            >
              <span className={style.requsetedStar}>*</span>姓名
            </InputItem>
            <InputItem
              {...getFieldProps('mobile', {
                initialValue: defaultUserInfo.mobile,
                rules: [{ required: true }],
              })}
              editable={false}
            >
              &nbsp;&nbsp;手机号
            </InputItem>
            <Picker
              {...getFieldProps('gender', {
                initialValue: defaultUserInfo.gender && [defaultUserInfo.gender] || null,
                rules: [{ required: true, message: '请选择性别!' }],
              })}
              data={this.state.genderList}
              cols={1}
            // value={genderValue}
            // onChange={this.onGenderChange}
            >
              <List.Item arrow="horizontal" last="true">
                <span className={style.requsetedStar}>*</span>性别
              </List.Item>
            </Picker>
            {/* <List.Item arrow=" "> */}
            {/* <span className={style.requsetedStar}>*</span>性别 */}
            {/* <Brief>
              {this.state.genderList.map(i => (
                <RadioItem
                  {...getFieldProps('gender', {
                    initialValue: defaultUserInfo.gender,
                    rules: [{ required: true, message: '请选择性别!' }],
                  })}
                  key={i.value}
                  checked={(genderValue || defaultUserInfo.gender) === i.value}
                  onChange={() => this.question1Onchange('genderValue', i.value)}
                >
                  {i.label}
                </RadioItem>
              ))}
            </Brief> */}
            {/* </List.Item> */}
            {/* <List.Item arrow=" ">
              <span className={style.requsetedStar}>*</span>证件类型
              <Brief>
                {this.state.cardTypeReducers.map(i => (
                  <RadioItem
                    {...getFieldProps('idCardTypeValue', {
                      initialValue: defaultUserInfo.idCardTypeValue,
                      rules: [{ required: true, message: '请选择证件类型!' }],
                    })}
                    key={i.value}
                    checked={(cardTypeValue || defaultUserInfo.idCardTypeValue) === i.value}
                    onChange={() => this.question1Onchange('cardTypeValue', i.value)}
                  >
                    {i.label}
                  </RadioItem>
                ))}
              </Brief>
            </List.Item> */}
            <Picker
              // {...getFieldProps('idCardTypeValue', {
              //   initialValue: [defaultUserInfo.idCardTypeValue],
              //   rules: [{ required: true, message: '请选择证件类型!' }],
              // })}
              data={this.state.cardTypeReducers}
              cols={1}
              value={this.state.cardTypeValue}
              onChange={this.handleChangeIdCard}
            >
              <List.Item arrow="horizontal" last="true">
                <span className={style.requsetedStar}>*</span>证件类型
              </List.Item>
            </Picker>
            <InputItem
              {...getFieldProps('idCard', {
                initialValue: defaultUserInfo.idCard,
                rules: [{ required: true, message: '请输入证件号码!' }, { validator: validatorType }],
              })}
              placeholder="请输入证件号码"
            >
              <span className={style.requsetedStar}>*</span>证件号码
            </InputItem>
            <InputItem
              {...getFieldProps('email', {
                initialValue: defaultUserInfo.email,
                rules: [{ required: true, message: '请填写正确的邮件!' }, { validator: checkEmail2 }],
              })}
              placeholder="请输入正确的邮件"
              type="email"
            >
              <span className={style.requsetedStar}>*</span>E-MAIL
            </InputItem>
            <List.Item arrow=" ">
              <span className={style.requsetedStar}>*</span>你对以下哪个赛事感兴趣？
              <Brief>
                {this.state.questionnaireSurvey1.map(i => (
                  <CheckboxItem
                    {...getFieldProps('question1', {
                      initialValue: question1Value,
                      rules: [{ required: true, message: '请选择你对以下哪个赛事感兴趣!' }],
                    })}
                    key={i.value}
                    checked={defaultUserInfo.question1 &&
                      defaultUserInfo.question1.indexOf(i.value) > -1
                    }
                    onChange={() => this.putDefaultUserInfoEffect(defaultUserInfo, 'question1', i.value, dispatch)}
                  >
                    {i.label}
                  </CheckboxItem>
                ))}
              </Brief>
            </List.Item>
          </List>
          <div className={style.BtnWrapper}>
            <Button onClick={this.submitHandle}>保 存</Button>
          </div>
        </div>
      </FullScreenFlex >
    );
  }
}
