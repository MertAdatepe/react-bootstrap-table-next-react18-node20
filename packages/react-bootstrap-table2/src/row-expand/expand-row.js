import cs from 'classnames';
import React, { useRef } from 'react';
import PropTypes from 'prop-types';
import { CSSTransition } from 'react-transition-group';

const ExpandRow = ({ children, expanded, onClosed, className, ...rest }) => {
  const nodeRef = useRef(null);

  return (
    <tr>
      <td className={ cs('reset-expansion-style', className) } { ...rest }>
        <CSSTransition
          appear
          unmountOnExit
          in={ expanded }
          timeout={ 400 }
          classNames="row-expand-slide"
          onExited={ onClosed }
          nodeRef={ nodeRef }
        >
          <div ref={ nodeRef }>
            <div className="row-expansion-style">
              { children }
            </div>
          </div>
        </CSSTransition>
      </td>
    </tr>
  );
};

ExpandRow.propTypes = {
  children: PropTypes.node,
  expanded: PropTypes.bool,
  onClosed: PropTypes.func,
  className: PropTypes.string
};

ExpandRow.defaultProps = {
  children: null,
  expanded: false,
  onClosed: null,
  className: ''
};

export default ExpandRow;
