import React from "react";
import "../styles/LoadingSVG.css";
import SmallSpinnerLoader from "./SmallSpinnerLoader";

const Loading = () => {
  return (
    <>
      <div className="loading_Container">
        <div className="loader">
          <SmallSpinnerLoader />
        </div>
        <h5>Fetching your account details</h5>
      </div>
    </>
  );
};

export default Loading;
