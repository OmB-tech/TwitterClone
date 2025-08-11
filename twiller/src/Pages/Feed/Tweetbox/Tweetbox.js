import { useState } from "react";
import "./Tweetbox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import { useUserAuth } from "../../../context/UserAuthContext";
import { toast } from "react-hot-toast";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const CLOUDINARY_CLOUD_NAME = "dhvjlxlei";
const CLOUDINARY_UPLOAD_PRESET = "twiller_unsigned";

const Tweetbox = ({ onPost }) => {
  const [post, setPost] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTweeting, setIsTweeting] = useState(false);
  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

    const fileType = file.type.startsWith("image/") ? "image" : "video";

    try {
      const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/${fileType}/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      setMediaUrl(data.secure_url);
      toast.success("File uploaded!");
    } catch (err) {
      console.error(err);
      toast.error("File upload failed!");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTweet = (e) => {
    e.preventDefault();
    if (!loggedinuser.length) {
      toast.error("User info not loaded yet.");
      return;
    }
    setIsTweeting(true);
    const userpost = {
      name: loggedinuser[0]?.name || user?.displayName,
      username: loggedinuser[0]?.username || user?.email?.split("@")[0],
      profilephoto: loggedinuser[0]?.profileImage || user?.photoURL,
      post: post,
      photo: mediaUrl,
      email: user?.email,
    };
    fetch("https://twitterclone-1-uvwk.onrender.com/createpost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userpost),
    })
    .then(res => res.json())
    .then(data => {
        if (!data.success) {
            toast.error(data.message || "Failed to post tweet.");
        } else {
            toast.success("Tweet posted successfully!");
            setPost("");
            setMediaUrl("");
            if(onPost) onPost(); // Refresh the feed
        }
    })
    .catch((err) => {
        console.error(err);
        toast.error("An error occurred while posting.");
    })
    .finally(() => {
        setIsTweeting(false);
    });
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleTweet}>
        <div className="tweetBox__input">
          <Avatar src={loggedinuser[0]?.profileImage || user?.photoURL} />
          <input type="text" placeholder="What's happening?" onChange={(e) => setPost(e.target.value)} value={post} required />
        </div>
        <div className="imageIcon_tweetButton">
          <label htmlFor="file-upload" className="imageIcon">
            {isLoading ? <p>Uploading...</p> : (mediaUrl ? <p>File Ready</p> : <AddPhotoAlternateOutlinedIcon />)}
          </label>
          <input type="file" id="file-upload" className="imageInput" onChange={handleFileUpload} accept="image/*,video/*" />
          <Button className="tweetBox__tweetButton" type="submit" disabled={isLoading || isTweeting || post.trim() === ""}>
            {isTweeting ? "Posting..." : "Tweet"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Tweetbox;
