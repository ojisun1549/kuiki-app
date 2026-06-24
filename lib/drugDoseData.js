// 体重ベースの薬剤投与量計算用データ。
// 抗不整脈薬（リドカイン・アミオダロン・ピルジカイニド）は手元の指示メモに基づく。
// カテコラミン等の持続投与薬は「薬剤投与量改訂」シートの希釈方法・濃度・基準投与量（体重50kg時）に基づき、
// rate(ml/hr) = 投与量(mg/kg/分または時) × 体重(kg) × (分換算なら60、時間ならそのまま) ÷ 濃度(mg/mL)
// の関係式（元シートの数値と整合確認済み）で任意体重に再計算する。

// ============ 抗不整脈薬 ============

export const VENTRICULAR_ANTIARRHYTHMICS = [
  {
    id: "lidocaine",
    name: "リドカイン",
    brand: "キシロカイン®注ほか",
    concentration: "100mg/5mL（20mg/mL）",
    doseLow: 1,
    doseHigh: 2,
    doseUnit: "mg/kg",
    mgPerMl: 20,
    note: "心室性不整脈の急速投与。1〜2mg/kgを静注。",
  },
  {
    id: "amiodarone",
    name: "アミオダロン",
    brand: "アンカロン®注",
    fixed: true,
    regimenSteps: [
      "負荷投与: 125mg(2.5mL)を5%ブドウ糖(TZ)500mLに希釈し、10分で投与",
      "維持投与①: 750mg(5A)/500mLを33mL/hrで24時間投与",
      "維持投与②: その後17mL/hrに変更",
    ],
    note: "体重に関わらず投与量は一定。",
  },
];

export const SUPRAVENTRICULAR_ANTIARRHYTHMICS = [
  {
    id: "pilsicainide",
    name: "ピルジカイニド",
    brand: "サンリズム®注",
    concentration: "50mg/5mL（10mg/mL）",
    doseLow: 1,
    doseHigh: 1,
    doseUnit: "mg/kg",
    mgPerMl: 10,
    note: "上室性不整脈。1mg/kgを10分で投与。",
    infusionMinutes: 10,
  },
];

// ============ カテコラミン等 持続投与薬 ============
// totalDoseMg・totalVolumeMl は元シートの希釈後の総量・総薬剤量から算出。
// steps: [{ label, value, unit('mg'|'μg'), perMin(bool) }]

