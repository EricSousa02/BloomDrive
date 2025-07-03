"use client";

import Link from "next/link";
import Image from "next/image";
import { navItems } from "@/constants";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useEffect, useMemo } from "react";

interface Props {
  fullName: string;
  avatar: string;
  email: string;
}

const Sidebar = ({ fullName, avatar, email }: Props) => {
  const pathname = usePathname();
  const router = useRouter();

  // Memoize navigation items
  const memoizedNavItems = useMemo(() => navItems, []);

  // Preload das rotas críticas
  useEffect(() => {
    const timer = setTimeout(() => {
      memoizedNavItems.forEach(({ url }) => {
        router.prefetch(url);
      });
    }, 500); // Pequeno delay para não interferir no carregamento inicial

    return () => clearTimeout(timer);
  }, [router, memoizedNavItems]);

  return (
    <aside className="sidebar">
      <Link href="/">
        <Image
          src="/assets/images/bloomdrive.png"
          alt="logo"
          width={160}
          height={50}
          className="hidden h-auto lg:block mx-4"
        />

        <Image
          src="/assets/images/bloomdriveicon.png"
          alt="logo"
          width={70}
          height={70}
          className="lg:hidden"
        />
      </Link>

      <nav className="sidebar-nav">
        <ul className="flex flex-1 flex-col gap-6">
          {memoizedNavItems.map(({ url, name, icon }) => (
            <Link key={name} href={url} className="lg:w-full" prefetch={true}>
              <li
                className={cn(
                  "sidebar-nav-item",
                  pathname === url && "shad-active",
                )}
              >
                <Image
                  src={icon}
                  alt={name}
                  width={24}
                  height={24}
                  className={cn(
                    "nav-icon",
                    pathname === url && "nav-icon-active",
                  )}
                  priority={name === "Dashboard"} // Prioridade para o Dashboard
                />
                <p className="hidden lg:block">{name}</p>
              </li>
            </Link>
          ))}
        </ul>
      </nav>

      {/* <Image
        src="/assets/images/files-2.png"
        alt="logo"
        width={506}
        height={418}
        className="w-full"
      /> */}

      <div className="sidebar-user-info">
        <Image
          src={avatar}
          alt="Avatar"
          width={44}
          height={44}
          className="sidebar-user-avatar"
        />
        <div className="hidden lg:block">
          <p className="subtitle-2 capitalize">{fullName}</p>
          <p className="caption">{email}</p>
        </div>
      </div>
    </aside>
  );
};
export default Sidebar;
