"use client";

import { Button } from "./Button";

export interface GuideChapterData {
  title: string;
  body?: string;
  errors?: string[];
  structure?: string[];
  quote: string;
}

export function GuideChapter({
  chapter,
  index,
  total,
  title,
  onPrev,
  onNext,
  onDone,
  doneLabel,
}: {
  chapter: GuideChapterData;
  index: number;
  total: number;
  title: string;
  onPrev: () => void;
  onNext: () => void;
  onDone: () => void;
  doneLabel: string;
}) {
  const list = chapter.errors ?? chapter.structure;

  return (
    <div className="flex flex-col">
      <p className="text-orange text-xs font-bold tracking-[0.15em] uppercase mb-2">
        {title} · {index + 1}/{total}
      </p>
      <h1 className="text-2xl font-extrabold text-warm mb-4 leading-snug">{chapter.title}</h1>

      {chapter.body && <p className="text-warm/80 leading-relaxed mb-5">{chapter.body}</p>}

      {list && (
        <ul className="flex flex-col gap-2.5 mb-5">
          {list.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-warm/90">
              <span className="w-6 h-6 rounded-full bg-olive-dim text-olive font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                {i + 1}
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )}

      <blockquote className="border-l-4 border-orange pl-4 py-1 text-warm font-bold italic mb-8">
        {chapter.quote}
      </blockquote>

      <div className="flex gap-3 mt-auto">
        <Button variant="secondary" onClick={onPrev} disabled={index === 0} className="flex-1">
          ←
        </Button>
        {index < total - 1 ? (
          <Button onClick={onNext} className="flex-[3]">→</Button>
        ) : (
          <Button onClick={onDone} className="flex-[3]">{doneLabel}</Button>
        )}
      </div>
    </div>
  );
}
