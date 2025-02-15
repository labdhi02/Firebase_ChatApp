import { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig"; // Ensure `db` is imported

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [inApp, setInApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setIsAuthenticated(true);
        setUser(user);
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    try {
      const response = await signInWithEmailAndPassword(auth, email, password);
      setIsAuthenticated(true);
      setUser(response.user);
      return { success: true };
    } catch (e) {
      let msg = e.message;
  
      if (msg.includes("auth/invalid-email")) {
        msg = "Invalid email address!";
      }
      if (msg.includes("auth/invalid-credentials")) {
        msg = "No user found with this credentials";
      }
      if (msg.includes("auth/wrong-password")) {
        msg = "Incorrect password!";
      }
  
      return { success: false, msg };
    }
  };
  
  const logout = async () => {
    try {
      await signOut(auth);
      return { success: true };
    } catch {
      return { success: false, msg: e.message, error: e };
    }
  };

  const register = async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("response.user", response.user);

      // setUser(response.user);
      // setIsAuthenticated(true);

      await setDoc(doc(db, "users", response?.user?.uid), {
        username,
        profileUrl,
        userId: response?.user?.uid,
      });
      return { success: true, data: response?.user };
    } catch (e) {
      let msg = e.message;
      if (msg.includes("auth/invalid-email")) {
        msg = "Invalid email address!";
      }

      if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already in use !";
      }

      if (msg.includes("auth/weak-password")) {
        msg = "Password should be at least 6 characters!";
      }

      return { success: false, msg };
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, logout, register }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within a AuthContextProvider");
  }
  return value;
};
