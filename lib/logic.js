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
    return { drug, perDrugInput, washout: w, hours: washoutToHours(w) };
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

export function aggregateCatheterRestart(selectedDrugs) {
  if (selectedDrugs.length === 0) {
    return { status: "none" };
  }
  const resolved = selectedDrugs.map((drug) => ({
    drug,
    restart: drug.catheterRestart,
  }));

  const ambiguous = resolved.filter((r) => r.restart.hours === null);
  const numeric = resolved.filter((r) => r.restart.hours !== null);

  let maxHours = null;
  let rateLimiting = [];
  if (numeric.length > 0) {
    maxHours = Math.max(...numeric.map((r) => r.restart.hours));
    rateLimiting = numeric.filter((r) => r.restart.hours === maxHours);
  }

  return {
    status: "resolved",
    maxHours,
    rateLimiting,
    ambiguous,
    resolved,
  };
}

export function addHoursToDate(dateTimeLocalStr, hours) {
  if (!dateTimeLocalStr || hours === null || hours === undefined) return null;
  const d = new Date(dateTimeLocalStr);
  if (isNaN(d.getTime())) return null;
  return new Date(d.getTime() + hours * 60 * 60 * 1000);
}

export function formatDateTime(date) {
  if (!date) return "";
  const pad = (n) => String(n).padStart(2, "0");
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(
    date.getDate()
  )} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

// 計算に必要な「最終服用日時」がすべて揃っているか確認し、
// 揃っていれば最も遅い施行可能日時を返す。
export function computeReadyDateTime(resolved) {
  const needed = resolved.filter((r) => (r.hours ?? 0) > 0);
  if (needed.length === 0) {
    return { computable: true, readyAt: null, missing: [] };
  }
  const missing = needed.filter((r) => !r.perDrugInput?.lastDoseTime);
  if (missing.length > 0) {
    return { computable: false, readyAt: null, missing: missing.map((r) => r.drug.name) };
  }
  const candidates = needed.map((r) =>
    addHoursToDate(r.perDrugInput.lastDoseTime, r.hours)
  );
  const readyAt = new Date(Math.max(...candidates.map((d) => d.getTime())));
  return { computable: true, readyAt, missing: [] };
}
