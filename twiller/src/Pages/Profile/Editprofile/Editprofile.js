import React, { useState } from "react";
import { Box, Modal, IconButton, TextField } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import "./Editprofile.css";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  height: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  borderRadius: 8,
};

function Editchild({ dob, setdob }) {
  const [open, setopen] = useState(false);

  return (
    <>
      <div className="birthdate-section" onClick={() => setopen(true)}>
        <span>Edit</span>
      </div>
      <Modal
        hideBackdrop
        open={open}
        onClose={() => setopen(false)}
        aria-labelledby="child-modal-title"
        aria-describedby="child-modal-description"
      >
        <Box sx={{ ...style, width: 300, height: 300 }}>
          <div className="text">
            <h2>Edit date of birth</h2>
            <p>
              This can only be changed a few times. <br />
              Make sure you enter the age of the <br />
              person using the account.
            </p>
            <input
              type="date"
              value={dob}
              onChange={(e) => setdob(e.target.value)}
            />
            <button className="e-button" onClick={() => setopen(false)}>
              Cancel
            </button>
          </div>
        </Box>
      </Modal>
    </>
  );
}

const Editprofile = ({ user, loggedinuser }) => {
  const currentUser = loggedinuser?.[0];

  const [name, setname] = useState(currentUser?.name || "");
  const [bio, setbio] = useState(currentUser?.bio || "");
  const [location, setlocation] = useState(currentUser?.location || "");
  const [website, setwebsite] = useState(currentUser?.website || "");
  const [dob, setdob] = useState(currentUser?.dob || "");
  const [open, setopen] = useState(false);

  const handlesave = () => {
    const editinfo = { name, bio, location, website, dob };
    fetch(`http://localhost:5000/userupdate/${user?.email}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(editinfo),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("✅ Profile updated:", data);
        setopen(false);
      });
  };

  if (!currentUser) return null; // prevent crash if data not ready

  return (
    <>
      <button onClick={() => setopen(true)} className="edit-profile-btn">
        Edit profile
      </button>
      <Modal open={open}>
        <Box style={style} className="modal">
          <div className="header">
            <IconButton onClick={() => setopen(false)}>
              <CloseIcon />
            </IconButton>
            <h2 className="header-title">Edit Profile</h2>
            <button className="save-btn" onClick={handlesave}>
              Save
            </button>
          </div>

          <form className="fill-content">
            <TextField
              className="text-field"
              fullWidth
              label="Name"
              variant="filled"
              onChange={(e) => setname(e.target.value)}
              value={name}
            />
            <TextField
              className="text-field"
              fullWidth
              label="Bio"
              variant="filled"
              onChange={(e) => setbio(e.target.value)}
              value={bio}
            />
            <TextField
              className="text-field"
              fullWidth
              label="Location"
              variant="filled"
              onChange={(e) => setlocation(e.target.value)}
              value={location}
            />
            <TextField
              className="text-field"
              fullWidth
              label="Website"
              variant="filled"
              onChange={(e) => setwebsite(e.target.value)}
              value={website}
            />
          </form>

          <div className="birthdate-section">
            <p>Birth Date</p>
            <p>.</p>
            <Editchild dob={dob} setdob={setdob} />
          </div>

          <div className="last-section">
            <h2>{dob || "Add your date of birth"}</h2>
            <div className="last-btn">
              <h2>Switch to Professional</h2>
              <ChevronRightIcon />
            </div>
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default Editprofile;
