import dynamic from 'dva/dynamic';
import { createElement } from 'react';

let routerDataCache;

const modelNotExisted = (app, model) =>
  // eslint-disable-next-line
  !app._models.some(({ namespace }) => {
    return namespace === model.substring(model.lastIndexOf('/') + 1);
  });

// wrapper of dynamic
const dynamicWrapper = (app, models, component) => {
  // () => require('module')
  // transformed by babel-plugin-dynamic-import-node-sync
  if (component.toString().indexOf('.then(') < 0) {
    models.forEach((model) => {
      if (modelNotExisted(app, model)) {
        // eslint-disable-next-line
        app.model(require(`../models/${model}`).default);
      }
    });
    return (props) => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return createElement(component().default, {
        ...props,
        routerData: routerDataCache,
      });
    };
  }
  return dynamic({
    app,
    models: () =>
      models.filter(model => modelNotExisted(app, model)).map(m => import(`../models/${m}.js`)),
    // add routerData prop
    component: () => {
      if (!routerDataCache) {
        routerDataCache = getRouterData(app);
      }
      return component().then((raw) => {
        const Component = raw.default || raw;
        return props =>
          createElement(Component, {
            ...props,
            routerData: routerDataCache,
          });
      });
    },
  });
};

export const getRouterData = (app) => {
  const routerConfig = {
    '/': {
      component: dynamicWrapper(app, ['user', 'login/login'], () => import('../layouts/BasicLayout')),
    },
    '/credit': {
      name: '首页-商品列表',
      component: dynamicWrapper(app, ['product/product', 'product/advertisment', 'info'], () => import('../routes/Home')),
    },
    '/user/login': {
      name: '登录页',
      component: dynamicWrapper(app, ['login/login'], () => import('../routes/login/index')),
    },
    '/register': {
      name: '注册页',
      component: dynamicWrapper(app, ['login/login'], () => import('../routes/register/index')),
    },
    '/forget': {
      name: '注册页',
      component: dynamicWrapper(app, ['login/login'], () => import('../routes/forget/index')),
    },
    '/member/orders': {
      name: '订单列表',
      component: dynamicWrapper(app, ['order'], () => import('../routes/my/Order')),
      authority: 'login',
    },
    '/order/detail': {
      name: '订单详情',
      component: dynamicWrapper(app, ['order'], () => import('../routes/my/Detail')),
      authority: 'login',
    },
    '/delivery': {
      name: '物流信息',
      component: dynamicWrapper(app, [], () => import('../routes/my/Delivery')),
      authority: 'login',
    },
    '/member/scores': {
      name: '我的积分',
      component: dynamicWrapper(app, ['scores'], () => import('../routes/my/Scores')),
      authority: 'login',
    },
    '/member/info': {
      name: '个人信息',
      component: dynamicWrapper(app, ['info', 'dictionary'], () => import('../routes/my/Info')),
      authority: 'login',
    },
    '/event/detail': {
      name: '积分商品详情',
      component: dynamicWrapper(app, ['product/detail'], () => import('../routes/product/Detail')),
    },
    '/event/normalDetail': {
      name: '普通商品详情',
      component: dynamicWrapper(app, ['product/detail'], () => import('../routes/product/Detail/NormalDetail')),
    },
    '/confirm': {
      name: '确认订单',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/Confirm')),
    },
    '/spec': {
      name: '选择规格',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/Spec')),
    },
    '/member/address': {
      name: '收货地址',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/AddressList')),
    },
    '/addAddress': {
      name: '新增收货地址',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/AddAddress')),
    },
    '/pay': {
      name: '支付',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/Pay')),
    },
    '/payStatus': {
      name: '支付',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/payStatus')),
    },
    '/paySuccess': {
      name: '支付成功',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/PaySuccess')),
    },
    '/invoice': {
      name: '支付成功',
      component: dynamicWrapper(app, ['product/product'], () => import('../routes/product/Invoice')),
    },
    '/order/payClose': {
      component: dynamicWrapper(app, [], () => import('../routes/product/payClose')),
      // name: '支付取消',
    },
    '/payTimeOut': {
      component: dynamicWrapper(app, [], () => import('../routes/product/payTimeOut')),
      // name: '支付取消',
    },
  };
  // Route configuration data
  // eg. {name,authority ...routerConfig }
  const routerData = {};
  // The route matches the menu
  Object.keys(routerConfig).forEach((path) => {
    let router = routerConfig[path];
    // If you need to configure complex parameter routing,
    // https://github.com/ant-design/ant-design-pro-site/blob/master/docs/router-and-nav.md#%E5%B8%A6%E5%8F%82%E6%95%B0%E7%9A%84%E8%B7%AF%E7%94%B1%E8%8F%9C%E5%8D%95
    // eg . /list/:type/user/info/:id
    router = {
      ...router,
      name: router.name,
      authority: router.authority,
    };
    routerData[path] = router;
  });
  return routerData;
};
