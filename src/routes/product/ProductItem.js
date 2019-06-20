import React, { PureComponent } from 'react';
import { routerRedux } from 'dva/router';
import classnames from 'classnames';
import styles from './index.less';
import creditImg from '../../../public/credit_img.png';

export default class ProductItem extends PureComponent {
  state = {
    done: false,
  };

  componentDidMount() {
    this.timeoutIds.push(
      setTimeout(() => {
        this.setState({ done: true });
      })
    );
  }

  componentWillUnmount() {
    this.timeoutIds.forEach((id) => {
      clearTimeout(id);
    });
  }

  timeoutIds = [];

  handleClick = () => {
    const { product, onClick, dispatch } = this.props;
    const detailPath = product.categoryType === 1 ? '/event/detail?id=' : '/event/normalDetail?id=';
    // dispatch(routerRedux.push(`/productDetail?id=${product.productId}&categoryType=
    // ${product.categoryType}`));
    dispatch(routerRedux.push(`${detailPath}${product.productId}`));
    if (onClick) {
      onClick(product);
    }
  };

  transformImgUrl = (url) => {
    if (!url) {
      return url;
    }
    const sufix = url.substr(url.lastIndexOf('.'));
    return `${url}/190*290${sufix}`;
  };
  render() {
    const { product } = this.props;
    const { done } = this.state;
    const wrapClass = classnames(styles.item, done && styles.done);
    const credit = (product.minCredit && <span>+ {product.minCredit}积分</span> || null);
    return (
      <div
        className={wrapClass}
        onClick={this.handleClick}
        categorytype={product.categoryType}
        productid={product.productId}
      >
        <img
          // src="http://mpic.tiankong.com/e1a/aab/e1aaab66d5226aa8162f11a71fd9fcbe/640.jpg@!670w"
          src={product.image}
          alt={product.name}
        />
        <div className={styles.subItem}>
          <span style={{ fontSize: '14px' }}>&yen;</span>&nbsp;
          <span className={styles.price}>{product.showMinPrice}</span>
          {credit}
        </div>
        <div className={`${styles.subItem} ${styles.title}`}>{product.productName}</div>
        {
          product.isCreditExchange && (
            <div className={styles.widget}>
              {/* <span>积分</span> */}
              <img src={creditImg} alt="" />
            </div>
          )
        }

      </div>
    );
  }
}

ProductItem.defaultProps = {
  product: {
    id: '',
    name: '',
    coverImg: '',
    price: '100',
  },
};
