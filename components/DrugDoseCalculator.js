"use client";

import { useState } from "react";
import {
  VENTRICULAR_ANTIARRHYTHMICS,
  SUPRAVENTRICULAR_ANTIARRHYTHMICS,
  CONTINUOUS_INFUSION_DRUGS,
  FIXED_RATE_DRUGS,
  calcInfusionRate,
  calcBolusRange,
} from "@/lib/drugDoseData";

function BolusDrugCard({ drug, weight }) {
  const result = drug.fixed ? null : calcBolusRange(drug, weight);
  return (
    <div className="card">
      <h3 className="font-heading text-lg text-ink">{drug.name}</h3>
      <p className="text-sm text-ink-soft">{drug.brand}</p>

      {drug.fixed ? (
        <div className="mt-3 rounded-md bg-teal-soft px-3 py-2 text-sm text-teal-ink">
          <p className="font-medium">{drug.note}</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-ink-soft">
            {drug.regimenSteps.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      ) : (
        <>
          <p className="mt-2 text-xs text-ink-faint">
            濃度: {drug.concentration} ／ 用量: {drug.doseLow === drug.doseHigh
              ? `${drug.doseLow} ${drug.doseUnit}`
              : `${drug.doseLow}〜${drug.doseHigh} ${drug.doseUnit}`}
            {drug.infusionMinutes ? `（${drug.infusionMinutes}分で投与）` : ""}
          </p>
          <div className="mt-3 rounded-md bg-teal-soft px-3 py-2 text-sm text-teal-ink">
            {weight > 0 ? (
              <p>
                投与量:{" "}
                <strong>
                  {drug.doseLow === drug.doseHigh
                    ? `${result.mgLow} mg（${result.mlLow} mL）`
                    : `${result.mgLow}〜${result.mgHigh} mg（${result.mlLow}〜${result.mlHigh} mL）`}
                </strong>
              </p>
            ) : (
              <p className="text-ink-soft">体重を入力すると投与量が表示されます。</p>
            )}
          </div>
          {drug.note && <p className="mt-2 text-xs text-ink-faint">{drug.note}</p>}
        </>
      )}
    </div>
  );
}

function InfusionDrugCard({ drug, weight }) {
  return (
    <div className="card">
      <h3 className="font-heading text-lg text-ink">{drug.brand}</h3>
      {drug.generic && <p className="text-sm text-ink-soft">{drug.generic}</p>}
      <p className="mt-2 text-xs text-ink-faint">希釈方法: {drug.dilution}</p>

      <div className="mt-3 space-y-1.5">
        {drug.steps.map((step) => {
          const rate = weight > 0 ? calcInfusionRate(drug, step, weight) : null;
          return (
            <div
              key={step.label}
              className="flex items-center justify-between rounded-md bg-teal-soft px-3 py-2 text-sm"
            >
              <span className="text-ink-soft">{step.label}</span>
              <strong className="text-teal-ink">
                {rate !== null ? `${rate} mL/hr` : "体重を入力"}
              </strong>
            </div>
          );
        })}
      </div>
      {drug.note && <p className="mt-2 text-xs text-ink-faint">{drug.note}</p>}
    </div>
  );
}

function FixedRateDrugCard({ drug }) {
  return (
    <div className="card">
      <h3 className="font-heading text-lg text-ink">{drug.brand}</h3>
      <p className="text-sm text-ink-soft">{drug.generic}</p>
      <p className="mt-2 text-xs text-ink-faint">希釈方法: {drug.dilution}</p>
      <div className="mt-3 space-y-1.5">
        {drug.regimens.map((r) => (
          <div
            key={r.label}
            className="flex items-center justify-between rounded-md bg-amber-soft px-3 py-2 text-sm"
          >
            <span className="text-ink-soft">{r.label}</span>
            <strong className="text-amber-ink">{r.rate}</strong>
          </div>
        ))}
      </div>
      <p className="mt-2 text-xs text-ink-faint">体重に関わらず一定の速度で運用します。</p>
    </div>
  );
}

export default function DrugDoseCalculator() {
  const [weightInput, setWeightInput] = useState("");
  const weight = parseFloat(weightInput);
  const validWeight = !isNaN(weight) && weight > 0 ? weight : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">薬剤投与量計算</h1>
        <p className="mt-2 text-sm text-ink-soft">
          体重を入力すると、抗不整脈薬・持続投与薬（カテコラミン等）の希釈方法と投与量（mL/hr等）を表示します。
        </p>
        <div className="mt-3 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・本計算は標準的な希釈方法・基準投与量に基づく参考値です。実際の指示量・滴定は患者の臨床状態と指示医の判断によってください。
          </p>
          <p>・腎機能・肝機能障害等がある場合は投与量の調整が必要になることがあります。</p>
        </div>
      </header>

      <section className="card">
        <label className="mb-1 block text-sm font-medium text-ink-faint">体重（kg）</label>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          placeholder="例: 55"
          value={weightInput}
          onChange={(e) => setWeightInput(e.target.value)}
          className="w-full max-w-xs rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
        />
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-xl text-ink">抗不整脈薬</h2>

        <h3 className="mt-3 text-sm font-medium text-ink-faint">心室性</h3>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {VENTRICULAR_ANTIARRHYTHMICS.map((d) => (
            <BolusDrugCard key={d.id} drug={d} weight={validWeight} />
          ))}
        </div>

        <h3 className="mt-5 text-sm font-medium text-ink-faint">上室性</h3>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {SUPRAVENTRICULAR_ANTIARRHYTHMICS.map((d) => (
            <BolusDrugCard key={d.id} drug={d} weight={validWeight} />
          ))}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="font-heading text-xl text-ink">持続投与薬（カテコラミン等）</h2>
        <div className="mt-2 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {CONTINUOUS_INFUSION_DRUGS.map((d) => (
            <InfusionDrugCard key={d.id} drug={d} weight={validWeight} />
          ))}
          {FIXED_RATE_DRUGS.map((d) => (
            <FixedRateDrugCard key={d.id} drug={d} />
          ))}
        </div>
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。</p>
      </footer>
    </div>
  );
}
