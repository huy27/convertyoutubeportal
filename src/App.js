import axios from "axios";
import React, { useEffect, useRef, useState } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import AudioPlayer from "react-h5-audio-player";
import ReactAutocomplete from "react-autocomplete";
import "react-h5-audio-player/lib/styles.css";
import "./App.css";
import Loading from "./Loading.tsx";
import heart from "./assets/img/heart.png";
import music_disc from "./assets/img/music_disc.png";
import trash from "./assets/img/trash.png";

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
  const [isLoading, setIsLoading] = useState(false);
  const [recommends, setRecommends] = useState(["huy"]);

  const convertToMP3 = async (url) => {
    try {
      setIsLoading(true);
      setIsConverting(true);
      setError("");
      setProgress(0);
      const response = await axios
        .get(`${apiUrl}/youTubeToMP3?url=${url}`, {
          responseType: "blob",
          onDownloadProgress: (progressEvent) => {
            const percentage = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setProgress(percentage);
          },
        })
        .catch(() => {
          setProgress(0);
          setError("Lỗi khi chuyển đổi URL");
        })
        .finally(() => {
          setIsLoading(false);
          setIsConverting(false);
        });

      const audioBlob = new Blob([response.data], { type: "audio/mpeg" });
      const audioUrl = URL.createObjectURL(audioBlob);

      setAudioUrl(audioUrl);
    } catch (error) {
      console.log(error);
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
      convertToMP3(playAudio);
    }
  }, [playAudio]);

  const addToPlayList = (url) => {
    setError("");
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

  const search = (url) => {
    setError("");
    setIsLoading(true);
    const response = axios
      .get(`${apiUrl}/youTubeToMP3/search?value=${url}`)
      .then((response) => {
        var videos = response.data;
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
      })
      .finally(() => setIsLoading(false));
  };

  const handleRemoveItem = (id) => {
    const newPlayList = playList.filter((x) => x.id !== id);
    localStorage.setItem("playList", JSON.stringify(newPlayList));
    setPlayList(newPlayList);
  };

  const handleSelectVideo = (video) => {
    setPlayAudio(video.url);
    setSelectVideo(video);
  };

  const handleConvertVideo = (url) => {
    setPlayAudio(url);
    setSelectVideo("");
  };

  const handleChangeInput = (e) => {
    // eslint-disable-next-line no-undef
    $.ajax({
      url: `https://suggestqueries.google.com/complete/search?hl=en&ds=yt&client=youtube&hjson=t&cp=1&q=${e.target.value}`,
      dataType: "jsonp",
      success: (data) => {
        setRecommends(data[1].map((x) => x[0]));
      },
      error: (error) => {
        console.error(error);
      },
    });
    setUrl(e.target.value);
  };

  return (
    <>
      {isLoading && <Loading></Loading>}

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
          <ReactAutocomplete
            items={recommends}
            renderInput={(props) => (
              <input
                style={{
                  width: "100%",
                  lineHeight: "20px",
                  fontSize: "20px",
                  backgroundColor: "rgb(79 79 79 / 60%)",
                  color: "white",
                }}
                type="search"
                {...props}
              />
            )}
            shouldItemRender={(item, value) =>
              item.toLowerCase().indexOf(value.toLowerCase()) > -1
            }
            getItemValue={(item) => item}
            renderItem={(item, highlighted) => {
              return (
                <div
                  key={item}
                  style={{
                    backgroundColor: highlighted
                      ? "rgb(79 79 79 / 60%)"
                      : "black",
                    cursor: "pointer",
                    color: "white",
                    padding: "10px",
                    display: "flex",
                    alignItems: "center",
                    zIndex: "900",
                  }}
                >
                  {item}
                </div>
              );
            }}
            value={url}
            onChange={(e) => handleChangeInput(e)}
            onSelect={(value) => {
              setUrl(value);
              search(value);
            }}
          />
          {/* <input
            type="text"
            value={url}
            onChange={(e) => handleChangeInput(e)}
            style={{ padding: "5px", width: "40%" }}
            placeholder="Nhập URL của video YouTube hoặc từ để tìm kiếm"
          /> */}
          <button
            ref={convertRef}
            onClick={() => handleConvertVideo(url)}
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
            onClick={() => addToPlayList(url)}
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
            onClick={() => search(url)}
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
        {audioUrl && (
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
              header={
                <span
                  style={{
                    color: "white",
                  }}
                >
                  {selectVideo && selectVideo.title}
                </span>
              }
              volume="0.5"
              loop
              autoPlay
              src={audioUrl}
              onPlay={(e) => console.log("onPlay")}
              // other props here
            />
          </div>
        )}
        {(progress > 0 && progress < 100) && (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              color: "white",
              height: "50px",
              position: "fixed",
              width: "100%",
              bottom: "39%",
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
        )}
        )
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
                    <img src={music_disc} alt="" className="card__disc" />
                  )}
                  <img
                    src={heart}
                    alt=""
                    height={20}
                    width={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => addToPlayList(video.url)}
                  />
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
            <div key={index} className="card card__favorite">
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
                    <img src={music_disc} alt="" className="card__disc" />
                  )}
                  <img
                    src={trash}
                    alt=""
                    width={20}
                    height={20}
                    style={{
                      cursor: "pointer",
                    }}
                    className="card__image__trash"
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
