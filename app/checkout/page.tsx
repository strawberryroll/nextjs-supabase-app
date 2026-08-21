import { SiteHeader } from "@/components/site-header";

// SiteHeader의 getClaims() 호출(cookies 접근)이 Suspense 없이 발생해 prerender가 막힌다.
// TODO(Phase 3): 실데이터 연동 시 "use cache"/<Suspense> 도입과 함께 재검토.
export const instant = false;

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-5xl p-5">
        <h1 className="text-2xl font-bold">체크아웃</h1>
        <p className="text-muted-foreground mt-2">구현 예정 (Phase 2)</p>
        {/* TODO(Phase 3): 실데이터 연동 시 Suspense 경계 고려 */}
      </main>
    </>
  );
}
