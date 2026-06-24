// 輸血製剤の血液型適合表（メモに基づく）。
// 自己型を優先し、入手できない場合の代替順を配列で保持する。

export const BLOOD_COMPATIBILITY = {
  A: { rbc: ["A", "O"], plasma: ["A", "AB", "B"] },
  B: { rbc: ["B", "O"], plasma: ["B", "AB", "A"] },
  AB: { rbc: ["AB", "A", "B", "O"], plasma: ["AB", "A", "B"] },
  O: { rbc: ["O"], plasma: ["O", "A", "B", "AB"] },
};

export const BLOOD_TYPES = ["A", "B", "AB", "O"];
