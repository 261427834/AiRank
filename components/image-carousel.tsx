"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";

export function ImageCarousel({ alt, images }: { alt: string; images: string[] }) {
  const [index, setIndex] = useState(0);

  const show = useCallback((next: number) => {
    setIndex(((next % images.length) + images.length) % images.length);
  }, [images.length]);

  useEffect(() => {
    if (images.length < 2) return;
    const timer = setInterval(() => show(index + 1), 5_000);
    return () => clearInterval(timer);
  }, [images.length, index, show]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") show(index - 1);
      if (event.key === "ArrowRight") show(index + 1);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [index, show]);

  return (
    <div
      className="glass-panel relative mt-4 overflow-hidden rounded-3xl"
      role="region"
      aria-roledescription="carousel"
      aria-label={`${alt} 产品截图轮播`}
      tabIndex={0}
    >
      <div className="pointer-events-none relative aspect-video w-full bg-black/40">
        {images.map((image, slide) => (
          <Image
            key={image}
            alt={`${alt} 截图 ${slide + 1}`}
            className="object-contain transition-opacity duration-500"
            fill
            priority={slide === 0}
            sizes="(max-width: 1024px) 100vw, 1024px"
            src={image}
            style={{ opacity: slide === index ? 1 : 0, zIndex: slide === index ? 1 : 0, pointerEvents: "none" }}
            unoptimized
          />
        ))}
      </div>

      {images.length > 1 ? (
        <>
          <CarouselButton direction="prev" onClick={() => show(index - 1)} />
          <CarouselButton direction="next" onClick={() => show(index + 1)} />
          <span className="absolute right-4 top-4 z-20 rounded-full bg-black/60 px-3 py-1 text-xs font-semibold text-slate-200">
            {index + 1} / {images.length}
          </span>
          <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center gap-2">
            {images.map((image, slide) => (
              <button
                aria-label={`查看第 ${slide + 1} 张截图`}
                className={`h-2 rounded-full transition-all ${slide === index ? "w-7 bg-sky-300" : "w-2 bg-white/40 hover:bg-white/70"}`}
                key={image}
                onClick={() => show(slide)}
                type="button"
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

function CarouselButton({ direction, onClick }: { direction: "prev" | "next"; onClick: () => void }) {
  const isPrev = direction === "prev";
  return (
    <button
      aria-label={isPrev ? "上一张" : "下一张"}
      className={`absolute top-1/2 z-20 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/50 text-lg text-white backdrop-blur transition hover:bg-black/70 sm:flex ${isPrev ? "left-4" : "right-4"}`}
      onClick={onClick}
      type="button"
    >
      {isPrev ? "←" : "→"}
    </button>
  );
}
