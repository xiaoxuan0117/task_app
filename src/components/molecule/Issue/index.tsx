import React from "react";
import { useAppDispatch } from "../../../store";
import { UpdateState } from "../../../reducer/issueList";
import { IssueProps } from "../../../type";

import LinkElement from "../../atom/LinkElement";
import Label from "../../atom/Label";
import Time from "../../atom/Time";
import Toggle from "../../atom/Toggle";
import Avatar from "../../atom/Avatar";

import "./style.scss";

export default function Issue(props: IssueProps): JSX.Element {
  const {
    isOpen,
    repoName,
    repoUrl,
    repoOwner,
    title,
    labels,
    time,
    creator,
    creatorUrl,
    assigneeUrl,
    number,
    assigneeAvatar,
    body,
  } = props;
  const dispatch = useAppDispatch();

  const issueInfo = {
    repoOwner: repoOwner,
    repoName: repoName,
    number: number,
  };

  const briefBody = body ? (
    body.replace(/[^\w\s\u00ff-\uffff]/g, "")
  ) : (
    <i>no description provided</i>
  );
  return (
    <div className="issue-wrapper">
      <div className="toggle-section">
        <Toggle
          isOpen={isOpen}
          onClick={() => {
            dispatch(UpdateState(issueInfo));
          }}
        />
      </div>
      <div className="issue">
        <div className="left">
          <div className="content-section">
            <div className="upper">
              <LinkElement isRouter={false} class="issuelist" href={repoUrl}>
                <div className="repo">{`${repoOwner}/${repoName}`}</div>
              </LinkElement>
              <LinkElement
                isRouter={true}
                class="issuelist"
                href={`/${repoOwner}/${repoName}/${number}`}
              >
                <div className="issue">{title}</div>
              </LinkElement>
              <div className="labels">
                {labels.map((label, index) => (
                  <Label key={`label-${index}`} children={label} />
                ))}
              </div>
            </div>
            <div className="middle">
              <p>{briefBody}</p>
            </div>
            <div className="lower">
              <div className="number"># {number}</div>
              <Time utcTime={time} />
              <div className="creator">
                by&nbsp;
                <LinkElement
                  isRouter={false}
                  class="issuelist"
                  href={creatorUrl}
                >
                  <div className="quick-info">{creator}</div>
                </LinkElement>
              </div>
            </div>
          </div>
        </div>
        <div className="right">
          {assigneeUrl && (
            <Avatar image={assigneeAvatar} class="member" href={assigneeUrl} />
          )}
        </div>
      </div>
    </div>
  );
}
