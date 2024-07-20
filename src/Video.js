import axios from "axios";
import React, { useEffect, useState } from "react";
import Draggable from "react-draggable";

const apiUrl = process.env.REACT_APP_API_URL;

const Video = () => {
  const [response, setResponse] = useState(null);
  const [videoUrl, setVideoUrl] = useState("");
  const [videoId, setVideoId] = useState("");
  const [selectQuality, setSelectQuality] = useState("auto");

  const handleSelectQuality = (event) => {
    const newValue = event.target.value;
    setSelectQuality(newValue);
  };

  // Function to handle API call
  const fetchData = async (videoId, quality) => {
    try {
      const response = axios
        .get(
          `${apiUrl}/youTubeToMP3/convertToMP4?videoId=${videoId}&quality=${quality}`
        )
        .then((response) => {
          setResponse(response);
        })
        .catch((error) => {
          alert(error.response.data);
        });
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  useEffect(() => {
    if (videoId !== "" && selectQuality !== "") {
      fetchData(videoId, selectQuality);
    }
  }, [selectQuality, videoId]);

  const callApi = () => {
    try {
      var url = new URL(videoUrl);
      var videoId = url.searchParams.get("v");
      setVideoId(videoId);
      setSelectQuality("auto");
    } catch (error) {
      alert(error);
    }
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "auto",
          marginTop: "10px",
        }}
      >
        <label style={{ color: "white" }}>VideoUrl</label>:
        <input
          value={videoUrl}
          style={{ width: "500px" }}
          onChange={(e) => setVideoUrl(e.target.value)}
        ></input>
        {response && response.data && (
          <select value={selectQuality} onChange={handleSelectQuality}>
            {response.data.qualities.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        <button
          style={{
            padding: "5px 10px",
            color: "#FFF",
            backgroundColor: "#007BFF",
            border: "none",
            transition: "background-color 0.3s ease",
          }}
          onClick={() => callApi()}
        >
          Convert
        </button>
      </div>

      {response && response.data && response.data.videoDetail.dlink && (
        <Draggable>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: "65px",
            }}
          >
            <video width={500} key={response.data.videoDetail.dlink} controls>
              <source src={response.data.videoDetail.dlink} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </Draggable>
      )}
    </div>
  );
};

export default Video;
