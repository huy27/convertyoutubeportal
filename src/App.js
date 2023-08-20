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
import trash_white from "./assets/img/trash_white.png";
import heart_white from "./assets/img/heart_white.png";
import heart_select from "./assets/img/heart_select.png";

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
          alert("Lỗi khi chuyển đổi URL");
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

  const addToPlayList = (video) => {
    const videoId = video.id.value ?? video.id;
    if (playList.find((x) => x.id === videoId))
      return alert("đã có trong danh sách");
    const newPlayList = [
      ...playList,
      {
        url: video.url,
        title: video.title,
        author: video.author,
        id: video.id.value ?? video.id,
        duration: video.duration,
        thumbnail: video.thumbnail,
      },
    ];
    localStorage.setItem("playList", JSON.stringify(newPlayList));
    setPlayList(newPlayList);
  };

  const handleAddToPlayList = (url) => {
    setError("");
    const response = axios
      .get(`${apiUrl}/youTubeToMP3/info?videoUrl=${url}`)
      .then((response) => {
        var audioInfo = response.data;
        addToPlayList(audioInfo);
      })
      .catch((error) => {
        alert(error.response.data);
      });
  };

  const search = (url) => {
    setError("");
    setIsLoading(true);
    const response = axios
      .get(`${apiUrl}/youTubeToMP3/search?value=${url}&size=20`)
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
            flexWrap: "wrap",
          }}
        >
          <ReactAutocomplete
            items={recommends}
            wrapperStyle={{
              minWidth: "40%",
            }}
            menuStyle={{
              borderRadius: "3px",
              boxShadow: "0 2px 12px rgba(0, 0, 0, 0.1)",
              background: "rgba(255, 255, 255, 0.9)",
              padding: "2px 0",
              fontSize: "90%",
              position: "fixed",
              overflow: "auto",
              maxHeight: "50%", // TODO: don't cheat, let it flow to the bottom
              display: recommends.length === 0 ? "none" : "",
            }}
            renderInput={(props) => (
              <input
                style={{
                  width: "100%",
                  lineHeight: "24px",
                  fontSize: "15px",
                  backgroundColor: "#110f0fb0",
                  color: "white",
                }}
                type="search"
                placeholder="Nhập URL của video YouTube hoặc từ để tìm kiếm"
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
                      ? "#9d9d9d"
                      : "#110f0fe6",
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
            onClick={() => handleAddToPlayList(url)}
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
              zIndex: "2",
            }}
          >
            <AudioPlayer
              style={{
                width: "100%",
              }}
              className="audio__player"
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
              showDownloadProgress
              // other props here
            />
          </div>
        )}
        {progress > 0 && progress < 100 && (
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
                    src={
                      playList.find((x) => x.id === video.id)
                        ? heart_select
                        : selectVideo === video
                        ? heart
                        : heart_white
                    }
                    alt=""
                    height={20}
                    width={20}
                    style={{ cursor: "pointer" }}
                    onClick={() => {
                      playList.find((x) => x.id === video.id)
                        ? handleRemoveItem(video.id)
                        : addToPlayList(video);
                    }}
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
      <div
        className="cards"
        style={{ marginBottom: audioUrl ? "130px" : "30px" }}
      >
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
                    <img src={music_disc} alt="" className="card__disc" />
                  )}
                  <img
                    src={selectVideo === video ? trash : trash_white}
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
