export function canReadLesson(
  user: { id: string; role: string } | null,
  lesson: { published: boolean; createdById: string | null },
) {
  return !!user && (lesson.published || user.role === "ADMIN"
    || (user.role === "TEACHER" && lesson.createdById === user.id));
}
