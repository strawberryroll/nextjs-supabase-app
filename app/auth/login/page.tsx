import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

// searchParams는 요청 시점에만 알려지는 런타임 값이라 페이지 최상단에서
// await하면 prerender가 막힌다(blocking-prerender-dynamic). Suspense로
// 감싼 자식 컴포넌트에서 await하도록 분리한다.
export default function Page({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Suspense fallback={<LoginForm />}>
          <LoginFormWithRedirect searchParams={searchParams} />
        </Suspense>
      </div>
    </div>
  );
}

async function LoginFormWithRedirect({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;
  return <LoginForm redirectTo={redirect} />;
}
