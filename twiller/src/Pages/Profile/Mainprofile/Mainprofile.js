import React, { useState, useEffect, useRef } from "react";
import Post from "../Posts/posts";
import { useNavigate } from "react-router-dom";
import "./Mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddLinkIcon from "@mui/icons-material/AddLink";
import Editprofile from "../Editprofile/Editprofile";
import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const Mainprofile = ({ user }) => {
  const navigate = useNavigate();
  const [isloading, setisloading] = useState(false);
  const [loggedinuser] = useLoggedinuser();
  const username = user?.email?.split("@")[0];
  const [post, setpost] = useState([]);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const avatarList = Array.from({ length: 16 }, (_, i) => `/avatars/${i + 1}_final.svg`);
  const avatarRef = useRef();

  useEffect(() => {
    fetch(`http://localhost:5000/userpost?email=${user?.email}`)
      .then((res) => res.json())
      .then((data) => {
        setpost(data);
      });
  }, [user.email]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target)) {
        setShowAvatarPicker(false);
      }
    };
    if (showAvatarPicker) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAvatarPicker]);

  const handleuploadcoverimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post("https://api.imgbb.com/1/upload?key=daa2ac1a5d20ec3d601828e4bf73164e", formData)
      .then((res) => {
        const url = res.data.data.display_url;
        const usercoverimage = { email: user?.email, coverimage: url };
        setisloading(false);
        if (url) {
          fetch(`http://localhost:5000/userupdate/${user?.email}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(usercoverimage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
            });
        }
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };

  const handleAvatarSelect = (avatarUrl) => {
    setisloading(true);
    const userprofileimage = { email: user?.email, profileImage: avatarUrl };
    fetch(`http://localhost:5000/userupdate/${user?.email}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(userprofileimage),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Avatar updated", data);
        setisloading(false);
        setShowAvatarPicker(false);
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };

  const handleuploadprofileimage = (e) => {
    setisloading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);
    axios
      .post("https://api.imgbb.com/1/upload?key=daa2ac1a5d20ec3d601828e4bf73164e", formData)
      .then((res) => {
        const url = res.data.data.display_url;
        const userprofileimage = { email: user?.email, profileImage: url };
        if (url) {
          fetch(`http://localhost:5000/userupdate/${user?.email}`, {
            method: "PATCH",
            headers: { "content-type": "application/json" },
            body: JSON.stringify(userprofileimage),
          })
            .then((res) => res.json())
            .then((data) => {
              console.log("done", data);
              setisloading(false);
              setShowAvatarPicker(false);
            });
        }
      })
      .catch((e) => {
        console.log(e);
        window.alert(e);
        setisloading(false);
      });
  };

  return (
    <div>
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate("/")} />
      <h4 className="heading-4">{username}</h4>
      <div className="mainprofile">
        <div className="profile-bio">
          <div>
            <div className="coverImageContainer">
              <img
                src={loggedinuser[0]?.coverimage || user?.photoURL}
                alt=""
                className="coverImage"
              />
              <div className="hoverCoverImage">
                <div className="imageIcon_tweetButton">
                  <label htmlFor="image" className="imageIcon">
                    {isloading ? (
                      <LockResetIcon className="photoIcon photoIconDisabled" />
                    ) : (
                      <CenterFocusWeakIcon className="photoIcon" />
                    )}
                  </label>
                  <input
                    type="file"
                    id="image"
                    className="imageInput"
                    onChange={handleuploadcoverimage}
                  />
                </div>
              </div>
            </div>

            <div className="avatar-img">
              <div className="avatarContainer" ref={avatarRef}>
                {isloading ? (
                  <div className="spinner" />
                ) : (
                  <img
                    src={loggedinuser[0]?.profileImage || user?.photoURL}
                    alt=""
                    className="avatar"
                    onClick={() => setShowAvatarPicker(true)}
                    style={{ cursor: "pointer" }}
                  />
                )}

                {showAvatarPicker && (
                  <div className="avatarPickerModal">
                    <label htmlFor="uploadAvatar" className="upload-label">
                      Upload from device:
                    </label>
                    <input
                      type="file"
                      id="uploadAvatar"
                      accept="image/*"
                      style={{ display: "block", marginTop: "8px" }}
                      onChange={handleuploadprofileimage}
                    />
                    <p className="avatarPickerTitle">Or select an avatar from here:</p>
                    <div className="avatarGrid">
                      {avatarList.map((avatar, index) => (
                        <img
                          key={index}
                          src={avatar}
                          alt={`avatar${index + 1}`}
                          className="avatarOption"
                          onClick={() => handleAvatarSelect(avatar)}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="userInfo">
                <div>
                  <h3 className="heading-3">
                    {loggedinuser[0]?.name || user?.displayname}
                  </h3>
                  <p className="usernameSection">@{username}</p>
                </div>
                <Editprofile user={user} loggedinuser={loggedinuser} />
              </div>

              <div className="infoContainer">
                {loggedinuser[0]?.bio && <p>{loggedinuser[0].bio}</p>}
                <div className="locationAndLink">
                  {loggedinuser[0]?.location && (
                    <p className="suvInfo">
                      <MyLocationIcon /> {loggedinuser[0].location}
                    </p>
                  )}
                  {loggedinuser[0]?.website && (
                    <p className="subInfo link">
                      <AddLinkIcon /> {loggedinuser[0].website}
                    </p>
                  )}
                </div>
              </div>
              <h4 className="tweetsText">Tweets</h4>
              <hr />
            </div>
            {post.map((p) => (
              <Post p={p} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Mainprofile;
