"use client";

import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

export function useIsMounted() {
  return useSyncExternalStore(
    subscribe,
    () => true, // 클라이언트 스냅샷
    () => false, // 서버 스냅샷
  );
}
