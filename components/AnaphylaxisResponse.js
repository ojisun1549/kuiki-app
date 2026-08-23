"use client";

import { useState } from "react";

// 出典: 日本アレルギー学会「アナフィラキシーガイドライン2022」

const INITIAL_STEPS = [
  { id: "help", label: "人手を集める・救急カートの準備" },
  { id: "cause", label: "原因と思われる薬剤・ラテックス等の投与を中止" },
  { id: "position", label: "仰臥位・下肢挙上（嘔吐時は回復体位）" },
  { id: "o2", label: "高流量酸素投与（マスク 8〜10 L/分）" },
  { id: "epi", label: "アドレナリン筋注（最優先）" },
  { id: "iv", label: "静脈路確保・細胞外液の急速輸液" },
  { id: "monitor", label: "心電図・SpO2・血圧モニタリング" },
];

const DRUG_TABLE = [
  {
    category: "第一選択（最優先）",
    color: "amber",
    drugs: [
      {
        name: "アドレナリン（エピネフリン）",
        brand: "ボスミン注 1mg/mL",
        dose: "成人: 0.3〜0.5 mg（0.3〜0.5 mL）筋注（大腿外側）",
        pediatric: "小児: 0.01 mg/kg 筋注（最大 0.5 mg）",
        notes: "5〜15分ごとに反復投与可。血圧低下・心停止時はIV/IO（1:10,000希釈）。",
        urgent: true,
      },
    ],
  },
  {
    category: "輸液",
    color: "teal",
    drugs: [
      {
        name: "細胞外液（乳酸リンゲル液・生理食塩液）",
        brand: "",
        dose: "成人: 500〜1,000 mL を急速投与（5〜10分）、症状に応じて追加（最大 1〜2 L）",
        pediatric: "小児: 10〜20 mL/kg を急速投与",
        notes: "アドレナリンと並行して投与開始。",
        urgent: false,
      },
    ],
  },
  {
    category: "気管支拡張薬（気管支痙攣が持続する場合）",
    color: "teal",
    drugs: [
      {
        name: "サルブタモール（アルブテロール）吸入",
        brand: "サルタノールインヘラー",
        dose: "2〜4 パフ 吸入、20分ごとに反復可",
        pediatric: "",
        notes: "アドレナリン筋注後も喘鳴・気管支痙攣が残存する場合に追加。",
        urgent: false,
      },
      {
        name: "アミノフィリン",
        brand: "アミノフィリン注 250 mg",
        dose: "250 mg を 20〜30分かけて緩徐に静注（吸入薬が使用できない場合）",
        pediatric: "小児: 5〜6 mg/kg",
        notes: "テオフィリン製剤未投与の患者に。不整脈・低血圧に注意。",
        urgent: false,
      },
    ],
  },
  {
    category: "抗ヒスタミン薬（補助的・H1遮断）",
    color: "teal",
    drugs: [
      {
        name: "ジフェンヒドラミン",
        brand: "レスタミン注 30 mg/mL",
        dose: "25〜50 mg ゆっくり静注（または筋注）",
        pediatric: "小児: 1 mg/kg（最大 50 mg）",
        notes: "皮膚症状・蕁麻疹の緩和に有効。単独ではアナフィラキシーの生命維持に不十分。",
        urgent: false,
      },
      {
        name: "d-クロルフェニラミン",
        brand: "ポララミン注 5 mg/mL",
        dose: "5 mg 静注または筋注",
        pediatric: "小児: 0.05〜0.1 mg/kg",
        notes: "",
        urgent: false,
      },
    ],
  },
];

