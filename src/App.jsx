import { useRef, useEffect, useState } from "react";
import "./App.css";
import * as faceapi from "face-api.js";
import { fabric } from "fabric";

function App() {
  const videoRef = useRef();
  const canvasRef = useRef();
  const fileInputRef = useRef();
  let interval = useRef();
  const [isPlaying, setIsPlaying] = useState(false);
  const [checkFile, setCheckFile] = useState("");
  const handlePlayPause = () => {
    if (isPlaying) {
      videoRef.current.pause();
      canvasRef.current.innerHtml = "";
      clearInterval(interval.current);
      setIsPlaying(!isPlaying);
    } else {
      loadModels();
      setIsPlaying(!isPlaying);
    }
  };
  const loadModels = () => {
    Promise.all([
      faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
      faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
      faceapi.nets.faceExpressionNet.loadFromUri("/models"),
    ]).then(() => {
      detectFaces();
    });
  };

  const detectFaces = () => {
    interval.current = videoRef.current.play().then(() => {
      setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceLandmarks()
          .withFaceExpressions();
        canvasRef.current.innerHtml = faceapi.createCanvasFromMedia(
          videoRef.current
        );

        faceapi.matchDimensions(canvasRef.current, {
          width: videoRef.current.width,
          height: videoRef.current.height,
        });
        const resized = faceapi.resizeResults(detections, {
          width: canvasRef.current.width,
          height: canvasRef.current.height,
        });
        faceapi.draw.drawDetections(canvasRef.current, resized);
        faceapi.draw.drawFaceLandmarks(canvasRef.current, resized);
        faceapi.draw.drawFaceExpressions(canvasRef.current, resized);
        const resizeDetection = [];
        // const fabricCanvas = new fabric.Canvas(canvasRef.current);

        //

        resized.forEach((detection) => {
          const { _box } = detection.detection;
          const rect = new fabric.Rect({
            left: _box._x, // Adjust as needed based on face detection coordinates
            top: _box._y, // Adjust as needed based on face detection coordinates
            width: _box._width,
            height: _box._height,
            fill: "transparent",
            stroke: "blue",
            strokeWidth: 2,
          });
        });
      }, 1000);
    });
  };
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      videoRef.current.src = videoURL;
      setCheckFile(videoURL);
      videoRef.current.load();
    }
  };
  return (
    <>
      <div className="controls">
        <input
          type="file"
          accept="video/*"
          ref={fileInputRef}
          onChange={handleFileChange}
        />
        {checkFile !== "" && (
          <button onClick={handlePlayPause}>
            {isPlaying ? "Pause" : "Play"}
          </button>
        )}
      </div>
      <div className="video-canva">
        <video
          style={{ position: "absolute" }}
          crossOrigin="anonymous"
          height={600}
          width={600}
          ref={videoRef}
        ></video>
        <canvas style={{ position: "absolute" }} ref={canvasRef} />
      </div>
    </>
  );
}

export default App;
