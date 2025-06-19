import React from "react";
import "../pages.css";
import Mainprofile from "./Mainprofile/Mainprofile";
import { useUserAuth } from "../../context/UserAuthContext";
const Profile = () => {
    const { user } = useUserAuth();

  return (
    <div className="profilePage">
      <Mainprofile user={user} />
    </div>
  );
};

export default Profile;
