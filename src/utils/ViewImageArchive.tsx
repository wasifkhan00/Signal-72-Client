import React, { useEffect, useState } from "react";
import useChatStore from "@store/ChatStore";

const ViewImage = (props) => {
  const { uploadedImageDimensions } = useChatStore();
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setAnimateIn(true);
    }, 10);
  }, []);

  const view_Image_Container_Style: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,1)",
    zIndex: 9999,
    padding: "1rem",
    boxSizing: "border-box",
    overflow: "hidden",
  };

  const closeButtonStyle: React.CSSProperties = {
    position: "absolute",
    top: "1rem",
    right: "1rem",
    backgroundColor: "transparent",
    color: "#000",
    border: "none",
    borderRadius: "50%",
    padding: "0.4rem 0.6rem",
    cursor: "pointer",
    fontSize: "1.2rem",
    lineHeight: "1",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    zIndex: 10000,
  };

  const view_Image_Container_Image_Style: React.CSSProperties = {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "contain",
    borderRadius: "8px",
    transition: "transform 0.3s ease, opacity 0.3s ease",
    transform: animateIn
      ? "scale(1) translate(0, 0)"
      : "scale(0.7) translateY(40px)",
    opacity: animateIn ? 1 : 0,
  };
  const handleClosedButton = () => {
    props.setViewImage(false);
  };
  return (
    <div className="viewImageContainer" style={view_Image_Container_Style}>
      <button style={closeButtonStyle} onClick={handleClosedButton}>
        X
      </button>
      <img
        className="viewImageRealImage"
        style={view_Image_Container_Image_Style}
        src={props.imageSource}
        alt="viewImage"
      />
    </div>
  );
};

export default ViewImage;