const STEROID_SECTION = {
  purpose: "二相性アナフィラキシー反応（初期症状消失後 8〜72 時間で再燃）の予防を目的として投与する。効果発現まで 4〜6 時間を要するため、急性期の第一選択薬にはならない。",
  drugs: [
    {
      name: "ヒドロコルチゾン",
      brand: "ソル・コーテフ / サクシゾン（コハク酸エステル型）",
      dose: "200 mg 静注",
      pediatric: "小児: 5〜10 mg/kg（最大 200 mg）",
      aspirin: "禁忌",
      note: "コハク酸エステル型のため、アスピリン喘息（NSAID過敏喘息）患者には禁忌。",
    },
    {
      name: "メチルプレドニゾロン",
      brand: "ソル・メドロール（コハク酸エステル型）",
      dose: "125 mg 静注",
      pediatric: "小児: 1〜2 mg/kg（最大 125 mg）",
      aspirin: "禁忌",
      note: "コハク酸エステル型のため、アスピリン喘息患者には禁忌。",
    },
    {
      name: "デキサメタゾン",
      brand: "デカドロン注 3.3 mg/mL（リン酸エステル型）",
      dose: "6.6〜9.9 mg 静注（2〜3 mL）",
      pediatric: "小児: 0.15 mg/kg（最大 10 mg）",
      aspirin: "安全",
      note: "リン酸エステル型のため、アスピリン喘息患者にも安全に使用可能。ヒドロコルチゾン 200 mg 相当（力価換算）。",
    },
    {
      name: "ベタメタゾン",
      brand: "リンデロン注 2 mg/mL・4 mg/mL（リン酸エステル型）",
      dose: "4〜8 mg 静注（2 mg/mL製剤なら 2〜4 mL）",
      pediatric: "小児: 0.1〜0.2 mg/kg",
      aspirin: "安全",
      note: "リン酸エステル型のため、アスピリン喘息患者にも安全。デキサメタゾンと同等の力価。",
    },
  ],
};

const ASPIRIN_ASTHMA_NOTE = [
  "アスピリン喘息（NSAID過敏喘息・AERD: Aspirin-Exacerbated Respiratory Disease）では、コハク酸エステル型ステロイドが気管支痙攣を誘発する危険がある。",
  "コハク酸エステル型（禁忌）: ヒドロコルチゾン（ソル・コーテフ・サクシゾン）、メチルプレドニゾロン（ソル・メドロール）",
  "リン酸エステル型（安全）: デキサメタゾン（デカドロン・オルガドロン）、ベタメタゾン（リンデロン）",
  "既往に「アスピリンや解熱鎮痛薬で喘息発作」「鼻ポリープ」「慢性副鼻腔炎」がある患者では術前に確認し、リン酸エステル型を選択する。",
];

const BLOOD_SAMPLING = [
  {
    timing: "直後",
    volume: "10 cc",
    items: [
      { tube: "紫", content: "CBC、血液像（保険）" },
      { tube: "青", content: "C3、C4、IgE（保険）" },
      { tube: "外注B", content: "ヒスタミン（3,400円 診療科払い）" },
    ],
    priority: true,
  },
  {
    timing: "1時間後",
    volume: "10 cc",
    items: [
      { tube: "紫", content: "CBC、血液像（保険）" },
      { tube: "青", content: "C3、C4、IgE（保険）" },
      { tube: "外注B", content: "トリプターゼ（8,000円 診療科払い）" },
    ],
    priority: true,
  },
  {
    timing: "3時間後",
    volume: "5 cc",
    items: [
      { tube: "紫", content: "CBC、血液像（保険）" },
      { tube: "青", content: "C3、C4、IgE（保険）" },
    ],
    priority: false,
  },
  {
    timing: "6時間後",
    volume: "5 cc",
    items: [
      { tube: "紫", content: "CBC、血液像（保険）" },
      { tube: "青", content: "C3、C4、IgE（保険）" },
    ],
    priority: false,
  },
  {
    timing: "24時間後",
    volume: "10 cc",
    items: [
      { tube: "紫", content: "CBC、血液像" },
      { tube: "青", content: "C3、C4、IgE（保険）" },
      { tube: "外注B", content: "トリプターゼ（8,000円 診療科払い）" },
    ],
    priority: false,
  },
];

const TUBE_COLORS = {
  紫: "bg-purple-100 text-purple-800 border-purple-300",
  青: "bg-blue-100 text-blue-800 border-blue-300",
  外注B: "bg-orange-100 text-orange-800 border-orange-300",
};

