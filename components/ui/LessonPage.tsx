"use client";

import {
  Box,
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

import QuizView from "./QuizView";

type LessonState =
  | { status: "loading" }
  | { status: "ready"; lesson: LessonDetail }
  | { status: "not-found" }
  | { status: "error" };

// What the user is doing once the lesson has loaded.
//   teach: look at the item cards
//   quiz:  answer questions (QuizView also shows the summary at the end)
type Phase = "teach" | "quiz";

export default function LessonPage(props: { lessonId: number }) {
  const { lessonId } = props;
  const [state, setState] = useState<LessonState>({ status: "loading" });
  // Kept apart from `state`: the phase only matters once the lesson is ready,
  // and reloading the lesson should not have to know about the quiz.
  const [phase, setPhase] = useState<Phase>("teach");
  // Bumped by "Try again". Used as QuizView's key, so each attempt mounts a
  // brand-new QuizView with fresh questions, score and position.
  const [attempt, setAttempt] = useState(0);

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

      {phase === "teach" && (
        <>
          {lesson.grammar_note && <Text mt="2">{lesson.grammar_note}</Text>}

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

          <Button size="lg" mt="8" onClick={() => setPhase("quiz")}>
            Start quiz
          </Button>
        </>
      )}

      {phase === "quiz" && (
        <Box mt="6">
          <QuizView
            key={attempt}
            lessonId={lesson.id}
            onRetry={() => setAttempt((current) => current + 1)}
            onExit={() => setPhase("teach")}
          />
        </Box>
      )}
    </Container>
  );
}
