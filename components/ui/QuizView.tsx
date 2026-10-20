"use client";

import {
  Button,
  Center,
  Heading,
  HStack,
  Progress,
  Spinner,
  Stack,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { ApiError, getQuestions, Question, submitAnswer } from "@/lib/api";

import QuestionCard, { AnswerStatus } from "./QuestionCard";
import { toaster } from "./toaster";

// Loading the question list. Same pattern as LessonState in LessonPage.
type QuestionsState =
  | { status: "loading" }
  | { status: "ready"; questions: Question[] }
  | { status: "error" };

type Props = {
  lessonId: number;
  // The parent remounts this component to start a new quiz (see LessonPage).
  onRetry: () => void;
  onExit: () => void;
};

/**
 * Runs one quiz from start to finish:
 *
 *   loading → question 1 → question 2 → ... → summary
 *
 * Every piece of state starts fresh when the component mounts, so "Try again"
 * does not reset anything by hand: the parent gives it a new `key` instead.
 */
export default function QuizView({ lessonId, onRetry, onExit }: Props) {
  const [questionsState, setQuestionsState] = useState<QuestionsState>({
    status: "loading",
  });
  // Which question is on screen. Equal to questions.length once the quiz is over.
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [answer, setAnswer] = useState<AnswerStatus>({ status: "unanswered" });
  // Set when the backend rejects the token (older than 24 hours).
  const [expired, setExpired] = useState(false);

  // 11b: fetch the questions once, when the quiz starts.
  useEffect(() => {
    // Ignore a reply that arrives after this component was unmounted.
    let cancelled = false;

    async function loadQuestions() {
      try {
        const questions = await getQuestions(lessonId);
        if (!cancelled) setQuestionsState({ status: "ready", questions });
      } catch {
        if (!cancelled) setQuestionsState({ status: "error" });
      }
    }

    loadQuestions();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  // 11c: send the clicked option to the backend and show the result.
  async function handleChoose(question: Question, choice: number) {
    // Lock the options straight away, before the reply arrives.
    setAnswer({ status: "checking", choice });

    try {
      const result = await submitAnswer(lessonId, question.token, choice);
      setAnswer({ status: "answered", choice, correctChoice: result.correct_choice });
      if (result.correct) {
        setScore((current) => current + 1);
      }
    } catch (error) {
      // 11e: a 400 here means the token was rejected, so these questions are
      // no longer usable. Anything else (network down, server error) may be
      // temporary, so unlock the options and let the user click again.
      if (error instanceof ApiError && error.status === 400) {
        setExpired(true);
      } else {
        setAnswer({ status: "unanswered" });
        toaster.create({
          description: "Couldn't check your answer. Please try again.",
          type: "error",
        });
      }
    }
  }

  function handleNext() {
    setIndex((current) => current + 1);
    setAnswer({ status: "unanswered" });
  }

  // ---- Everything below only decides what to show. ----

  if (questionsState.status === "loading") {
    return (
      <Center py="16">
        <Spinner />
      </Center>
    );
  }

  // 11e: the questions could not be loaded.
  if (questionsState.status === "error") {
    return (
      <QuizMessage
        text="Couldn't load the quiz."
        actionLabel="Try again"
        onAction={onRetry}
        onExit={onExit}
      />
    );
  }

  // 11e: the backend no longer accepts these questions.
  if (expired) {
    return (
      <QuizMessage
        text="This quiz has expired. Start a new one to continue."
        actionLabel="New quiz"
        onAction={onRetry}
        onExit={onExit}
      />
    );
  }

  const { questions } = questionsState;

  if (questions.length === 0) {
    return (
      <QuizMessage
        text="This lesson has no questions yet."
        onExit={onExit}
      />
    );
  }

  // 11d: past the last question → show the summary.
  if (index >= questions.length) {
    return (
      <Stack align="center" gap="4" py="8">
        <Heading size="2xl">
          {score} / {questions.length} correct
        </Heading>
        <Text color="fg.muted">{summaryMessage(score, questions.length)}</Text>
        <HStack>
          <Button onClick={onRetry}>Try again</Button>
          <Button variant="outline" onClick={onExit}>
            Back to lesson
          </Button>
        </HStack>
      </Stack>
    );
  }

  const question = questions[index];
  const isLast = index === questions.length - 1;

  return (
    <Stack gap="4">
      <HStack justify="space-between">
        <Text color="fg.muted">
          Question {index + 1} of {questions.length}
        </Text>
        <Button variant="ghost" size="sm" onClick={onExit}>
          Quit
        </Button>
      </HStack>

      {/* How far through the quiz the user is. */}
      <Progress.Root value={index} max={questions.length} size="sm">
        <Progress.Track>
          <Progress.Range />
        </Progress.Track>
      </Progress.Root>

      <QuestionCard
        // A new key per question makes React treat each question as a fresh
        // card instead of reusing the previous card's buttons.
        key={question.token}
        question={question}
        answer={answer}
        onChoose={(choice) => handleChoose(question, choice)}
      />

      {/* "Next" appears only once the answer has been checked. */}
      {answer.status === "answered" && (
        <Button alignSelf="flex-end" onClick={handleNext}>
          {isLast ? "See results" : "Next"}
        </Button>
      )}
    </Stack>
  );
}

function summaryMessage(score: number, total: number) {
  if (score === total) return "Perfect! You know this lesson.";
  if (score >= total * 0.7) return "Well done. Try again to get them all.";
  return "Go back to the lesson to review, then try again.";
}

/** A short message with buttons, for the error and empty cases. */
function QuizMessage(props: {
  text: string;
  actionLabel?: string;
  onAction?: () => void;
  onExit: () => void;
}) {
  return (
    <Stack align="center" gap="4" py="8">
      <Text>{props.text}</Text>
      <HStack>
        {props.actionLabel && props.onAction && (
          <Button onClick={props.onAction}>{props.actionLabel}</Button>
        )}
        <Button variant="outline" onClick={props.onExit}>
          Back to lesson
        </Button>
      </HStack>
    </Stack>
  );
}
