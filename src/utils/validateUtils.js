// 验证手机号
export function checkMobile(rule, value, callback) {
  // 正则用//包起来
  const regex = /^((\+)?86|((\+)?86)?)0?1[23465789]\d{9}$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('请输入正确的手机号码！');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 验证固话号码
export function checkFixed(rule, value, callback) {
  const regex = /^(0\d{2}-?\d{8}(-?\d{1,4})?)|(0\d{3}-?\d{7,8}(-?\d{1,4})?)$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('请输入正确的电话号码！');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 验证手机或座机
export function checkTelephone(rule, value, callback) {
  const regex = /^(0\d{2}-?\d{8}(-?\d{1,4})?)|(0\d{3}-?\d{7,8}(-?\d{1,4})?)|(((\+)?86|((\+)?86)?)0?1[23465789]\d{9})$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('请输入正确的电话号码！');
    }
  } else {
    callback('');
  }
}

// 名称校验(中文、英文、数字、空格)
export function checkName(rule, value, callback) {
  const regex = /^[\u4E00-\u9FA5A-Za-z0-9\s]+$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('输入格式有误,请重新输入！');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 英文数字校验
export function checkEnOrNo(rule, value, callback) {
  const regex = /^[A-Za-z0-9]+$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('输入格式有误,请重新输入！');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 匹配正整数
export function checkPositiveInt(rule, value, callback) {
  const regex = /^[1-9]\d*$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('输入格式有误,请重新输入！');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 匹配邮箱
export function checkEmail(rule, value, callback) {
  const reg = new RegExp('^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$');
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (reg.test(value)) {
      callback();
    } else {
      callback('请输入正确的邮箱!');
    }
  } else {
    // 这里的callback函数会报错
  }
}

// 匹配身份证
export function checkIdCard(rule, value, callback) {
  const regex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('请输入正确的身份证号!');
    }
  } else {
    // 为空时有个旋转的图标，会和required冲突
    callback('');
  }
}

// 验证邮箱，可以为空
export function checkEmail2(rule, value, callback) {
  const reg = new RegExp('^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$');
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (reg.test(value)) {
      callback();
    } else {
      callback('请输入正确的邮箱!');
    }
  } else {
    callback();
  }
}

// 验证手机号，可以为空
export function checkMobile2(rule, value, callback) {
  // 正则用//包起来
  const regex = /^((\+)?86|((\+)?86)?)0?1[23465789]\d{9}$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex.test(value)) {
      callback();
    } else {
      callback('请输入正确的手机号码！');
    }
  } else {
    callback();
  }
}

// 匹配护照
export function checkPassport(rule, value, callback) {
  const regex1 = /^[a-zA-Z]{5,17}$/;
  const regex2 = /^[a-zA-Z0-9]{5,17}$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regex1.test(value) || regex2.test(value)) {
      callback();
    } else {
      callback('请输入正确的护照!');
    }
  } else {
    // 为空时有个旋转的图标，会和required冲突
    callback('');
  }
}

// 匹配港澳台
export function checkHongKongAndMacauPass(rule, value, callback) {
  const regexHongKong1 = /^[HMhm]{1}([0-9]{10}|[0-9]{8})$/;
  const regexHongKong2 = /^[CWcw]{1}([0-9]{10}|[0-9]{8})$/;
  const regexMacau1 = /^[0-9]{8}$/;
  const regexMacau2 = /^[0-9]{10}$/;
  if (value) {
    // react使用正则表达式变量的test方法进行校验，直接使用value.match(regex)显示match未定义
    if (regexHongKong1.test(value) ||
      regexHongKong2.test(value) || regexMacau1.test(value) || regexMacau2.test(value)) {
      callback();
    } else {
      callback('请输入正确的港澳台通行证!');
    }
  } else {
    // 为空时有个旋转的图标，会和required冲突
    callback('');
  }
}

