import React from "react";
import Header from "../header/Header";
import Footer from "../footer/Footer";
import Router from "../router/Router";
import SideBar from "../sidebar/SideBar";
import PageSpinner from "../common/pageSpinner/PageSpinner";

const Base = () => {
  return (
    <div className="h-full">
      <Header/>
      <div className="grid grid-flow-row-dense grid-cols-4 bg-lightWhite grid-rows-1 main-body">
        {/*
        <div className="col-span-1">
         {  <SideBar/> }
        </div>
        */}
        <div className="my-3 h-auto col-span-4">
          <Router/>
        </div>
      </div>
      {/* <Footer/> */}
      <PageSpinner></PageSpinner>
    </div>
  );
}

export default Base;