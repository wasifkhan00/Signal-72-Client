// import useAppStore from "@store/AppStore";
// import useChatModulesStore from "@store/ChatModulesStore";
// import useChatStore from "@store/ChatStore";
// ("@store/ChatStore");

// const dark = useAppStore.getState().dark;
// const showWait = useChatModulesStore.getState().showWait;
// const viewImageContainer = useChatModulesStore.getState().viewImageContainer;
// const uploadedImageDimensions = useChatStore.getState().uploadedImageDimensions;

// const isMobile = window.innerWidth <= 580;

// export const fontColor = dark ? "#ffff" : "#000000";

// export const right_Side_Header_Styles: React.CSSProperties = {
//   background: dark
//     ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
//     : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",

//   boxShadow: dark ? "0 4px 7px -6px #ffffff" : "0 4px 7px -6px black",
//   filter: viewImageContainer ? "blur(2px)" : "none",
// };

// export const right_side_Style: React.CSSProperties = {
//   backgroundColor: dark ? "#404040" : "rgb(255, 255, 255)",
// };

// export const group_Name_Style: React.CSSProperties = {
//   color: fontColor,
//   display: "flex",
//   alignItems: "center",
// };

// export const send_Image_style = {
//   resizeMode: "cover",
//   width:
//     uploadedImageDimensions !== null
//       ? uploadedImageDimensions.width < 850
//         ? `${uploadedImageDimensions.width}px`
//         : "100%"
//       : null,

//   height:
//     uploadedImageDimensions !== null
//       ? `${uploadedImageDimensions.height}px`
//       : null,
// };

// export const show_Image_Before_Sending_Style = {
//   padding: "0.3rem 0.5rem",
//   color: dark ? "#fff" : "rgb(10, 10, 10)",
// };

// export const viewImageStyle: React.CSSProperties = {
//   position: "fixed",
//   top: "50%",
//   left: isMobile ? "50%" : "60dvw",
//   transform: "translate(-50%, -50%)",
//   background: dark
//     ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
//     : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
//   // transform: "translate(-50%, -50%)",
//   display: "flex",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   // backgroundColor: "rgba(255, 255, 255, 0.9)",
//   backdropFilter: "blur(5px)",
//   padding: "1rem",
//   borderRadius: "10px",
//   boxShadow: "0px 4px 20px rgba(0,0,0,0.2)",
//   maxWidth: "90vw",
//   maxHeight: "90vh",
//   minWidth: showWait ? "500px" : "auto",
//   minHeight: showWait ? "450px" : "auto",
//   overflow: "auto",
//   zIndex: 9999,
// };

// export const dummyStyleFOrDiv: React.CSSProperties = {
//   display: showWait ? "flex" : "none",
//   position: "absolute",
//   top: "50%",
//   left: "50%",
//   transform: "translate(-50%, -50%)",
//   flexDirection: "column",
//   justifyContent: "center",
//   alignItems: "center",
//   background: dark
//     ? "linear-gradient(145deg, #1a1a1a, #2c2c2c)"
//     : "linear-gradient(145deg, #f4f4f4, #e8e8e8)",
//   padding: "1rem",
//   borderRadius: "8px",
//   zIndex: 10,
// };

// export const imageTemporaryStyle: React.CSSProperties = {
//   display: showWait ? "none" : "block",
//   maxWidth: "100%",
//   maxHeight: "80vh",
//   height: "auto",
//   width: "auto",
//   borderRadius: "8px",
//   objectFit: "contain",
// };
