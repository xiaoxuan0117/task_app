import React, { useEffect, useState } from "react";
import classNames from "classnames";

import "./style.scss";

type ToggleProps = {
  isOpen: boolean;
};

export default function Toggle(props: ToggleProps): JSX.Element {
  const [open, setOpen] = useState(props.isOpen);

  const toggleChange = () => {
    setOpen(open ? false : true);
  };
  return (
    <div className="toggle-wrapper">
      <button
        className={`toggle ${classNames(open && "open")}`}
        onClick={toggleChange}
      >
        <div className="button"></div>
      </button>
    </div>
  );
}
