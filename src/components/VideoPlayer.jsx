// VideoPlayer.js
import React, { useRef } from "react";

function VideoPlayer({ handleFileChange, isPlaying, togglePlayPause }) {
  const videoRef = useRef();

  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
    } else {
      videoRef.current.play();
    }
    togglePlayPause(); // Notify the parent component about play/pause state change
  };

  return (
    <div className="input">
      <input type="file" accept="video/*" onChange={handleFileChange} />
      <button onClick={handlePlayPause}>{isPlaying ? "Pause" : "Play"}</button>
      <video
        width={450}
        height={450}
        crossOrigin="anonymous"
        ref={videoRef}
      ></video>
    </div>
  );
}

export default VideoPlayer;
