"use client";

import { Button, Card, Field, Input, Text, VStack } from "@chakra-ui/react";
import { useState } from "react";
import { PasswordInput } from "./password-input";
import { ApiError, FieldErrors, signup } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [repeatedPassword, setRepeatedPassword] = useState("");
  const [email, setEmail] = useState("");
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const router = useRouter();

  async function signUp(event: React.SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    if (password !== repeatedPassword) {
      return;
    }
    try {
      await signup(username, email, password);
      router.replace("/");
    } catch (err) {
      if (err instanceof ApiError && err.status === 400) {
        setFieldErrors(err.body as FieldErrors);
      } else {
        setFieldErrors({ non_field_errors: ["Unknown error occured"] });
      }
    }
  }
  return (
    <Card.Root>
      <Card.Header>
         <Card.Title>Sign up</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={signUp}>
          <VStack>
            <Field.Root invalid={!!fieldErrors.username} required>
              <Field.Label>
                <Field.RequiredIndicator />
                Username
              </Field.Label>

              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />

              <Field.HelperText />
              <Field.ErrorText>{fieldErrors.username?.[0]}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!fieldErrors.email} required>
              <Field.Label>
                <Field.RequiredIndicator />
                Email
              </Field.Label>

              <Input value={email} onChange={(e) => setEmail(e.target.value)} />

              <Field.HelperText />
              <Field.ErrorText>{fieldErrors.email?.[0]}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={!!fieldErrors.password} required>
              <Field.Label>
                <Field.RequiredIndicator />
                Password
              </Field.Label>

              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              <Field.HelperText />
              <Field.ErrorText>{fieldErrors.password?.[0]}</Field.ErrorText>
            </Field.Root>
            <Field.Root invalid={password !== repeatedPassword} required>
              <Field.Label>
                <Field.RequiredIndicator />
                Repeat Password
              </Field.Label>

              <PasswordInput
                value={repeatedPassword}
                onChange={(e) => setRepeatedPassword(e.target.value)}
              />

              <Field.HelperText />
              <Field.ErrorText>Passwords Must Match</Field.ErrorText>
            </Field.Root>
            <Text color="red.500">
              {fieldErrors["non_field_errors"]?.[0] ?? ""}
            </Text>
            <Button type="submit">Sign Up</Button>
          </VStack>
          
        </form>
      </Card.Body>
    </Card.Root>
  );
}
