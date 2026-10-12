import {  Center } from "@chakra-ui/react";

export default function AuthLayout(props: { children: React.ReactNode }) {
  const { children } = props;
  return (
    <Center minH="100vh"> { children }</Center>
     
  );
}
