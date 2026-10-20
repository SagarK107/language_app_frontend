const API_URL = "http://localhost:8000";

export type User = {
   
    username : string,
    id : number
    email : string
    active_course : number | null
}

export type Course =  {
  id : number,
  title : string,
  source_language : string,
  target_language : string
}

export type LessonSummary = {
  id : number,
  order : number,
  title : string
}

export type CourseDetail = Course &  {

  lessons : LessonSummary[]
}

export type ItemKind = "character" | "word" | "sentence";

export type Item = {
  id: number;
  kind: ItemKind;
  text: string;
  transliteration: string;
  meaning: string;
  hint: string;
  order: number;
};

export type LessonDetail = {
  id: number;
  course: number;
  title: string;
  order: number;
  grammar_note: string;
  items: Item[];
};

export type FieldErrors = Record<string, string[]>;

// Thrown for any non-2xx reply, so callers can read the status and the body.
export class ApiError extends Error {
  constructor(
    public status: number,
    public body: unknown,
  ) {
    super(`API request failed with status ${status}`);
  }
}

// Django puts the CSRF token in a cookie named "csrftoken".
function getCsrfToken(): string | undefined {
  return document.cookie
    .split("; ")
    .find((cookie) => cookie.startsWith("csrftoken="))
    ?.split("=")[1];
}

async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  const csrfToken = getCsrfToken();
  // TODO 1: if there is a token, set the "X-CSRFToken" header to it
if (csrfToken) {
    headers.set("X-CSRFToken",csrfToken)
}
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    // TODO 3: the option that makes fetch send cookies
    credentials : "include"
  });

  // A 204 (logout) has no body to parse.
  const body = response.status === 204 ? null : await response.json();

  // TODO 4: if the reply is not a success, throw an ApiError
  if (!response.ok)
  {
    throw new ApiError(response.status,body)
  }
  

  return body as T;
}

export function login(username: string, password: string) {
  return apiFetch<User>("/api/login/", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });
}

export function signup(username:string, email:string, password:string) {
    return apiFetch<User>("/api/signup/", {
        method : "POST",
        body: JSON.stringify({username, password, email})
    })
}

export function logout() {
    return apiFetch<null>("/api/logout/", {
        method : "POST",
        
    })
}


export function me() {
    return apiFetch<User>("/api/me/", {
        method : "GET",

    })
}

export function getCourses() {
  return apiFetch<Course[]>("/api/courses/", {
    method : "GET",
  })
}

export function getCourse(id : number) {
  return apiFetch<CourseDetail>(`/api/courses/${id}/`, {
    method : "GET",
  })
}

export function getLesson(id: number) {
  return apiFetch<LessonDetail>(`/api/lessons/${id}/`, {
    method: "GET",
  });
}

export function setActiveCourse(id : number) {
  return apiFetch<{course : number}>(`/api/active-course/`, {
    method : "PUT",
    body : JSON.stringify({course : id})
  })
}

// One side of a question: `main` is the big label, `sub` an optional helper line.
export type QuestionSide = {
  main: string;
  sub: string;
};

export type Question = {
  // Signed by the backend. Holds the answer, so the UI only passes it back.
  token: string;
  type: string;
  prompt: QuestionSide;
  options: QuestionSide[];
};

export type AnswerResult = {
  correct: boolean;
  correct_choice: number;
};

export function getQuestions(lessonId: number) {
  return apiFetch<Question[]>(`/api/lessons/${lessonId}/questions/`, {
    method: "GET",
  });
}

export function submitAnswer(lessonId: number, token: string, choice: number) {
  return apiFetch<AnswerResult>(`/api/lessons/${lessonId}/answer/`, {
    method: "POST",
    body: JSON.stringify({ token, choice }),
  });
}
