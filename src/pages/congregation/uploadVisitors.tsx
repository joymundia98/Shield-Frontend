import React, { useEffect, useRef, useState } from "react";
import "../../styles/global.css";
import axios from "axios";

// Import Images
import visitorsTemplate from "../../assets/visitors_format.png";
import step2 from "../../assets/step2.png";
import step3 from "../../assets/step3.png";
import optional from "../../assets/optional.png";
import step4 from "../../assets/step4.png";

const baseURL = import.meta.env.VITE_BASE_URL;

const UploadVisitorsGuide: React.FC = () => {
  const [acknowledged, setAcknowledged] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  const [uploadMessage, setUploadMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);


  const trackRef = useRef<HTMLDivElement | null>(null);
  const dropZoneRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const slidesCount = 6;

  /* ======================
     Carousel Logic
  ====================== */
  useEffect(() => {
    if (trackRef.current) {
      trackRef.current.style.transform = `translateX(-${currentIndex * 100}%)`;
    }
  }, [currentIndex]);

  const nextSlide = () => {
    if (currentIndex < slidesCount - 1) setCurrentIndex((prev) => prev + 1);
  };

  const prevSlide = () => {
    if (currentIndex > 0) setCurrentIndex((prev) => prev - 1);
  };

  /* ======================
     Drag & Drop Logic
  ====================== */
  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles) return;

    const validFiles = Array.from(newFiles).filter((file) =>
      [".csv", ".xlsx"].some((ext) => file.name.toLowerCase().endsWith(ext))
    );

    setFiles((prev) => [...prev, ...validFiles]);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
  if (files.length === 0) {
    setUploadMessage("No file selected");
    return;
  }

  const token = localStorage.getItem("authToken");
  if (!token) {
    setUploadMessage("You are not authenticated.");
    return;
  }

  const formData = new FormData();
  formData.append("file", files[0]);
  formData.append("type", "visitors");

  try {
    setIsUploading(true);
    setUploadProgress(0);
    setUploadMessage("");

    const res = await axios.post(
      `${baseURL}/api/uploads`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },

        onUploadProgress: (progressEvent) => {
          if (!progressEvent.total) return;

          const rawPercent =
            (progressEvent.loaded * 100) / progressEvent.total;

          // Cap at 90% while uploading
          const cappedPercent = Math.min(Math.round(rawPercent * 0.9), 90);

          setUploadProgress(cappedPercent);
        },

      }
    );
    setUploadProgress(100);

    setUploadMessage(
      `${res.data.count} rows uploaded successfully to visitors table.`
    );
    setFiles([]);
  } catch (error: any) {
    console.error("Upload failed:", error);
    setUploadMessage(
      error?.response?.data?.error || "Upload failed"
    );
  } finally {
    setIsUploading(false);
  }
};


  return (
    <div className="parent-upload-container">
      <div className="Upload-container">
        <h1>CSV & Excel Upload Guide</h1>

        {/* Disclaimer */}
        <div className="disclaimer">
          <strong>Important Notice</strong>
          <br />
          Please review this guide carefully before proceeding with any data
          upload. Uploading files that do not follow the required format may
          result in failed uploads, incomplete records, or data inconsistencies.
          <br />
          <br />
          Once you have reviewed the guide and confirmed that your data meets the
          requirements, acknowledge your understanding at the bottom of this
          page to proceed with the upload.
        </div>

        {/* Column Rules */}
        <div className="notice">
          <strong>Column Naming Rules</strong>

          <br/>

          To avoid errors during parsing, please name your columns as follows...
          <ul>
              <li><strong>full_name</strong></li>
              <li><strong>email</strong></li>
              <li><strong>phone</strong></li>
              <li><strong>gender</strong></li>
              <li><strong>date_of_birth</strong></li>
              <li><strong>date_joined</strong></li>
              <li><strong>age</strong></li>
              <li><strong>disabled</strong></li>
              <li><strong>orphan</strong></li>
              <li><strong>widowed</strong></li>
              <li><strong>nrc</strong></li>
              <li><strong>guardian_name</strong></li>
              <li><strong>guardian_phone</strong></li>
          </ul>
        </div>

        {/* Template Preview */}
        <div className="template-preview">
          <p>The Image below shows the acceptable format</p>
          <img
            src={visitorsTemplate}
            alt="Correct file example"
            onClick={() => setZoomSrc(visitorsTemplate)}
          />
          <div className="template-caption">Click the image to zoom in</div>
        </div>

        {/* Warning */}
        <div className="warning">
          <strong>Important: Excel Formatting</strong>
          <ul>
            <li>
              <strong>
                Phone Number columns must be formatted as <em>Number</em>
              </strong>
            </li>
            <li>No spaces, dashes, or symbols</li>
            <li>
              Example: <code>260977123456</code>
            </li>
          </ul>
        </div>

        <p>
          Below is a step by step guide to help you set up your file in the
          required Format
        </p>

        {/* ======================
            Carousel
        ====================== */}
        <div className="carousel">
          <div className="carousel-track" ref={trackRef}>
            {/* Slide 1 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Step 1: Check Column Names and Data Types</h3>
                <ul>
                  <li>
                    Ensure column names <strong>Match</strong> the guide shown.
                  </li>
                  <li>
                    <strong>date_of_birth</strong> and <strong>date_joined</strong> should be in the <code>Date</code> format.
                  </li>
                  <li>
                    All other columns can take the <strong> general format</strong>
                  </li>  
                  <li>
                    Confirm all Columns<strong> Match</strong> the acceptable format
                    shown above
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={visitorsTemplate}
                  alt="Correct column naming example"
                  onClick={() => setZoomSrc(visitorsTemplate)}
                />
              </div>
            </div>

            {/* Slide 2 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Step 2: Verify Phone Number Format</h3>
                <ul>
                  <li>
                    Phone column must be formatted as{" "}
                    <strong>Number</strong> in Excel
                  </li>
                  <li>No spaces, dashes, or symbols</li>
                  <li>
                    Example: <code>260977123456</code>
                  </li>
                </ul>
                <ul>
                  <li>
                    If the phone column <strong>resembles</strong> the image on
                    the left, follow the next steps...
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={step2}
                  alt="Phone number formatting example"
                  onClick={() => setZoomSrc(step2)}
                />
              </div>
            </div>

            {/* Slide 3 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Step 3: Change Data Type</h3>
                <ul>
                  <li>
                    Select the Data Format drop-down and select Number
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={step3}
                  alt="Data Structure Drop-down"
                  onClick={() => setZoomSrc(step3)}
                />
              </div>
            </div>

            {/* Slide 4 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Optional Step: Increase width of phone column</h3>
                <ul>
                  <li>
                    Following step 3, increase the width of the phone column to
                    unveil the numbers
                  </li>
                  <li>
                    This step is only applicable if you see the hashtag (#)
                    symbols in the phone column
                  </li>
                  <li>
                    Skip this step if you can already <strong>see</strong> your
                    numbers clearly
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={optional}
                  alt="Optional Step"
                  onClick={() => setZoomSrc(optional)}
                />
              </div>
            </div>

            {/* Slide 5 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Step 4: Remove Trailing Zeroes</h3>
                <ul>
                  <li>
                    Click the <strong>Decrease Decimal</strong> button in excel
                    to remove all zeroes after the decimal.
                  </li>
                  <li>
                    In most cases you will only need to click this button twice
                  </li>
                  <li>
                    Confirm there are no <strong>decimals</strong> in your phone
                    column
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={step4}
                  alt="Remove decimals"
                  onClick={() => setZoomSrc(step4)}
                />
              </div>
            </div>

            {/* Slide 6 */}
            <div className="carousel-slide">
              <div className="carousel-left">
                <h3>Final Step: Confirm Format meets requirements</h3>
                <ul>
                  <li>
                    Confirm all columns including the phone column match the
                    required Format
                  </li>
                </ul>
              </div>
              <div className="carousel-right">
                <img
                  src={visitorsTemplate}
                  alt="Final confirmation"
                  onClick={() => setZoomSrc(visitorsTemplate)}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="carousel-controls">
            <button onClick={prevSlide}>Previous</button>
            <span>
              {currentIndex + 1} / {slidesCount}
            </span>
            <button onClick={nextSlide}>Next</button>
          </div>
        </div>

        {/* visitors Table */}
        <h2>Visitors Upload</h2>
        <table>
          <thead>
            <tr>
              <th>Column Name</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>full_name</td>
              <td>Member’s full name (First name + Last name)</td>
            </tr>
            <tr>
              <td>email</td>
              <td>Unique email address</td>
            </tr>
            <tr>
              <td>phone</td>
              <td>Phone number (Excel format: Number)</td>
            </tr>
            <tr>
              <td>gender</td>
              <td>Member gender (Male / Female)</td>
            </tr>
            <tr>
              <td>date_of_birth</td>
              <td>Date of birth (DD/MM/YYYY)</td>
            </tr>
            <tr>
              <td>date_joined</td>
              <td>Date member joined (DD/MM/YYYY)</td>
            </tr>
            <tr>
              <td>age</td>
              <td>Member age (Number)</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td>Indicates if member is disabled (TRUE / FALSE)</td>
            </tr>
            <tr>
              <td>orphan</td>
              <td>Indicates if member is an orphan (TRUE / FALSE)</td>
            </tr>
            <tr>
              <td>widowed</td>
              <td>
                Indicates if member is widowed (TRUE / FALSE). 
                <br />
                <strong>Applies only to Female visitors</strong>
              </td>
            </tr>
            <tr>
              <td>nrc</td>
              <td>National Registration Card number</td>
            </tr>
            <tr>
              <td>guardian_name</td>
              <td>
                Guardian’s full name.
                <br />
                <strong>Required only if age is under 18</strong>
              </td>
            </tr>
            <tr>
              <td>guardian_phone</td>
              <td>
                Guardian’s phone number.
                <br />
                <strong>Required only if age is under 18</strong>
              </td>
            </tr>
          </tbody>
        </table>


        {/* Acknowledgement */}
        <div className="acknowledgement">
          <label>
            <input
              type="checkbox"
              checked={acknowledged}
              onChange={(e) => setAcknowledged(e.target.checked)}
            />
            I have read and understood this guide, and I confirm that my data is
            in the required format.
          </label>
        </div>

        <div className="footer">
          Upload functionality will be enabled once the acknowledgement is
          confirmed.
        </div>

        {/* Upload Modal */}
        {acknowledged && (
          <div className="upload-overlay">
            <form className="upload-modal" onSubmit={(e) => e.preventDefault()}>
              <span className="close" onClick={() => setAcknowledged(false)}>
                X
              </span>

              <div className="content">
                <span className="title">Upload a File</span>
                <p className="message">
                  Select a file from your device
                </p>

                <div
                  className={`drop-zone ${isDragging ? "dragover" : ""}`}
                  ref={dropZoneRef}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onDrop={onDrop}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <p>
                    <strong>click to browse</strong>
                  </p>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx"
                  multiple
                  hidden
                  onChange={(e) => handleFiles(e.target.files)}
                />

                {/* Selected files / no file message */}
                <div className="result">
                  {files.length > 0 ? (
                    files.map((file, index) => (
                      <div key={index} className="file-uploaded">
                        <span>{file.name}</span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFile(index)}
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="no-file">No file selected</p>
                  )}
                </div>

                {/* Upload button */}
                <button
                  type="button"
                  className="file-upload-btn"
                  disabled={isUploading}
                  onClick={handleUpload}
                >
                  {isUploading ? "Uploading..." : "📤 Upload File"}
                </button>

                {isUploading && (
                  <div className="progress-wrapper">
                    <div className="progress-bar">
                      <div
                        className="progress-fill"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>

                    <span className="progress-text">
                      {uploadProgress < 90
                        ? `Uploading… ${uploadProgress}%`
                        : "Processing data…"}
                    </span>

                    {uploadProgress >= 90 && (
                      <p className="processing-hint">
                        <b>Please be patient while your file uploads.</b><br/> 
                        Upload time may take up to 1–2 minutes depending on the file size.
                      </p>
                    )}

                  </div>
                )}


                {/* Upload status message */}
                {uploadMessage && (
                  <p className="upload-message">{uploadMessage}</p>
                )}

              </div>
            </form>
          </div>
        )}
      </div>

      {/* Image Zoom Modal */}
      {zoomSrc && (
        <div className="image-modal" onClick={() => setZoomSrc(null)}>
          <img src={zoomSrc} alt="Zoomed preview" />
        </div>
      )}
    </div>
  );
};

export default UploadVisitorsGuide;
