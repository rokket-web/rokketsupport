import type { ClientPlatform } from "@/lib/clients";

export function normalizeUrl(url: string): string {
  const trimmed = url.trim();
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

// WordPress's wp-login.php (or a renamed equivalent, hence the explicit
// loginUrl field) accepts a plain POST with well-known field names, so a
// cross-origin form submit (not a fetch/XHR, so CORS doesn't block it) can
// drive the real login for the common case.
function loginToWordPress(loginUrl: string, username: string, password: string) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = normalizeUrl(loginUrl);
  form.target = "_blank";
  form.style.display = "none";

  const fields: Record<string, string> = {
    log: username,
    pwd: password,
    "wp-submit": "Log In",
    testcookie: "1",
  };

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
  form.remove();
}

// Other platforms (Webflow, Next, custom admin panels) use login forms with
// unknown field names, CSRF tokens, or OAuth flows we can't drive blind, so
// the best we can do is open the login page and hand the admin the
// credentials to paste in.
async function openLoginAndCopyCredentials(
  loginUrl: string,
  username: string,
  password: string
) {
  window.open(normalizeUrl(loginUrl), "_blank", "noopener,noreferrer");
  if (navigator.clipboard) {
    await navigator.clipboard.writeText(
      `Username: ${username}\nPassword: ${password}`
    );
  }
}

export async function loginToClientSite(
  platform: ClientPlatform,
  loginUrl: string,
  username: string,
  password: string
): Promise<{ copiedToClipboard: boolean }> {
  if (platform === "WordPress") {
    loginToWordPress(loginUrl, username, password);
    return { copiedToClipboard: false };
  }
  await openLoginAndCopyCredentials(loginUrl, username, password);
  return { copiedToClipboard: true };
}
