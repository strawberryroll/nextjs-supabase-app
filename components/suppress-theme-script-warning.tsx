"use client";

if (process.env.NODE_ENV === "development") {
  const originalConsoleError = console.error;

  console.error = (...args: Parameters<typeof console.error>) => {
    const [first] = args;
    const message = first instanceof Error ? first.message : first;

    if (
      typeof message === "string" &&
      message.includes(
        "Encountered a script tag while rendering React component",
      )
    ) {
      return;
    }

    originalConsoleError(...args);
  };
}

export function SuppressThemeScriptWarning() {
  return null;
}
