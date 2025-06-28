
import "./Posts.css";
import { Avatar } from "@mui/material";
import { Link } from "react-router-dom";
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import RepeatIcon from '@mui/icons-material/Repeat';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import PublishIcon from '@mui/icons-material/Publish';

const Posts = ({ p }) => {
  const { name, username, photo, post, profilephoto, email } = p;
  
  return (
    <div className="post">
      <div className="post__avatar">
        <Avatar src={profilephoto} />
      </div>
      <div className="post__body">
        <div className="post__header">
          <div className="post__headerText">
            <h3>
              <Link to={`/home/profile/${username}`}>{name}</Link>
              <span className="post__headerSpecial">
                @<Link to={`/home/profile/${username}`}>{username}</Link>
              </span> 
            </h3>
          </div>
          <div className="post__headerDescription">
            <p>{post}</p>
          </div>
        </div>
        {photo && <img src={photo} alt="" width="500" />}
        <div className="post__footer">
          <ChatBubbleOutlineIcon
            className="post__fotter__icon"
            fontSize="small"
          />
          <RepeatIcon className="post__fotter__icon" fontSize="small" />
          <FavoriteBorderIcon className="post__fotter__icon" fontSize="small" />
          <PublishIcon className="post__fotter__icon" fontSize="small" />
        
        </div>
      </div>
    </div>
  );
};

export default Posts;
