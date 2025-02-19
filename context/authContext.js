import { createContext, useState, useEffect, useContext } from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { auth } from "../firebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

export const AuthContext = createContext();

export const AuthContextProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [inApp, setInApp] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(undefined);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setIsAuthenticated(true);
        setUser(currentUser);
        updateUserData(currentUser.uid); // Call with the correct `uid`
      } else {
        setIsAuthenticated(false);
        setUser(null);
      }
    });
    return unsub;
  }, []);

  const updateUserData = async (userId) => {
    try {
      const docRef = doc(db, "users", userId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        // Use setUser safely with the previous user state
        setUser((prevUser) => ({
          ...prevUser,
          username: data.username,
          profileUrl: data.profileUrl,
          userId: userId,
        }));
      }
    } catch (e) {
      console.error("Error updating user data:", e);
    }
  };

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
      if (msg.includes("auth/user-not-found")) {
        msg = "No user found with these credentials.";
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
      setIsAuthenticated(false);
      setUser(null);
      return { success: true };
    } catch (e) {
      return { success: false, msg: e.message };
    }
  };

  const register = async (email, password, username, profileUrl) => {
    try {
      const response = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await setDoc(doc(db, "users", response?.user?.uid), {
        username,
        profileUrl,
        userId: response?.user?.uid,
      });

      setUser(response.user);
      setIsAuthenticated(true);

      return { success: true, data: response?.user };
    } catch (e) {
      let msg = e.message;

      if (msg.includes("auth/invalid-email")) {
        msg = "Invalid email address!";
      }

      if (msg.includes("auth/email-already-in-use")) {
        msg = "This email is already in use!";
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
