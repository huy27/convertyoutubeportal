import React, { useState } from "react";
import axios from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

function App() {
  const [url, setUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);

  const convertToMP3 = async () => {
    try {
      setIsConverting(true);
      setError("");
      setProgress(0);
      setAudioUrl("");
      const apiUrl = process.env.REACT_APP_API_URL;
      const response = await axios.get(`${apiUrl}/youTubeToMP3?url=${url}`, {
        responseType: "blob",
        onDownloadProgress: (progressEvent) => {
          const percentage = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setProgress(percentage);
        },
      });

      setIsConverting(false);

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(audioUrl);
    } catch (error) {
      setIsConverting(false);
      setError("Lỗi khi chuyển đổi URL");
      setAudioUrl("");
    }
  };

  return (
    <div style={{ height: "100vh", backgroundColor: "black" }}>
      <h1 style={{ textAlign: "center", color: "white", marginTop: 0 }}>
        Ứng dụng chuyển đổi YouTube sang MP3
      </h1>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ marginRight: "10px", padding: "5px", width: "40%" }}
          placeholder="Nhập URL của video YouTube"
        />
        <button
          onClick={convertToMP3}
          disabled={isConverting}
          style={{
            padding: "5px 10px",
            backgroundColor: isConverting ? "#999" : "#007BFF",
            color: "#FFF",
            border: "none",
            cursor: isConverting ? "default" : "pointer",
            transition: "background-color 0.3s ease",
          }}
        >
          {isConverting ? "Đang chuyển đổi..." : "Chuyển đổi"}
        </button>
      </div>
      {error && <p style={{ color: "red", textAlign: "center" }}>{error}</p>}
      {audioUrl ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "20px",
            alignItems: "center",
          }}
        >
          <AudioPlayer
            style={{
              width: "50%",
            }}
            volume="0.5"
            loop
            autoPlay
            src={audioUrl}
            onPlay={(e) => console.log("onPlay")}
            // other props here
          />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            color: "white",
            height: "50px",
            width: "50vw",
            margin: "20px auto 0",
            gap: "2rem",
            alignItems: "center",
          }}
        >
          <div style={{ width: "4rem" }}>
            {progress > 0 && (
              <CircularProgressbar value={progress} text={`${progress}%`} styles={buildStyles({ pathTransition: "none" })}/>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
