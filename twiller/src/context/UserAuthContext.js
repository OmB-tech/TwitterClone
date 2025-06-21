import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { auth } from "./firbase";

const userAuthContext = createContext();

export function UserAuthContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); 

  function logIn(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function signUp(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
  }

  function logOut() {
    return signOut(auth);
  }

  function googleSignIn() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log("Auth state changed:", currentUser);
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <userAuthContext.Provider value={{ user, logIn, signUp, logOut, googleSignIn }}>
      {!loading && children} 
    </userAuthContext.Provider>
  );
}

export function useUserAuth() {
  return useContext(userAuthContext);
}
