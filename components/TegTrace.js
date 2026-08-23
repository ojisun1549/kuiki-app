// TEG波形の模式図(教育用イメージ)を描画するSVGコンポーネント。
// R(反応時間)・K(凝固形成時間)・MA(最大振幅)・LY30(溶解率)からロジスティック曲線を生成し、
// 紡錘形のクロット形成〜(必要なら)線溶による振幅低下までを近似的に可視化する。

const CHART_W = 320;
const CHART_H = 150;
const PAD_X = 14;
const PAD_Y = 12;
const TIME_SPAN = 32; // 表示する時間軸の幅(分・スケール)
const MAX_AMP = 85; // 振幅スケールの基準(mm)

function amplitudeAt(t, { r, k, ma, ly30 }) {
  if (t <= r) return 0;
  const steep = 3 / Math.max(k, 0.3);
  const t0 = r + k;
  let amp = ma / (1 + Math.exp(-steep * (t - t0)));
  const decayStart = t0 + 6;
  if (ly30 > 0 && t > decayStart) {
    const frac = Math.min(1, (t - decayStart) / 8);
    const floor = ma * Math.max(0, 1 - ly30 / 100);
    amp = amp - (amp - floor) * frac;
  }
  return Math.max(0, amp);
}

function buildSpindlePath(trace) {
  const N = 100;
  const xScale = (CHART_W - 2 * PAD_X) / TIME_SPAN;
  const yScale = (CHART_H / 2 - PAD_Y) / MAX_AMP;
  const midY = CHART_H / 2;
  const top = [];
  const bottom = [];
  for (let i = 0; i <= N; i++) {
    const t = (i / N) * TIME_SPAN;
    const amp = amplitudeAt(t, trace);
    const x = PAD_X + t * xScale;
    top.push(`${x.toFixed(1)},${(midY - amp * yScale).toFixed(1)}`);
    bottom.push(`${x.toFixed(1)},${(midY + amp * yScale).toFixed(1)}`);
  }
  const d = `M ${top.join(" L ")} L ${bottom.slice().reverse().join(" L ")} Z`;
  const rX = PAD_X + trace.r * xScale;
  return { d, rX, midY };
}

export default function TegTrace({ trace, color = "#0f5f5c", showNormalOverlay = true, normalTrace }) {
  const { d, rX, midY } = buildSpindlePath(trace);
  const normal = showNormalOverlay && normalTrace ? buildSpindlePath(normalTrace) : null;

  return (
    <svg
      viewBox={`0 0 ${CHART_W} ${CHART_H}`}
      className="h-auto w-full"
      role="img"
      aria-label={`模式TEG波形 R${trace.r}分 MA${trace.ma}mm LY30 ${trace.ly30}%`}
    >
      <line x1={PAD_X} y1={midY} x2={CHART_W - PAD_X} y2={midY} stroke="#c7d4d4" strokeWidth="1" strokeDasharray="2 3" />

      {normal && (
        <path d={normal.d} fill="none" stroke="#9fb0b0" strokeWidth="1.5" strokeDasharray="4 3" />
      )}

      <path d={d} fill={color} fillOpacity="0.18" stroke={color} strokeWidth="2" strokeLinejoin="round" />

      <line x1={rX} y1={midY - 4} x2={rX} y2={midY + 4} stroke={color} strokeWidth="1.5" />
      <text x={rX} y={midY + 18} fontSize="9" fill="#3c4d54" textAnchor="middle">
        R {trace.r.toFixed(1)}分
      </text>

      <text x={CHART_W - PAD_X} y={12} fontSize="9" fill="#3c4d54" textAnchor="end">
        MA {trace.ma}mm ／ LY30 {trace.ly30}%
      </text>
    </svg>
  );
}
