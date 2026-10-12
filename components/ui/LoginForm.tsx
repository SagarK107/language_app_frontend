"use client";

import { useState } from "react";
import { Button, Card, Field, Input, Text, VStack } from "@chakra-ui/react";
import { PasswordInput } from "@/components/ui/password-input";
import { useRouter } from "next/navigation";
import { ApiError, login } from "@/lib/api";

export default function LoginForm() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  async function sendLoginDetails(event: React.SubmitEvent<HTMLFormElement>) {
    // Stop the browser's default form submit, which would reload the page.
    event.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      await login(username, password);
      router.replace("/")
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setError("Username or password incorrect. Try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setSubmitting(false);
    }


  }

  function routeToSignup() {
    router.replace("/signup")
  }

  return (
    <Card.Root width="sm">
      <Card.Header>
        <Card.Title>Log in</Card.Title>
      </Card.Header>
      <Card.Body>
        <form onSubmit={sendLoginDetails}>
          <VStack gap="4" align="stretch">
            <Field.Root required>
              <Field.Label>
                Username or email
                <Field.RequiredIndicator />
              </Field.Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </Field.Root>

            <Field.Root required>
              <Field.Label>
                Password
                <Field.RequiredIndicator />
              </Field.Label>
              <PasswordInput
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Field.Root>

            {error && <Text color="red.500">{error}</Text>}

            <Button type="submit" loading={submitting}>
              Log in
            </Button>
          </VStack>
          Dont Have an account? <Button variant="plain" onClick={routeToSignup}>Sign Up</Button>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
