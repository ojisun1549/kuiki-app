import { useEffect, useMemo, useState } from "react";

// ============================================================
// データソース:
// 「抗血栓療法中の区域麻酔・神経ブロックガイドライン」
// 日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会 合同
// 2016年9月 表5（出血リスク分類）・表6（抗血小板薬等）・表7（抗凝固薬）
// ============================================================

const DEEP_BLOCKS = [
  "深頸神経叢ブロック",
  "頸部神経根ブロック",
  "頸部椎間関節ブロック",
  "三叉神経節ブロック",
  "舌咽神経ブロック",
  "翼口蓋神経節ブロック",
  "上顎神経ブロック",
  "下顎神経ブロック",
  "星状神経節ブロック（SGB）",
  "傍脊椎ブロック",
  "腕神経叢ブロック（斜角筋間法・鎖骨上法・鎖骨下法）",
  "内臓神経ブロック",
  "腰部交感神経節ブロック",
  "腰神経叢ブロック",
  "閉鎖神経ブロック",
  "坐骨神経ブロック",
];

const SUPERFICIAL_BLOCKS = [
  "浅頸神経叢ブロック",
  "眼窩上神経ブロック",
  "後頭神経ブロック",
  "腕神経叢ブロック（腋窩法）",
  "前腕の神経ブロック",
  "肩甲上神経ブロック",
  "肋間神経ブロック",
  "腹直筋鞘ブロック",
  "腹横筋膜面ブロック（TAPブロックなど）",
  "大腿神経ブロック",
  "外側大腿皮神経ブロック",
  "伏在神経ブロック",
  "下腿の神経ブロック",
];

