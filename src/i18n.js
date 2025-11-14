import { getRequestConfig } from "next-intl/server";

export default getRequestConfig(async () => {
  // Get locale from cookie or default to 'en'
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const locale = cookieStore.get("NEXT_LOCALE")?.value || "en";

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
