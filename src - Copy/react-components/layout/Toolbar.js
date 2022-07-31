import React from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import styles from "./Toolbar.scss";
import styleUtils from "../styles/style-utils.scss";

export function Toolbar({ className, left, center, mycenter, mycenterTwo, right, ...rest }) {
  return (
    <div className={classNames(styles.toolbar, className)} {...rest}>
      <div className={classNames(styles.content, styles.leftContent, styleUtils.showLg)}>{left}</div>
      <div className={classNames(styles.content, styles.centerContent)}>
        {center}
        <div className={classNames(styles.content, styles.centerContent)}>{mycenter}</div>
        <div className={classNames(styles.content, styles.centerContent)}>{mycenterTwo}</div>
      </div>
      <div className={classNames(styles.content, styles.rightContent, styleUtils.showLg)}>{right}</div>
    </div>
  );
}

Toolbar.propTypes = {
  className: PropTypes.string,
  left: PropTypes.node,
  center: PropTypes.node,
  mycenter: PropTypes.node,
  mycenterTwo: PropTypes.node,
  right: PropTypes.node,
  hideLeft: PropTypes.string,
  hideRight: PropTypes.string
};
