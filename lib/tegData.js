// TEG6s (Thromboelastography 6s) 評価支援データ
// 基準範囲は Haemonetics TEG6s 関連文献・添付文書の代表値を参考にした目安。
// 機器のロット・カートリッジ・施設により基準範囲は異なるため、実運用では各施設の基準範囲を優先すること。

export const TEG_PARAMETERS = [
  {
    key: "r_ck",
    assay: "CK",
    assayFull: "Citrated Kaolin(カオリン活性化)",
    label: "反応時間",
    abbr: "R",
    unit: "分",
    range: [4.6, 9.1],
    meaning:
      "検体添加から初期フィブリン網形成(振幅2mm到達)までの時間。凝固因子(内因系)の活性を反映する。",
  },
  {
    key: "r_ckh",
    assay: "CKH",
    assayFull: "Citrated Kaolin + Heparinase",
    label: "反応時間(ヘパリナーゼ添加)",
    abbr: "R",
    unit: "分",
    range: [4.3, 8.3],
    meaning:
      "検体中のヘパリンをヘパリナーゼで中和したうえでのR time。CK-Rと比較することでヘパリン効果の有無を判定できる。",
  },
  {
    key: "k",
    assay: "CK",
    assayFull: "Citrated Kaolin",
    label: "凝固形成時間",
    abbr: "K",
    unit: "分",
    range: [0.8, 2.5],
    meaning:
      "R終了後、振幅が20mmに達するまでの時間。フィブリン架橋・血餅強度形成の速度を反映する。MAが20mm未満では測定不能(N/A)。",
  },
  {
    key: "angle",
    assay: "CK",
    assayFull: "Citrated Kaolin",
    label: "α角",
    abbr: "Angle(α)",
    unit: "°",
    range: [63, 75],
    meaning: "クロット形成の速度(勢い)。フィブリノゲン濃度・凝固因子活性の影響を受ける。",
  },
  {
    key: "ma_ck",
    assay: "CK / CRT",
    assayFull: "Citrated Kaolin / Citrated RapidTEG",
    label: "最大振幅",
    abbr: "MA",
    unit: "mm",
    range: [52, 69],
    meaning:
      "血小板とフィブリノゲンの相互作用による最終的な血餅強度。振幅への寄与は血小板が約80%、フィブリノゲンが約20%とされる。",
  },
  {
    key: "ma_cff",
    assay: "CFF",
    assayFull: "Citrated Functional Fibrinogen",
    label: "機能的フィブリノゲンMA",
    abbr: "FF-MA",
    unit: "mm",
    range: [15, 34],
    meaning:
      "血小板GPIIb/IIIa阻害剤(アブシキマブ様試薬)存在下で測定するため、フィブリノゲン単独の血餅強度への寄与を反映する。おおよそFF-MA 19.5mm前後がフィブリノゲン200mg/dL相当の目安とされる。",
  },
  {
    key: "ly30",
    assay: "CK",
    assayFull: "Citrated Kaolin",
    label: "溶解率",
    abbr: "LY30",
    unit: "%",
    range: [0, 3],
    meaning:
      "MA到達30分後の振幅減少率。線溶(プラスミン)活性を反映する。おおよそ3〜8%で軽度〜中等度、8%以上で重度の線溶亢進の目安とされる。",
  },
  {
    key: "ci",
    assay: "CK",
    assayFull: "Citrated Kaolin",
    label: "凝固指数",
    abbr: "CI",
    unit: "",
    range: [-3.0, 3.0],
    meaning:
      "R, K, Angle, MAを重み付けして統合した総合的な凝固能指数。負に大きいほど低凝固傾向、正に大きいほど過凝固傾向を示す。",
  },
];

// パターン表示用の模式波形パラメータ(教育用イメージであり実測波形ではない)
export const NORMAL_TRACE = { r: 6.8, k: 1.6, ma: 60, ly30: 1 };

