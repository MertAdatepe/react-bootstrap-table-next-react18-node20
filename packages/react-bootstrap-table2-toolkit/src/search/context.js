/* eslint react/prop-types: 0 */
/* eslint react/require-default-props: 0 */
/* eslint no-continue: 0 */
/* eslint no-lonely-if: 0 */
/* eslint class-methods-use-this: 0 */
/* eslint camelcase: 0 */
import React from 'react';
import PropTypes from 'prop-types';

export default (options = {
  searchFormatted: false,
  afterSearch: null,
  onColumnMatch: null
}) => (
  _,
  isRemoteSearch,
  handleRemoteSearchChange
) => {
  const SearchContext = React.createContext();

  class SearchProvider extends React.Component {
    static propTypes = {
      data: PropTypes.array.isRequired,
      columns: PropTypes.array.isRequired,
      searchText: PropTypes.string,
      dataChangeListener: PropTypes.object
    }

    constructor(props) {
      super(props);
      let initialData = props.data;
      if (isRemoteSearch() && this.props.searchText !== '') {
        handleRemoteSearchChange(this.props.searchText);
      } else {
        initialData = this.search(props);
        this.triggerListener(initialData, true);
      }
      this.state = { data: initialData };
    }

    getSearched() {
      return this.state.data;
    }

    triggerListener(result, skipInit) {
      if (options.afterSearch && !skipInit) {
        options.afterSearch(result);
      }
      if (this.props.dataChangeListener) {
        this.props.dataChangeListener.emit('filterChanged', result.length);
      }
    }

   componentDidUpdate(prevProps) {
    const { searchText, data: newData } = this.props;
  
    // 1) searchText değiştiyse
    if (searchText !== prevProps.searchText) {
      if (isRemoteSearch()) {
        handleRemoteSearchChange(searchText);
      } else {
        const result = this.search(this.props);
        this.triggerListener(result);
        this.setState({ data: result });
      }
      return;
    }
  
    // 2) searchText aynı kalıp data değiştiyse
    if (isRemoteSearch()) {
      // remote aramada her data güncellemesinde direkt gelen datayı koy
      if (newData !== prevProps.data) {
        this.setState({ data: newData });
      }
    } else if (!_.isEqual(newData, prevProps.data)) {
      // local aramada data değiştiğinde aramayı tekrar uygula
      const result = this.search(this.props);
      this.triggerListener(result);
      this.setState({ data: result });
    }
  }


    search(props) {
      const { data, columns } = props;
      const searchText = props.searchText.toLowerCase();
      return data.filter((row, ridx) => {
        for (let cidx = 0; cidx < columns.length; cidx += 1) {
          const column = columns[cidx];
          if (column.searchable === false) continue;
          let targetValue = _.get(row, column.dataField);
          if (column.formatter && options.searchFormatted) {
            targetValue = column.formatter(targetValue, row, ridx, column.formatExtraData);
          } else if (column.filterValue) {
            targetValue = column.filterValue(targetValue, row);
          }
          if (options.onColumnMatch) {
            if (options.onColumnMatch({
              searchText,
              value: targetValue,
              column,
              row
            })) {
              return true;
            }
          } else {
            if (targetValue !== null && typeof targetValue !== 'undefined') {
              targetValue = targetValue.toString().toLowerCase();
              if (targetValue.indexOf(searchText) > -1) {
                return true;
              }
            }
          }
        }
        return false;
      });
    }

    render() {
      return (
        <SearchContext.Provider value={ { data: this.state.data } }>
          { this.props.children }
        </SearchContext.Provider>
      );
    }
  }

  return {
    Provider: SearchProvider,
    Consumer: SearchContext.Consumer
  };
};
