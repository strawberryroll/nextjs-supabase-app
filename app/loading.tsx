import { SiteHeaderSkeleton } from "@/components/site-header-skeleton";

// 라우트 전환 시 즉시 표시되는 최상위 로딩 보완재 — 각 page.tsx 내부의
// 세밀한 <Suspense>+skeleton 구조를 대체하지 않는다.
export default function Loading() {
  return (
    <>
      <SiteHeaderSkeleton />
      <main className="mx-auto max-w-7xl p-5">
        <div className="bg-muted h-8 w-40 animate-pulse rounded" />
      </main>
    </>
  );
}
