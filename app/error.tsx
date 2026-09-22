"use client";

import { Button } from "@/components/ui/button";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex max-w-7xl flex-col items-center justify-center gap-4 p-5 py-24 text-center">
      <h1 className="text-xl font-bold">문제가 발생했습니다</h1>
      <p className="text-muted-foreground text-sm">
        일시적인 오류일 수 있습니다. 다시 시도해주세요.
      </p>
      <Button onClick={reset}>다시 시도</Button>
    </main>
  );
}
