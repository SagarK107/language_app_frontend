"use client";
import { ApiError, me, User } from "@/lib/api";
import { AuthState } from "@/lib/types";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { createContext, useCallback, useContext, useEffect, useState } from "react";

type authContextValue = {
  user : User,
  refreshUser : () => Promise<void>
}
const AuthContext = createContext<authContextValue | null>(null);

export function useUser() {
  const userContext = useContext(AuthContext);
  if (!userContext) {
    throw new Error("useUser must be used inside <AuthProvider>");
  }

  return userContext.user;
}

export function useRefreshUser() {
  const userContext = useContext(AuthContext);
  if (!userContext) {
    throw new Error("useRefreshUserUser must be used inside <AuthProvider>");
  }

  return userContext.refreshUser;
}



export default function AuthProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const router = useRouter();
  const { children } = props;

  const refreshUser = useCallback(async () => {
    const user = await me();
    setState({ status: "authenticated", user: user });
  },[])

  useEffect(() => {
    async function getMe() {
      try {
       await refreshUser()
      } catch (error) {
        if (error instanceof ApiError && error.status === 403) {
          router.replace("/login");
        } else {
          setState({
            status: "error",
            message: "Something went wrong, please try again",
          });
        }
      }
    }

    getMe();
  }, [router,refreshUser]);

  if (state.status === "loading") {
    return (
      <Center>
        <Spinner />
      </Center>
    );
  } else if (state.status === "error") {
    return (
      <Center>
        <Text color="red.500">{state.message}</Text>
      </Center>
    );
  } else {
    return <AuthContext value={{user : state.user, refreshUser}}>{children}</AuthContext>;
  }
}
