import Link from "next/link";
import { useRouter } from "next/router";

export default function NavLink({ href, children }) {
  const router = useRouter();

  return (
    <Link href={href}>
      <a
        className={`p-4 ${
          router.pathname === href ? "border-purple-700" : "border-transparent"
        } border-b-2`}
      >
        {children}
      </a>
    </Link>
  );
}
