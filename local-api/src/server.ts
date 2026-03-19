import { app } from "@/app";
import { env } from "@/env";

const server = app.listen(env.port, () => {
  // biome-ignore lint/suspicious/noConsole: Startup log message
  console.log(`Server is running on port ${env.port}`);
  // biome-ignore lint/suspicious/noConsole: Startup log message
  console.log(
    `To test the query, visit http://localhost:${env.port}/author-data?author=Albert%20Einstein`,
  );
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    // biome-ignore lint/suspicious/noConsole: Error log message
    console.error(`Port ${env.port} is already in use`);
  } else {
    // biome-ignore lint/suspicious/noConsole: Error log message
    console.error(error);
  }
  process.exit(1);
});
