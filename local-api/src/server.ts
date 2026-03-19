import { app } from "@/app";

const PORT = process.env.PORT ?? 3000;

const server = app.listen(PORT, () => {
  // biome-ignore lint/suspicious/noConsole: Startup log message
  console.log(`Server is running on port ${PORT}`);
  // biome-ignore lint/suspicious/noConsole: Startup log message
  console.log(
    `To test the query, visit http://localhost:${PORT}/author-data?author=Albert%20Einstein`,
  );
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    // biome-ignore lint/suspicious/noConsole: Error log message
    console.error(`Port ${PORT} is already in use`);
  } else {
    // biome-ignore lint/suspicious/noConsole: Error log message
    console.error(error);
  }
  process.exit(1);
});
