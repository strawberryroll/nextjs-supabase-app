## 회원가입/로그인 인증 관련 이슈

- [x] 에러 메세지가 영어로 출력됨. 한글로 일관성 맞춰야함
  - `lib/auth/error-messages.ts`에 Supabase Auth 에러 코드 → 한글 메시지 매핑 유틸 `getAuthErrorMessage` 추가, 모든 인증 폼(`login-form`, `sign-up-form`, `forgot-password-form`, `update-password-form`)과 `app/auth/{callback,confirm}/route.ts`에 적용.
- [x] 이미 계정이 있는 이메일 주소로 회원가입이 되면 안됨.
  - `sign-up-form.tsx`에서 `signUp()` 응답의 `identities` 배열이 비어있으면(Supabase의 이메일 확인 활성화 시 중복 가입의 신호) "이미 가입된 이메일입니다" 안내로 처리하고 가입 완료 화면으로 넘어가지 않도록 수정.
