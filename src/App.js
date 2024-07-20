// App.js
import React, { useState } from "react";
import Video from "./Video";
import Music from "./Music";

const App = () => {
  const [showComponent, setShowComponent] = useState("one");

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "end" }}>
        <button onClick={() => setShowComponent("one")}>
          mp3
        </button>
        <button onClick={() => setShowComponent("two")}>
          mp4
        </button>
      </div>
      <>
        {showComponent === "one" && <Music />}
        {showComponent === "two" && <Video />}
      </>
    </div>
  );
};

export default App;
