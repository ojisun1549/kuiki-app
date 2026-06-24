// 悪性高熱症（MH: Malignant Hyperthermia）対応データ。
// 出典: 公益社団法人 日本麻酔科学会「悪性高熱症管理ガイドライン2025」（2025年3月改定）

export const DANTROLENE = {
  vialMg: 20, // 1瓶あたりの含量
  diluentMlPerVial: 60, // 1瓶を溶解するための注射用蒸留水量
  initialDoseMinMgPerKg: 1.0,
  initialDoseRecommendedMgPerKg: 2.0,
  infusionMinutes: 10,
  reassessIntervalMinutes: 10,
  labelMaxMgPerKg: 7.0, // 医薬品添付文書上の最大投与量
  overseasMaxMgPerKg: 10.0, // 欧米ガイドラインで効果がある場合に推奨される投与量
};

export function calcDantroleneDose(weightKg, mgPerKg) {
  if (!weightKg || weightKg <= 0) return null;
  const mg = weightKg * mgPerKg;
  const vials = Math.ceil(mg / DANTROLENE.vialMg);
  const diluentMl = vials * DANTROLENE.diluentMlPerVial;
  return {
    mg: Math.round(mg * 10) / 10,
    vials,
    diluentMl,
  };
}

export const COOLING_SALINE = { minMlPerKg: 50, maxMlPerKg: 60 };
export function calcCoolingSalineMl(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  return {
    min: Math.round(weightKg * COOLING_SALINE.minMlPerKg),
    max: Math.round(weightKg * COOLING_SALINE.maxMlPerKg),
  };
}

export const URINE_OUTPUT_TARGET_ML_PER_KG_HR = 1.0;
export function calcUrineTargetMlPerHr(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  return Math.round(weightKg * URINE_OUTPUT_TARGET_ML_PER_KG_HR * 10) / 10;
}

// MHを疑う症状（5章）
export const SUSPECTED_SYMPTOMS = [
  "説明のできないETCO2の上昇・高値",
  "原因不明の頻脈",
  "15分間に0.5℃以上の体温上昇",
  "38.8℃以上の高体温",
  "開口障害",
  "筋強直",
  "コーラ色の尿",
  "代謝性アシドーシス（BE -8.0以下）",
];

// 治療手順（図2: 全身麻酔中のMH）
export const TREATMENT_STEPS_INTRAOP = [
  {
    category: "A. 緊急事態宣言・原因除去",
    items: [
      "起因薬剤（揮発性吸入麻酔薬・スキサメトニウム）の投与を中止し、静脈麻酔・非脱分極性筋弛緩薬に変更",
      "「悪性高熱症による緊急事態」を宣言し、人手を集める",
      "執刀医に手術の早期終了を要請（手術チーム全体で対処）",
      "高流量純酸素（10 L/分以上）で過換気（分時換気量を2倍以上に設定）",
    ],
  },
  {
    category: "C. ダントロレン投与（直ちに実施すべき）",
    items: [
      "できるだけ太い専用の末梢静脈路を確保",
      "1瓶20mgあたり注射用蒸留水60mLで透明になるまで震盪溶解",
      "少なくとも1.0mg/kg（実体重）、できれば2.0mg/kgを10分程度で投与",
      "ETCO2・深部体温が低下し筋強直が改善するまで、10分おきに評価し初期投与量と同量を適宜追加投与",
      "症状により適宜増減し、添付文書上の最大投与量7.0mg/kgまで追加投与（欧米ガイドラインでは効果がある場合10mg/kgを超える投与も推奨）",
    ],
  },
  {
    category: "B・D. 対症療法（直ちに実施すべき）",
    items: [
      "動脈圧ラインを確保",
      "冷却した生理食塩水を点滴静注（最大50〜60mL/kg）",
      "体表冷却（室温を下げ、室温で送風）。38℃以下になれば冷却中止",
      "高カリウム血症の治療（グルコース・インスリン療法、グルコン酸カルシウム、炭酸水素ナトリウム）、毎時1.0mL/kgの尿量を目安に強制利尿（フロセミド）",
      "代謝性アシドーシスの治療（炭酸水素ナトリウム投与、尿のアルカリ化）",
      "不整脈治療（Ca拮抗薬は原則投与しない。アミオダロンやβ遮断薬を考慮）",
      "他の対症療法を必要に応じて実施",
      "可能なら気化器を取り外し麻酔回路を交換（必須ではない）",
    ],
  },
  {
    category: "E. 推奨する血液検査",
    items: [
      "動脈血液ガス分析、血糖、電解質、乳酸",
      "CK、ミオグロビン定性・定量（尿も）",
      "生化学（腎機能・肝機能）",
      "DIC診断のための血液凝固系検査",
      "発症後に再燃することがあるため適宜検査し、最低24時間は観察",
    ],
  },
];

// 図3: 術後悪性高熱症（PMH）
export const PMH_NOTES = {
  timing:
    "術後悪性高熱症（PMH）の多くは術後30〜40分以内に発症し、術後2時間以内におよそ70%、24時間以内におよそ90%が発症する。",
  suspectedSymptoms: [
    "説明のできないETCO2の高値",
    "コーラ色の尿",
    "代謝性アシドーシス（BE ≦ -8.0）",
    "高CK血症",
    "高ミオグロビン血症",
  ],
  additionalSteps: [
    "麻酔科医へのコンサルト",
    "気管挿管（プロポフォール、ロクロニウム）",
    "人工呼吸管理（過換気とする）",
    "静脈麻酔の開始・維持",
    "ダントロレンの準備（対応は図2のMH治療手順に準じる）",
  ],
};

// 不整脈治療等の注意点
export const PRECAUTIONS = [
  {
    title: "カルシウム拮抗薬は原則禁忌",
    detail:
      "カルシウム拮抗薬とダントロレンの併用で心停止を来す可能性がある。特にベラパミルとダントロレンの併用では致死的高カリウム血症の報告がある。不整脈治療にはアミオダロンやβ遮断薬を考慮する。",
  },
  {
    title: "ダントロレンの予防投与は推奨されない",
    detail:
      "MH既往・素因のある患者に対し術前から予防的にダントロレンを投与することは、筋力低下などの副作用のリスクがあり推奨されていない。",
  },
  {
    title: "局所麻酔・区域麻酔は安全に施行可能",
    detail:
      "局所麻酔・区域麻酔（脊髄くも膜下麻酔、硬膜外麻酔を含む）はMH素因患者に対しても安全であり、必要に応じて鎮静薬の併用も可能。",
  },
  {
    title: "麻酔器の洗い出し",
    detail:
      "気化器を取り外し、呼吸回路・バッグ・二酸化炭素吸収剤を交換。高流量（10 L/分以上）のガスで残留揮発性吸入麻酔薬を洗い出す（機種により概ね60〜100分を要する）。流量を低下させるとリバウンド現象で麻酔薬濃度が再上昇するため、麻酔器使用までガスを高流量で流し続ける。",
  },
];
