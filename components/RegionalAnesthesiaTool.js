"use client";

import { useMemo, useState } from "react";
import {
  DRUGS,
  CATEGORY_LABELS,
  DEEP_BLOCKS,
  SUPERFICIAL_BLOCKS,
} from "@/lib/drugData";
import {
  aggregateWashout,
  aggregateCatheterRestart,
  computeReadyDateTime,
  addHoursToDate,
  formatDateTime,
} from "@/lib/logic";

function StatusStamp({ status }) {
  const map = {
    "no-washout": { label: "休薬不要", className: "stamp-green" },
    "washout-required": { label: "要休薬", className: "stamp-amber" },
    individual: { label: "要個別判断", className: "stamp-gray" },
    none: { label: "未選択", className: "stamp-gray" },
  };
  const conf = map[status] || map.none;
  return <span className={`stamp ${conf.className}`}>{conf.label}</span>;
}

function DrugCard({ drug, input, onChangeInput }) {
  return (
    <div className="card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h3 className="font-heading text-lg text-ink">{drug.name}</h3>
          <p className="text-sm text-ink-soft">{drug.brand}</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-1 gap-1.5 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-ink-faint">作用機序</dt>
          <dd className="text-ink-soft">{drug.mechanism}</dd>
        </div>
        <div>
          <dt className="text-ink-faint">半減期</dt>
          <dd className="text-ink-soft">{drug.halfLifeText}</dd>
        </div>
      </dl>

      {drug.generalNote && (
        <p className="mt-3 rounded-md bg-amber-soft px-3 py-2 text-xs text-amber-ink">
          参考値: {drug.generalNote}
        </p>
      )}

      {drug.specialInput === "dabigatran-renal" && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-ink-faint">腎機能（CrCl）</p>
          <div className="flex gap-2">
            {[
              { key: "normal", label: "CrCl ≥ 60" },
              { key: "low", label: "30 < CrCl < 60" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChangeInput({ renal: opt.key })}
                className={`pill-toggle ${
                  (input.renal || "normal") === opt.key ? "pill-toggle-active" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {drug.specialInput === "heparin-route" && (
        <div className="mt-3">
          <p className="mb-1 text-xs font-medium text-ink-faint">投与経路</p>
          <div className="flex gap-2">
            {[
              { key: "iv", label: "静脈内投与" },
              { key: "sc", label: "皮下投与" },
            ].map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => onChangeInput({ route: opt.key })}
                className={`pill-toggle ${
                  (input.route || "iv") === opt.key ? "pill-toggle-active" : ""
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3">
        <label className="mb-1 block text-xs font-medium text-ink-faint">
          最終服用（投与）日時（任意）
        </label>
        <input
          type="datetime-local"
          value={input.lastDoseTime || ""}
          onChange={(e) => onChangeInput({ lastDoseTime: e.target.value })}
          className="w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
        />
      </div>

      <div className="mt-4 border-t border-line pt-3 text-xs text-ink-faint">
        <p>
          単独使用時の目安 ―
          中リスク群（脊髄くも膜下麻酔・硬膜外麻酔・深部ブロック）:{" "}
          <span className="text-ink-soft">
            {drug.specialInput === "heparin-route"
              ? drug.washoutByRoute[input.route || "iv"].display
              : drug.specialInput === "dabigatran-renal"
              ? drug.washoutMidByRenal[input.renal || "normal"].display
              : drug.washoutMid?.display}
          </span>
        </p>
        <p className="mt-1">
          低リスク群（浅在性ブロック）:{" "}
          <span className="text-ink-soft">
            {drug.specialInput === "heparin-route"
              ? drug.washoutByRoute[input.route || "iv"].display
              : drug.washoutLow?.display}
          </span>
        </p>
        <p className="mt-1">
          硬膜外カテーテル抜去後再開:{" "}
          <span className="text-ink-soft">{drug.catheterRestart.display}</span>
        </p>
      </div>
    </div>
  );
}

function NoteList({ resolved }) {
  const notes = resolved
    .map((r) => ({ name: r.drug.name, note: r.washout?.note }))
    .filter((n) => n.note);
  if (notes.length === 0) return null;
  return (
    <ul className="mt-2 space-y-1 text-xs text-ink-faint">
      {notes.map((n) => (
        <li key={n.name}>
          ・{n.name}: {n.note}
        </li>
      ))}
    </ul>
  );
}

function WashoutResultCard({ title, description, agg, lastDoseHint }) {
  const ready =
    agg.status === "washout-required" || agg.status === "no-washout"
      ? computeReadyDateTime(agg.resolved)
      : null;

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg text-ink">{title}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{description}</p>
        </div>
        <StatusStamp status={agg.status} />
      </div>

      {agg.status === "none" && (
        <p className="mt-3 text-sm text-ink-faint">薬剤が選択されていません。</p>
      )}

      {agg.status === "individual" && (
        <div className="mt-3 text-sm">
          <p className="text-ink-soft">
            次の薬剤はガイドライン上明確な休薬基準がないため、機械的な日数計算を行わず
            <strong className="text-amber-ink">要個別判断</strong>としています。
          </p>
          <ul className="mt-1 list-inside list-disc text-ink-faint">
            {agg.tbdDrugs.map((d) => (
              <li key={d.id}>
                {d.name}（{d.washoutMid?.display || d.washoutLow?.display}）
              </li>
            ))}
          </ul>
        </div>
      )}

      {(agg.status === "no-washout" || agg.status === "washout-required") && (
        <div className="mt-3 text-sm">
          <p className="text-ink-soft">
            採用基準:{" "}
            <strong className="text-ink">
              {agg.maxHours > 0 ? `${agg.maxHours} 時間` : "休薬不要"}
            </strong>
          </p>
          {agg.maxHours > 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              律速薬剤（最長基準を採用）:{" "}
              {agg.rateLimiting.map((r) => r.drug.name).join("、")}
            </p>
          )}
          <NoteList resolved={agg.resolved} />

          {agg.maxHours > 0 && (
            <div className="mt-3 rounded-md bg-teal-soft px-3 py-2 text-sm">
              {ready?.computable ? (
                ready.readyAt ? (
                  <p className="text-teal-ink">
                    施行可能日時（推定）:{" "}
                    <strong>{formatDateTime(ready.readyAt)}</strong>
                  </p>
                ) : (
                  <p className="text-teal-ink">休薬不要のため施行可能です。</p>
                )
              ) : (
                <p className="text-ink-soft">
                  施行可能日時を計算するには、次の薬剤の最終服用日時を入力してください:{" "}
                  {ready.missing.join("、")}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function CatheterRestartCard({ agg, pullTime, onChangePullTime }) {
  let readyAt = null;
  if (agg.status === "resolved" && agg.maxHours !== null) {
    readyAt = addHoursToDate(pullTime, agg.maxHours);
  }

  return (
    <div className="card">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-heading text-lg text-ink">
            硬膜外カテーテル抜去後の内服・投与再開
          </h3>
          <p className="mt-0.5 text-sm text-ink-soft">
            選択薬剤のうち最も再開が遅い基準を採用します。
          </p>
        </div>
        <StatusStamp
          status={
            agg.status === "none"
              ? "none"
              : agg.maxHours
              ? "washout-required"
              : "no-washout"
          }
        />
      </div>

      {agg.status === "none" ? (
        <p className="mt-3 text-sm text-ink-faint">薬剤が選択されていません。</p>
      ) : (
        <div className="mt-3 text-sm">
          <p className="text-ink-soft">
            採用基準:{" "}
            <strong className="text-ink">
              {agg.maxHours !== null ? `抜去後 ${agg.maxHours} 時間` : "—"}
            </strong>
          </p>
          {agg.maxHours !== null && agg.rateLimiting.length > 0 && (
            <p className="mt-1 text-xs text-ink-faint">
              律速薬剤: {agg.rateLimiting.map((r) => r.drug.name).join("、")}
            </p>
          )}
          {agg.ambiguous.length > 0 && (
            <p className="mt-2 rounded-md bg-amber-soft px-3 py-2 text-xs text-amber-ink">
              次の薬剤は「抜去後より（具体的な時間の定めなし）」とされており、止血状況等を踏まえた個別判断が必要です:{" "}
              {agg.ambiguous.map((r) => r.drug.name).join("、")}
            </p>
          )}

          <div className="mt-3">
            <label className="mb-1 block text-xs font-medium text-ink-faint">
              硬膜外カテーテル抜去日時（任意）
            </label>
            <input
              type="datetime-local"
              value={pullTime}
              onChange={(e) => onChangePullTime(e.target.value)}
              className="w-full max-w-xs rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
            />
          </div>

          {agg.maxHours !== null && (
            <div className="mt-3 rounded-md bg-teal-soft px-3 py-2 text-sm">
              {pullTime ? (
                readyAt && (
                  <p className="text-teal-ink">
                    再開可能日時（推定）: <strong>{formatDateTime(readyAt)}</strong>
                  </p>
                )
              ) : (
                <p className="text-ink-soft">
                  抜去日時を入力すると再開可能日時を自動計算します。
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function BlockReferenceTable() {
  const [open, setOpen] = useState(false);
  return (
    <div className="card">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="font-heading text-lg text-ink">
          末梢神経ブロック 深部／浅在性 一覧表
        </h3>
        <span className="text-ink-faint">{open ? "－" : "＋"}</span>
      </button>
      {open && (
        <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="mb-2 text-sm font-medium text-teal-ink">
              深部神経ブロック（中リスク群と同等）
            </p>
            <ul className="space-y-1 text-sm text-ink-soft">
              {DEEP_BLOCKS.map((b) => (
                <li key={b} className="rounded bg-bg-subtle px-2 py-1">
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="mb-2 text-sm font-medium text-amber-ink">
              浅在性（体表面）神経ブロック（低リスク群）
            </p>
            <ul className="space-y-1 text-sm text-ink-soft">
              {SUPERFICIAL_BLOCKS.map((b) => (
                <li key={b} className="rounded bg-bg-subtle px-2 py-1">
                  {b}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

export default function RegionalAnesthesiaTool() {
  const [selectedIds, setSelectedIds] = useState([]);
  const [inputsById, setInputsById] = useState({});
  const [search, setSearch] = useState("");
  const [pullTime, setPullTime] = useState("");

  const filteredDrugs = useMemo(() => {
    if (!search.trim()) return DRUGS;
    const q = search.trim().toLowerCase();
    return DRUGS.filter(
      (d) =>
        d.name.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q)
    );
  }, [search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const d of filteredDrugs) {
      groups[d.category] = groups[d.category] || [];
      groups[d.category].push(d);
    }
    return groups;
  }, [filteredDrugs]);

  const selectedDrugs = useMemo(
    () => DRUGS.filter((d) => selectedIds.includes(d.id)),
    [selectedIds]
  );

  const toggleDrug = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const updateInput = (id, patch) => {
    setInputsById((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const hasAnyInput =
    selectedIds.length > 0 ||
    pullTime !== "" ||
    Object.values(inputsById).some(
      (v) => v && Object.keys(v).length > 0 && Object.values(v).some(Boolean)
    );

  const clearAll = () => {
    setSelectedIds([]);
    setInputsById({});
    setSearch("");
    setPullTime("");
  };

  const midAgg = useMemo(
    () => aggregateWashout(selectedDrugs, inputsById, "mid"),
    [selectedDrugs, inputsById]
  );
  const lowAgg = useMemo(
    () => aggregateWashout(selectedDrugs, inputsById, "low"),
    [selectedDrugs, inputsById]
  );
  const catheterAgg = useMemo(
    () => aggregateCatheterRestart(selectedDrugs),
    [selectedDrugs]
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">
          抗血栓薬服用患者の区域麻酔・神経ブロック 判定ツール
        </h1>
        <div className="mt-3 rounded-md border border-teal-deep/30 bg-teal-soft px-4 py-3 text-sm text-teal-ink">
          出典:「抗血栓療法中の区域麻酔・神経ブロックガイドライン」日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会
          合同（2016年9月）表5〜7に基づく
        </div>
        <div className="mt-2 space-y-1 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          <p>
            ・血小板減少や出血性素因等がある場合は出血リスク区分が上がりますが、本ツールはそれに対応していません。
          </p>
          <p>
            ・ガイドライン本表に記載のない薬剤については、同種同効薬の基準を準用した参考値である旨を各カードに明記しています。
          </p>
          <p>
            ・最終的な臨床判断は、必ず最新版ガイドライン・各施設のプロトコル・主治医・麻酔科医の判断によってください。
          </p>
        </div>
      </header>

      <section className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-heading text-xl text-ink">薬剤選択</h2>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-teal-deep px-2.5 py-0.5 text-xs font-medium text-white">
              {selectedIds.length} 件選択中
            </span>
            <button
              type="button"
              onClick={clearAll}
              disabled={!hasAnyInput}
              className={`rounded-md px-3 py-1.5 text-xs font-medium ${
                hasAnyInput
                  ? "bg-ink text-white hover:bg-ink-soft"
                  : "cursor-not-allowed bg-bg-subtle text-ink-faint"
              }`}
            >
              すべてクリア
            </button>
          </div>
        </div>

        <input
          type="text"
          placeholder="薬剤名・商品名で検索"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-md border border-line bg-white px-3 py-2 text-sm text-ink focus:border-teal-deep focus:outline-none focus:ring-1 focus:ring-teal-deep"
        />

        {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
          <div key={cat} className="mt-4">
            <p className="mb-2 text-sm font-medium text-ink-faint">{label}</p>
            <div className="flex flex-wrap gap-2">
              {(grouped[cat] || []).map((d) => (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => toggleDrug(d.id)}
                  className={`chip ${
                    selectedIds.includes(d.id) ? "chip-active" : ""
                  }`}
                >
                  {d.name}
                </button>
              ))}
              {(grouped[cat] || []).length === 0 && (
                <p className="text-xs text-ink-faint">該当する薬剤がありません。</p>
              )}
            </div>
          </div>
        ))}
      </section>

      {selectedDrugs.length > 0 && (
        <section className="mt-6">
          <h2 className="font-heading text-xl text-ink">選択中の薬剤</h2>
          <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {selectedDrugs.map((d) => (
              <DrugCard
                key={d.id}
                drug={d}
                input={inputsById[d.id] || {}}
                onChangeInput={(patch) => updateInput(d.id, patch)}
              />
            ))}
          </div>
        </section>
      )}

      {selectedDrugs.length >= 2 && (
        <div className="mt-6 rounded-md border border-amber-deep/40 bg-amber-soft px-4 py-3 text-sm text-amber-ink">
          複数の薬剤が選択されています。併用により出血リスクが単剤投与時より高まる可能性があります。本ツールは各薬剤の基準のうち
          <strong>最も長い期間を機械的に採用</strong>しているのみであり、併用時の安全性そのものを保証するものではありません。専門科（麻酔科・循環器科等）への相談を推奨します。
        </div>
      )}

      <section className="mt-6 space-y-4">
        <h2 className="font-heading text-xl text-ink">判定結果</h2>

        <WashoutResultCard
          title="① 脊髄くも膜下麻酔・硬膜外麻酔"
          description="中リスク群の休薬基準を使用します。"
          agg={midAgg}
        />

        <CatheterRestartCard
          agg={catheterAgg}
          pullTime={pullTime}
          onChangePullTime={setPullTime}
        />

        <WashoutResultCard
          title="③ 末梢神経ブロック（深部）"
          description="中リスク群と同じ休薬基準を使用します。"
          agg={midAgg}
        />

        <WashoutResultCard
          title="④ 末梢神経ブロック（浅在性）"
          description="低リスク群の休薬基準を使用します。"
          agg={lowAgg}
        />
      </section>

      <section className="mt-6">
        <BlockReferenceTable />
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>
          出典:「抗血栓療法中の区域麻酔・神経ブロックガイドライン」日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会
          合同（2016年9月）
        </p>
        <p className="mt-1">
          本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
        </p>
      </footer>
    </div>
  );
}
