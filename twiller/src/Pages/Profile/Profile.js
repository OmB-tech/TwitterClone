import React from "react";
import Mainprofile from "./Mainprofile/Mainprofile";
import useLoggedinuser from "../../hooks/useLoggedinuser";

const Profile = () => {
  const [loggedinuser, loadingUser] = useLoggedinuser();

  if (loadingUser) {
    return <p>Loading profile...</p>;
  }

  return (
    <div className="profilePage">
      <Mainprofile user={loggedinuser[0]} />
    </div>
  );
};

export default Profile;