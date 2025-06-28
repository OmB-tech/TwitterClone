import { useEffect, useState } from "react";
import { useUserAuth } from "../context/UserAuthContext";

const useLoggedinuser = () => {
  const { user } = useUserAuth();
  const [loggedinuser, setLoggedinuser] = useState([]);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const fetchLoggedInUser = async () => {
      try {
        const res = await fetch(`http://localhost:5000/loggedinuser?email=${user?.email}`);
        const data = await res.json();
        setLoggedinuser(data);
      } catch (err) {
        console.error("Failed to load user", err);
      } finally {
        setLoadingUser(false);
      }
    };

    if (user?.email) {
      fetchLoggedInUser();
    }
  }, [user?.email]);

  return [loggedinuser, loadingUser];
};

export default useLoggedinuser;
