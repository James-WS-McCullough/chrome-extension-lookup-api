import { app } from "@/app";

const PORT = process.env.PORT ?? 3000;

app.listen(PORT);

// biome-ignore lint/suspicious/noConsole: Startup log message
console.log(`Server is running on port ${PORT}`);
// biome-ignore lint/suspicious/noConsole: Startup log message
console.log(
  `To test the query, visit http://localhost:${PORT}/author-data?author=Albert%20Einstein`,
);
