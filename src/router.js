import { LocaleProvider, ActivityIndicator } from 'antd-mobile';
// import zhCN from 'antd-mobile/lib/locale-provider/zh_CN';
import dynamic from 'dva/dynamic';
import { Route, routerRedux, Switch } from 'dva/router';
import React from 'react';
import { getRouterData } from './common/router';
import styles from './index.less';
import Authorized from './utils/Authorized';

const { ConnectedRouter } = routerRedux;
const { AuthorizedRoute } = Authorized;
dynamic.setDefaultLoadingComponent(() => {
  return <ActivityIndicator size="large" className={styles.globalSpin} />;
});

function RouterConfig({ history, app }) {
  const routerData = getRouterData(app);
  // const UserLayout = routerData['/user'].component;
  const BasicLayout = routerData['/'].component;
  return (
    <LocaleProvider>
      <ConnectedRouter history={history}>
        <Switch>
          {/* <Route path="/user" component={UserLayout} /> */}
          <Route path="/" component={BasicLayout} />
          <AuthorizedRoute
            path="/"
            render={props => <BasicLayout {...props} />}
            // authority={[]}
            loginPath="/user/login"
            redirectPath="/user/login"
          />
        </Switch>
      </ConnectedRouter>
    </LocaleProvider>
  );
}

export default RouterConfig;
