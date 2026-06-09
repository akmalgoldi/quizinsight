import "./globals.css";

export const metadata = {
  title: "QuizInsight - AI-Powered Quiz Evaluation for Lecturers & Students",
  description: "Create quizzes easily, monitor student progress, and get automated AI insights on student understanding of lecture topics.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="id" suppressHydrationWarning>
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
