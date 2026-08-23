"use client";

import { TEG_ASSAYS, TEG_PARAMETERS, TEG_PATTERNS, NORMAL_TRACE } from "@/lib/tegData";
import TegTrace from "@/components/TegTrace";

function AssayCard({ assay }) {
  return (
    <div className="card">
      <div className="flex items-center gap-2">
        <span
          className="inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold text-white"
          style={{ backgroundColor: assay.color }}
        >
          {assay.abbr}
        </span>
        <h3 className="font-heading text-base text-ink">{assay.name}</h3>
      </div>
      <p className="mt-0.5 text-xs text-ink-faint">{assay.nameJa}</p>

      <p className="mt-2 text-sm font-medium text-teal-ink">{assay.purpose}</p>

      <ul className="mt-2 list-inside list-disc space-y-0.5 text-xs text-ink-soft">
        {assay.features.map((f) => (
          <li key={f}>{f}</li>
        ))}
      </ul>

      <div className="mt-2 rounded-md bg-bg-subtle px-3 py-2 text-xs text-ink-soft">
        <span className="font-medium text-ink-faint">使いどころ: </span>
        {assay.whenToUse}
      </div>
    </div>
  );
}

function ParamCard({ p }) {
  return (
    <div className="card !p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-ink-faint">{p.assay}</span>
        <span className="whitespace-nowrap rounded-full bg-teal-soft px-2 py-0.5 text-xs font-semibold text-teal-ink">
          {p.range[0]}〜{p.range[1]}
          {p.unit}
        </span>
      </div>
      <h3 className="mt-1 font-heading text-base text-ink">
        {p.label}
        <span className="ml-1 text-xs font-normal text-ink-faint">({p.abbr})</span>
      </h3>
      <p className="mt-1 text-xs leading-relaxed text-ink-soft">{p.meaning}</p>
    </div>
  );
}

function PatternCard({ pattern }) {
  return (
    <section id={`pattern-${pattern.id}`} className="card scroll-mt-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span
            className="inline-block rounded-full px-2 py-0.5 text-[11px] font-medium text-white"
            style={{ backgroundColor: pattern.color }}
          >
            {pattern.tag}
          </span>
          <h3 className="mt-1 font-heading text-lg text-ink">{pattern.name}</h3>
        </div>
      </div>
      <p className="mt-1 text-sm text-ink-soft">{pattern.summary}</p>

      <div className="mt-3 rounded-md bg-bg-subtle p-2">
        <TegTrace trace={pattern.trace} color={pattern.color} normalTrace={pattern.id === "normal" ? null : NORMAL_TRACE} />
        <p className="mt-1 text-center text-[11px] text-ink-faint">
          {pattern.id === "normal" ? "実線:正常波形(模式図)" : "実線:本パターン／破線:正常波形(比較用・模式図)"}
        </p>
      </div>

      <div className="mt-3">
        <p className="text-xs font-medium text-ink-faint">主な変化</p>
        <ul className="mt-1 list-inside list-disc space-y-0.5 text-sm text-ink-soft">
          {pattern.keyChanges.map((c) => (
            <li key={c}>{c}</li>
          ))}
        </ul>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div className="rounded-md bg-bg-subtle px-3 py-2 text-xs text-ink-soft">
          <p className="mb-1 font-medium text-ink-faint">主な原因・背景</p>
          {pattern.causes}
        </div>
        <div className="rounded-md bg-teal-soft px-3 py-2 text-xs text-teal-ink">
          <p className="mb-1 font-medium">対応の目安</p>
          {pattern.management}
        </div>
      </div>
      {pattern.overlayNote && <p className="mt-2 text-xs text-ink-faint">※ {pattern.overlayNote}</p>}
    </section>
  );
}

export default function TEG6sEvaluation() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">TEG6s 評価支援</h1>
        <p className="mt-2 text-sm text-ink-soft">
          トロンボエラストグラフィ(TEG6s)の各アッセイの特徴、評価項目の基準範囲、代表的な凝固異常パターンを一覧できます。
        </p>
        <div className="mt-3 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・基準範囲は文献・添付文書に基づく代表的な参考値です。機器のロット・カートリッジ・施設により基準範囲は異なるため、実際の評価は各施設・機器が提示する基準範囲を優先してください。
          </p>
          <p>・波形図はR・K・MA・LY30から生成した教育用の模式図であり、実測波形そのものではありません。</p>
          <p>・本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。</p>
        </div>
      </header>

      <section>
        <h2 className="font-heading text-xl text-ink">① アッセイ(チャンネル)の特徴・目的</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEG_ASSAYS.map((a) => (
            <AssayCard key={a.id} assay={a} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl text-ink">② 評価項目と基準範囲</h2>
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
          {TEG_PARAMETERS.map((p) => (
            <ParamCard key={p.key} p={p} />
          ))}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl text-ink">③ 主な凝固異常パターン</h2>
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {TEG_PATTERNS.map((p) => (
            <PatternCard key={p.id} pattern={p} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。</p>
      </footer>
    </div>
  );
}
