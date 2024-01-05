// FaceDetectionCanvas.jsx
import React, { useRef, useEffect } from "react";
import * as faceapi from "face-api.js";

function FaceDetectionCanvas({ videoRef }) {
  const canvasRef = useRef();
  const intervalRef = useRef(); // Ref for the interval

  useEffect(() => {
    const loadModels = async () => {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceExpressionNet.loadFromUri("/models"),
      ]);

      detectFaces();
    };

    const detectFaces = async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: video.width, height: video.height };

      faceapi.matchDimensions(canvas, displaySize);

      intervalRef.current = setInterval(async () => {
        const detections = await faceapi
          .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceExpressions();

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize
        );

        canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);

        faceapi.draw.drawDetections(canvas, resizedDetections);
        faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
        faceapi.draw.drawFaceExpressions(canvas, resizedDetections);
      }, 1000);
    };

    loadModels();

    // Cleanup function to clear interval on unmount
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [videoRef]);

  return (
    <canvas
      style={{ position: "absolute" }}
      ref={canvasRef}
      className="appcanvas"
    />
  );
}

export default FaceDetectionCanvas;
