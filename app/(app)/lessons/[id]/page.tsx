import { notFound } from "next/navigation";

import LessonPage from "@/components/ui/LessonPage";

export default async function Lesson(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

  // Only whole numbers from 1 upwards can be lesson ids ("abc", "0", "1.5" cannot).
  if (!/^[1-9]\d*$/.test(id)) {
    notFound();
  }

  return <LessonPage lessonId={Number(id)} />;
}
