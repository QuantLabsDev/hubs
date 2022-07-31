import React, { useEffect, useRef, forwardRef } from "react";
import PropTypes from "prop-types";
import classNames from "classnames";
import { Sidebar } from "../sidebar/Sidebar";
import { CloseButton } from "../input/CloseButton";
import { ReactComponent as WandIcon } from "../icons/Wand.svg";
import { ReactComponent as AttachIcon } from "../icons/Attach.svg";
import { ReactComponent as ChatIcon } from "../icons/Chat.svg";
import { ReactComponent as NFTIcon } from "../icons/nftwallet.svg";
import { ReactComponent as SendIcon } from "../icons/Send.svg";
import { ReactComponent as ReactionIcon } from "../icons/Reaction.svg";
import { IconButton } from "../input/IconButton";
import { TextAreaInput } from "../input/TextAreaInput";
import { ToolbarButton } from "../input/ToolbarButton";
import { Popover } from "../popover/Popover";
import { EmojiPicker } from "./EmojiPicker";
import styles from "./ChatSidebar.scss";
import { formatMessageBody } from "../../utils/chat-message";
import { FormattedMessage, useIntl, defineMessages, FormattedRelativeTime } from "react-intl";

export function NFTSidebar({ onClose, children, ...rest }) {
  return (
    <Sidebar
      className="cus-font-color"
      title={<FormattedMessage id="chat-sidebar.title" defaultMessage="NFT" />}
      beforeTitle={<CloseButton onClick={onClose} />}
      contentClassName={styles.content}
      disableOverflowScroll
      {...rest}
    >
      {children}
    </Sidebar>
  );
}

NFTSidebar.propTypes = {
  onClose: PropTypes.func,
  onScrollList: PropTypes.func,
  children: PropTypes.node,
  listRef: PropTypes.func
};

export function NFTToolbarButton(props) {
  return (
    <ToolbarButton
      className="cus-font-color"
      {...props}
      icon={<NFTIcon />}
      preset="accent4"
      label={<FormattedMessage id="chat-toolbar-button" defaultMessage="NFT" />}
    />
  );
}
