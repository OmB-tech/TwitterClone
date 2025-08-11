import { useState } from "react";
import "./Posts.css";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublishIcon from '@mui/icons-material/Publish';
import VideoPlayer from "../../../components/VideoPlayer/VideoPlayer";
import CommentSection from "../../../components/CommentSection/CommentSection";
import useLoggedinuser from "../../../hooks/useLoggedinuser";

const Posts = ({ p, onPostUpdate, onPlayNext }) => {
  const { name, username, photo, post, profilephoto, comments } = p;
  const isVideo = photo && (photo.includes('.mp4') || photo.endsWith('.webm') || photo.endsWith('.ogg'));
  const [showComments, setShowComments] = useState(false);
  const [loggedinuser] = useLoggedinuser();

  return (
    <div className="post">
      <div className="post__avatar"><Avatar src={profilephoto} /></div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3>
              <Link to={`/home/profile/${username}`} className="profile-link">{name}</Link>
              <span className="post__headerSpecial"> @<Link to={`/home/profile/${username}`} className="profile-link">{username}</Link></span>
            </h3>
          </div>
          <div className="post__headerDescription"><p>{post}</p></div>
        </div>
        
        {isVideo ? (
          <VideoPlayer 
            src={photo} 
            onNextVideo={onPlayNext} // This prop now triggers the scroll logic
            onShowComments={() => setShowComments(prev => !prev)}
          />
        ) : (
          photo && <img src={photo} alt="" className="post__image" />
        )}

        <div className="post__footer">
          <ChatBubbleOutlineIcon className="post__footer__icon" fontSize="small" onClick={() => setShowComments(prev => !prev)} />
          <RepeatIcon className="post__footer__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__footer__icon" fontSize="small" />
          <PublishIcon className="post__footer__icon" fontSize="small" />
        </div>
        
        {showComments && (
          <CommentSection postId={p._id} comments={comments || []} loggedinuser={loggedinuser} onCommentPosted={onPostUpdate} />
        )}
      </div>
    </div>
  );
};

export default Posts;
