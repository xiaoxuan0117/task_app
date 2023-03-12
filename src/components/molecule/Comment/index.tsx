import * as React from "react";
import Avatar from "../../atom/Avatar";
import avatar from "../../../assets/avatar.png";
import editButton from "../../../assets/editButton.svg";
import LinkElement from "../../atom/LinkElement";
import Time from "../../atom/Time";
import Button from "../../atom/Button";
import Markdown from "../../atom/Markdown";

import "./style.scss";

type ICommentProps = {};

export default function Comment(props: ICommentProps): JSX.Element {
  return (
    <div className="comment">
      <div className="avatar-wrapper">
        <Avatar
          image={avatar}
          class="member"
          href="https://github.com/Xiaoxuan0117"
        />
      </div>
      <div className="content">
        <div className="info">
          <div className="left">
            <LinkElement isRouter={false} class="task">
              <div className="username">username</div>
            </LinkElement>
            <Time utcTime="2023-03-08T05:47:16Z" />
          </div>
          <div className="right">
            <Button class="edit">
              <img src={editButton} alt="editButton" />
            </Button>
          </div>
        </div>
        <div className="context">
          <Markdown />
        </div>
      </div>
    </div>
  );
}