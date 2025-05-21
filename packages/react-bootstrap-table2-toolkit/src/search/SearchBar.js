/* eslint camelcase: 0 */
/* eslint no-return-assign: 0 */
import React from 'react';
import PropTypes from 'prop-types';

const handleDebounce = (func, wait = 0, immediate = false) => {
  let timeout;
  return function(...args) {
    const later = () => {
      timeout = null;
      if (!immediate) func.apply(this, args);
    };
    const callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(this, args);
  };
};

class SearchBar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.searchText
    };
    // debounce onSearch
    this.debouncedSearch = handleDebounce(this.triggerSearch, props.delay, false);
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.searchText !== prevState.value) {
      return { value: nextProps.searchText };
    }
    return null;
  }

  triggerSearch = () => {
    const { onSearch } = this.props;
    onSearch(this.state.value);
  }

  onChangeValue = (e) => {
    const newValue = e.target.value;
    this.setState({ value: newValue }, () => {
      this.debouncedSearch();
    });
  }

  render() {
    const {
      className,
      style,
      placeholder,
      tableId,
      srText
    } = this.props;
    const { value } = this.state;

    return (
      <label
        htmlFor={`search-bar-${tableId}`}
        className="search-label"
      >
        <span id={`search-bar-${tableId}-label`} className="sr-only">
          {srText}
        </span>
        <input
          ref={n => this.input = n}
          id={`search-bar-${tableId}`}
          type="text"
          style={style}
          aria-labelledby={`search-bar-${tableId}-label`}
          onChange={this.onChangeValue}
          className={`form-control ${className}`}
          value={value}
          placeholder={placeholder}
        />
      </label>
    );
  }
}

SearchBar.propTypes = {
  onSearch: PropTypes.func.isRequired,
  className: PropTypes.string,
  placeholder: PropTypes.string,
  style: PropTypes.object,
  delay: PropTypes.number,
  searchText: PropTypes.string,
  tableId: PropTypes.string,
  srText: PropTypes.string
};

SearchBar.defaultProps = {
  className: '',
  style: {},
  placeholder: 'Search',
  delay: 250,
  searchText: '',
  tableId: '0',
  srText: 'Search this table'
};

export default SearchBar;
