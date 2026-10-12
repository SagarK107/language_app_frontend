'use client'
import { Box, Button, Flex,HStack,Spacer } from "@chakra-ui/react";
import React from "react";
import { useUser } from "../context/AuthProvider";
import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toaster } from "./toaster";

export default function TopBar() {
    const user = useUser()
    const router = useRouter();
    async function logoutUser() {
        try{
            await logout();
        router.replace("/login")
        }
        catch  {
            toaster.create({
                description: "Error logging out",
                type : "error"
            })
        }
    }

  return (
    <Flex align="center" px="6" as="header" h="14" borderBottomWidth="1px">
      <Box  >LanguageApp</Box>
      <Spacer />
      <HStack gap="4">
          <Box >Welcome, {user.username}</Box>
          <Button variant="ghost" onClick={logoutUser}>Logout</Button>
      </HStack>
    </Flex>
  );
}
