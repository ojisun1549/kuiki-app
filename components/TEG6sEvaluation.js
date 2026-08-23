"use client";

import { useMemo, useState } from "react";
import {
  TEG_PARAMETERS,
  TEG_PATTERNS,
  NORMAL_TRACE,
  classifyValue,
  statusLabel,
  statusStampClass,
} from "@/lib/tegData";
import TegTrace from "@/components/TegTrace";

const INPUT_FIELDS = [
  { key: "rCk", label: "CK-R", unit: "分", range: [4.6, 9.1] },
  { key: "rCkh", label: "CKH-R", unit: "分", range: [4.3, 8.3] },
  { key: "k", label: "K", unit: "分", range: [0.8, 2.5] },
  { key: "angle", label: "Angle(α)", unit: "°", range: [63, 75] },
  { key: "maCk", label: "CK-MA", unit: "mm", range: [52, 69] },
  { key: "ffMa", label: "FF-MA", unit: "mm", range: [15, 34] },
  { key: "ly30", label: "LY30", unit: "%", range: [0, 3] },
  { key: "ci", label: "CI", unit: "", range: [-3.0, 3.0] },
];

function buildSuggestions(values, statuses) {
  const suggestions = [];
  const rCk = parseFloat(values.rCk);
  const rCkh = parseFloat(values.rCkh);
  const ly30 = parseFloat(values.ly30);
  const ci = values.ci;

  if (
    statuses.rCk === "high" &&
    statuses.rCkh === "normal" &&
    !isNaN(rCk) &&
    !isNaN(rCkh) &&
    rCkh > 0 &&
    rCk / rCkh >= 1.4
  ) {
    suggestions.push({
      patternId: "heparin",
      label: "ヘパリン効果の可能性",
      rationale: `CK-R(${rCk}分)/ CKH-R(${rCkh}分) = ${(rCk / rCkh).toFixed(2)} ≧ 1.4`,
    });
  }

  if (statuses.rCkh === "high") {
    suggestions.push({
      patternId: "factor-deficiency",
      label: "凝固因子欠乏の可能性",
      rationale: `CKH-Rが基準上限(8.3分)を超えています`,
    });
  } else if (statuses.rCkh === null && statuses.rCk === "high") {
    suggestions.push({
      patternId: "factor-deficiency",
      label: "凝固因子欠乏(またはヘパリン効果)の可能性",
      rationale: "CK-Rが基準上限(9.1分)を超えています。CKH-Rも入力するとヘパリン効果との鑑別の目安になります。",
    });
  }

  if (statuses.ffMa === "low") {
    suggestions.push({
      patternId: "hypofibrinogenemia",
      label: "フィブリノゲン低下の可能性",
      rationale: `FF-MA(${values.ffMa}mm)が基準下限(15mm)を下回っています`,
    });
  }

  if (statuses.maCk === "low" && (statuses.ffMa === "normal" || statuses.ffMa === null)) {
    suggestions.push({
      patternId: "platelet",
      label: "血小板数減少・機能低下の可能性",
      rationale: "CK-MAが低値です。FF-MAが正常(または未測定)であれば、フィブリノゲンより血小板側の関与が疑われます。",
    });
  }

  if (statuses.ly30 === "high") {
    const severity = ly30 >= 8 ? "重度" : "軽度〜中等度";
    suggestions.push({
      patternId: "hyperfibrinolysis",
      label: `線溶亢進の可能性(${severity})`,
      rationale: `LY30(${ly30}%)が基準上限(3%)を超えています`,
    });
  }

  if (statuses.ci === "high" || (statuses.rCk === "low" && statuses.maCk === "high")) {
    suggestions.push({
      patternId: "hypercoagulable",
      label: "過凝固状態の可能性",
      rationale: statuses.ci === "high" ? `CI(${ci})が基準上限(3.0)を超えています` : "Rが短縮し、MAが高値です",
    });
  }

  return suggestions;
}

