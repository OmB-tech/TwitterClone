import { useState } from "react";
import TwitterIcon from "@mui/icons-material/Twitter";
import HomeIcon from "@mui/icons-material/Home";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneIcon from "@mui/icons-material/NotificationsNone";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import BookmarkBorderIcon from "@mui/icons-material/BookmarkBorder";
import ListAltIcon from "@mui/icons-material/ListAlt";
import PermIdentityIcon from "@mui/icons-material/PermIdentity";
import MoreIcon from "@mui/icons-material/More";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Divider from "@mui/material/Divider";
import DoneIcon from "@mui/icons-material/Done";
import Button from "@mui/material/Button";
import ListItemIcon from "@mui/material/ListItemIcon";
import { Avatar } from "@mui/material";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import "./sidebar.css";
import Customlink from "./Customlink";
import Sidebaroption from "./Sidebaroption";
import { useNavigate } from "react-router-dom";
import useLoggedinuser from "../../hooks/useLoggedinuser";
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../../components/LanguageSwitcher/LanguageSwitcher';

const Sidebar = ({ handlelogout, user }) => {
  const { t } = useTranslation();
  const [anchorE1, setanchorE1] = useState(null);
  const openmenu = Boolean(anchorE1);
  const [loggedinuser, loadingUser] = useLoggedinuser();
  const navigate = useNavigate();
  const [languageModalOpen, setLanguageModalOpen] = useState(false);

  const handleclick = (e) => {
    setanchorE1(e.currentTarget);
  };
  const handleclose = () => {
    setanchorE1(null);
  };
  const result = user?.email?.split("@")[0];
  const userData = loggedinuser[0];

  return (
    <div className="sidebar">
      <TwitterIcon className="sidebar__twitterIcon" />
      <Customlink to="/home/feed"><Sidebaroption active Icon={HomeIcon} text={t('home')} /></Customlink>
      <Customlink to="/home/explore"><Sidebaroption Icon={SearchIcon} text={t('explore')} /></Customlink>
      <Customlink to="/home/notification"><Sidebaroption Icon={NotificationsNoneIcon} text={t('notifications')} /></Customlink>
      <Customlink to="/home/messages"><Sidebaroption Icon={MailOutlineIcon} text={t('messages')} /></Customlink>
      <Customlink to="/home/bookmarks"><Sidebaroption Icon={BookmarkBorderIcon} text="Bookmarks" /></Customlink>
      <Customlink to="/home/lists"><Sidebaroption Icon={ListAltIcon} text="Lists" /></Customlink>
      <Customlink to="/home/profile"><Sidebaroption Icon={PermIdentityIcon} text="Profile" /></Customlink>
      <Customlink to="/home/more"><Sidebaroption Icon={MoreIcon} text="More" /></Customlink>
      <Button variant="outlined" className="sidebar__tweet" fullWidth>{t('tweet')}</Button>

      <div className="Profile__info">
        <Avatar src={userData?.profileImage || (user && user.photoURL)} />
        <div className="user__info">
          <h4>{loadingUser ? "Loading..." : (userData?.name || (user && user.displayName))}</h4>
          <h5>@{result}</h5>
        </div>
        <IconButton
          size="small" sx={{ ml: 2 }}
          aria-controls={openmenu ? "basic-menu" : undefined}
          aria-haspopup="true" aria-expanded={openmenu ? "true" : undefined}
          onClick={handleclick}
        >
          <MoreHorizIcon />
        </IconButton>
        <Menu
          id="basic-menu" anchorEl={anchorE1} open={openmenu} onClose={handleclose}
          MenuListProps={{ 'aria-labelledby': 'basic-button' }}
        >
          <MenuItem className="Profile__info1" onClick={() => navigate("/home/profile")} disabled={loadingUser || !userData}>
            <Avatar src={userData?.profileImage || (user && user.photoURL)} />
            <div className="user__info subUser__info">
              <div>
                <h4>{userData?.name || (user && user.displayName)}</h4>
                <h5>@{result}</h5>
              </div>
              <ListItemIcon className="done__icon" color="blue"><DoneIcon /></ListItemIcon>
            </div>
          </MenuItem>
          <Divider />
          <MenuItem onClick={handleclose}>Add an existing account</MenuItem>
          <MenuItem onClick={() => { setLanguageModalOpen(true); handleclose(); }}>
            Switch Language
          </MenuItem>
          <MenuItem onClick={handlelogout}>Log out @{result}</MenuItem>
        </Menu>
      </div>

      {languageModalOpen && (
        <LanguageSwitcher
          user={user}
          loggedinuser={loggedinuser}
          onClose={() => setLanguageModalOpen(false)}
        />
      )}

    </div>
  );
};

export default Sidebar;
