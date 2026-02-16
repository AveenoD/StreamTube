import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../toaster/UseToast.js";

const BASE_URL = "http://localhost:5000/api/v1";

function UploadPage() {
  const toast    = useToast();
  const navigate = useNavigate();

  const [title, setTitle]                       = useState("");
  const [description, setDescription]           = useState("");
  const [loading, setLoading]                   = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);
  const [videoName, setVideoName]               = useState(null);

  const videoRef     = useRef(null);
  const thumbnailRef = useRef(null);

  function handleThumbnailChange() {
    const file = thumbnailRef.current.files[0];
    if (!file) return;
    setThumbnailPreview(URL.createObjectURL(file));  
  }

  function handleVideoChange() {
    const file = videoRef.current.files[0];
    if (!file) return;
    setVideoName(file.name);   
  }

  function validate() {
    if (!title.trim()) {
      toast.error("Title is required");
      return false;            
    }
    if (!description.trim()) {
      toast.error("Description is required");
      return false;
    }
    if (!videoRef.current.files[0]) {     
      toast.error("Video file is required");
      return false;
    }
    if (!thumbnailRef.current.files[0]) { 
      toast.error("Thumbnail is required");
      return false;
    }
    return true;
  }

  async function handleUpload(e) {
    e.preventDefault();
    if (!validate()) return;

    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("videoFile", videoRef.current.files[0]);      
    formData.append("thumbnail", thumbnailRef.current.files[0]);

    setLoading(true);

    try {
      const response = await axios.post(
        `${BASE_URL}/videos/publish`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,        
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Video uploaded successfully! 🎉");
      navigate(`/video/${response.data.data._id}`);  

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Upload failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return <div></div>;
}

export default UploadPage;