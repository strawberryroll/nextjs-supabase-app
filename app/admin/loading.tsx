// app/admin/layout.tsx가 헤더/사이드바를 유지한 채 이 콘텐츠 영역만
// 로딩 상태로 대체한다(각 admin page.tsx 내부의 Suspense+skeleton 보완재).
export default function AdminLoading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-muted h-8 w-32 animate-pulse rounded" />
      <div className="bg-muted h-40 w-full animate-pulse rounded" />
    </div>
  );
}
