"use client";

import {
  Card,
  Center,
  Container,
  Heading,
  IconButton,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { CourseDetail, getCourse } from "@/lib/api";

type CourseState =
  | { status: "loading" }
  | { status: "ready"; course: CourseDetail }
  | { status: "error" };

export default function LessonList(props: { courseId: number }) {
  const { courseId } = props;
  const [state, setState] = useState<CourseState>({ status: "loading" });

  useEffect(() => {
    async function loadCourse() {
      setState({ status: "loading" });
      try {
        const course = await getCourse(courseId);
        setState({ status: "ready", course });
      } catch {
        setState({ status: "error" });
      }
    }

    loadCourse();
  }, [courseId]);

  if (state.status === "loading") {
    return (
      <Center py="16">
        <Spinner />
      </Center>
    );
  }

  if (state.status === "error") {
    return (
      <Center py="16">
        <Text color="red.500">
          Couldn&apos;t load the lessons. Please refresh the page.
        </Text>
      </Center>
    );
  }

  const { course } = state;

  return (
    <Container maxW="5xl" py="8">
      <Heading>{course.title}</Heading>
      <Text color="fg.muted" mb="6">
        {course.source_language} → {course.target_language}
      </Text>

      {course.lessons.length === 0 && <Text>This course has no lessons yet.</Text>}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {course.lessons.map((lesson) => (
          <Card.Root key={lesson.id}>
            <Card.Header>
              <Heading size="md">Lesson {lesson.order}</Heading>
            </Card.Header>
            <Card.Body
              flexDirection="row"
              alignItems="center"
              justifyContent="space-between"
            >
              <Text>{lesson.title}</Text>
              <IconButton
                asChild
                variant="ghost"
                aria-label={`Start lesson ${lesson.order}`}
              >
                <Link href={`/lessons/${lesson.id}`}>
                  <ArrowRight />
                </Link>
              </IconButton>
            </Card.Body>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Container>
  );
}
