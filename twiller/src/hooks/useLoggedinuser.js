import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedinuser = () => {
  const { user } = useUserAuth();
  const [loggedinuser, setLoggedinuser] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      if (!user?.uid) {
        setLoadingUser(false);
        return;
      }
      setLoadingUser(true);
      try {
        const res = await fetch(`http://localhost:5000/loggedinuser?uid=${user.uid}`);
        const data = await res.json();
        setLoggedinuser(data);
      } catch (err) {
        console.error("[useLoggedinuser] Fetch FAILED. Error:", err);
        setLoggedinuser([]);
      } finally {
        setLoadingUser(false);
      }
    };

    fetchLoggedInUser();
  }, [user?.uid]);

  return [loggedinuser, loadingUser];
};

export default useLoggedinuser;