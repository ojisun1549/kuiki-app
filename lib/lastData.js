// 局所麻酔薬中毒（LAST: Local Anesthetic Systemic Toxicity）対応データ。
// 出典:「局所麻酔薬中毒への対応プラクティカルガイド」公益社団法人日本麻酔科学会（2017年6月制定）
// 脂肪乳剤（20%イントラリポス®）の投与法（Ⅳ章C項）の数値をそのまま使用。

export const LIPID_EMULSION_REGIMEN = {
  bolusMlPerKg: 1.5,
  bolusMinutes: 1,
  initialInfusionMlPerKgMin: 0.25,
  increasedInfusionMlPerKgMin: 0.5,
  maxBoluses: 3,
  reassessIntervalMinutes: 5,
  continueAfterStableMinutes: 10,
  typicalEffectiveMaxMlPerKg: 10,
  maxTotalMlPerKg: 12,
  animalLethalDoseMlPerKg: 67,
};

export function calcBolusVolumeMl(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  return Math.round(weightKg * LIPID_EMULSION_REGIMEN.bolusMlPerKg * 10) / 10;
}

export function calcInfusionRate(weightKg, mlPerKgMin) {
  if (!weightKg || weightKg <= 0) return null;
  const mlPerMin = weightKg * mlPerKgMin;
  return {
    mlPerMin: Math.round(mlPerMin * 10) / 10,
    mlPerHr: Math.round(mlPerMin * 60 * 10) / 10,
  };
}

export function calcMaxTotalVolumeMl(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  return Math.round(weightKg * LIPID_EMULSION_REGIMEN.maxTotalMlPerKg * 10) / 10;
}

export function calcTypicalEffectiveVolumeMl(weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  return Math.round(weightKg * LIPID_EMULSION_REGIMEN.typicalEffectiveMaxMlPerKg * 10) / 10;
}

// Ⅳ章A・B（初期対応）
export const INITIAL_RESPONSE_STEPS = [
  "局所麻酔薬の投与を中止する",
  "応援を要請する",
  "血圧計・心電図モニター・パルスオキシメータを装着する",
  "静脈ラインを確保する",
  "気道確保および100%酸素投与。必要に応じて気管挿管・人工呼吸",
  "痙攣の治療（ベンゾジアゼピンが推奨。血圧・心拍が不安定な場合はプロポフォールの使用は不可）",
  "（余裕があれば）血中濃度測定のための採血",
];

export const SEVERE_CASE_STEPS = [
  "脂肪乳剤を下記の方法に従って投与する",
  "標準的な手順に従って心肺蘇生（CPR）を開始する",
  "体外循環（PCPS/ECMO）の準備を行う",
];

// Ⅳ章D（注意点）
export const PRECAUTIONS = [
  "頻脈・不整脈の治療目的でリドカインを用いないこと（局所麻酔薬であり中毒を悪化させうる）",
  "痙攣にはベンゾジアゼピン、チオペンタールやプロポフォールが使用可能だが、いずれも少量ずつ投与すること。プロポフォールの溶媒は脂肪乳剤だがその濃度は10%と低く、投与量増加により直接心抑制が生じるため、脂肪乳剤治療の代用として使用してはならない",
  "アドレナリンの投与量は、AHAの蘇生ガイドライン等に従い、ASRA基準である「<1μg/kg」にはこだわらないこと",
  "局所麻酔薬中毒からの蘇生には長時間を要する場合があることを念頭におくこと",
  "小児に対しても成人と同程度の体重当たり投与量で脂肪乳剤の効果が報告されている",
  "脂肪乳剤の投与開始後は、投与前に比べて局所麻酔薬の血中濃度が一時的に上昇する場合がある",
  "動物実験に基づき計算された、ヒトにおける脂肪乳剤の致死量は67 mL/kgである",
];

export const ALTERNATIVE_TREATMENTS = [
  {
    category: "痙攣治療",
    drugs: "ベンゾジアゼピン（ミダゾラム、ジアゼパムなど）",
    note: "第一選択。痙攣治療薬は施設で準備しておくこと（ミダゾラム、ジアゼパム、またはバルビタールのいずれか）。",
  },
  {
    category: "痙攣治療（代替）",
    drugs: "チオペンタール、プロポフォール",
    note: "使用可能だが少量ずつ投与。プロポフォールは脂肪乳剤治療の代用にはならない（心抑制のリスク、脂肪含有量が不足）。血圧・心拍が不安定な場合はプロポフォール使用不可。",
  },
  {
    category: "循環管理（不整脈）",
    drugs: "標準的な蘇生プロトコルに従う",
    note: "頻脈・不整脈治療目的でリドカイン（および他の局所麻酔薬類似薬）は使用しないこと。",
  },
  {
    category: "循環管理（昇圧薬）",
    drugs: "アドレナリン等",
    note: "AHA蘇生ガイドラインに従う。ASRA基準の「<1μg/kg」という低用量にはこだわらず、通常の蘇生量を投与してよい。",
  },
  {
    category: "難治性心停止",
    drugs: "体外循環（PCPS/ECMO）",
    note: "重度の低血圧・不整脈を伴う場合は、脂肪乳剤投与・標準的CPRと並行して体外循環の準備を進める。",
  },
];
