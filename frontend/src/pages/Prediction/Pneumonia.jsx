import React, { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import "./prediction.css";
import { Link } from "react-router-dom";
import Modal from "../../components/Modal/Modal";
import Progress_bar from "../../components/ProgressBar/ProgressBar";
import videoSrc from "../../Videos/xray_video.mp4";
import Chat from "../../components/Chat/Chat";

// Icon import
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";

function Pneumonia() {
  // fileupload & Result
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [result, setResult] = useState(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [showGive, setshowGive] = useState(false);
  const [loading, setLoading] = useState(false);

  const handelClose = () => {
    setshowGive(false);
    setLoading(false);
    setUploadProgress(0);
  };

  useEffect(() => {
    if (selectedFile != null) setLoading(true);
  }, [selectedFile]);

  const uploadImg = async () => {
    const formData = new FormData();
    formData.append("image", selectedFile);
    const config = {
      onUploadProgress: (progressEvent) => {
        const progress = Math.round(
          (progressEvent.loaded / progressEvent.total) * 100
        );
        setUploadProgress(progress);
      },
    };

    await axios
      .post("http://localhost:8000/pneumonia", formData, config)
      .then((response) => {
        setResult(response.data);
        setshowGive(true);
      })
      .catch((error) => {
        console.error(error);
      });
  };

  useEffect(() => {
    if (selectedFile) {
      uploadImg();
    }
  }, [selectedFile]);

  // Drag and Drop
  const onDrop = useCallback((acceptedFiles) => {
    setSelectedFile(acceptedFiles[0]);
    setIsDraggingOver(false);
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    onDragEnter: () => setIsDraggingOver(true),
    onDragLeave: () => setIsDraggingOver(false),
  });
  return (
    <div>
      <div className="chat_header_text">
        <h2>
          AI Health Assistant for{" "}
          <span className="text-red-500">Pneumonia</span> realated Queries
        </h2>
        <p>
          <FontAwesomeIcon
            icon={faTriangleExclamation}
            className="fa-margin"
            style={{ color: "red" }}
          />
          Cure.AI Health Assistant is for informational purposes only. Don’t
          take any actions without a doctor’s validation or consultation.
        </p>
      </div>
      <div
        className="main-container flex items-center justify-center overflow-x-clip"
        style={{ height: "90vh" }}
      >
        <div className="py-4 md:py-8">
          <div className="mx-auto w-full px-8 relative">
            <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center md:gap-9">
              <div className="left-container flex flex-col md:flex-row lg:flex-col items-center gap-6 md:gap-8">
                <video
                  preload="auto"
                  className="left-container-video w-full h-auto rounded-4xl max-w-[320px] lg:max-w-[420px]"
                  poster="https://images.pexels.com/videos/4316922/corona-virus-coronavirus-covid-covid-19-4316922.jpeg?auto=compress&cs=tinysrgb&w=1600"
                  autoPlay
                  muted
                  playsInline
                  src={videoSrc}
                ></video>
                <div className="flex flex-col gap-4">
                  <h1 className="font-display font-bold text-typo m-0 text-4xl md:text-5xl lg:text-6xl text-center md:!text-left">
                    Detect <span className="text-orange-500">Pneumonia</span>
                    <br /> X-RAY image
                  </h1>
                  <p className="text-typo-tertiary font-bold text-xl m-0 !text-typo text-center md:!text-left">
                    100% Automatically and
                    <span className="!py-1 !px-4 bg-brush bg-no-repeat bg-cover bg-center">
                      Free
                    </span>
                  </p>
                </div>
              </div>
              <div className="right-container-prediction relative group flex flex-col gap-4 md:gap-8">
                {loading == false ? (
                  <div className="dropzone-enabled" {...getRootProps()}>
                    <input {...getInputProps()} />

                    <div
                      className={`right-container-drop  w-full flex flex-col sm:justify-center sm:items-center sm:gap-8 sm:pt-36 sm:pb-16 rounded-4xl bg-white shadow-2xl ${
                        isDraggingOver ? "right-container-drag" : ""
                      }`}
                    >
                      <button type="button" className="upload-btn">
                        Upload Image
                      </button>
                      <div className="hidden sm:flex flex-col gap-1.5">
                        <p className="m-0 font-bold text-xl text-typo-secondary">
                          or drop a file,
                        </p>
                        <span className="text-xs text-typo-secondary text-center">
                          Paste Image and Wait
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="right-container-drop  w-full flex flex-col sm:justify-center sm:items-center sm:gap-8 sm:pt-36 sm:pb-36  rounded-4xl bg-white shadow-2xl">
                    <div className="loading_div">
                      <p>Uploading the image</p>
                      <Progress_bar
                        bgcolor="#99ccff"
                        progress={`${uploadProgress}`}
                        height={30}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        {/* Result Modal */}
        {result && showGive ? (
          <Modal
            show={showGive}
            onClose={handelClose}
            img="Image/modelBanner.jpg"
            bigText={`${result.predicted_class}`}
            smallText="We recommend you to make a appointment with doctor"
            percentage={`${Math.round(result.probability)}`}
          />
        ) : null}
      </div>
      <hr />
      <div>
        <Chat />
      </div>
    </div>
  );
}

{
  /* <div>
      <h1>Image Upload App</h1>
      <input type="file" accept="image/*" onChange={handleFileInputChange} />
      <button onClick={handleUploadClick}>Upload</button>
      {result && (
        <div>
          <h2>Result</h2>
          <p>Predicted Class: {result.predicted_class}</p>
          <p>Probability: {result.probability.toFixed(2)}%</p>
        </div>
      )}
    </div> */
}

export default Pneumonia;