const DRUGS = [
  {
    id: "aspirin",
    category: "antiplatelet",
    name: "アスピリン",
    brand: "バイアスピリン®ほか",
    mechanism: "トロンボキサンA2合成阻害（不可逆的）",
    halfLifeText: "約2時間（血小板寿命に相当する7〜10日間、作用が持続）",
    washoutMid: {
      display: "症例ごとに判断（一律の休薬期間設定なし）",
      tbd: true,
      note:
        "施行する手技の出血リスクにより異なるため症例ごとに決定するとされています。高出血リスク手技では7日（二次予防など休薬リスクが高い場合は5日への短縮も考慮）が目安です。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: {
      display: "術後早期より再開可",
      hours: null,
      note: "カテーテル抜去時期というより、周術期の止血状況を踏まえて再開を判断します。",
    },
  },
  {
    id: "diclofenac",
    category: "antiplatelet",
    name: "ジクロフェナク",
    brand: "ボルタレン®",
    mechanism: "COX阻害（可逆的）",
    halfLifeText: "1〜2時間",
    washoutMid: { display: "1日", days: 1 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
  },
  {
    id: "indomethacin",
    category: "antiplatelet",
    name: "インドメタシン",
    brand: "インダシン®",
    mechanism: "COX阻害（可逆的）",
    halfLifeText: "5〜10時間",
    washoutMid: { display: "2日", days: 2 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
  },
  {
    id: "ibuprofen",
    category: "antiplatelet",
    name: "イブプロフェン",
    brand: "ブルフェン®ほか",
    mechanism: "COX阻害（可逆的）",
    halfLifeText: "2〜4時間",
    washoutMid: { display: "1日", days: 1 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
  },
  {
    id: "flurbiprofen",
    category: "antiplatelet",
    name: "フルルビプロフェン",
    brand: "ロピオン®",
    mechanism: "COX阻害（可逆的）",
    halfLifeText: "6時間",
    washoutMid: { display: "1日", days: 1 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
  },
  {
    id: "celecoxib",
    category: "antiplatelet",
    name: "セレコキシブ",
    brand: "セレコックス®",
    mechanism: "COX-2選択的阻害",
    halfLifeText: "5〜9時間",
    washoutMid: {
      display: "休薬不要",
      days: 0,
      note: "血小板凝集を直接阻害する作用はないとされています。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "休薬の必要なし", hours: 0 },
  },
  {
    id: "clopidogrel",
    category: "antiplatelet",
    name: "クロピドグレル",
    brand: "プラビックス®",
    mechanism: "P2Y12受容体遮断（不可逆的）",
    halfLifeText: "0.5〜3時間（作用は血小板寿命相当で持続）",
    washoutMid: {
      display: "7日（5日）",
      days: 7,
      note: "冠動脈ステント留置例など血栓リスクが高い場合は5日への短縮も考慮されます。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "ticlopidine",
    category: "antiplatelet",
    name: "チクロピジン",
    brand: "パナルジン®",
    mechanism: "アデニル酸シクラーゼ活性化＋P2Y12受容体遮断",
    halfLifeText: "1.5時間（作用は血小板寿命相当で持続）",
    washoutMid: {
      display: "7〜10日（5日）",
      days: 10,
      note: "状況により5日への短縮も考慮されます。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "prasugrel",
    category: "antiplatelet",
    name: "プラスグレル",
    brand: "エフィエント®",
    mechanism: "P2Y12受容体遮断（不可逆的）",
    halfLifeText: "5時間（作用は血小板寿命相当で持続）",
    washoutMid: {
      display: "7〜10日（5日）",
      days: 10,
      note: "状況により5日への短縮も考慮されます。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "cilostazol",
    category: "antiplatelet",
    name: "シロスタゾール",
    brand: "プレタール®",
    mechanism: "ホスホジエステラーゼ阻害",
    halfLifeText: "11〜13時間",
    washoutMid: {
      display: "2日",
      days: 2,
      note: "アスピリンと併用中の場合はアスピリンの休薬基準に従います。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "dipyridamole",
    category: "antiplatelet",
    name: "ジピリダモール",
    brand: "ペルサンチン®",
    mechanism: "ホスホジエステラーゼ阻害",
    halfLifeText: "10時間",
    washoutMid: { display: "2日", days: 2 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "epa",
    category: "antiplatelet",
    name: "イコサペント酸エチル",
    brand: "エパデール®",
    mechanism: "トロンボキサンA2阻害",
    halfLifeText: "60〜65時間",
    washoutMid: { display: "7〜10日", days: 10 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "omega3-epa-dha",
    category: "antiplatelet",
    name: "オメガ-3脂肪酸エチル（EPA・DHA配合）",
    brand: "ロトリガ®",
    mechanism: "トロンボキサンA2産生抑制等による抗血小板作用（EPA＋DHA配合製剤）",
    halfLifeText:
      "明確な血中半減期の設定なし。EPA・DHAは血小板膜リン脂質に取り込まれ、効果は血小板の入れ替わる期間（7〜10日程度）持続するとされています。",
    washoutMid: {
      display: "7〜10日",
      days: 10,
      note: "本剤（EPA＋DHA配合）はガイドライン本表に個別記載がないため、同じ抗血小板機序を持つイコサペント酸エチル（エパデール®）に準じた休薬目安を表示しています。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
    generalNote:
      "ガイドライン本表に記載のない薬剤のため、エパデール®の基準を準用した参考値です。実際の判断は施設プロトコル・主治医の判断によってください。",
  },
  {
    id: "sarpogrelate",
    category: "antiplatelet",
    name: "サルポグレラート",
    brand: "アンプラーグ®",
    mechanism: "5-HT2受容体遮断",
    halfLifeText: "0.8時間",
    washoutMid: { display: "1日", days: 1 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "beraprost",
    category: "antiplatelet",
    name: "ベラプロスト",
    brand: "ドルナー®／プロサイリン®",
    mechanism: "アデニル酸シクラーゼ活性化",
    halfLifeText: "0.5〜0.7時間",
    washoutMid: { display: "1日", days: 1 },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "limaprost",
    category: "antiplatelet",
    name: "リマプロストアルファデクス",
    brand: "オパルモン®／プロレナール®",
    mechanism:
      "プロスタグランジンE1（PGE1）誘導体。血小板cAMP増加・トロンボキサンA2産生抑制による血小板凝集抑制作用（作用の強さはPGI2に匹敵するとされる）",
    halfLifeText: "約0.5時間（添付文書記載の消失半減期：0.5〜1時間）",
    washoutMid: {
      display: "1日",
      days: 1,
      note: "ガイドライン本表に個別記載がないため、同様の機序・半減期を持つベラプロスト等のプロスタグランジン系抗血小板薬に準じた休薬目安を表示しています。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
    generalNote:
      "ガイドライン本表に記載のない薬剤のため、同種同効薬（ベラプロスト等）の基準を準用した参考値です。実際の判断は施設プロトコル・主治医の判断によってください。",
  },
  {
    id: "clomipramine",
    category: "antiplatelet",
    name: "クロミプラミン",
    brand: "アナフラニール®",
    mechanism: "セロトニン再取り込み抑制（三環系）",
    halfLifeText: "24時間",
    washoutMid: {
      display: "5日",
      days: 5,
      note: "周術期の抗うつ薬休薬は原疾患の悪化リスクがあるため、リスク・ベネフィットを慎重に判断してください。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "sertraline",
    category: "antiplatelet",
    name: "セルトラリン",
    brand: "ジェイゾロフト®",
    mechanism: "セロトニン再取り込み抑制（SSRI）",
    halfLifeText: "24時間",
    washoutMid: {
      display: "5日",
      days: 5,
      note: "周術期の抗うつ薬休薬は原疾患の悪化リスクがあるため、リスク・ベネフィットを慎重に判断してください。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "paroxetine",
    category: "antiplatelet",
    name: "パロキセチン",
    brand: "パキシル®",
    mechanism: "セロトニン再取り込み抑制（SSRI）",
    halfLifeText: "21時間",
    washoutMid: {
      display: "5日",
      days: 5,
      note: "周術期の抗うつ薬休薬は原疾患の悪化リスクがあるため、リスク・ベネフィットを慎重に判断してください。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "fluvoxamine",
    category: "antiplatelet",
    name: "フルボキサミン",
    brand: "ルボックス®／デプロメール®",
    mechanism: "セロトニン再取り込み抑制（SSRI）",
    halfLifeText: "16〜26時間",
    washoutMid: {
      display: "5日",
      days: 5,
      note: "周術期の抗うつ薬休薬は原疾患の悪化リスクがあるため、リスク・ベネフィットを慎重に判断してください。",
    },
    washoutLow: { display: "休薬不要", days: 0 },
    catheterRestart: { display: "抜去後より", hours: 0 },
  },
  {
    id: "ufh",
    category: "anticoagulant",
    name: "未分画ヘパリン",
    brand: "ヘパリン®／カプロシン®",
    mechanism: "トロンビン・第Xa因子阻害",
    halfLifeText: "静注 0.7〜2時間／皮下注 2〜4時間",
    specialInput: "heparin-route",
    washoutByRoute: {
      iv: { display: "4時間（静脈内投与）", hours: 4 },
      sc: { display: "8〜10時間（皮下投与）", hours: 10 },
    },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
    generalNote: "穿刺手技前にAPTTおよび血小板数が基準値内であることを確認してください。",
  },
  {
    id: "enoxaparin",
    category: "anticoagulant",
    name: "エノキサパリン",
    brand: "クレキサン®",
    mechanism: "第Xa因子＞トロンビン阻害（低分子ヘパリン）",
    halfLifeText: "3〜6時間（皮下）",
    washoutMid: { display: "12時間", hours: 12 },
    washoutLow: { display: "12時間", hours: 12 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
  },
  {
    id: "dalteparin",
    category: "anticoagulant",
    name: "ダルテパリン",
    brand: "フラグミン®",
    mechanism: "第Xa因子＞トロンビン阻害（低分子ヘパリン）",
    halfLifeText: "2〜4時間",
    washoutMid: { display: "12時間", hours: 12 },
    washoutLow: { display: "12時間", hours: 12 },
    catheterRestart: { display: "抜去2時間後より", hours: 2 },
    generalNote:
      "本邦では深部静脈血栓症予防の保険適応はなく、主にDICや体外循環回路の凝血防止目的での使用です。",
  },
  {
    id: "fondaparinux",
    category: "anticoagulant",
    name: "フォンダパリヌクス",
    brand: "アリクストラ®",
    mechanism: "第Xa因子阻害",
    halfLifeText: "17〜20時間（皮下）",
    washoutMid: { display: "4日", days: 4 },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: { display: "抜去6時間後より", hours: 6 },
  },
  {
    id: "warfarin",
    category: "anticoagulant",
    name: "ワルファリン",
    brand: "ワーファリン®",
    mechanism: "ビタミンK依存性凝固因子合成阻害",
    halfLifeText: "4〜5日（投与量により個人差が大きい）",
    washoutMid: {
      display: "5日",
      days: 5,
      note: "穿刺手技前にPT-INR ≦ 1.2であることを確認してください。",
    },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: {
      display: "抜去後、止血確認のうえで再開（具体的な時間設定の規定なし）",
      hours: null,
    },
  },
  {
    id: "dabigatran",
    category: "anticoagulant",
    name: "ダビガトラン",
    brand: "プラザキサ®",
    mechanism: "トロンビン阻害",
    halfLifeText: "CrCl≥60: 約14時間／30<CrCl<60: 約18時間",
    specialInput: "dabigatran-renal",
    washoutMidByRenal: {
      normal: { display: "4日（CrCl≥60 mL/min）", days: 4 },
      low: { display: "5日（30<CrCl<60 mL/min）", days: 5 },
    },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: { display: "抜去6時間後より", hours: 6 },
    generalNote:
      "硬膜外カテーテル留置中の患者への投与は推奨されていません（添付文書）。",
  },
  {
    id: "rivaroxaban",
    category: "anticoagulant",
    name: "リバーロキサバン",
    brand: "イグザレルト®",
    mechanism: "第Xa因子阻害",
    halfLifeText: "5〜9時間",
    washoutMid: { display: "2日", days: 2 },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: { display: "抜去6時間後より", hours: 6 },
  },
  {
    id: "apixaban",
    category: "anticoagulant",
    name: "アピキサバン",
    brand: "エリキュース®",
    mechanism: "第Xa因子阻害",
    halfLifeText: "8〜15時間",
    washoutMid: { display: "3日", days: 3 },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: { display: "抜去6時間後より", hours: 6 },
  },
  {
    id: "edoxaban",
    category: "anticoagulant",
    name: "エドキサバン",
    brand: "リクシアナ®",
    mechanism: "第Xa因子阻害",
    halfLifeText: "6〜11時間",
    washoutMid: { display: "2日", days: 2 },
    washoutLow: {
      display: "個別判断（休薬する場合は半減期の約2倍が目安）",
      tbd: true,
    },
    catheterRestart: { display: "抜去6時間後より", hours: 6 },
  },
];

const CATEGORY_LABELS = {
  antiplatelet: "抗血小板薬・関連薬",
  anticoagulant: "抗凝固薬",
};

// ============================================================
// ロジック
// ============================================================

function resolveMidWashout(drug, perDrugInput) {
  if (drug.specialInput === "heparin-route") {
    const route = (perDrugInput && perDrugInput.route) || "iv";
    return drug.washoutByRoute[route];
  }
  if (drug.specialInput === "dabigatran-renal") {
    const renal = (perDrugInput && perDrugInput.renal) || "normal";
    return drug.washoutMidByRenal[renal];
  }
  return drug.washoutMid;
}

function resolveLowWashout(drug, perDrugInput) {
  if (drug.specialInput === "heparin-route") {
    const route = (perDrugInput && perDrugInput.route) || "iv";
    return drug.washoutByRoute[route];
  }
  return drug.washoutLow;
}

function washoutToHours(w) {
  if (!w) return null;
  if (w.tbd) return null;
  if (typeof w.days === "number") return w.days * 24;
  if (typeof w.hours === "number") return w.hours;
  return null;
}

function aggregateWashout(selectedDrugs, inputsById, risk) {
  if (selectedDrugs.length === 0) return { status: "none" };

  const resolved = selectedDrugs.map((drug) => {
    const perDrugInput = inputsById[drug.id] || {};
    const w =
      risk === "mid"
        ? resolveMidWashout(drug, perDrugInput)
        : resolveLowWashout(drug, perDrugInput);
    return { drug, perDrugInput, washout: w, hours: washoutToHours(w) };
  });

  const hasTbd = resolved.some((r) => r.washout && r.washout.tbd);
  if (hasTbd) {
    return {
      status: "individual",
      tbdDrugs: resolved.filter((r) => r.washout && r.washout.tbd).map((r) => r.drug),
      resolved,
    };
  }

  const maxHours = Math.max(...resolved.map((r) => r.hours || 0));
  const rateLimiting = resolved.filter((r) => (r.hours || 0) === maxHours);

  return {
    status: maxHours > 0 ? "washout-required" : "no-washout",
    maxHours,
    rateLimiting,
    resolved,
  };
}

function aggregateCatheterRestart(selectedDrugs) {
  if (selectedDrugs.length === 0) return { status: "none" };
  const resolved = selectedDrugs.map((drug) => ({ drug, restart: drug.catheterRestart }));

  const ambiguous = resolved.filter((r) => r.restart.hours === null);
  const numeric = resolved.filter((r) => r.restart.hours !== null);

  let maxHours = null;
  let rateLimiting = [];
  if (numeric.length > 0) {
    maxHours = Math.max(...numeric.map((r) => r.restart.hours));
    rateLimiting = numeric.filter((r) => r.restart.hours === maxHours);
  }

  return { status: "resolved", maxHours, rateLimiting, ambiguous, resolved };
}

function addHoursToDate(dateTimeLocalStr, hours) {
  if (!dateTimeLocalStr || hours === null || hours === undefined) return null;
  const d = new Date(dateTimeLocalStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

function formatDateTime(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())} ${pad(
    date.getHours()
  )}:${pad(date.getMinutes())}`;
}

function computeReadyDateTime(resolved) {
  const needed = resolved.filter((r) => (r.hours || 0) > 0);
  if (needed.length === 0) return { computable: true, readyAt: null, missing: [] };
  const missing = needed.filter((r) => !(r.perDrugInput && r.perDrugInput.lastDoseTime));
  if (missing.length > 0) {
    return { computable: false, readyAt: null, missing: missing.map((r) => r.drug.name) };
  }
  const candidates = needed.map((r) => addHoursToDate(r.perDrugInput.lastDoseTime, r.hours));
  const readyAt = new Date(Math.max(...candidates.map((d) => d.getTime())));
  return { computable: true, readyAt, missing: [] };
}

// ============================================================
// UIコンポーネント
// ============================================================

function StatusStamp({ status }) {
  const map = {
    "no-washout": { label: "休薬不要", style: { color: "#146c43", background: "#e8f5ee" } },
    "washout-required": { label: "要休薬", style: { color: "#8a5a0a", background: "#fbf0dd" } },
    individual: { label: "要個別判断", style: { color: "#5b6b6e", background: "#eef2f2" } },
    none: { label: "未選択", style: { color: "#5b6b6e", background: "#eef2f2" } },
  };
  const conf = map[status] || map.none;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "9999px",
        border: `2px solid ${conf.style.color}`,
        padding: "0.35rem 0.9rem",
        fontSize: "0.75rem",
        fontWeight: 700,
        whiteSpace: "nowrap",
        ...conf.style,
      }}
    >
      {conf.label}
    </span>
  );
}

const cardStyle = {
  background: "#ffffff",
  border: "1px solid #d9e2e2",
  borderRadius: "0.75rem",
  padding: "1.25rem",
};

function DrugCard({ drug, input, onChangeInput }) {
  return (
    <div style={cardStyle}>
      <h3 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.125rem", color: "#1c2b33" }}>
        {drug.name}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "#3c4d54", marginTop: "0.1rem" }}>{drug.brand}</p>

      <div
        style={{
          marginTop: "0.75rem",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "0.4rem",
          fontSize: "0.875rem",
        }}
      >
        <div>
          <div style={{ color: "#6b7c80" }}>作用機序</div>
          <div style={{ color: "#3c4d54" }}>{drug.mechanism}</div>
        </div>
        <div>
          <div style={{ color: "#6b7c80" }}>半減期</div>
          <div style={{ color: "#3c4d54" }}>{drug.halfLifeText}</div>
        </div>
      </div>

      {drug.generalNote && (
        <p
          style={{
            marginTop: "0.75rem",
            background: "#fbf0dd",
            color: "#8a5a0a",
            borderRadius: "0.375rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.75rem",
          }}
        >
          参考値: {drug.generalNote}
        </p>
      )}

      {drug.specialInput === "dabigatran-renal" && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7c80", marginBottom: "0.25rem" }}>
            腎機能（CrCl）
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { key: "normal", label: "CrCl ≥ 60" },
              { key: "low", label: "30 < CrCl < 60" },
            ].map((opt) => {
              const active = (input.renal || "normal") === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeInput({ renal: opt.key })}
                  style={{
                    border: "1px solid #c7d4d4",
                    borderRadius: "0.5rem",
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.8125rem",
                    background: active ? "#b5781a" : "#fff",
                    color: active ? "#fff" : "#1c2b33",
                    borderColor: active ? "#b5781a" : "#c7d4d4",
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {drug.specialInput === "heparin-route" && (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.75rem", color: "#6b7c80", marginBottom: "0.25rem" }}>
            投与経路
          </p>
          <div style={{ display: "flex", gap: "0.5rem" }}>
            {[
              { key: "iv", label: "静脈内投与" },
              { key: "sc", label: "皮下投与" },
            ].map((opt) => {
              const active = (input.route || "iv") === opt.key;
              return (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => onChangeInput({ route: opt.key })}
                  style={{
                    border: "1px solid #c7d4d4",
                    borderRadius: "0.5rem",
                    padding: "0.35rem 0.75rem",
                    fontSize: "0.8125rem",
                    background: active ? "#b5781a" : "#fff",
                    color: active ? "#fff" : "#1c2b33",
                    borderColor: active ? "#b5781a" : "#c7d4d4",
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ marginTop: "0.75rem" }}>
        <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7c80", marginBottom: "0.25rem" }}>
          最終服用（投与）日時（任意）
        </label>
        <input
          type="datetime-local"
          value={input.lastDoseTime || ""}
          onChange={(e) => onChangeInput({ lastDoseTime: e.target.value })}
          style={{
            width: "100%",
            border: "1px solid #d9e2e2",
            borderRadius: "0.375rem",
            padding: "0.5rem 0.75rem",
            fontSize: "0.875rem",
            color: "#1c2b33",
          }}
        />
      </div>

      <div
        style={{
          marginTop: "1rem",
          borderTop: "1px solid #d9e2e2",
          paddingTop: "0.75rem",
          fontSize: "0.75rem",
          color: "#6b7c80",
        }}
      >
        <p>
          単独使用時の目安 ― 中リスク群（脊髄くも膜下麻酔・硬膜外麻酔・深部ブロック）:{" "}
          <span style={{ color: "#3c4d54" }}>
            {drug.specialInput === "heparin-route"
              ? drug.washoutByRoute[input.route || "iv"].display
              : drug.specialInput === "dabigatran-renal"
              ? drug.washoutMidByRenal[input.renal || "normal"].display
              : drug.washoutMid && drug.washoutMid.display}
          </span>
        </p>
        <p style={{ marginTop: "0.25rem" }}>
          低リスク群（浅在性ブロック）:{" "}
          <span style={{ color: "#3c4d54" }}>
            {drug.specialInput === "heparin-route"
              ? drug.washoutByRoute[input.route || "iv"].display
              : drug.washoutLow && drug.washoutLow.display}
          </span>
        </p>
        <p style={{ marginTop: "0.25rem" }}>
          硬膜外カテーテル抜去後再開:{" "}
          <span style={{ color: "#3c4d54" }}>{drug.catheterRestart.display}</span>
        </p>
      </div>
    </div>
  );
}

function NoteList({ resolved }) {
  const notes = resolved
    .map((r) => ({ name: r.drug.name, note: r.washout && r.washout.note }))
    .filter((n) => n.note);
  if (notes.length === 0) return null;
  return (
    <ul style={{ marginTop: "0.5rem", fontSize: "0.75rem", color: "#6b7c80" }}>
      {notes.map((n) => (
        <li key={n.name}>・{n.name}: {n.note}</li>
      ))}
    </ul>
  );
}

function WashoutResultCard({ title, description, agg }) {
  const ready =
    agg.status === "washout-required" || agg.status === "no-washout"
      ? computeReadyDateTime(agg.resolved)
      : null;

  return (
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
        <div>
          <h3 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.125rem", color: "#1c2b33" }}>
            {title}
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#3c4d54", marginTop: "0.1rem" }}>{description}</p>
        </div>
        <StatusStamp status={agg.status} />
      </div>

      {agg.status === "none" && (
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#6b7c80" }}>
          薬剤が選択されていません。
        </p>
      )}

      {agg.status === "individual" && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
          <p style={{ color: "#3c4d54" }}>
            次の薬剤はガイドライン上明確な休薬基準がないため、機械的な日数計算を行わず
            <strong style={{ color: "#8a5a0a" }}>要個別判断</strong>としています。
          </p>
          <ul style={{ marginTop: "0.25rem", color: "#6b7c80", paddingLeft: "1rem" }}>
            {agg.tbdDrugs.map((d) => (
              <li key={d.id}>
                {d.name}（{(d.washoutMid && d.washoutMid.display) || (d.washoutLow && d.washoutLow.display)}）
              </li>
            ))}
          </ul>
        </div>
      )}

      {(agg.status === "no-washout" || agg.status === "washout-required") && (
        <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
          <p style={{ color: "#3c4d54" }}>
            採用基準:{" "}
            <strong style={{ color: "#1c2b33" }}>
              {agg.maxHours > 0 ? `${agg.maxHours} 時間` : "休薬不要"}
            </strong>
          </p>
          {agg.maxHours > 0 && (
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#6b7c80" }}>
              律速薬剤（最長基準を採用）: {agg.rateLimiting.map((r) => r.drug.name).join("、")}
            </p>
          )}
          <NoteList resolved={agg.resolved} />

          {agg.maxHours > 0 && (
            <div style={{ marginTop: "0.75rem", background: "#e4f0ef", borderRadius: "0.375rem", padding: "0.5rem 0.75rem" }}>
              {ready.computable ? (
                ready.readyAt ? (
                  <p style={{ color: "#0f5f5c" }}>
                    施行可能日時（推定）: <strong>{formatDateTime(ready.readyAt)}</strong>
                  </p>
                ) : (
                  <p style={{ color: "#0f5f5c" }}>休薬不要のため施行可能です。</p>
                )
              ) : (
                <p style={{ color: "#3c4d54" }}>
                  施行可能日時を計算するには、次の薬剤の最終服用日時を入力してください: {ready.missing.join("、")}
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
    <div style={cardStyle}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "0.75rem" }}>
        <div>
          <h3 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.125rem", color: "#1c2b33" }}>
            硬膜外カテーテル抜去後の内服・投与再開
          </h3>
          <p style={{ fontSize: "0.875rem", color: "#3c4d54", marginTop: "0.1rem" }}>
            選択薬剤のうち最も再開が遅い基準を採用します。
          </p>
        </div>
        <StatusStamp
          status={agg.status === "none" ? "none" : agg.maxHours ? "washout-required" : "no-washout"}
        />
      </div>

      {agg.status === "none" ? (
        <p style={{ marginTop: "0.75rem", fontSize: "0.875rem", color: "#6b7c80" }}>
          薬剤が選択されていません。
        </p>
      ) : (
        <div style={{ marginTop: "0.75rem", fontSize: "0.875rem" }}>
          <p style={{ color: "#3c4d54" }}>
            採用基準:{" "}
            <strong style={{ color: "#1c2b33" }}>
              {agg.maxHours !== null ? `抜去後 ${agg.maxHours} 時間` : "—"}
            </strong>
          </p>
          {agg.maxHours !== null && agg.rateLimiting.length > 0 && (
            <p style={{ marginTop: "0.25rem", fontSize: "0.75rem", color: "#6b7c80" }}>
              律速薬剤: {agg.rateLimiting.map((r) => r.drug.name).join("、")}
            </p>
          )}
          {agg.ambiguous.length > 0 && (
            <p
              style={{
                marginTop: "0.5rem",
                background: "#fbf0dd",
                color: "#8a5a0a",
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.75rem",
              }}
            >
              次の薬剤は「抜去後より（具体的な時間の定めなし）」とされており、止血状況等を踏まえた個別判断が必要です:{" "}
              {agg.ambiguous.map((r) => r.drug.name).join("、")}
            </p>
          )}

          <div style={{ marginTop: "0.75rem" }}>
            <label style={{ display: "block", fontSize: "0.75rem", color: "#6b7c80", marginBottom: "0.25rem" }}>
              硬膜外カテーテル抜去日時（任意）
            </label>
            <input
              type="datetime-local"
              value={pullTime}
              onChange={(e) => onChangePullTime(e.target.value)}
              style={{
                maxWidth: "16rem",
                width: "100%",
                border: "1px solid #d9e2e2",
                borderRadius: "0.375rem",
                padding: "0.5rem 0.75rem",
                fontSize: "0.875rem",
                color: "#1c2b33",
              }}
            />
          </div>

          {agg.maxHours !== null && (
            <div style={{ marginTop: "0.75rem", background: "#e4f0ef", borderRadius: "0.375rem", padding: "0.5rem 0.75rem" }}>
              {pullTime ? (
                readyAt && (
                  <p style={{ color: "#0f5f5c" }}>
                    再開可能日時（推定）: <strong>{formatDateTime(readyAt)}</strong>
                  </p>
                )
              ) : (
                <p style={{ color: "#3c4d54" }}>抜去日時を入力すると再開可能日時を自動計算します。</p>
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
    <div style={cardStyle}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          width: "100%",
          justifyContent: "space-between",
          alignItems: "center",
          background: "none",
          border: "none",
          cursor: "pointer",
          textAlign: "left",
          padding: 0,
        }}
      >
        <h3 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.125rem", color: "#1c2b33" }}>
          末梢神経ブロック 深部／浅在性 一覧表
        </h3>
        <span style={{ color: "#6b7c80" }}>{open ? "－" : "＋"}</span>
      </button>
      {open && (
        <div style={{ marginTop: "1rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
          <div>
            <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#0f5f5c" }}>
              深部神経ブロック（中リスク群と同等）
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem", color: "#3c4d54" }}>
              {DEEP_BLOCKS.map((b) => (
                <li key={b} style={{ background: "#f1f5f5", borderRadius: "0.25rem", padding: "0.25rem 0.5rem" }}>
                  {b}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", fontWeight: 600, color: "#8a5a0a" }}>
              浅在性（体表面）神経ブロック（低リスク群）
            </p>
            <ul style={{ display: "flex", flexDirection: "column", gap: "0.25rem", fontSize: "0.875rem", color: "#3c4d54" }}>
              {SUPERFICIAL_BLOCKS.map((b) => (
                <li key={b} style={{ background: "#f1f5f5", borderRadius: "0.25rem", padding: "0.25rem 0.5rem" }}>
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

export default function App() {
  useEffect(() => {
    const preconnect1 = document.createElement("link");
    preconnect1.rel = "preconnect";
    preconnect1.href = "https://fonts.googleapis.com";
    const preconnect2 = document.createElement("link");
    preconnect2.rel = "preconnect";
    preconnect2.href = "https://fonts.gstatic.com";
    preconnect2.crossOrigin = "anonymous";
    const fontLink = document.createElement("link");
    fontLink.rel = "stylesheet";
    fontLink.href =
      "https://fonts.googleapis.com/css2?family=Zen+Old+Mincho:wght@400;500;700&family=Noto+Sans+JP:wght@400;500;700&display=swap";
    document.head.appendChild(preconnect1);
    document.head.appendChild(preconnect2);
    document.head.appendChild(fontLink);
    return () => {
      document.head.removeChild(preconnect1);
      document.head.removeChild(preconnect2);
      document.head.removeChild(fontLink);
    };
  }, []);

  const [selectedIds, setSelectedIds] = useState([]);
  const [inputsById, setInputsById] = useState({});
  const [search, setSearch] = useState("");
  const [pullTime, setPullTime] = useState("");

  const filteredDrugs = useMemo(() => {
    if (!search.trim()) return DRUGS;
    const q = search.trim().toLowerCase();
    return DRUGS.filter((d) => d.name.toLowerCase().includes(q) || d.brand.toLowerCase().includes(q));
  }, [search]);

  const grouped = useMemo(() => {
    const groups = {};
    for (const d of filteredDrugs) {
      groups[d.category] = groups[d.category] || [];
      groups[d.category].push(d);
    }
    return groups;
  }, [filteredDrugs]);

  const selectedDrugs = useMemo(() => DRUGS.filter((d) => selectedIds.includes(d.id)), [selectedIds]);

  const toggleDrug = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const updateInput = (id, patch) => {
    setInputsById((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const hasAnyInput =
    selectedIds.length > 0 ||
    pullTime !== "" ||
    Object.values(inputsById).some((v) => v && Object.values(v).some(Boolean));

  const clearAll = () => {
    setSelectedIds([]);
    setInputsById({});
    setSearch("");
    setPullTime("");
  };

  const midAgg = useMemo(() => aggregateWashout(selectedDrugs, inputsById, "mid"), [selectedDrugs, inputsById]);
  const lowAgg = useMemo(() => aggregateWashout(selectedDrugs, inputsById, "low"), [selectedDrugs, inputsById]);
  const catheterAgg = useMemo(() => aggregateCatheterRestart(selectedDrugs), [selectedDrugs]);

  return (
    <div style={{ background: "#f3f6f6", minHeight: "100vh", fontFamily: '"Noto Sans JP", sans-serif', color: "#1c2b33" }}>
      <div style={{ maxWidth: "56rem", margin: "0 auto", padding: "2rem 1.25rem" }}>
        <header style={{ marginBottom: "1.5rem" }}>
          <h1 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.6rem", color: "#1c2b33" }}>
            抗血栓薬服用患者の区域麻酔・神経ブロック 判定ツール
          </h1>
          <div
            style={{
              marginTop: "0.75rem",
              border: "1px solid rgba(15,95,92,0.3)",
              background: "#e4f0ef",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: "#0f5f5c",
            }}
          >
            出典:「抗血栓療法中の区域麻酔・神経ブロックガイドライン」日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会
            合同（2016年9月）表5〜7に基づく
          </div>
          <div
            style={{
              marginTop: "0.5rem",
              border: "1px solid rgba(181,120,26,0.4)",
              background: "#fbf0dd",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "0.75rem",
              color: "#8a5a0a",
              display: "flex",
              flexDirection: "column",
              gap: "0.25rem",
            }}
          >
            <p>・血小板減少や出血性素因等がある場合は出血リスク区分が上がりますが、本ツールはそれに対応していません。</p>
            <p>・ガイドライン本表に記載のない薬剤については、同種同効薬の基準を準用した参考値である旨を各カードに明記しています。</p>
            <p>・最終的な臨床判断は、必ず最新版ガイドライン・各施設のプロトコル・主治医・麻酔科医の判断によってください。</p>
          </div>
        </header>

        <section style={cardStyle}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "0.75rem" }}>
            <h2 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.25rem" }}>薬剤選択</h2>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span
                style={{
                  borderRadius: "9999px",
                  background: "#0f5f5c",
                  color: "#fff",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  padding: "0.15rem 0.6rem",
                }}
              >
                {selectedIds.length} 件選択中
              </span>
              <button
                type="button"
                onClick={clearAll}
                disabled={!hasAnyInput}
                style={{
                  borderRadius: "0.375rem",
                  padding: "0.4rem 0.75rem",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  border: "none",
                  cursor: hasAnyInput ? "pointer" : "not-allowed",
                  background: hasAnyInput ? "#1c2b33" : "#f1f5f5",
                  color: hasAnyInput ? "#fff" : "#6b7c80",
                }}
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
            style={{
              marginTop: "1rem",
              width: "100%",
              border: "1px solid #d9e2e2",
              borderRadius: "0.375rem",
              padding: "0.5rem 0.75rem",
              fontSize: "0.875rem",
              color: "#1c2b33",
            }}
          />

          {Object.entries(CATEGORY_LABELS).map(([cat, label]) => (
            <div key={cat} style={{ marginTop: "1rem" }}>
              <p style={{ marginBottom: "0.5rem", fontSize: "0.875rem", color: "#6b7c80" }}>{label}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {(grouped[cat] || []).map((d) => {
                  const active = selectedIds.includes(d.id);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      onClick={() => toggleDrug(d.id)}
                      style={{
                        border: "1px solid #c7d4d4",
                        borderRadius: "9999px",
                        padding: "0.4rem 0.9rem",
                        fontSize: "0.8125rem",
                        cursor: "pointer",
                        background: active ? "#0f5f5c" : "#fff",
                        color: active ? "#fff" : "#1c2b33",
                        borderColor: active ? "#0f5f5c" : "#c7d4d4",
                      }}
                    >
                      {d.name}
                    </button>
                  );
                })}
                {(grouped[cat] || []).length === 0 && (
                  <p style={{ fontSize: "0.75rem", color: "#6b7c80" }}>該当する薬剤がありません。</p>
                )}
              </div>
            </div>
          ))}
        </section>

        {selectedDrugs.length > 0 && (
          <section style={{ marginTop: "1.5rem" }}>
            <h2 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.25rem" }}>選択中の薬剤</h2>
            <div style={{ marginTop: "0.75rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
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
          <div
            style={{
              marginTop: "1.5rem",
              border: "1px solid rgba(181,120,26,0.4)",
              background: "#fbf0dd",
              borderRadius: "0.375rem",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
              color: "#8a5a0a",
            }}
          >
            複数の薬剤が選択されています。併用により出血リスクが単剤投与時より高まる可能性があります。本ツールは各薬剤の基準のうち
            <strong>最も長い期間を機械的に採用</strong>しているのみであり、併用時の安全性そのものを保証するものではありません。専門科（麻酔科・循環器科等）への相談を推奨します。
          </div>
        )}

        <section style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <h2 style={{ fontFamily: '"Zen Old Mincho", serif', fontSize: "1.25rem" }}>判定結果</h2>

          <WashoutResultCard
            title="① 脊髄くも膜下麻酔・硬膜外麻酔"
            description="中リスク群の休薬基準を使用します。"
            agg={midAgg}
          />

          <CatheterRestartCard agg={catheterAgg} pullTime={pullTime} onChangePullTime={setPullTime} />

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

        <section style={{ marginTop: "1.5rem" }}>
          <BlockReferenceTable />
        </section>

        <footer
          style={{
            marginTop: "2.5rem",
            borderTop: "1px solid #d9e2e2",
            paddingTop: "1rem",
            fontSize: "0.75rem",
            color: "#6b7c80",
          }}
        >
          <p>
            出典:「抗血栓療法中の区域麻酔・神経ブロックガイドライン」日本ペインクリニック学会・日本麻酔科学会・日本区域麻酔学会
            合同（2016年9月）
          </p>
          <p style={{ marginTop: "0.25rem" }}>
            本ツールは情報提供のみを目的としており、診断・治療方針の決定を代替するものではありません。
          </p>
        </footer>
      </div>
    </div>
  );
}