export const TEG_PATTERNS = [
  {
    id: "normal",
    name: "正常波形",
    tag: "基準",
    color: "#0f5f5c",
    summary: "R・K・Angle・MA・LY30・CIのすべてが基準範囲内におさまるパターン。",
    keyChanges: ["すべての項目が基準範囲内", "MA到達後は振幅がほぼ一定に保たれる"],
    causes: "生理的な止血機能が保たれている状態。",
    management: "特別な凝固系への治療介入は不要。周術期の他の出血原因(外科的出血など)を評価する。",
    trace: NORMAL_TRACE,
  },
  {
    id: "factor-deficiency",
    name: "凝固因子欠乏",
    tag: "低凝固",
    color: "#8a5a0a",
    summary: "凝固因子活性の低下によりクロット形成の開始が遅延するパターン。",
    keyChanges: [
      "R延長(特にCKH-Rの著明な延長)",
      "Angleは軽度低下することがある",
      "MAは比較的保たれることが多い",
    ],
    causes:
      "肝機能障害、ワルファリン・DOAC内服、大量輸液・輸血による希釈性凝固障害、先天性凝固因子欠乏症など。",
    management:
      "新鮮凍結血漿(FFP)10〜15mL/kg、またはプロトロンビン複合体濃縮製剤(PCC)を病態に応じて検討。ワルファリン内服例ではビタミンK投与も考慮。",
    trace: { r: 14, k: 3.2, ma: 54, ly30: 1 },
  },
  {
    id: "hypofibrinogenemia",
    name: "フィブリノゲン低下",
    tag: "低凝固",
    color: "#8a5a0a",
    summary: "フィブリノゲン(またはその機能)の低下により血餅強度が低下するパターン。",
    keyChanges: ["FF-MAの低下(<15mm)", "Angleの低下", "CK-MAも二次的に低下しうる"],
    causes: "大量出血・希釈性凝固障害、産科DIC、肝不全、L-アスパラギナーゼ投与後など。",
    management:
      "フィブリノゲン濃縮製剤またはクリオプレシピテートを投与し、目標フィブリノゲン濃度(目安150〜200mg/dL以上)を確保する。",
    trace: { r: 6.8, k: 3.6, ma: 40, ly30: 1 },
  },
  {
    id: "platelet",
    name: "血小板減少・機能低下",
    tag: "低凝固",
    color: "#8a5a0a",
    summary: "血小板数減少または機能低下により、フィブリノゲンは保たれつつMAのみ低下するパターン。",
    keyChanges: [
      "CK-MAの低下",
      "FF-MAは正常(フィブリノゲンの寄与分は保たれる)",
      "R・Angleは比較的正常",
    ],
    causes:
      "血小板減少症、抗血小板薬(アスピリン・P2Y12阻害薬)内服、体外循環後の血小板機能低下、尿毒症など。",
    management:
      "血小板輸血、DDAVP投与を病態に応じて検討。抗血小板薬の内服歴・休薬状況を確認する。",
    trace: { r: 6.8, k: 2.4, ma: 42, ly30: 1 },
  },
  {
    id: "hyperfibrinolysis",
    name: "線溶亢進",
    tag: "線溶異常",
    color: "#b23b3b",
    summary: "MA到達後にプラスミン活性亢進により血餅が急速に溶解するパターン(いわゆる whale sign)。",
    keyChanges: [
      "LY30の上昇(>3%)",
      "重度ではMA到達直後から振幅が急速に低下",
      "R・Angle・MA自体は正常のことも多い",
    ],
    causes: "外傷急性期、産科合併症(常位胎盤早期剥離など)、肝移植・肝切除術中、DIC線溶期など。",
    management:
      "トラネキサム酸(TXA)1g静注(以後1g/8時間などを病態に応じ継続)を早期に検討。LY30目安:3〜8%は軽度〜中等度、8%以上は重度の線溶亢進として早期介入を考慮。原疾患の治療も並行する。",
    trace: { r: 6.8, k: 1.6, ma: 58, ly30: 45 },
  },
  {
    id: "heparin",
    name: "ヘパリン効果",
    tag: "低凝固",
    color: "#8a5a0a",
    summary: "残存・過剰なヘパリンによりCK-Rのみが延長し、ヘパリナーゼ添加チャンネルでは正常化するパターン。",
    keyChanges: [
      "CK-Rの著明な延長",
      "CKH-R(ヘパリナーゼ添加)は正常範囲",
      "CK-R / CKH-R比 ≧ 1.4程度が目安",
    ],
    causes: "ヘパリン投与中、体外循環(CPB)後のヘパリン残存・リバウンド現象など。",
    management:
      "残存ヘパリン量に応じたプロタミン投与によるヘパリン中和を検討。CK-Rのみの延長でCKH-Rが正常であれば、凝固因子補充より中和を優先する。",
    trace: { r: 15.5, k: 1.7, ma: 58, ly30: 1 },
    overlayNote: "CKH-R(ヘパリナーゼ添加)では正常化するため、実際にはR短縮側の波形も並記して比較する。",
  },
  {
    id: "hypercoagulable",
    name: "過凝固状態",
    tag: "過凝固",
    color: "#1d6fa5",
    summary: "クロット形成が速く強固になり、全体的に基準範囲を超えて凝固能が亢進するパターン。",
    keyChanges: ["Rの短縮", "Angleの増大", "MAの増大", "CIの上昇(>3)"],
    causes: "術後・外傷後の生理的反応、悪性腫瘍、妊娠、炎症・敗血症、DIC代償期など。",
    management:
      "画一的な薬物治療の適応にはならないが、静脈血栓塞栓症(VTE)リスクを評価し、早期離床・間欠的空気圧迫法、必要に応じた薬物的血栓予防を検討する。",
    trace: { r: 3.6, k: 0.9, ma: 76, ly30: 0 },
  },
];

export function classifyValue(value, range) {
  if (value === "" || value === null || value === undefined) return null;
  const v = parseFloat(value);
  if (isNaN(v)) return null;
  const [low, high] = range;
  if (v < low) return "low";
  if (v > high) return "high";
  return "normal";
}

export function statusLabel(status) {
  if (status === "low") return "低値";
  if (status === "high") return "高値";
  if (status === "normal") return "正常";
  return "未入力";
}

export function statusStampClass(status) {
  if (status === "normal") return "stamp-green";
  if (status === "low" || status === "high") return "stamp-amber";
  return "stamp-gray";
}
