import { PullToRefresh, Carousel } from 'antd-mobile';
import FullScreenFlex from 'components/Flex';
import { connect } from 'dva';
import React, { Component } from 'react';
import ProductItem from './ProductItem';
import styles from './index.less';

// const Loading = () => (
//   <ActivityIndicator toast />
// );

@connect(({ product, advertisment }) => (
  {
    product,
    advertisment,
    // loadingData: loading.effects['product/query'],
  })
)
export default class Product extends Component {
  constructor(props) {
    super(props);
    this.pullToRefreshHeight = document.documentElement.clientHeight - 50;
    this.actions = {
      // loadProductList: 'product/fetchQueryEnroll',
      loadAds: 'advertisment/queryBannerAd',
    };

    this.loadAdvertisments();
    this.state = {
      // slideIndex: 0,
      bannerImgHeight: 276,
      // ads: [{ url: '/logo.png' }], // 广告位
      // dataSource: new ListView.DataSource({
      //   getRowData: (dataBlob, sectionID, rowID) => (dataBlob[sectionID][rowID]),
      //   rowHasChanged: (row1, row2) => (row1 !== row2),
      //   sectionHeaderHasChanged: (prevData, nextData) => (prevData !== nextData),
      // }),
    };
  }

  componentDidMount() {
    this.loadData();
    // console.log(this.contentRef);
  }

  loadAdvertisments = () => {
    const { dispatch } = this.props;
    dispatch({
      type: this.actions.loadAds,
    });
  }

  loadData = () => {
    // const { dispatch, product: { page, enrollHasMore } } = this.props;
    // if (!enrollHasMore) {
    //   return false;
    // }
    // dispatch({
    //   type: this.actions.loadProductList,
    //   payload: {
    //     limit: 8,
    //     page: page + 1,
    //   },
    // });// .then(this.genDataSource);
  }

  renderProductList = () => {
    const { product: { enrollList }, dispatch } = this.props;
    // if (enrollList.length === 0) {
    //   return <Loading />;
    // }
    return enrollList.map(product => (
      <ProductItem product={product} key={product.productId} dispatch={dispatch} />
    ));
  }

  render() {
    const { advertisment: { banner: ads }, product: { enrollHasMore } } = this.props;
    const { bannerImgHeight } = this.state;
    const carouselDom = (
      <Carousel
        className={styles.spaceCarousel}
        frameOverflow="visible"
        // cellSpacing={10}
        // slideWidth={0.8}
        // autoplay
        infinite
      // beforeChange={(from, to) => console.log(`slide from ${from} to ${to}`)}
      // afterChange={index => this.setState({ slideIndex: index })}
      >
        {ads.map((adv, index) => ( // eslint-disable-line
          <a
            key={adv.id}
            // href="http://www.alipay.com"
            style={{
              display: 'block',
              position: 'relative',
              // top: slideIndex === index ? -10 : 0,
              height: bannerImgHeight,
              // boxShadow: '2px 1px 1px rgba(0, 0, 0, 0.2)',
            }}
          >
            <img
              src={`${adv.advImage}`}
              alt=""
              style={{ width: '100%', verticalAlign: 'top' }}
              onLoad={() => {
                // fire window resize event to change height
                window.dispatchEvent(new Event('resize'));
                this.setState({ bannerImgHeight: 'auto' });
              }}
            />
          </a>
        ))}
      </Carousel>
    );
    return (
      <FullScreenFlex style={{ flexDirection: 'column', overflow: 'scroll' }} className="home">
        <PullToRefresh
          damping={100}
          distanceToRefresh={20}
          ref={(el) => { this.ptr = el; }}
          style={{
            width: '100%',
            height: `${this.pullToRefreshHeight}px`,
            overflow: 'auto',
          }}
          indicator={{ activate: '松手更新', deactivate: '上拉刷新', finish: enrollHasMore ? '' : '没有更多商品' }}
          direction="up"
          refreshing={this.state.refreshing}
          onRefresh={this.loadData}
        >
          {carouselDom}
          <div className={styles.content} ref={(el) => { this.contentRef = el; }}>
            {this.renderProductList()}
          </div>
        </PullToRefresh>
      </FullScreenFlex>
    );
  }
}
