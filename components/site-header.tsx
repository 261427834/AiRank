import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#050914]/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-600 text-lg font-black text-white shadow-lg shadow-sky-500/25">
            A
          </span>
          <span className="text-xl font-black tracking-tight">
            Ai<span className="bg-gradient-to-r from-sky-300 to-indigo-300 bg-clip-text text-transparent">Rank</span>
          </span>
        </Link>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium text-slate-300 sm:gap-2">
          <Link className="rounded-lg px-3 py-2 transition hover:bg-white/10 hover:text-white" href="/">
            首页
          </Link>
          <Link className="rounded-lg bg-white/10 px-3 py-2 text-white" href="/">
            排行榜
          </Link>
        </nav>
      </div>
    </header>
  );
}
