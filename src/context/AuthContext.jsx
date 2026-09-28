import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const DEMO_ACCOUNT = {
  email: "admin@sotreg.ma",
  password: "Sotreg2026!",
  name: "Responsable SOTREG",
  role: "Responsable transport",
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("sotreg_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        "sotreg_user",
        JSON.stringify(user)
      );
    } else {
      localStorage.removeItem("sotreg_user");
    }
  }, [user]);

  function login(email, password) {
    const validEmail =
      email.trim().toLowerCase() ===
      DEMO_ACCOUNT.email.toLowerCase();

    const validPassword =
      password === DEMO_ACCOUNT.password;

    if (!validEmail || !validPassword) {
      return {
        success: false,
        message: "Email ou mot de passe incorrect.",
      };
    }

    const connectedUser = {
      email: DEMO_ACCOUNT.email,
      name: DEMO_ACCOUNT.name,
      role: DEMO_ACCOUNT.role,
    };

    setUser(connectedUser);

    return {
      success: true,
      user: connectedUser,
    };
  }

  function logout() {
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth doit être utilisé dans AuthProvider"
    );
  }

  return context;
}