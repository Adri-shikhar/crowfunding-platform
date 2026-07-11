"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiReq, setToken, clearToken } from "@/lib/api";
import type { AppUser, Role } from "@/lib/types";

interface RegisterInput {
  name: string;
  email: string;
  password: string;
  role: Role;
  photoURL: string;
}

interface AuthContextValue {
  /** Firebase auth user (identity). */
  firebaseUser: User | null;
  /** App profile record (role, credits) from the API/mock backend. */
  dbUser: AppUser | null;
  /** True until Firebase reports the initial auth state — never redirect while true. */
  loading: boolean;
  role: Role | null;
  credits: number;
  register: (input: RegisterInput) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  logInWithGoogle: (role?: Role) => Promise<void>;
  logOut: () => Promise<void>;
  /** Re-fetch the profile record after a credit/role-changing action. */
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Captured by register()/logInWithGoogle() before the Firebase call so the
  // single hydrate path (onAuthStateChanged) can create the record with the
  // right role. Credits are granted only on first insert, so re-hydrating on
  // reload never re-grants.
  const pendingRole = useRef<Role | undefined>(undefined);
  const pendingProfile = useRef<{ name?: string; photoURL?: string }>({});

  const hydrate = useCallback(async (fbUser: User) => {
    const token = await fbUser.getIdToken();
    setToken(token); // the "secret access token" apiReq attaches as Bearer

    const { data } = await apiReq<AppUser>("/users/register", {
      method: "POST",
      body: {
        uid: fbUser.uid,
        email: fbUser.email,
        name: pendingProfile.current.name || fbUser.displayName || fbUser.email,
        photoURL: pendingProfile.current.photoURL || fbUser.photoURL || "",
        role: pendingRole.current || "supporter",
      },
      noRedirect: true,
    });
    setDbUser(data ?? null);
    pendingRole.current = undefined;
    pendingProfile.current = {};
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setFirebaseUser(currentUser);
      if (currentUser) {
        try {
          await hydrate(currentUser);
        } catch {
          setDbUser(null);
        }
      } else {
        setDbUser(null);
        clearToken();
      }
      setLoading(false);
    });
    return unsubscribe;
  }, [hydrate]);

  const register = useCallback(
    async (input: RegisterInput) => {
      pendingRole.current = input.role;
      pendingProfile.current = { name: input.name, photoURL: input.photoURL };
      const result = await createUserWithEmailAndPassword(
        auth,
        input.email,
        input.password,
      );
      await updateProfile(result.user, {
        displayName: input.name,
        photoURL: input.photoURL || undefined,
      });
      await hydrate(result.user);
    },
    [hydrate],
  );

  const logIn = useCallback(
    async (email: string, password: string) => {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await hydrate(result.user);
    },
    [hydrate],
  );

  const logInWithGoogle = useCallback(
    async (role?: Role) => {
      pendingRole.current = role;
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      await hydrate(result.user);
    },
    [hydrate],
  );

  const logOut = useCallback(async () => {
    await signOut(auth);
    clearToken();
    setDbUser(null);
  }, []);

  const refreshUser = useCallback(async () => {
    const email = firebaseUser?.email;
    if (!email) return;
    const { data } = await apiReq<AppUser | null>(
      `/users/me?email=${encodeURIComponent(email)}`,
      { noRedirect: true },
    );
    if (data) setDbUser(data);
  }, [firebaseUser]);

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        dbUser,
        loading,
        role: dbUser?.role ?? null,
        credits: dbUser?.credits ?? 0,
        register,
        logIn,
        logInWithGoogle,
        logOut,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
