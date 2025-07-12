"use client";

import "../styles/SmallSpinnerLoader.css"; // we'll write the styles here

const SmallSpinnerLoader = (props) => {
  return (
    <div className="loader-overlay">
      <div className="loader-spinner" style={{ margin: "auto" }}></div>
    </div>
  );
};

export default SmallSpinnerLoader;
