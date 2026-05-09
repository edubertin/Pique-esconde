import { type Href, usePathname, useRouter } from 'expo-router';

export function useSafeRouter() {
  const pathname = usePathname();
  const router = useRouter();

  const isSamePath = (href: Href) => {
    if (typeof href !== 'string') return false;
    return pathname === href;
  };

  return {
    pathname,
    push(href: Href) {
      if (!isSamePath(href)) router.push(href);
    },
    replace(href: Href) {
      if (!isSamePath(href)) router.replace(href);
    },
    router,
  };
}
