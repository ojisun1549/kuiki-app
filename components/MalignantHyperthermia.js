"use client";

import { useState } from "react";
import {
  DANTROLENE,
  COOLING_SALINE,
  SUSPECTED_SYMPTOMS,
  TREATMENT_STEPS_INTRAOP,
  PMH_NOTES,
  PRECAUTIONS,
  calcDantroleneDose,
  calcCoolingSalineMl,
  calcUrineTargetMlPerHr,
} from "@/lib/mhData";

function DantroleneCalculator({ weight }) {
  const initialMin = calcDantroleneDose(weight, DANTROLENE.initialDoseMinMgPerKg);
  const initialRecommended = calcDantroleneDose(weight, DANTROLENE.initialDoseRecommendedMgPerKg);
  const labelMax = calcDantroleneDose(weight, DANTROLENE.labelMaxMgPerKg);
  const overseasMax = calcDantroleneDose(weight, DANTROLENE.overseasMaxMgPerKg);
  const saline = calcCoolingSalineMl(weight);
  const urineTarget = calcUrineTargetMlPerHr(weight);

  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">ダントロレン投与量計算</h2>
      <p className="mt-1 text-xs text-ink-faint">
        1瓶{DANTROLENE.vialMg}mgあたり注射用蒸留水{DANTROLENE.diluentMlPerVial}
        mLで透明になるまで震盪溶解
      </p>

      {weight > 0 ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">
              初回投与（{DANTROLENE.infusionMinutes}分程度で投与）
            </p>
            <p className="mt-1 text-ink-soft">
              最低 1.0 mg/kg: <strong>{initialMin.mg} mg</strong>（{initialMin.vials}
              瓶、溶解液 {initialMin.diluentMl} mL）
            </p>
            <p className="mt-1 text-ink-soft">
              推奨 2.0 mg/kg: <strong>{initialRecommended.mg} mg</strong>（
              {initialRecommended.vials}瓶、溶解液 {initialRecommended.diluentMl} mL）
            </p>
          </div>

          <div className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">追加投与</p>
            <p className="mt-1 text-ink-soft">
              {DANTROLENE.reassessIntervalMinutes}
              分おとに効果を再評価し、改善なければ初期投与量と同量を追加投与（症状により適宜増減）
            </p>
          </div>

          <div className="rounded-md bg-amber-soft px-3 py-3">
            <p className="font-medium text-amber-ink">最大投与量</p>
            <p className="mt-1 text-ink-soft">
              添付文書上の最大: 7.0 mg/kg = <strong>{labelMax.mg} mg</strong>（
              {labelMax.vials}瓶、溶解液 {labelMax.diluentMl} mL）
            </p>
            <p className="mt-1 text-ink-soft">
              欧米ガイドライン（効果がある場合）: 10 mg/kg超 ≈{" "}
              <strong>{overseasMax.mg} mg</strong>（{overseasMax.vials}瓶、溶解液{" "}
              {overseasMax.diluentMl} mL）
            </p>
          </div>

          <div className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">その他の体重依存項目</p>
            <p className="mt-1 text-ink-soft">
              冷却生理食塩水（最大用量）: {COOLING_SALINE.minMlPerKg}〜
              {COOLING_SALINE.maxMlPerKg} mL/kg ＝{" "}
              <strong>
                {saline.min}〜{saline.max} mL
              </strong>
            </p>
            <p className="mt-1 text-ink-soft">
              強制利尿の目標尿量: 1.0 mL/kg/hr ＝ <strong>{urineTarget} mL/hr</strong>
            </p>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-ink-faint">体重を入力すると投与量が表示されます。</p>
      )}

      <p className="mt-3 text-xs text-ink-faint">
        多くの施設・手術室内には多量のダントロレン備蓄がない可能性があるため、総投与量で最大7.0
        mg/kgの量を確保する手段を講じることが推奨されています。
      </p>
    </div>
  );
}

