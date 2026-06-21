// 各薬剤の選択状態（個別入力）から休薬基準・再開時間を解決し、
// 複数薬剤併用時には「最も保守的な（長い）基準」を採用するロジック。

export function resolveMidWashout(drug, perDrugInput) {
  if (drug.specialInput === "heparin-route") {
    const route = perDrugInput?.route || "iv";
    return drug.washoutByRoute[route];
  }
  if (drug.specialInput === "dabigatran-renal") {
    const renal = perDrugInput?.renal || "normal";
    return drug.washoutMidByRenal[renal];
  }
  return drug.washoutMid;
}

export function resolveLowWashout(drug, perDrugInput) {
  if (drug.specialInput === "heparin-route") {
    const route = perDrugInput?.route || "iv";
    return drug.washoutByRoute[route];
  }
  return drug.washoutLow;
}

export function washoutToHours(w) {
  if (!w) return null;
  if (w.tbd) return null;
  if (typeof w.days === "number") return w.days * 24;
  if (typeof w.hours === "number") return w.hours;
  return null;
}

// 休薬基準が「日単位」か「時間単位」かを判定する。
// 日単位の場合は時刻入力を不要にし、日付のみの入力で計算できるようにする。
export function getWashoutUnit(w) {
  if (!w || w.tbd) return "hour";
  if (typeof w.days === "number") return "day";
  return "hour";
}

// 薬剤カードの「最終服用（投与）日時」入力欄の単位（日単位／時刻単位）を決める。
// 中リスク群の基準を優先的に参照し、それがtbdの場合は低リスク群の基準を参照する。
export function getDoseInputUnit(drug, perDrugInput) {
  const midW = resolveMidWashout(drug, perDrugInput);
  if (midW && !midW.tbd) return getWashoutUnit(midW);
  const lowW = resolveLowWashout(drug, perDrugInput);
  if (lowW && !lowW.tbd) return getWashoutUnit(lowW);
  return "day";
}

// risk: "mid" | "low"
export function aggregateWashout(selectedDrugs, inputsById, risk) {
  if (selectedDrugs.length === 0) {
    return { status: "none" };
  }

  const resolved = selectedDrugs.map((drug) => {
    const perDrugInput = inputsById[drug.id] || {};
    const w =
      risk === "mid"
        ? resolveMidWashout(drug, perDrugInput)
        : resolveLowWashout(drug, perDrugInput);
    return {
      drug,
      perDrugInput,
      washout: w,
      hours: washoutToHours(w),
      unit: getWashoutUnit(w),
    };
  });

  const hasTbd = resolved.some((r) => r.washout?.tbd);
  if (hasTbd) {
    return {
      status: "individual",
      tbdDrugs: resolved.filter((r) => r.washout?.tbd).map((r) => r.drug),
      resolved,
    };
  }

  const maxHours = Math.max(...resolved.map((r) => r.hours ?? 0));
  const rateLimiting = resolved.filter((r) => (r.hours ?? 0) === maxHours);

  return {
    status: maxHours > 0 ? "washout-required" : "no-washout",
    maxHours,
    rateLimiting,
    resolved,
  };
}

// カテーテル抜去後の再開基準が「日単位」か「時間単位」かを判定する。
// データ上は基本的に時間単位（hours）だが、将来日単位（days）の基準が
// 追加された場合にも対応できるようにしておく。
export function getRestartUnit(restart) {
  if (!restart) return "hour";
  if (typeof restart.days === "number") return "day";
  return "hour";
}

export function aggregateCatheterRestart(selectedDrugs) {
  if (selectedDrugs.length === 0) {
    return { status: "none" };
  }
  const resolved = selectedDrugs.map((drug) => ({
    drug,
    restart: drug.catheterRestart,
    unit: getRestartUnit(drug.catheterRestart),
  }));

  const ambiguous = resolved.filter((r) => r.restart.hours === null);
  const numeric = resolved.filter((r) => r.restart.hours !== null);

  let maxHours = null;
  let rateLimiting = [];
  let unit = "hour";
  if (numeric.length > 0) {
    maxHours = Math.max(...numeric.map((r) => r.restart.hours));
    rateLimiting = numeric.filter((r) => r.restart.hours === maxHours);
    unit = rateLimiting.every((r) => r.unit === "day") ? "day" : "hour";
  }

  return {
    status: "resolved",
    maxHours,
    rateLimiting,
    ambiguous,
    resolved,
    unit,
  };
}

// 日付のみの入力（YYYY-MM-DD）と日時入力（datetime-localのYYYY-MM-DDTHH:MM）の
// 両方を、タイムゾーンのずれが起きないようにローカル時刻として解釈する。
function parseLocalDateTime(str) {
  if (!str) return null;
  if (str.length === 10) {
    const [y, m, d] = str.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d, 0, 0, 0, 0);
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d;
}

export function addHoursToDate(dateTimeLocalStr, hours) {
  if (!dateTimeLocalStr || hours === null || hours === undefined) return null;
  const d = parseLocalDateTime(dateTimeLocalStr);
  if (!d) return null;
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

// 採用基準（時間）を表示用に整形する。24時間以上は日単位（＋余り時間）で表示し、わかりやすくする。
export function formatDurationHours(hours) {
  if (hours === null || hours === undefined) return "";
  if (hours <= 0) return "休薬不要";
  if (hours < 24) return `${hours} 時間`;
  const days = Math.floor(hours / 24);
  const remainder = hours % 24;
  return remainder === 0 ? `${days} 日` : `${days} 日 ${remainder} 時間`;
}

export function formatDateTime(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function formatDate(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

// 計算に必要な「最終服用日時」がすべて揃っているか確認し、
// 揃っていれば最も遅い施行可能日時を返す。
// すべての律速要素が日単位の基準であれば、表示も日付のみにする。
export function computeReadyDateTime(resolved) {
  const needed = resolved.filter((r) => (r.hours ?? 0) > 0);
  if (needed.length === 0) {
    return { computable: true, readyAt: null, missing: [], unit: "day" };
  }
  const missing = needed.filter((r) => !r.perDrugInput?.lastDoseTime);
  if (missing.length > 0) {
    return {
      computable: false,
      readyAt: null,
      missing: missing.map((r) => r.drug.name),
      unit: "day",
    };
  }
  const candidates = needed.map((r) =>
    addHoursToDate(r.perDrugInput.lastDoseTime, r.hours)
  );
  const readyAt = new Date(Math.max(...candidates.map((d) => d.getTime())));
  const unit = needed.every((r) => r.unit === "day") ? "day" : "hour";
  return { computable: true, readyAt, missing: [], unit };
}
