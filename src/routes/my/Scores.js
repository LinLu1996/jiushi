import { connect } from 'dva';
import React, { PureComponent } from 'react';
import { NavBar, Icon, PullToRefresh } from 'antd-mobile';
import style from './Scores.less';

@connect(({ scores }) => ({
  myScoresReducer: scores.myScoresReducer,
  listReducer: scores.listReducer,
}))
export default class Scores extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      // refreshing: true,
    };
  }

  componentDidMount() {
    this.getIntroduction();
    this.getScoresList(true, 0);
    // 设置底部菜单的page值为1
    this.setSessionStorage();
  }
  componentWillUnmount() {
    this.resetListReducers();
  }
  /* ***************设置底部菜单的page值为1**************** */
  setSessionStorage = () => {
    sessionStorage.setItem('sessionInitialPage', 1);
  }
  // 获取积分概览
  getIntroduction = () => {
    this.props.dispatch({
      type: 'scores/fetchintroduction',
    });
  }
  // 获取积分列表
  getScoresList = (hasMore, page) => {
    if (hasMore) {
      this.props.dispatch({
        type: 'scores/fetchlist',
        payload: {
          limit: 5,
          page: page + 1,
        },
      });
    }
  }

  // 滑动刷新页面
  getPullToRefreshData = (hasMore, page) => {
    this.getScoresList(hasMore, page);
  }
  resetListReducers = () => {
    this.props.dispatch({
      type: 'scores/resetListReducersEffect',
      payload: {
        hasMore: true,
        page: 0,
        rows: [],
        total: 0,
      },
    });
  }

  renderList = (oldData) => {
    return oldData.map((item) => {
      return (
        <li key={item.id}>
          <div>
            <span>{item.form}</span>
            <i>{item.createTime}</i>
          </div>
          <p>
            <span>
              {item.income}
            </span>
          </p>
        </li>
      );
    });
  }

  render() {
    const { myScoresReducer, listReducer: { hasMore, page, rows } } = this.props;
    return (
      <div className="scores">
        <div className={style.scoresWrapper}>
          <NavBar
            mode="light"
            icon={<Icon type="left" />}
            onLeftClick={() => history.go(-1)}
          >
            我的积分
          </NavBar>
          <div className={style.top}>
            <h3>当前积分</h3>
            <div>{myScoresReducer.count}</div>
          </div>
          <div className={style.content}>
            <PullToRefresh
              damping={160}
              distanceToRefresh={30}
              ref={(el) => { this.ptr = el; }}
              style={{
                width: '100%',
                height: '64vh',
                overflow: 'auto',
              }}
              indicator={{ activate: '松手更新', deactivate: '上拉刷新', finish: hasMore ? '' : '没有更多积分' }}
              direction="up"
              // refreshing={this.state.refreshing}
              onRefresh={() => this.getPullToRefreshData(hasMore, page)}
            >
              <h3>积分明细</h3>
              <ul>
                {this.renderList(rows)}
              </ul>
            </PullToRefresh>
          </div>
        </div>
      </div>
    );
  }
}
