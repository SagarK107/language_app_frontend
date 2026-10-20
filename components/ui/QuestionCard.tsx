"use client";

import { Button, Card, SimpleGrid, Stack, Text } from "@chakra-ui/react";

import { Question, QuestionSide, QuestionType } from "@/lib/api";

// The instruction shown above the prompt, one per question type.
// `Record<QuestionType, string>` makes TypeScript complain if a type is missing.
const INSTRUCTIONS: Record<QuestionType, string> = {
  text_to_transliteration: "How is this letter read?",
  transliteration_to_text: "Which letter is this?",
  text_to_meaning: "What does this word mean?",
  meaning_to_text: "Which word means this?",
};

// What the parent knows about the current answer. `QuestionCard` only displays it.
export type AnswerStatus =
  | { status: "unanswered" }
  | { status: "checking"; choice: number }
  | { status: "answered"; choice: number; correctChoice: number };

type Props = {
  question: Question;
  answer: AnswerStatus;
  onChoose: (choice: number) => void;
};

/**
 * Shows one question and its four options.
 *
 * This component is "presentational": it has no state and calls no API.
 * The parent (QuizView) decides what happens on a click and passes the result
 * back in through `answer`.
 */
export default function QuestionCard({ question, answer, onChoose }: Props) {
  // Options are locked as soon as one is clicked, so a double click cannot
  // send two answers for the same question.
  const locked = answer.status !== "unanswered";

  return (
    <Card.Root>
      <Card.Body gap="6">
        <Stack align="center" gap="1">
          <Text color="fg.muted">{INSTRUCTIONS[question.type]}</Text>
          <SideLabel side={question.prompt} size="4xl" />
        </Stack>

        <SimpleGrid columns={{ base: 1, sm: 2 }} gap="3">
          {question.options.map((option, index) => (
            <Button
              // The options never change order while a question is shown,
              // so the index is a stable key here.
              key={index}
              height="auto"
              py="4"
              disabled={locked}
              onClick={() => onChoose(index)}
              {...optionStyle(answer, index)}
            >
              <SideLabel side={option} size="xl" />
            </Button>
          ))}
        </SimpleGrid>
      </Card.Body>
    </Card.Root>
  );
}

/** The big `main` text with the optional small `sub` line under it. */
function SideLabel({ side, size }: { side: QuestionSide; size: string }) {
  return (
    <Stack align="center" gap="0">
      <Text fontSize={size}>{side.main}</Text>
      {side.sub && (
        <Text fontSize="sm" opacity={0.8}>
          {side.sub}
        </Text>
      )}
    </Stack>
  );
}

/**
 * Colors for one option button.
 *   before answering    → all neutral
 *   while checking      → the clicked one is highlighted and shows a spinner
 *   after the reply     → correct one green, a wrong pick red, the rest faded
 */
function optionStyle(answer: AnswerStatus, index: number) {
  if (answer.status === "checking") {
    return answer.choice === index
      ? { variant: "solid" as const, loading: true }
      : { variant: "outline" as const };
  }

  if (answer.status === "answered") {
    if (index === answer.correctChoice) {
      return { variant: "solid" as const, colorPalette: "green", _disabled: { opacity: 1 } };
    }
    if (index === answer.choice) {
      return { variant: "solid" as const, colorPalette: "red", _disabled: { opacity: 1 } };
    }
  }

  return { variant: "outline" as const };
}
