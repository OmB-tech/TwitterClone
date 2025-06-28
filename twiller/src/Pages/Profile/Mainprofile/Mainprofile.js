import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Editprofile from "../Editprofile/Editprofile";
import FollowButton from "./FollowButton";
import axios from "axios";
import useLoggedinuser from "../../../hooks/useLoggedinuser";
import { useUserAuth } from "../../../context/UserAuthContext";
import "./Mainprofile.css";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CenterFocusWeakIcon from "@mui/icons-material/CenterFocusWeak";
import LockResetIcon from "@mui/icons-material/LockReset";
import Post from "../Posts/posts"
const Mainprofile = () => {
  const { username: routeUsername } = useParams();
  const navigate = useNavigate();
  const { user } = useUserAuth();
  const [loggedinuser] = useLoggedinuser();
  const [profileUser, setProfileUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const avatarList = Array.from({ length: 16 }, (_, i) => `/avatars/${i + 1}_final.svg`);
  const avatarRef = useRef();

  const username = routeUsername || loggedinuser[0]?.username;

  const isOwnProfile = loggedinuser[0]?.email === profileUser?.email;

  useEffect(() => {
    if (!username) return;

    const fetchUserAndPosts = async () => {
      setLoading(true);
      try {
        const userRes = await fetch(`http://localhost:5000/users?username=${username}`);
        const userData = await userRes.json();

        if (!userData || userData.length === 0) {
          setProfileUser(null);
          return;
        }

        const u = userData[0];
        setProfileUser(u);

        const postsRes = await fetch(`http://localhost:5000/userpost?email=${u.email}`);
        const postsData = await postsRes.json();
        postsData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setPosts(postsData);
      } catch (err) {
        console.error("Error fetching user/posts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserAndPosts();
  }, [username]);

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

  const handleUploadImage = (e, type) => {
    setIsLoading(true);
    const image = e.target.files[0];
    const formData = new FormData();
    formData.set("image", image);

    axios
      .post("https://api.imgbb.com/1/upload?key=daa2ac1a5d20ec3d601828e4bf73164e", formData)
      .then((res) => {
        const url = res.data.data.display_url;
        const payload = type === "cover"
          ? { email: profileUser.email, coverImage: url }
          : { email: profileUser.email, profileImage: url };

        fetch(`http://localhost:5000/userupdate/${profileUser.email}`, {
          method: "PATCH",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        })
          .then((res) => res.json())
          .then((data) => {
            setProfileUser((prev) => ({
              ...prev,
              ...(type === "cover" ? { coverImage: url } : { profileImage: url }),
            }));
            setShowAvatarPicker(false);
            setIsLoading(false);
          });
      })
      .catch((err) => {
        console.error(err);
        window.alert("Image upload failed");
        setIsLoading(false);
      });
  };

  const handleAvatarSelect = (avatarUrl) => {
    setIsLoading(true);
    const payload = { email: profileUser.email, profileImage: avatarUrl };
    fetch(`http://localhost:5000/userupdate/${profileUser.email}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        setProfileUser((prev) => ({
          ...prev,
          profileImage: avatarUrl,
        }));
        setShowAvatarPicker(false);
        setIsLoading(false);
      });
  };

  if (loading) return <div>Loading...</div>;
  if (!profileUser) return <div>User not found</div>;

  return (
    <div className="main-profile">
      <ArrowBackIcon className="arrow-icon" onClick={() => navigate(-1)} />
      <h4 className="heading-4">@{username}</h4>

      <div className="coverImageContainer">
        <img
          src={profileUser.coverImage || "https://i.ibb.co/6JV5vNdF/banner-full-blue-scratch-jpg-twimg-1280.jpg"}
          alt="cover"
          className="coverImage"
        />
        {isOwnProfile && (
          <div className="hoverCoverImage">
            <label htmlFor="cover-upload">
              {isLoading ? <LockResetIcon /> : <CenterFocusWeakIcon />}
            </label>
            <input
              type="file"
              id="cover-upload"
              style={{ display: "none" }}
              onChange={(e) => handleUploadImage(e, "cover")}
            />
          </div>
        )}
      </div>

      <div className="avatar-img">
        <div className="avatarContainer" ref={avatarRef}>
          {isLoading ? (
            <div className="spinner" />
          ) : (
            <img
              src={profileUser.profileImage || "https://i.ibb.co/HsC1vhf/e.png"}
              alt="avatar"
              className="avatar"
              onClick={() => isOwnProfile && setShowAvatarPicker(true)}
            />
          )}

          {showAvatarPicker && (
            <div className="avatarPickerModal">
              <label htmlFor="upload-avatar" className="upload-label">Upload from device:</label>
              <input
                type="file"
                id="upload-avatar"
                accept="image/*"
                style={{ display: "block", marginTop: "8px" }}
                onChange={(e) => handleUploadImage(e, "profile")}
              />
              <p>Or pick from avatars:</p>
              <div className="avatarGrid">
                {avatarList.map((avatar, i) => (
                  <img
                    key={i}
                    src={avatar}
                    alt={`avatar-${i}`}
                    className="avatarOption"
                    onClick={() => handleAvatarSelect(avatar)}
                  />
                ))}
              </div>
            </div>
          )}
          <div className="edit">
            {isOwnProfile ? (
              <Editprofile user={user} loggedinuser={[profileUser]} />
            ) : (
              <FollowButton
                profileUserEmail={profileUser.email}
                loggedInUserEmail={loggedinuser[0]?.email}
              />
            )}</div>
        </div>
      </div>
      <div className="userInfo">
        <h3>{profileUser.name}</h3>
        <div className="username-and-button">
          <p>@{profileUser.username}</p>
          <p>{profileUser.bio}</p>
        </div>
      </div>

      <div className="profile-stats">
        <span><strong>{profileUser.followers?.length || 0}</strong>   <span>Followers </span></span>
        <span><strong>{profileUser.following?.length || 0}</strong>   <span>Following </span></span>
      </div>

      <div className="posts-section">
        <h4>Tweets</h4>
        <hr />

        {posts.map((p) => (
          <Post key={p._id || p.id} p={p} />
        ))}

      </div>
    </div>
  );
};

export default Mainprofile;
