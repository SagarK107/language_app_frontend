"use client";

import {
  Button,
  Card,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { ApiError, getLesson, LessonDetail } from "@/lib/api";

type LessonState =
  | { status: "loading" }
  | { status: "ready"; lesson: LessonDetail }
  | { status: "not-found" }
  | { status: "error" };

export default function LessonPage(props: { lessonId: number }) {
  const { lessonId } = props;
  const [state, setState] = useState<LessonState>({ status: "loading" });

  useEffect(() => {
    async function loadLesson() {
      setState({ status: "loading" });
      try {
        const lesson = await getLesson(lessonId);
        setState({ status: "ready", lesson });
      } catch (error) {
        // The id looked valid, but only the backend knows whether the lesson exists.
        if (error instanceof ApiError && error.status === 404) {
          setState({ status: "not-found" });
        } else {
          setState({ status: "error" });
        }
      }
    }

    loadLesson();
  }, [lessonId]);

  if (state.status === "loading") {
    return (
      <Center py="16">
        <Spinner />
      </Center>
    );
  }

  if (state.status === "not-found") {
    return (
      <Center py="16">
        <Stack align="center" gap="4">
          <Text>This lesson doesn&apos;t exist.</Text>
          <Button asChild variant="outline">
            <Link href="/">Back to lessons</Link>
          </Button>
        </Stack>
      </Center>
    );
  }

  if (state.status === "error") {
    return (
      <Center py="16">
        <Text color="red.500">Couldn&apos;t load the lesson. Please refresh the page.</Text>
      </Center>
    );
  }

  const { lesson } = state;

  return (
    <Container maxW="5xl" py="8">
      <Button asChild variant="ghost" size="sm" mb="4">
        <Link href="/">← Back to lessons</Link>
      </Button>

      <Heading>
        Lesson {lesson.order}: {lesson.title}
      </Heading>

      {lesson.grammar_note && <Text mt="2">{lesson.grammar_note}</Text>}

      {/* A plain list for now; step 11 turns this into the teach and quiz phases. */}
      <SimpleGrid columns={{ base: 2, md: 4 }} gap="4" mt="6">
        {lesson.items.map((item) => (
          <Card.Root key={item.id}>
            <Card.Body alignItems="center" gap="1">
              <Text fontSize="3xl">{item.text}</Text>
              <Text color="fg.muted">{item.transliteration}</Text>
              {item.meaning && <Text>{item.meaning}</Text>}
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Container>
  );
}
