"use client";

import { useState } from "react";

const BLOOD_PRODUCTS = [
  { id: "rbc", label: "RBC", stepUnits: 2, mlPerUnit: 140 },
  { id: "ffp", label: "FFP", stepUnits: 2, mlPerUnit: 120 },
  { id: "pc", label: "PC", stepUnits: 10, mlPerUnit: 20 },
  { id: "cryo", label: "クリオ", stepUnits: 12, mlPerUnit: 15 },
];

function NumInput({ value, onChange, placeholder }) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min="0"
      placeholder={placeholder}
      value={value === 0 ? "" : value}
      onChange={(e) => {
        const n = parseInt(e.target.value, 10);
        onChange(isNaN(n) || n < 0 ? 0 : n);
      }}
      className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
    />
  );
}

export default function InOutBalance() {
  const [fluidMl, setFluidMl] = useState(0);
  const [bloodUnits, setBloodUnits] = useState({ rbc: 0, ffp: 0, pc: 0, cryo: 0 });
  const [salvageMl, setSalvageMl] = useState(0);
  const [suctionMl, setSuctionMl] = useState(0);
  const [gauzeG, setGauzeG] = useState(0);
  const [urineMl, setUrineMl] = useState(0);
  const [otherOutMl, setOtherOutMl] = useState(0);

  const bloodInMl = BLOOD_PRODUCTS.reduce((sum, p) => sum + bloodUnits[p.id] * p.mlPerUnit, 0);
  const totalIn = fluidMl + bloodInMl + salvageMl;

  // ガーゼ出血: 1g ≈ 1mL として換算
  const bleedingMl = suctionMl + gauzeG;
  const totalOut = bleedingMl + urineMl + otherOutMl;
  const balance = totalIn - totalOut;
  const isPositive = balance >= 0;

  function adjustBlood(id, delta) {
    setBloodUnits((v) => ({ ...v, [id]: Math.max(0, v[id] + delta) }));
  }

  function reset() {
    setFluidMl(0);
    setBloodUnits({ rbc: 0, ffp: 0, pc: 0, cryo: 0 });
    setSalvageMl(0);
    setSuctionMl(0);
    setGauzeG(0);
    setUrineMl(0);
    setOtherOutMl(0);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6 flex items-start justify-between">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">術中 In/Out バランス</h1>
        <button
          type="button"
          onClick={reset}
          className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-faint hover:bg-bg-subtle"
        >
          リセット
        </button>
      </header>

      {/* Balance summary */}
      <div
        className={`mb-6 rounded-lg border-2 px-5 py-4 ${
          isPositive ? "border-teal-deep/40 bg-teal-soft" : "border-amber-deep/40 bg-amber-soft"
        }`}
      >
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <span className="text-sm font-medium text-ink-soft">トータルバランス</span>
          <span
            className={`text-3xl font-bold tabular-nums ${
              isPositive ? "text-teal-ink" : "text-amber-ink"
            }`}
          >
            {isPositive ? "+" : ""}
            {balance.toLocaleString()} mL
          </span>
        </div>
        <div className="mt-2 flex flex-wrap gap-4 text-sm text-ink-faint">
          <span>IN 合計: {totalIn.toLocaleString()} mL</span>
          <span>OUT 合計: {totalOut.toLocaleString()} mL</span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* ── IN ── */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg text-teal-ink">
            IN{" "}
            <span className="text-base font-normal">({totalIn.toLocaleString()} mL)</span>
          </h2>

          {/* 輸液 */}
          <div className="card">
            <p className="mb-2 text-sm font-medium text-ink">
              輸液&ensp;
              <span className="font-normal text-ink-faint">{fluidMl.toLocaleString()} mL</span>
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[-1000, -100, +100, +1000].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setFluidMl((v) => Math.max(0, v + d))}
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-bg-subtle"
                >
                  {d > 0 ? "+" : ""}
                  {d}
                </button>
              ))}
            </div>
            <NumInput value={fluidMl} onChange={setFluidMl} placeholder="直接入力 (mL)" />
          </div>

          {/* 輸血 */}
          <div className="card">
            <p className="mb-3 text-sm font-medium text-ink">
              輸血&ensp;
              <span className="font-normal text-ink-faint">{bloodInMl.toLocaleString()} mL</span>
            </p>
            <div className="space-y-3">
              {BLOOD_PRODUCTS.map((p) => {
                const units = bloodUnits[p.id];
                return (
                  <div key={p.id}>
                    <div className="mb-1 flex items-baseline justify-between">
                      <span className="text-sm font-medium text-ink-soft">{p.label}</span>
                      <span className="text-sm text-ink-faint">
                        {units} 単位（{(units * p.mlPerUnit).toLocaleString()} mL）
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        type="button"
                        onClick={() => adjustBlood(p.id, -p.stepUnits)}
                        className="flex-1 rounded-md border border-line py-1.5 text-sm text-ink-soft hover:bg-bg-subtle"
                      >
                        −{p.stepUnits}単位
                      </button>
                      <button
                        type="button"
                        onClick={() => adjustBlood(p.id, p.stepUnits)}
                        className="flex-1 rounded-md border border-line py-1.5 text-sm text-ink-soft hover:bg-bg-subtle"
                      >
                        +{p.stepUnits}単位
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              RBC 1単位≈140 mL / FFP 1単位≈120 mL / PC 1単位≈20 mL / クリオ 1単位≈15 mL（概算）
            </p>
          </div>

          {/* 回収血 */}
          <div className="card">
            <p className="mb-2 text-sm font-medium text-ink">
              回収血&ensp;
              <span className="font-normal text-ink-faint">{salvageMl.toLocaleString()} mL</span>
            </p>
            <div className="mb-2 flex flex-wrap gap-1.5">
              {[-500, -100, +100, +500].map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setSalvageMl((v) => Math.max(0, v + d))}
                  className="rounded-md border border-line px-3 py-1.5 text-sm text-ink-soft hover:bg-bg-subtle"
                >
                  {d > 0 ? "+" : ""}
                  {d}
                </button>
              ))}
            </div>
            <NumInput value={salvageMl} onChange={setSalvageMl} placeholder="直接入力 (mL)" />
          </div>
        </div>

        {/* ── OUT ── */}
        <div className="space-y-4">
          <h2 className="font-heading text-lg text-amber-ink">
            OUT{" "}
            <span className="text-base font-normal">({totalOut.toLocaleString()} mL)</span>
          </h2>

          {/* 出血 */}
          <div className="card">
            <p className="mb-3 text-sm font-medium text-ink">
              出血&ensp;
              <span className="font-normal text-ink-faint">{bleedingMl.toLocaleString()} mL</span>
            </p>

            <p className="mb-1 text-xs text-ink-faint">吸引</p>
            <div className="mb-3">
              <NumInput value={suctionMl} onChange={setSuctionMl} placeholder="吸引量 (mL)" />
            </div>

            <p className="mb-1 text-xs text-ink-faint">ガーゼ（1 g ≈ 1 mL として換算）</p>
            <NumInput value={gauzeG} onChange={setGauzeG} placeholder="ガーゼ出血量 (g)" />
            {gauzeG > 0 && (
              <p className="mt-1 text-xs text-ink-faint">≈ {gauzeG.toLocaleString()} mL 相当</p>
            )}
          </div>

          {/* 尿量 */}
          <div className="card">
            <p className="mb-2 text-sm font-medium text-ink">
              尿量&ensp;
              <span className="font-normal text-ink-faint">{urineMl.toLocaleString()} mL</span>
            </p>
            <NumInput value={urineMl} onChange={setUrineMl} placeholder="尿量 (mL)" />
          </div>

          {/* その他 */}
          <div className="card">
            <p className="mb-2 text-sm font-medium text-ink">
              その他&ensp;
              <span className="font-normal text-ink-faint">{otherOutMl.toLocaleString()} mL</span>
            </p>
            <NumInput
              value={otherOutMl}
              onChange={setOtherOutMl}
              placeholder="その他の出量 (mL)"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
