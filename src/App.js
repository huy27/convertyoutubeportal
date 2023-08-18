import React, { useEffect, useRef, useState } from "react";
import axios, { HttpStatusCode } from "axios";
import AudioPlayer from "react-h5-audio-player";
import "react-h5-audio-player/lib/styles.css";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import "./App.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const apiUrl = process.env.REACT_APP_API_URL;

function App() {
  const [url, setUrl] = useState("");
  const [isConverting, setIsConverting] = useState(false);
  const [audioUrl, setAudioUrl] = useState("");
  const [error, setError] = useState("");
  const [progress, setProgress] = useState(0);
  const [playList, setPlayList] = useState([]);
  const convertRef = useRef();
  const [playAudio, setPlayAudio] = useState("");
  const [videos, setVideos] = useState([]);
  const [selectVideo, setSelectVideo] = useState({});

  const convertToMP3 = async () => {
    try {
      setIsConverting(true);
      setError("");
      setProgress(0);
      setAudioUrl("");
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

  useEffect(() => {
    if (localStorage.getItem("playList")) {
      const playList = JSON.parse(localStorage.getItem("playList"));
      setPlayList(playList);
    }
  }, []);

  useEffect(() => {
    if (playAudio) {
      convertToMP3();
    }
  }, [playAudio]);

  const addToPlayList = () => {
    const response = axios
      .get(`${apiUrl}/youTubeToMP3/info?videoUrl=${url}`)
      .then((response) => {
        var audioInfo = response.data;

        if (playList.find((x) => x.id === audioInfo.id.value))
          return alert("đã có trong danh sách");
        const newPlayList = [
          ...playList,
          {
            url: audioInfo.url,
            title: audioInfo.title,
            author: audioInfo.author,
            id: audioInfo.id.value,
            duration: audioInfo.duration,
            thumbnail: audioInfo.thumbnail,
          },
        ];
        localStorage.setItem("playList", JSON.stringify(newPlayList));
        setPlayList(newPlayList);
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

  const search = () => {
    const response = axios
      .get(`${apiUrl}/youTubeToMP3/search?value=${url}`)
      .then((response) => {
        var videos = response.data;
        console.log(videos);
        setVideos(
          videos.map((item) => ({
            url: item.url,
            title: item.title,
            author: item.author,
            id: item.id.value,
            duration: item.duration,
            thumbnail: item.thumbnail,
          }))
        );
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

  const handleRemoveItem = (id) => {
    const newPlayList = playList.filter((x) => x.id !== id);
    localStorage.setItem("playList", JSON.stringify(newPlayList));
    setPlayList(newPlayList);
  };

  const handleSelectVideo = (video) => {
    setUrl(video.url);
    setPlayAudio(video.url);
    setSelectVideo(video);
  };

  return (
    <>
      <div
        style={{
          padding: "20px 0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "15px",
          }}
        >
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            style={{ padding: "5px", width: "40%" }}
            placeholder="Nhập URL của video YouTube hoặc từ để tìm kiếm"
          />
          <button
            ref={convertRef}
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
          <button
            onClick={addToPlayList}
            style={{
              padding: "5px 10px",
              color: "#FFF",
              backgroundColor: "red",
              border: "none",
              cursor: "pointer",
            }}
          >
            Thêm vào list nhạc
          </button>
          <button
            onClick={search}
            style={{
              padding: "5px 10px",
              color: "#FFF",
              backgroundColor: "gray",
              border: "none",
              cursor: "pointer",
            }}
          >
            Tìm kiếm
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
              position: "fixed",
              width: "100%",
              bottom: "0",
            }}
          >
            <AudioPlayer
              style={{
                width: "100%",
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
          progress > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                color: "white",
                height: "50px",
                position: "fixed",
                width: "100%",
                bottom: "13px",
                margin: "20px auto 0",
                gap: "2rem",
                alignItems: "center",
              }}
            >
              <div style={{ width: "4rem" }}>
                <CircularProgressbar
                  background
                  value={progress}
                  text={`${progress}%`}
                  styles={buildStyles({ pathTransition: "none" })}
                />
              </div>
            </div>
          )
        )}
      </div>

      <div className="cards">
        {videos.length > 0 &&
          videos.map((video, index) => (
            <div key={index} className="card">
              <div onClick={() => handleSelectVideo(video)}>
                <img className="card__image" src={video.thumbnail} alt="" />
                <div
                  className={
                    "card__content" +
                    (video === selectVideo ? " card__selected" : "")
                  }
                >
                  <p>{video.title}</p>
                </div>
              </div>
              <div
                className={
                  "card__info" +
                  (video === selectVideo ? " card__selected" : "")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {selectVideo === video && (
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/009/393/830/original/black-vinyl-disc-record-for-music-album-cover-design-free-png.png"
                      alt=""
                      className="card__disc"
                    />
                  )}
                  {video.duration}
                </div>
                <div className="card__author">{video.author}</div>
              </div>
            </div>
          ))}
      </div>

      {playList.length > 0 && (
        <div
          style={{
            color: "white",
            fontSize: "30px",
            padding: "10px 50px",
          }}
        >
          Danh sách yêu thích
        </div>
      )}
      <div className="cards">
        {playList.length > 0 &&
          playList.map((video, index) => (
            <div key={index} className="card">
              <div onClick={() => handleSelectVideo(video)}>
                <img className="card__image" src={video.thumbnail} alt="" />
                <div
                  className={
                    "card__content" +
                    (video === selectVideo ? " card__selected" : "")
                  }
                >
                  <p>{video.title}</p>
                </div>
              </div>
              <div
                className={
                  "card__info" +
                  (video === selectVideo ? " card__selected" : "")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "5px",
                  }}
                >
                  {selectVideo === video && (
                    <img
                      src="https://static.vecteezy.com/system/resources/previews/009/393/830/original/black-vinyl-disc-record-for-music-album-cover-design-free-png.png"
                      alt=""
                      className="card__disc"
                    />
                  )}
                  <img
                    src="https://spng.pngfind.com/pngs/s/57-578431_trash-can-clipart-general-waste-trash-bin-icon.png"
                    alt=""
                    width={20}
                    height={20}
                    style={{
                      cursor: "pointer",
                    }}
                    onClick={() => handleRemoveItem(video.id)}
                  />
                  {video.duration}
                </div>
                <div className="card__author">{video.author}</div>
              </div>
            </div>
          ))}
      </div>
    </>
  );
}

export default App;
