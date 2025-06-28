import React, { useEffect, useState } from "react";
import Mainprofile from "./Mainprofile/Mainprofile";
import { useParams } from "react-router-dom";
import { useUserAuth } from "../../context/UserAuthContext";

const Profile = () => {
  const { email } = useParams();
  const { user: loggedInUser } = useUserAuth();
  const [viewUser, setViewUser] = useState(null);

  useEffect(() => {
    const targetEmail = email || loggedInUser?.email;

    if (!targetEmail) return;

    fetch(`http://localhost:5000/loggedinuser?email=${targetEmail}`)
      .then((res) => res.json())
      .then((data) => setViewUser(data[0]))
      .catch((err) => console.error("Failed to load user", err));
  }, [email, loggedInUser]);

  if (!viewUser) return <p>Loading profile...</p>;

  return (
    <div className="profilePage">
      <Mainprofile user={viewUser} />
    </div>
  );
};

export default Profile;
