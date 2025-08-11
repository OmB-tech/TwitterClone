import { useState, useEffect } from "react";
import { Box, Modal, IconButton, TextField, Button } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { toast } from "react-hot-toast";
import { auth, RecaptchaVerifier, signInWithPhoneNumber, PhoneAuthProvider, updatePhoneNumber } from "../../../context/firebase";
import "./Editprofile.css";

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 600,
  height: 600,
  bgcolor: 'background.paper',
  boxShadow: 24,
  borderRadius: 8,
};

function Editchild({ dob, setdob }) {
    // This component remains unchanged
    return (
        <div className="birthdate-section">
            <p>Birth Date</p>
            <p>.</p>
            <text onClick={() => setdob('')}>Edit</text>
        </div>
    )
}

const Editprofile = ({ user, loggedinuser }) => {
  const currentUser = loggedinuser?.[0];
  const [name, setname] = useState(currentUser?.name || "");
  const [bio, setbio] = useState(currentUser?.bio || "");
  const [location, setlocation] = useState(currentUser?.location || "");
  const [website, setwebsite] = useState(currentUser?.website || "");
  const [dob, setdob] = useState(currentUser?.dob || "");
  const [phoneNumber, setPhoneNumber] = useState(currentUser?.phoneNumber || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState('EDIT_DETAILS'); // EDIT_DETAILS or VERIFY_OTP
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [open, setopen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // This effect ensures the reCAPTCHA is ready but invisible
    // It should only run once when the modal is about to open
    if (open && !window.recaptchaVerifier) {
        window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', { 
            size: 'invisible',
            'callback': () => {}
        });
    }
  }, [open]);

  const handlePhoneVerification = async () => {
    if (!phoneNumber || !/^\+[1-9]\d{1,14}$/.test(phoneNumber)) {
      toast.error("Please enter a valid phone number with country code (e.g., +919876543210)");
      return;
    }
    setIsLoading(true);
    try {
      const confirmation = await signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
      setConfirmationResult(confirmation);
      setStep('VERIFY_OTP');
      toast.success("Verification code sent!");
    } catch (error) {
      console.error(error);
      toast.error(`Failed to send code: ${error.message}`);
    } finally {
        setIsLoading(false);
    }
  };

  const onOtpConfirm = async () => {
    setIsLoading(true);
    try {
      // First, confirm the OTP with Firebase
      await confirmationResult.confirm(otp);
      
      // If successful, update the user's main Firebase Auth record
      const credential = PhoneAuthProvider.credential(confirmationResult.verificationId, otp);
      await updatePhoneNumber(auth.currentUser, credential);
      
      // Then, save the now-verified phone number to our database
      await fetch(`https://twitterclone-1-uvwk.onrender.com/userupdate/${user?.email}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber: auth.currentUser.phoneNumber }),
      });

      toast.success("Phone number verified and updated!");
      setStep('EDIT_DETAILS'); // Go back to the main edit view
      // **THE FIX**: Force a reload to fetch the new user data everywhere
      window.location.reload(); 
    } catch (error) {
      console.error(error);
      toast.error("Invalid verification code or failed to update.");
    } finally {
        setIsLoading(false);
    }
  };

  const handlesave = () => {
    const editinfo = { name, bio, location, website, dob };
    fetch(`https://twitterclone-1-uvwk.onrender.com/userupdate/${user?.email}`, {
      method: "PATCH", headers: { "content-type": "application/json" },
      body: JSON.stringify(editinfo),
    })
      .then(res => res.json())
      .then(() => {
        toast.success("Profile updated successfully!");
        // **THE FIX**: Force a reload to ensure all components have fresh data
        window.location.reload();
      });
  };

  if (!currentUser) return null;

  return (
    <>
      <div id="recaptcha-container" style={{ position: 'absolute', bottom: 0, right: 0 }}></div>
      <button onClick={() => setopen(true)} className="edit-profile-btn">Edit profile</button>
      <Modal open={open} onClose={() => setopen(false)}>
        <Box sx={style} className="modal">
          <div className="header">
            <IconButton onClick={() => setopen(false)}><CloseIcon /></IconButton>
            <h2 className="header-title">Edit Profile</h2>
            <button className="save-btn" onClick={handlesave}>Save</button>
          </div>
          <div className="fill-content">
            {step === 'EDIT_DETAILS' && (
              <>
                <TextField className="text-field" fullWidth label="Name" variant="filled" onChange={(e) => setname(e.target.value)} defaultValue={name} />
                <TextField className="text-field" fullWidth label="Bio" variant="filled" onChange={(e) => setbio(e.target.value)} defaultValue={bio} />
                <TextField className="text-field" fullWidth label="Location" variant="filled" onChange={(e) => setlocation(e.target.value)} defaultValue={location} />
                <TextField className="text-field" fullWidth label="Website" variant="filled" onChange={(e) => setwebsite(e.target.value)} defaultValue={website} />
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '16px' }}>
                  <TextField fullWidth label="Phone Number" variant="filled" defaultValue={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} helperText="Include country code (e.g., +91)" />
                  <Button variant="contained" onClick={handlePhoneVerification} disabled={isLoading}>
                    {isLoading ? 'Sending...' : 'Verify'}
                  </Button>
                </div>
              </>
            )}
            {step === 'VERIFY_OTP' && (
              <div style={{ marginTop: '16px' }}>
                <p>Enter the 6-digit code sent to {phoneNumber}</p>
                <TextField fullWidth label="Verification Code" variant="filled" value={otp} onChange={(e) => setOtp(e.target.value)} />
                <Button variant="contained" onClick={onOtpConfirm} disabled={isLoading || otp.length < 6} sx={{mt: 2}}>
                  {isLoading ? 'Confirming...' : 'Confirm'}
                </Button>
              </div>
            )}
          </div>
          <div className="birthdate-section">
            <Editchild dob={dob} setdob={setdob} />
          </div>
        </Box>
      </Modal>
    </>
  );
};

export default Editprofile;
