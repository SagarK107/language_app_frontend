import AuthProvider from "@/components/context/AuthProvider";
import TopBar from "@/components/ui/TopBar";
import React from "react";

export default function layout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <AuthProvider>
      <TopBar />
      {children}
    </AuthProvider>
  );
}
