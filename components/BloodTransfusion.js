"use client";

import { useState } from "react";
import { BLOOD_COMPATIBILITY, BLOOD_TYPES } from "@/lib/bloodData";

export default function BloodTransfusion() {
  const [bloodType, setBloodType] = useState(null);
  const result = bloodType ? BLOOD_COMPATIBILITY[bloodType] : null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">輸血（血液型適合表）</h1>
        <p className="mt-2 text-sm text-ink-soft">
          患者の血液型を選択すると、使用可能なRBC（赤血球製剤）・FFP/PC（血漿・血小板製剤）を、自己型を優先した順に表示します。
        </p>
        <div className="mt-3 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          ・緊急輸血時の対応は各施設のマニュアル・輸血部門の判断を優先してください。本表はABO型のみに基づく参考情報であり、交差適合試験・Rh型等は別途確認が必要です。
        </div>
      </header>

      <section className="card">
        <p className="mb-2 text-sm font-medium text-ink-faint">患者の血液型</p>
        <div className="flex flex-wrap gap-2">
          {BLOOD_TYPES.map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setBloodType(type)}
              className={`chip ${bloodType === type ? "chip-active" : ""}`}
            >
              {type}型
            </button>
          ))}
        </div>
      </section>

      {result && (
        <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="card">
            <h2 className="font-heading text-lg text-ink">RBC（赤血球製剤）</h2>
            <ol className="mt-3 space-y-2">
              {result.rbc.map((t, i) => (
                <li
                  key={t}
                  className="flex items-center justify-between rounded-md bg-teal-soft px-3 py-2 text-sm"
                >
                  <span className="text-ink-soft">{i === 0 ? "第一選択" : `代替 ${i}`}</span>
                  <strong className="text-teal-ink">{t}型</strong>
                </li>
              ))}
            </ol>
          </div>

          <div className="card">
            <h2 className="font-heading text-lg text-ink">FFP / PC（血漿・血小板製剤）</h2>
            <ol className="mt-3 space-y-2">
              {result.plasma.map((t, i) => (
                <li
                  key={t}
                  className="flex items-center justify-between rounded-md bg-teal-soft px-3 py-2 text-sm"
                >
                  <span className="text-ink-soft">{i === 0 ? "第一選択" : `代替 ${i}`}</span>
                  <strong className="text-teal-ink">{t}型</strong>
                </li>
              ))}
            </ol>
          </div>
        </section>
      )}

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。</p>
      </footer>
    </div>
  );
}