function ParamTable() {
  return (
    <div className="overflow-x-auto rounded-lg border border-line">
      <table className="w-full min-w-[640px] border-collapse text-sm">
        <thead>
          <tr className="bg-bg-subtle text-left text-ink-faint">
            <th className="px-3 py-2 font-medium">アッセイ</th>
            <th className="px-3 py-2 font-medium">項目</th>
            <th className="whitespace-nowrap px-3 py-2 font-medium">基準範囲</th>
            <th className="px-3 py-2 font-medium">意味</th>
          </tr>
        </thead>
        <tbody>
          {TEG_PARAMETERS.map((p) => (
            <tr key={p.key} className="border-t border-line align-top">
              <td className="whitespace-nowrap px-3 py-2 text-ink-soft">
                <div className="font-medium text-ink">{p.assay}</div>
                <div className="text-xs text-ink-faint">{p.assayFull}</div>
              </td>
              <td className="whitespace-nowrap px-3 py-2">
                <div className="font-medium text-ink">
                  {p.label}
                  <span className="ml-1 text-xs text-ink-faint">({p.abbr})</span>
                </div>
              </td>
              <td className="whitespace-nowrap px-3 py-2 font-medium text-teal-ink">
                {p.range[0]}〜{p.range[1]}
                {p.unit}
              </td>
              <td className="px-3 py-2 text-ink-soft">{p.meaning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ValueChecker() {
  const [values, setValues] = useState(
    Object.fromEntries(INPUT_FIELDS.map((f) => [f.key, ""]))
  );

  const statuses = useMemo(() => {
    const out = {};
    for (const f of INPUT_FIELDS) {
      out[f.key] = classifyValue(values[f.key], f.range);
    }
    return out;
  }, [values]);

  const anyEntered = Object.values(values).some((v) => v !== "");
  const suggestions = useMemo(() => buildSuggestions(values, statuses), [values, statuses]);

  const update = (key) => (e) => setValues((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="card">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {INPUT_FIELDS.map((f) => (
          <div key={f.key}>
            <label className="mb-1 block text-xs font-medium text-ink-faint">
              {f.label} {f.unit && `(${f.unit})`}
            </label>
            <input
              type="number"
              inputMode="decimal"
              step="0.1"
              value={values[f.key]}
              onChange={update(f.key)}
              placeholder={`${f.range[0]}〜${f.range[1]}`}
              className="w-full rounded-md border border-line bg-white px-2 py-1.5 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            />
            <span className={`stamp ${statusStampClass(statuses[f.key])} mt-1 inline-block !px-2 !py-0.5 text-[11px]`}>
              {statusLabel(statuses[f.key])}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <p className="mb-2 text-sm font-medium text-ink-faint">示唆される所見(簡易ルールベース・参考)</p>
        {!anyEntered && <p className="text-sm text-ink-faint">数値を入力すると、基準範囲との比較と考えられるパターンを表示します。</p>}
        {anyEntered && suggestions.length === 0 && (
          <p className="text-sm text-ink-soft">現時点の入力からは、特定の異常パターンへの明確な該当はありません。</p>
        )}
        {suggestions.length > 0 && (
          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li key={i} className="rounded-md bg-amber-soft px-3 py-2 text-sm text-amber-ink">
                <a href={`#pattern-${s.patternId}`} className="font-medium underline decoration-dotted underline-offset-2">
                  {s.label}
                </a>
                <p className="mt-0.5 text-xs text-ink-soft">{s.rationale}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
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
          トロンボエラストグラフィ(TEG6s)の各評価項目の基準範囲と、代表的な凝固異常パターンを一覧できます。実測値を入力すると基準範囲との比較を表示します。
        </p>
        <div className="mt-3 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・基準範囲は文献・添付文書に基づく代表的な参考値です。機器のロット・カートリッジ・施設により基準範囲は異なるため、実際の評価は各施設・機器が提示する基準範囲を優先してください。
          </p>
          <p>
            ・「示唆される所見」は入力値と基準範囲の単純な比較によるルールベースの参考表示であり、診断や治療方針の決定を代替するものではありません。臨床所見・他検査と併せて専門的な判断のもとで解釈してください。
          </p>
          <p>・波形図はR・K・MA・LY30から生成した教育用の模式図であり、実測波形そのものではありません。</p>
        </div>
      </header>

      <section>
        <h2 className="font-heading text-xl text-ink">① 評価項目と基準範囲</h2>
        <div className="mt-3">
          <ParamTable />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="font-heading text-xl text-ink">② 実測値の簡易判定</h2>
        <p className="mt-1 text-sm text-ink-soft">測定値を入力すると、基準範囲との比較(高値・正常・低値)と、考えられる異常パターンの候補を表示します。</p>
        <div className="mt-3">
          <ValueChecker />
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