function CheckSection({ title, steps, checked, onToggle }) {
  return (
    <div className="card">
      <h2 className="font-heading text-lg text-ink">{title}</h2>
      <ul className="mt-3 space-y-2">
        {steps.map((s) => (
          <li key={s.id}>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={!!checked[s.id]}
                onChange={() => onToggle(s.id)}
                className="mt-0.5 h-4 w-4 rounded border-line accent-teal-deep"
              />
              <span className={`text-sm ${checked[s.id] ? "text-ink-faint line-through" : "text-ink-soft"}`}>
                {s.label}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function AnaphylaxisResponse() {
  const [checked, setChecked] = useState({});
  const toggle = (id) => setChecked((v) => ({ ...v, [id]: !v[id] }));
  const [showAspirin, setShowAspirin] = useState(false);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="font-heading text-2xl text-ink sm:text-3xl">アナフィラキシー対応</h1>
        <div className="mt-3 rounded-md border border-teal-deep/30 bg-teal-soft px-4 py-3 text-sm text-teal-ink">
          出典: 日本アレルギー学会「アナフィラキシーガイドライン2022」
        </div>
        <div className="mt-2 rounded-md border border-amber-deep/30 bg-amber-soft px-4 py-3 text-xs text-amber-ink">
          アドレナリン筋注が唯一の第一選択薬。抗ヒスタミン薬・ステロイドは補助療法であり、アドレナリンの代替にはならない。
        </div>
      </header>

      {/* 初期対応チェックリスト */}
      <CheckSection
        title="初期対応チェックリスト"
        steps={INITIAL_STEPS}
        checked={checked}
        onToggle={toggle}
      />

      {/* 薬物療法 */}
      <section className="mt-6 space-y-4">
        <h2 className="font-heading text-lg text-ink">薬物療法</h2>
        {DRUG_TABLE.map((cat) => (
          <div key={cat.category} className="card">
            <p className={`mb-3 text-sm font-medium ${cat.color === "amber" ? "text-amber-ink" : "text-teal-ink"}`}>
              {cat.category}
            </p>
            <div className="space-y-4">
              {cat.drugs.map((drug) => (
                <div
                  key={drug.name}
                  className={`rounded-md border px-3 py-3 ${
                    drug.urgent
                      ? "border-amber-deep/40 bg-amber-soft"
                      : "border-line bg-bg-subtle"
                  }`}
                >
                  <p className="text-sm font-medium text-ink">{drug.name}</p>
                  {drug.brand && (
                    <p className="mt-0.5 text-xs text-ink-faint">{drug.brand}</p>
                  )}
                  <p className="mt-1.5 text-sm text-ink-soft">{drug.dose}</p>
                  {drug.pediatric && (
                    <p className="mt-0.5 text-xs text-ink-faint">{drug.pediatric}</p>
                  )}
                  {drug.notes && (
                    <p className="mt-1.5 text-xs text-ink-faint border-t border-line pt-1.5">{drug.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* 二相性反応予防ステロイド */}
      <section className="mt-6">
        <div className="card">
          <h2 className="font-heading text-lg text-ink">二相性反応予防：ステロイド投与</h2>
          <p className="mt-2 text-xs text-ink-faint">{STEROID_SECTION.purpose}</p>

          <div className="mt-4 space-y-3">
            {STEROID_SECTION.drugs.map((drug) => (
              <div
                key={drug.name}
                className={`rounded-md border px-3 py-3 ${
                  drug.aspirin === "禁忌"
                    ? "border-amber-deep/30 bg-amber-soft"
                    : "border-teal-deep/30 bg-teal-soft"
                }`}
              >
                <div className="flex flex-wrap items-start justify-between gap-1">
                  <p className="text-sm font-medium text-ink">{drug.name}</p>
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      drug.aspirin === "禁忌"
                        ? "bg-amber-deep/10 text-amber-ink"
                        : "bg-teal-deep/10 text-teal-ink"
                    }`}
                  >
                    アスピリン喘息: {drug.aspirin}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-ink-faint">{drug.brand}</p>
                <p className="mt-1.5 text-sm font-medium text-ink-soft">{drug.dose}</p>
                {drug.pediatric && (
                  <p className="mt-0.5 text-xs text-ink-faint">{drug.pediatric}</p>
                )}
                <p className="mt-1.5 text-xs text-ink-faint border-t border-line/50 pt-1.5">{drug.note}</p>
              </div>
            ))}
          </div>

          {/* アスピリン喘息詳細 */}
          <button
            type="button"
            onClick={() => setShowAspirin((v) => !v)}
            className="mt-4 flex w-full items-center justify-between rounded-md border border-line px-3 py-2.5 text-left text-sm font-medium text-amber-ink"
          >
            アスピリン喘息（AERD）とステロイド選択の注意点
            <span className="text-ink-faint">{showAspirin ? "－" : "＋"}</span>
          </button>
          {showAspirin && (
            <div className="mt-2 rounded-md bg-amber-soft px-4 py-3 space-y-2">
              {ASPIRIN_ASTHMA_NOTE.map((note, i) => (
                <p key={i} className="text-xs text-amber-ink">・{note}</p>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 採血プロトコール */}
      <section className="mt-6">
        <div className="card">
          <h2 className="font-heading text-lg text-ink">院内採血プロトコール</h2>
          <p className="mt-1 text-xs text-ink-faint mb-4">
            ※当院プロトコール。最低限、直後と1時間後の採血を実施すること。
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-teal-deep/40 bg-teal-soft text-xs text-teal-ink">
                  <th className="px-3 py-2 text-left whitespace-nowrap">発症からの時間</th>
                  <th className="px-3 py-2 text-center whitespace-nowrap">採血量</th>
                  <th className="px-3 py-2 text-left">採血項目</th>
                </tr>
              </thead>
              <tbody>
                {BLOOD_SAMPLING.map((row) => (
                  <tr
                    key={row.timing}
                    className={`border-b border-line ${
                      row.priority ? "bg-amber-soft" : ""
                    }`}
                  >
                    <td className="px-3 py-3 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-ink">{row.timing}</span>
                        {row.priority && (
                          <span className="rounded-full bg-amber-deep/20 px-1.5 py-0.5 text-xs text-amber-ink font-medium">
                            最低限
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center text-ink-soft whitespace-nowrap">
                      {row.volume}
                    </td>
                    <td className="px-3 py-3">
                      <div className="space-y-1">
                        {row.items.map((item) => (
                          <div key={item.tube} className="flex items-start gap-2 flex-wrap">
                            <span
                              className={`rounded border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap ${
                                TUBE_COLORS[item.tube] ?? "bg-gray-100 text-gray-700 border-gray-300"
                              }`}
                            >
                              {item.tube}
                            </span>
                            <span className="text-xs text-ink-soft">{item.content}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* オーダー方法 */}
          <div className="mt-4 rounded-md border border-teal-deep/20 bg-teal-soft px-4 py-3 text-xs text-teal-ink space-y-1.5">
            <p className="font-medium text-sm text-teal-ink">オーダー方法</p>
            <p>・マルチセット → 新田美夕希 → アナフィラキシー検査（CBC、血液像、C3、C4、IgE）</p>
            <p>・ヒスタミン・トリプターゼは電カルからオーダー不可 → 検査部に電話</p>
          </div>
          <div className="mt-2 rounded-md border border-amber-deep/20 bg-amber-soft px-4 py-3 text-xs text-amber-ink space-y-1">
            <p>・外注Bのスピッツは手術室にはない。検査部に電話オーダーして送ってもらう。採血後はすぐに検査部へ！</p>
            <p>・紫・青のスピッツは手術室にあります。</p>
          </div>
        </div>
      </section>

      <footer className="mt-10 border-t border-line pt-4 text-xs text-ink-faint">
        <p>出典: 日本アレルギー学会「アナフィラキシーガイドライン2022」</p>
        <p className="mt-1">
          本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
        </p>
      </footer>
    </div>
  );
}
