import React from "react";
import { Link } from "../../../models/Links";
import { NavLink } from "react-router-dom";
import "./subheader.scss";

export interface SubheaderProps {
  paths: Link[];
  buttons: Link[];
}

const Subheader = (props: SubheaderProps) => {
  return (
    <div className="flex items-center sub-header">
      <NavLink to="/">Home</NavLink>
      {props.paths.map((path) => (
        <>
          <span>&nbsp;&gt;&nbsp;</span>
          <NavLink to={path.linkRef}>{path.linkTitle}</NavLink>
        </>
      ))}
      <span className="ml-auto">
        {props.buttons.map((button) => (
          <button
            onClick={button.action}
            className="bg-pwcOrange text-white rounded float-right p-2 mx-5"
          >
            {button.linkTitle}
          </button>
        ))}
      </span>
    </div>
  );
};

export default Subheader;
