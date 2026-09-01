import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-black text-sky-300">404</p>
      <h1 className="mt-4 text-3xl font-bold text-white">产品不存在或暂不可用</h1>
      <p className="mt-3 text-slate-400">该产品可能已下榜，或源站暂时无法提供详情数据。</p>
      <Link className="mt-8 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-500 px-6 py-3 font-bold text-white" href="/">
        返回排行榜
      </Link>
    </div>
  );
}
