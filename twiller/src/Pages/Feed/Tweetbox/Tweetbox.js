import { useState } from "react";
import "./Tweetbox.css";
import { Avatar, Button } from "@mui/material";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import axios from "axios";
import { useUserAuth } from "../../../context/UserAuthContext";
import { toast } from "react-hot-toast";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const Tweetbox = () => {
  const [post, setPost] = useState("");
  const [imageurl, setImageurl] = useState("");
  const [isloading, setIsLoading] = useState(false);

  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();

  const email = user?.email;
  const userProfilePic =
    loggedinuser[0]?.profileImage || user?.photoURL;

  const handleUploadImage = (e) => {
    setIsLoading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);

    axios
      .post(
        "https://api.imgbb.com/1/upload?key=daa2ac1a5d20ec3d601828e4bf73164e",
        formData
      )
      .then((res) => {
        setImageurl(res.data.data.display_url);
        setIsLoading(false);
      })
      .catch((e) => {
        console.log(e);
        toast.error("Image upload failed!");
        setIsLoading(false);
      });
  };

  const handleTweet = (e) => {
    e.preventDefault();

    if (!loggedinuser.length) {
      toast.error("User info not loaded yet.");
      return;
    }

    const userpost = {
      name: loggedinuser[0]?.name,
      username: email?.split("@")[0],
      profilephoto: userProfilePic,
      post: post,
      photo: imageurl,
      email: email,
      timestamp: new Date().toISOString(),
    };

    fetch("http://localhost:5000/post", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userpost),
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          toast.error(data.message || "Post failed!");
          return;
        }
        toast.success("Tweet posted!");
        setPost("");
        setImageurl("");
      })
      .catch((err) => {
        console.error(err);
        toast.error("Something went wrong!");
      });
  };

  return (
    <div className="tweetBox">
      <form onSubmit={handleTweet}>
        <div className="tweetBox__input">
          <Avatar src={userProfilePic} />
          <input
            type="text"
            placeholder="What's happening?"
            onChange={(e) => setPost(e.target.value)}
            value={post}
            required
          />
        </div>

        <div className="imageIcon_tweetButton">
          <label htmlFor="image" className="imageIcon">
            {isloading ? (
              <p>Uploading Image...</p>
            ) : (
              <p>
                {imageurl ? "Image Uploaded" : <AddPhotoAlternateOutlinedIcon />}
              </p>
            )}
          </label>
          <input
            type="file"
            id="image"
            className="imageInput"
            onChange={handleUploadImage}
          />

          <Button
            className="tweetBox__tweetButton"
            type="submit"
            disabled={isloading || post.trim() === ""}
          >
            Tweet
          </Button>
        </div>
      </form>
    </div>
  );
};

export default Tweetbox;
