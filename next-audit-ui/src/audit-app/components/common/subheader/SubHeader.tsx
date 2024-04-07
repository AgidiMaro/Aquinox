import React from "react";
import { Link } from "../../../models/Links";
import { NavLink } from "react-router-dom";

export interface SubheaderProps {
  paths: Link [];
  buttons: Link [];
}

const Subheader = (props : SubheaderProps) => {

  return (
    <div className="mx-10 px-5 mb-5 flex items-center">
      <NavLink to="/">Home</NavLink>
      {props.paths.map(path => (
            <>
              <span>&nbsp;&gt;&nbsp;</span>
              <NavLink to={path.linkRef}>{path.linkTitle}</NavLink>
            </>
        ))}
      <span className="ml-auto">
        {props.buttons.map(button => (
              <button className="bg-darkBlue text-white float-right p-2 mx-5">{button.linkTitle}</button>
          ))}
      </span>
    </div>
  );
}

export default Subheader;