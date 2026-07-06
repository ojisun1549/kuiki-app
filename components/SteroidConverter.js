"use client";

import { useState } from "react";

// 抗炎症効力比（ヒドロコルチゾン=1）と、20mgヒドロコルチゾンに相当する用量
const STEROIDS = [
  { id: "hydrocortisone", name: "ヒドロコルチゾン", brand: "サクシゾン・ソル・コーテフ", hcEq: 20 },
  { id: "cortisone", name: "コルチゾン", brand: "コーチゾン酢酸エステル", hcEq: 25 },
  { id: "prednisolone", name: "プレドニゾロン", brand: "プレドニン", hcEq: 5 },
  { id: "methylprednisolone", name: "メチルプレドニゾロン", brand: "ソル・メドロール", hcEq: 4 },
  { id: "triamcinolone", name: "トリアムシノロン", brand: "ケナコルト", hcEq: 4 },
  { id: "dexamethasone", name: "デキサメタゾン", brand: "デカドロン・レナデックス", hcEq: 0.75 },
  { id: "betamethasone", name: "ベタメタゾン", brand: "リンデロン", hcEq: 0.75 },
];

// hcEq = そのステロイドで20mgヒドロコルチゾン相当に必要なmg数
// 換算式: target_mg = source_mg × (target.hcEq / source.hcEq)

const EQUIVALENCY_TABLE = [
  { drug: "ヒドロコルチゾン", dose: "20 mg", potency: "1" },
  { drug: "コルチゾン", dose: "25 mg", potency: "0.8" },
  { drug: "プレドニゾロン", dose: "5 mg", potency: "4" },
  { drug: "メチルプレドニゾロン", dose: "4 mg", potency: "5" },
  { drug: "トリアムシノロン", dose: "4 mg", potency: "5" },
  { drug: "デキサメタゾン", dose: "0.75 mg", potency: "25〜30" },
  { drug: "ベタメタゾン", dose: "0.75 mg", potency: "25〜30" },
];

const STEROID_COVER = [
  {
    level: "小手術",
    examples: "鼠径ヘルニア・内視鏡手術など",
    hcDose: "25 mg",
    alternatives: "プレドニゾロン 6 mg / メチルプレドニゾロン 5 mg / デキサメタゾン 1 mg",
    duration: "手術当日のみ（術前〜術中に投与）",
    note: "通常の経口ステロイドを内服できる場合は、その2倍量に変更でも可。",
  },
  {
    level: "中手術",
    examples: "腹腔鏡手術・関節置換術・大腸内視鏡ポリープ切除など",
    hcDose: "50〜75 mg/日",
    alternatives: "プレドニゾロン 12〜20 mg/日 / メチルプレドニゾロン 10〜15 mg/日",
    duration: "術当日〜術後1〜2日間（症状により漸減）",
    note: "",
  },
  {
    level: "大手術",
    examples: "心臓手術・食道切除・大腸切除・長時間手術など",
    hcDose: "100〜150 mg/日",
    alternatives: "プレドニゾロン 25〜38 mg/日 / メチルプレドニゾロン 20〜30 mg/日",
    duration: "術当日〜術後2〜3日間（病態安定後に漸減）",
    note: "ICU管理が必要な重篤な状態では200〜300 mg/日相当まで増量されることもある。",
  },
];

function round3(n) {
  return Math.round(n * 1000) / 1000;
}

