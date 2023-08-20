import React from "react";
import ReactLoading from "react-loading";

interface ILoading {
  type?:
    | "balls"
    | "bars"
    | "bubbles"
    | "cubes"
    | "cylon"
    | "spin"
    | "spinningBubbles"
    | "spokes";
  color?: string;
  delay?: number;
  height?: string | number;
  width?: string | number;
  className?: string;
}

const Loading = ({ type = "balls", color = "#ffffff", ...prop }: ILoading) => {
  return (
    <div style={{
        height: "100%",
        width: "100%",
        position: "fixed",
        zIndex: "999",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "gray",
        opacity: "0.3"
    }}>
        <ReactLoading type={type} color={color} {...prop} />
    </div>
  )
};

export default Loading;
