"use client";

import { useUser } from "../context/AuthProvider";
import CoursePicker from "./CoursePicker";
import LessonList from "./LessonList";

export default function HomePage() {
  const user = useUser()

  if (user.active_course !== null)
  {
    return <LessonList courseId={user.active_course} />
  }
  else
  {
    return <CoursePicker />
  }
}
