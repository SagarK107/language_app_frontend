"use client";

import {
  Button,
  Card,
  Center,
  Container,
  Heading,
  SimpleGrid,
  Spinner,
  Text,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";

import { Course, getCourses, setActiveCourse } from "@/lib/api";
import { useRefreshUser } from "../context/AuthProvider";
import { toaster } from "./toaster";

type CoursesState =
  | { status: "loading" }
  | { status: "ready"; courses: Course[] }
  | { status: "error" };

export default function CoursePicker() {
  const [state, setState] = useState<CoursesState>({ status: "loading" });
  // The course whose Start button was clicked, so only that button shows a spinner.
  const [startingId, setStartingId] = useState<number | null>(null);
  const refreshUser = useRefreshUser();

  useEffect(() => {
    async function loadCourses() {
      try {
        const courses = await getCourses();
        setState({ status: "ready", courses });
      } catch {
        setState({ status: "error" });
      }
    }

    loadCourses();
  }, []);

  async function startCourse(courseId: number) {
    setStartingId(courseId);
    try {
      await setActiveCourse(courseId);
      // The user now has an active course, so HomePage replaces this component.
      await refreshUser();
    } catch {
      toaster.create({
        title: "Couldn't start the course",
        description: "Please try again.",
        type: "error",
      });
      setStartingId(null);
    }
  }

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
        <Text color="red.500">Couldn&apos;t load courses. Please refresh the page.</Text>
      </Center>
    );
  }

  return (
    <Container maxW="5xl" py="8">
      <Heading mb="6">Choose a course</Heading>

      {state.courses.length === 0 && <Text>No courses are available yet.</Text>}

      <SimpleGrid columns={{ base: 1, md: 2 }} gap="4">
        {state.courses.map((course) => (
          <Card.Root key={course.id}>
            <Card.Body gap="2">
              <Card.Title>{course.title}</Card.Title>
              <Card.Description>
                {course.source_language} → {course.target_language}
              </Card.Description>
            </Card.Body>
            <Card.Footer>
              <Button
                loading={startingId === course.id}
                disabled={startingId !== null}
                onClick={() => startCourse(course.id)}
              >
                Start
              </Button>
            </Card.Footer>
          </Card.Root>
        ))}
      </SimpleGrid>
    </Container>
  );
}