export const CONTINUOUS_INFUSION_DRUGS = [
  {
    id: "dopamine-inovan",
    brand: "イノバンシリンジ",
    generic: "ドーパミン",
    dilution: "150mg/50mL シリンジ製剤をそのまま使用",
    totalDoseMg: 150,
    totalVolumeMl: 50,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
  },
  {
    id: "dopamine-catabon-hi",
    brand: "カタボンHi",
    generic: "ドーパミン",
    dilution: "600mg/200mL パック製剤をそのまま使用",
    totalDoseMg: 600,
    totalVolumeMl: 200,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
  },
  {
    id: "dopamine-catabon-low",
    brand: "カタボンLow",
    generic: "ドーパミン",
    dilution: "200mg/200mL パック製剤をそのまま使用",
    totalDoseMg: 200,
    totalVolumeMl: 200,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
  },
  {
    id: "dobutamine-dobpon",
    brand: "ドブポンシリンジ",
    generic: "ドブタミン",
    dilution: "150mg/50mL シリンジ製剤をそのまま使用",
    totalDoseMg: 150,
    totalVolumeMl: 50,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
  },
  {
    id: "dobutamine-retamine",
    brand: "レタメックス",
    generic: "ドブタミン",
    dilution: "100mg/5mL 3Aを生理食塩水85mLに希釈し総量100mLとする",
    totalDoseMg: 300,
    totalVolumeMl: 100,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
  },
  {
    id: "milrinone",
    brand: "ミルリーラ",
    generic: "ミルリノン",
    dilution: "10mg/10mL 2Aをそのまま使用（希釈なし、総量20mL）",
    totalDoseMg: 20,
    totalVolumeMl: 20,
    steps: [{ label: "0.1 μg/kg/min", value: 0.1, unit: "μg", perMin: true }],
    note: "通常投与量 0.25〜0.75 μg/kg/min",
  },
  {
    id: "noradrenaline",
    brand: "ノルアドリナリン",
    generic: "ノルエピネフリン",
    dilution: "1mg/1mL 3Aを生理食塩水47mLに希釈し総量50mLとする",
    totalDoseMg: 3,
    totalVolumeMl: 50,
    steps: [{ label: "0.01 μg/kg/min", value: 0.01, unit: "μg", perMin: true }],
  },
  {
    id: "adrenaline",
    brand: "ボスミン",
    generic: "エピネフリン",
    dilution: "1mg/1mL 3Aを生理食塩水47mLに希釈し総量50mLとする",
    totalDoseMg: 3,
    totalVolumeMl: 50,
    steps: [{ label: "0.01 μg/kg/min", value: 0.01, unit: "μg", perMin: true }],
  },
  {
    id: "landiolol",
    brand: "オノアクト",
    generic: "塩酸ランジオロール",
    dilution: "150mg(粉末) 1バイアルを希釈液50mLで溶解",
    totalDoseMg: 150,
    totalVolumeMl: 50,
    steps: [{ label: "0.01 mg/kg/min", value: 0.01, unit: "mg", perMin: true }],
    note: "通常投与量 0.01〜0.04 mg/kg/min",
  },
  {
    id: "verapamil",
    brand: "ワソラン",
    generic: "塩酸ベラパミル",
    dilution: "5mg/2mL 2Aを生理食塩水46mLに希釈し総量50mLとする",
    totalDoseMg: 10,
    totalVolumeMl: 50,
    steps: [{ label: "0.1 μg/kg/min", value: 0.1, unit: "μg", perMin: true }],
  },
  {
    id: "carperitide",
    brand: "ハンプ",
    generic: "カルペリチド",
    dilution: "1000μg(粉末) 3バイアルを希釈液50mLで溶解",
    totalDoseMg: 3,
    totalVolumeMl: 50,
    steps: [{ label: "0.1 μg/kg/min", value: 0.1, unit: "μg", perMin: true }],
    note: "通常投与量 0.1〜0.2 μg/kg/min",
  },
  {
    id: "nicardipine",
    brand: "ニカルジピン",
    generic: "塩酸ニカルジピン",
    dilution: "25mg/25mL 1Aをそのまま使用（希釈なし）",
    totalDoseMg: 25,
    totalVolumeMl: 25,
    steps: [{ label: "1 μg/kg/min", value: 1, unit: "μg", perMin: true }],
    note: "通常投与量（元資料記載） 0.5〜1 μg/kg/hr",
  },
  {
    id: "alprostadil",
    brand: "タンデトロン",
    generic: "アルプロスタジル",
    dilution: "500μg(粉末) 1バイアルを希釈液50mLで溶解",
    totalDoseMg: 0.5,
    totalVolumeMl: 50,
    steps: [{ label: "0.01 μg/kg/min", value: 0.01, unit: "μg", perMin: true }],
  },
  {
    id: "propofol",
    brand: "ディプリバン",
    generic: "プロポフォール",
    dilution: "1000mg/50mL 1バイアルをそのまま使用",
    totalDoseMg: 1000,
    totalVolumeMl: 50,
    steps: [{ label: "1 mg/kg/hr", value: 1, unit: "mg", perMin: false }],
    note: "通常投与量 0.3〜3.0 mg/kg/hr",
  },
  {
    id: "fentanyl",
    brand: "フェンタニル",
    generic: "",
    dilution: "50μg/mL 10mL 2Aを生理食塩水20mLに希釈し総量40mLとする",
    totalDoseMg: 1, // 1000μg
    totalVolumeMl: 40,
    steps: [
      { label: "0.5 μg/kg/hr", value: 0.5, unit: "μg", perMin: false },
      { label: "1 μg/kg/hr", value: 1, unit: "μg", perMin: false },
      { label: "1.5 μg/kg/hr", value: 1.5, unit: "μg", perMin: false },
      { label: "2 μg/kg/hr", value: 2, unit: "μg", perMin: false },
    ],
  },
  {
    id: "dexmedetomidine",
    brand: "プレセデックス",
    generic: "塩酸デクスメデトミジン",
    dilution: "200μg/2mL シリンジを希釈液で総量50mLとして使用",
    totalDoseMg: 0.2, // 200μg
    totalVolumeMl: 50,
    steps: [
      { label: "0.1 μg/kg/hr", value: 0.1, unit: "μg", perMin: false },
      { label: "0.2 μg/kg/hr", value: 0.2, unit: "μg", perMin: false },
      { label: "0.4 μg/kg/hr", value: 0.4, unit: "μg", perMin: false },
      { label: "0.7 μg/kg/hr", value: 0.7, unit: "μg", perMin: false },
      { label: "1 μg/kg/hr", value: 1, unit: "μg", perMin: false },
    ],
  },
];

// 体重によらず固定のレジメンで運用する薬剤（持続投与だが速度が体重に比例しない）
export const FIXED_RATE_DRUGS = [
  {
    id: "nicorandil",
    brand: "シグマート",
    generic: "ニコランジル",
    dilution: "48mg(粉末) 1バイアルを48mLで溶解（総量48mL）",
    regimens: [
      { label: "不安定狭心症投与量", rate: "2〜6 mL/hr" },
      { label: "急性心不全投与量", rate: "2.5〜10 mL/hr" },
    ],
  },
  {
    id: "vasopressin",
    brand: "ピトレシン",
    generic: "バソプレシン",
    dilution: "1Aを生理食塩水19mLに希釈し総量20mLとする",
    regimens: [{ label: "投与量", rate: "病状に応じて指示医の指示による" }],
  },
];

// rate(ml/hr) = doseValue(mg換算) × weight × (perMin?60:1) ÷ (totalDoseMg/totalVolumeMl)
export function calcInfusionRate(drug, step, weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  const concMgPerMl = drug.totalDoseMg / drug.totalVolumeMl;
  const doseValueMg = step.unit === "μg" ? step.value / 1000 : step.value;
  const timeMultiplier = step.perMin ? 60 : 1;
  const rate = (doseValueMg * weightKg * timeMultiplier) / concMgPerMl;
  return Math.round(rate * 100) / 100;
}

export function calcBolusRange(drug, weightKg) {
  if (!weightKg || weightKg <= 0) return null;
  const mgLow = drug.doseLow * weightKg;
  const mgHigh = drug.doseHigh * weightKg;
  const mlLow = mgLow / drug.mgPerMl;
  const mlHigh = mgHigh / drug.mgPerMl;
  const round2 = (n) => Math.round(n * 100) / 100;
  return {
    mgLow: round2(mgLow),
    mgHigh: round2(mgHigh),
    mlLow: round2(mlLow),
    mlHigh: round2(mlHigh),
  };
}
