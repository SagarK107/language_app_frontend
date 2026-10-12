"use client";
import { ApiError, me, User } from "@/lib/api";
import { AuthState } from "@/lib/types";
import { Center, Spinner, Text } from "@chakra-ui/react";
import { useRouter } from "next/navigation";

import { createContext, useContext, useEffect, useState } from "react";

export const AuthContext = createContext<User | null>(null);

export function useUser() {
  const user = useContext(AuthContext);
  if (!user) {
    throw new Error("useUser must be inside");
  }

  return user;
}

export default function AuthProvider(props: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({ status: "loading" });
  const router = useRouter();
  const { children } = props;

  useEffect(() => {
    async function getMe() {
      try {
        const user = await me();
        setState({ status: "authenticated", user: user });
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
  }, [router]);

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
    return <AuthContext value={state.user}>{children}</AuthContext>;
  }
}
