"use client";

import { useState } from "react";
import {
  LIPID_EMULSION_REGIMEN,
  INITIAL_RESPONSE_STEPS,
  SEVERE_CASE_STEPS,
  PRECAUTIONS,
  ALTERNATIVE_TREATMENTS,
  calcBolusVolumeMl,
  calcInfusionRate,
  calcMaxTotalVolumeMl,
  calcTypicalEffectiveVolumeMl,
} from "@/lib/lastData";

function LipidEmulsionCalculator({ weight }) {
  const bolus = calcBolusVolumeMl(weight);
  const initialRate = calcInfusionRate(weight, LIPID_EMULSION_REGIMEN.initialInfusionMlPerKgMin);
  const increasedRate = calcInfusionRate(
    weight,
    LIPID_EMULSION_REGIMEN.increasedInfusionMlPerKgMin
  );
  const typicalMax = calcTypicalEffectiveVolumeMl(weight);
  const maxTotal = calcMaxTotalVolumeMl(weight);

  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">
        脂肪乳剤（20%イントラリポス®）投与法
      </h2>
      <p className="mt-1 text-xs text-ink-faint">
        出典: 日本麻酔科学会「局所麻酔薬中毒への対応プラクティカルガイド」（2017年6月制定）Ⅳ章C項
      </p>

      {weight > 0 ? (
        <ol className="mt-4 space-y-3 text-sm">
          <li className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">① 初回ボーラス＋持続投与開始</p>
            <p className="mt-1 text-ink-soft">
              <strong>{bolus} mL</strong>（1.5 mL/kg）を約1分かけて静注
            </p>
            <p className="mt-1 text-ink-soft">
              続けて持続投与開始: <strong>{initialRate.mlPerHr} mL/hr</strong>
              （{initialRate.mlPerMin} mL/min ＝ 0.25 mL/kg/min）
            </p>
          </li>
          <li className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">
              ② 5分後に循環の改善が得られなければ
            </p>
            <p className="mt-1 text-ink-soft">
              再度 <strong>{bolus} mL</strong> をボーラス投与し、持続投与速度を2倍の{" "}
              <strong>{increasedRate.mlPerHr} mL/hr</strong>
              （{increasedRate.mlPerMin} mL/min ＝ 0.5 mL/kg/min）に上昇
            </p>
          </li>
          <li className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">③ さらに5分後も改善なければ</p>
            <p className="mt-1 text-ink-soft">
              再度 <strong>{bolus} mL</strong> をボーラス投与（ボーラス投与は合計3回が限度）
            </p>
          </li>
          <li className="rounded-md bg-teal-soft px-3 py-3">
            <p className="font-medium text-teal-ink">④ 循環が回復・安定した後</p>
            <p className="mt-1 text-ink-soft">
              さらに{LIPID_EMULSION_REGIMEN.continueAfterStableMinutes}
              分間は持続投与を継続
            </p>
          </li>
        </ol>
      ) : (
        <p className="mt-4 text-sm text-ink-faint">体重を入力すると投与量が表示されます。</p>
      )}

      <div className="mt-4 rounded-md bg-amber-soft px-3 py-3 text-xs text-amber-ink">
        <p>
          多くの報告で総投与量
          <strong>10 mL/kg</strong>
          {weight > 0 && <>（{typicalMax} mL）</>}
          以下で蘇生効果が報告されており、最大投与量の目安は
          <strong> 12 mL/kg</strong>
          {weight > 0 && <>（{maxTotal} mL）</>}
          です。
        </p>
        <p className="mt-1">
          動物実験から計算されたヒトでの脂肪乳剤致死量は67 mL/kgと報告されています。
        </p>
      </div>
    </div>
  );
}

function StepList({ title, steps, badgeClass }) {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">{title}</h2>
      <ol className="mt-3 space-y-2 text-sm">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-2">
            <span
              className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold ${badgeClass}`}
            >
              {i + 1}
            </span>
            <span className="text-ink-soft">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function AlternativeTreatmentsTable() {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">脂肪乳剤以外の有効な薬剤・治療</h2>
      <div className="mt-3 space-y-3">
        {ALTERNATIVE_TREATMENTS.map((t) => (
          <div key={t.category} className="rounded-md border border-line px-3 py-2.5">
            <p className="text-sm font-medium text-teal-ink">{t.category}</p>
            <p className="mt-0.5 text-sm text-ink">{t.drugs}</p>
            <p className="mt-1 text-xs text-ink-faint">{t.note}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function PrecautionsList() {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">注意点</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {PRECAUTIONS.map((p, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-amber-ink">・</span>
            <span className="text-ink-soft">{p}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function LastToxicity() {
  const [weightInput, setWeightInput] = useState("");
  const weight = parseFloat(weightInput);
  const validWeight = !isNaN(weight) && weight > 0 ? weight : 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">
          局所麻酔薬中毒（LAST）への対応
        </h1>
        <div className="mt-3 rounded-md border border-teal-deep/30 bg-teal-soft px-4 py-3 text-sm text-teal-ink">
          出典:「局所麻酔薬中毒への対応プラクティカルガイド」公益社団法人日本麻酔科学会（2017年6月制定）
        </div>
        <div className="mt-2 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・本ツールは上記プラクティカルガイドに基づく参考値です。患者の臨床状態・施設のプロトコルに応じて、指示医の判断を優先してください。
          </p>
          <p>
            ・このガイドは標準化や法的責任の判断を目的としたものではなく、記載内容に沿った診療が予後を保証するものではないと明記されています。
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
        <LipidEmulsionCalculator weight={validWeight} />
      </section>

      <section className="mt-6">
        <StepList
          title="初期対応（局所麻酔薬中毒が疑われた場合）"
          steps={INITIAL_RESPONSE_STEPS}
          badgeClass="bg-teal-soft text-teal-ink"
        />
      </section>

      <section className="mt-6">
        <StepList
          title="重度の低血圧・不整脈を伴う場合"
          steps={SEVERE_CASE_STEPS}
          badgeClass="bg-amber-soft text-amber-ink"
        />
      </section>

      <section className="mt-6">
        <AlternativeTreatmentsTable />
      </section>

      <section className="mt-6">
        <PrecautionsList />
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>
          出典:「局所麻酔薬中毒への対応プラクティカルガイド」公益社団法人日本麻酔科学会（2017年6月制定）
        </p>
        <p className="mt-1">
          本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
        </p>
      </footer>
    </div>
  );
}