function SuspectedSymptomsCard() {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">MHを疑う症状</h2>
      <ul className="mt-3 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
        {SUSPECTED_SYMPTOMS.map((s) => (
          <li key={s} className="flex items-start gap-2 rounded-md bg-amber-soft px-3 py-2">
            <span className="text-amber-ink">□</span>
            <span className="text-ink-soft">{s}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-ink-faint">
        分時換気量を増加させてもなお上昇するETCO2、原因不明の頻脈、高体温、筋強直などがあれば、ダントロレン投与の適応です。
      </p>
    </div>
  );
}

function TreatmentChart() {
  const [showPmh, setShowPmh] = useState(false);

  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">治療チャート（MHの治療手順）</h2>
      <p className="mt-1 text-xs text-ink-faint">出典: ガイドライン図2（全身麻酔中に発症したMH）</p>

      <div className="mt-4 space-y-3">
        {TREATMENT_STEPS_INTRAOP.map((step, i) => (
          <div key={step.category} className="rounded-md border border-line px-3 py-3">
            <p className="text-sm font-medium text-teal-ink">{step.category}</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {step.items.map((item, j) => (
                <li key={j} className="flex gap-2">
                  <span className="text-ink-faint">□</span>
                  <span className="text-ink-soft">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowPmh((v) => !v)}
        className="mt-4 flex w-full items-center justify-between rounded-md border border-line px-3 py-2.5 text-left text-sm font-medium text-teal-ink"
      >
        術後悪性高熱症（PMH）の場合（図3）
        <span className="text-ink-faint">{showPmh ? "－" : "＋"}</span>
      </button>

      {showPmh && (
        <div className="mt-3 space-y-3">
          <p className="rounded-md bg-teal-soft px-3 py-2 text-sm text-teal-ink">
            {PMH_NOTES.timing}
          </p>

          <div className="rounded-md border border-line px-3 py-3">
            <p className="text-sm font-medium text-teal-ink">F. PMHを疑う症状</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {PMH_NOTES.suspectedSymptoms.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-ink-faint">□</span>
                  <span className="text-ink-soft">{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-md border border-line px-3 py-3">
            <p className="text-sm font-medium text-teal-ink">追加で実施する項目</p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {PMH_NOTES.additionalSteps.map((s) => (
                <li key={s} className="flex gap-2">
                  <span className="text-ink-faint">□</span>
                  <span className="text-ink-soft">{s}</span>
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-ink-faint">
              対症療法・ダントロレン投与・血液検査は図2のMH治療手順に準じます。
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function PrecautionsCard() {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">注意点</h2>
      <div className="mt-3 space-y-3">
        {PRECAUTIONS.map((p) => (
          <div key={p.title} className="rounded-md border border-line px-3 py-2.5">
            <p className="text-sm font-medium text-amber-ink">{p.title}</p>
            <p className="mt-1 text-xs text-ink-faint">{p.detail}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MalignantHyperthermia() {
  const [weightInput, setWeightInput] = useState("");
  const weight = parseFloat(weightInput);
  const validWeight = !isNaN(weight) && weight > 0 ? weight : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">悪性高熱症（MH）対応</h1>
        <div className="mt-3 rounded-md border border-teal-deep/30 bg-teal-soft px-4 py-3 text-sm text-teal-ink">
          出典:「悪性高熱症管理ガイドライン2025」公益社団法人 日本麻酔科学会（2025年3月改定）
        </div>
        <div className="mt-2 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・本ガイドラインは診療の標準化を意図したものではなく、記載内容に沿った診療が患者の予後を保証するものではないと明記されています。
          </p>
          <p>
            ・MHは確定診断を待たず、疑わしい症状があればダントロレン投与を開始することが推奨されています。
          </p>
        </div>
      </header>

      <section className="card">
        <label className="mb-1 block text-sm font-medium text-ink-faint">体重（kg）</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder="例: 60"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="w-full max-w-xs rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
        />
      </section>

      <section className="mt-6">
        <SuspectedSymptomsCard />
      </section>

      <section className="mt-6">
        <DantroleneCalculator weight={validWeight} />
      </section>

      <section className="mt-6">
        <TreatmentChart />
      </section>

      <section className="mt-6">
        <PrecautionsCard />
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>出典:「悪性高熱症管理ガイドライン2025」公益社団法人 日本麻酔科学会（2025年3月改定）</p>
        <p className="mt-1">
          本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
        </p>
      </footer>
    </div>
  );
}