export default function SteroidConverter() {
  const [sourceId, setSourceId] = useState("");
  const [sourceDose, setSourceDose] = useState("");
  const [targetId, setTargetId] = useState("");
  const [showTable, setShowTable] = useState(false);
  const [showCover, setShowCover] = useState(false);

  const source = STEROIDS.find((s) => s.id === sourceId);
  const target = STEROIDS.find((s) => s.id === targetId);
  const dose = parseFloat(sourceDose);

  let resultMg = null;
  let hcEquivalentMg = null;
  if (source && target && !isNaN(dose) && dose > 0) {
    hcEquivalentMg = round3((dose / source.hcEq) * 20);
    resultMg = round3(dose * (target.hcEq / source.hcEq));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">ステロイド力価換算</h1>
        <p className="mt-1 text-sm text-ink-faint">
          抗炎症効力による等価換算。鉱質コルチコイド作用・投与経路による吸収率の違いは考慮していません。
        </p>
      </header>

      {/* Converter */}
      <div className="card space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Source drug */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-faint">
              現在のステロイド
            </label>
            <select
              value={sourceId}
              onChange={(e) => setSourceId(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            >
              <option value="">選択してください</option>
              {STEROIDS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}（{s.brand}）
                </option>
              ))}
            </select>
          </div>

          {/* Source dose */}
          <div>
            <label className="mb-1 block text-sm font-medium text-ink-faint">
              現在の用量（mg）
            </label>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              placeholder="例: 10"
              value={sourceDose}
              onChange={(e) => setSourceDose(e.target.value)}
              className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            />
          </div>
        </div>

        {/* Target drug */}
        <div>
          <label className="mb-1 block text-sm font-medium text-ink-faint">変更先のステロイド</label>
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep sm:max-w-xs"
          >
            <option value="">選択してください</option>
            {STEROIDS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}（{s.brand}）
              </option>
            ))}
          </select>
        </div>

        {/* Result */}
        {resultMg !== null ? (
          <div className="rounded-md bg-teal-soft px-4 py-4">
            <p className="text-xs text-ink-faint mb-1">
              {source.name} {dose} mg ＝ ヒドロコルチゾン換算 {hcEquivalentMg} mg
            </p>
            <div className="flex flex-wrap items-baseline gap-2">
              <span className="text-sm text-teal-ink">{target.name}</span>
              <span className="text-3xl font-bold text-teal-ink tabular-nums">{resultMg} mg</span>
              <span className="text-sm text-ink-faint">相当</span>
            </div>
            {sourceId === targetId && (
              <p className="mt-1 text-xs text-amber-ink">同一薬剤が選択されています。</p>
            )}
          </div>
        ) : (
          <div className="rounded-md bg-bg-subtle px-4 py-3 text-sm text-ink-faint">
            薬剤と用量を入力すると換算結果が表示されます。
          </div>
        )}
      </div>

      {/* Equivalency table toggle */}
      <button
        type="button"
        onClick={() => setShowTable((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-line px-4 py-3 text-left text-sm font-medium text-teal-ink"
      >
        等価換算表（ヒドロコルチゾン 20 mg 相当）
        <span className="text-ink-faint">{showTable ? "－" : "＋"}</span>
      </button>

      {showTable && (
        <div className="mt-2 overflow-x-auto rounded-md border border-line">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-line bg-bg-subtle text-xs text-ink-faint">
                <th className="px-4 py-2 text-left">薬剤名</th>
                <th className="px-4 py-2 text-right">相当用量</th>
                <th className="px-4 py-2 text-right">力価比（HC=1）</th>
              </tr>
            </thead>
            <tbody>
              {EQUIVALENCY_TABLE.map((row, i) => (
                <tr key={i} className="border-b border-line last:border-0">
                  <td className="px-4 py-2 text-ink-soft">{row.drug}</td>
                  <td className="px-4 py-2 text-right tabular-nums text-ink">{row.dose}</td>
                  <td className="px-4 py-2 text-right text-ink-faint">{row.potency}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Steroid cover toggle */}
      <button
        type="button"
        onClick={() => setShowCover((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-line px-4 py-3 text-left text-sm font-medium text-teal-ink"
      >
        周術期ステロイドカバーの目安
        <span className="text-ink-faint">{showCover ? "－" : "＋"}</span>
      </button>

      {showCover && (
        <div className="mt-2 space-y-3">
          {STEROID_COVER.map((c) => (
            <div key={c.level} className="rounded-md border border-line px-4 py-3">
              <div className="flex flex-wrap items-baseline gap-2">
                <span className="font-medium text-teal-ink">{c.level}</span>
                <span className="text-xs text-ink-faint">{c.examples}</span>
              </div>
              <p className="mt-2 text-sm text-ink">
                ヒドロコルチゾン換算 <strong>{c.hcDose}</strong>
              </p>
              <p className="mt-0.5 text-xs text-ink-faint">他剤換算例: {c.alternatives}</p>
              <p className="mt-1 text-xs text-ink-soft">投与期間: {c.duration}</p>
              {c.note && (
                <p className="mt-1 text-xs text-amber-ink">{c.note}</p>
              )}
            </div>
          ))}

          <div className="rounded-md bg-amber-soft px-4 py-3 text-xs text-amber-ink space-y-1">
            <p>・ステロイドカバーの適応・用量は患者の基礎疾患・通常用量・手術侵襲の程度により個別に判断してください。</p>
            <p>・長期ステロイド使用患者（プレドニゾロン換算 5 mg/日以上を1か月以上）では視床下部-下垂体-副腎軸（HPA軸）抑制を考慮します。</p>
            <p>・術後は速やかに通常量に戻すことが推奨されます。</p>
          </div>
        </div>
      )}

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>
          本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
          実際の投与量は患者個別の状態を考慮して判断してください。
        </p>
      </footer>
    </div>
  );
}
