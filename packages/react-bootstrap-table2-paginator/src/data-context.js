/* eslint react/prop-types: 0 */
/* eslint react/require-default-props: 0 */
/* eslint no-lonely-if: 0 */
import React from 'react';
import PropTypes from 'prop-types';

import Const from './const';
import Pagination from './pagination';
import { getByCurrPage, alignPage } from './page';
import createBaseContext from './state-context';

const { Provider } = createBaseContext();

const PaginationDataContext = React.createContext();

class PaginationDataProvider extends Provider {
  static propTypes = {
    data: PropTypes.array.isRequired,
    remoteEmitter: PropTypes.object.isRequired,
    isRemotePagination: PropTypes.func.isRequired
  }

  componentDidUpdate(prevProps) {
    // Call super if it implements componentDidUpdate
    if (super.componentDidUpdate) {
      super.componentDidUpdate(prevProps);
    }

    const { currSizePerPage } = this;
    const { pagination, onDataSizeChange, data } = this.props;
    const { custom, onPageChange, pageStartIndex: psiProp } = pagination.options;

    const pageStartIndex = typeof psiProp !== 'undefined'
      ? psiProp
      : Const.PAGE_START_INDEX;

    // Align page when data size changes and remote pagination is disabled
    if (!this.isRemotePagination() && !custom) {
      const newPage = alignPage(
        data.length,
        prevProps.data.length,
        this.currPage,
        currSizePerPage,
        pageStartIndex
      );

      if (this.currPage !== newPage) {
        if (onPageChange) {
          onPageChange(newPage, currSizePerPage);
        }
        this.currPage = newPage;
      }
    }

    // Emit data size change if needed
    if (onDataSizeChange && data.length !== prevProps.data.length) {
      onDataSizeChange({ dataSize: data.length });
    }
  }

  isRemotePagination = () => this.props.isRemotePagination();

  renderDefaultPagination = () => {
    if (!this.props.pagination.options.custom) {
      const {
        page: currPage,
        sizePerPage: currSizePerPage,
        dataSize,
        ...rest
      } = this.getPaginationProps();
      return (
        <Pagination
          { ...rest }
          key="pagination"
          dataSize={ dataSize || this.props.data.length }
          currPage={ currPage }
          currSizePerPage={ currSizePerPage }
        />
      );
    }
    return null;
  }

  render() {
    let { data } = this.props;
    const { pagination: { options } } = this.props;
    const { currPage, currSizePerPage } = this;
    const pageStartIndex = typeof options.pageStartIndex === 'undefined'
      ? Const.PAGE_START_INDEX
      : options.pageStartIndex;

    data = this.isRemotePagination()
      ? data
      : getByCurrPage(
          data,
          currPage,
          currSizePerPage,
          pageStartIndex
        );

    return (
      <PaginationDataContext.Provider value={{ data, setRemoteEmitter: this.setRemoteEmitter }}>
        { this.props.children }
        { this.renderDefaultPagination() }
      </PaginationDataContext.Provider>
    );
  }
}

export default () => ({
  Provider: PaginationDataProvider,
  Consumer: PaginationDataContext.Consumer
});
