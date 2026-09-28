// Shared recharts styling so every chart matches the soft sky-blue theme.
export const CHART_COLORS = {
  teal: "#2E86BD",
  blue: "#8FCBE8",
  amber: "#D9A34D",
  red: "#D97C72",
  purple: "#A98FD2",
  grid: "rgba(30,45,60,0.08)",
  tick: "#93A3B2",
};

export const CHART_PALETTE = ["#2E86BD", "#8FCBE8", "#D9A34D", "#A98FD2", "#5FB4DC", "#D97C72", "#4A9FC7"];

export const axisTick = { fontSize: 11, fill: CHART_COLORS.tick };

export const tooltipStyle = {
  contentStyle: {
    background: "#FFFFFF",
    border: "1px solid rgba(30,45,60,0.12)",
    borderRadius: 10,
    fontSize: 12.5,
    color: "#263443",
    boxShadow: "0 4px 18px rgba(40,70,100,0.1)",
  },
  labelStyle: { color: "#74879A" },
  itemStyle: { color: "#263443" },
};
