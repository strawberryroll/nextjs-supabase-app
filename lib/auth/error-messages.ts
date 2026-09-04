import { isAuthError } from "@supabase/supabase-js";

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  invalid_credentials: "이메일 또는 비밀번호가 올바르지 않습니다",
  user_already_exists: "이미 가입된 이메일입니다",
  email_exists: "이미 가입된 이메일입니다",
  weak_password: "비밀번호가 너무 약합니다",
  email_not_confirmed: "이메일 인증이 필요합니다",
  over_email_send_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요",
  over_request_rate_limit: "요청이 너무 많습니다. 잠시 후 다시 시도해주세요",
  same_password: "기존과 동일한 비밀번호는 사용할 수 없습니다",
  signup_disabled: "현재 회원가입이 비활성화되어 있습니다",
  user_not_found: "존재하지 않는 계정입니다",
  user_banned: "이용이 제한된 계정입니다",
  email_address_invalid: "사용할 수 없는 이메일 주소입니다",
  validation_failed: "입력하신 정보를 확인해주세요",
};

const DEFAULT_MESSAGE = "요청 처리 중 오류가 발생했습니다";

export function getAuthErrorMessage(error: unknown): string {
  if (isAuthError(error) && error.code) {
    return AUTH_ERROR_MESSAGES[error.code] ?? DEFAULT_MESSAGE;
  }
  return DEFAULT_MESSAGE;
}
