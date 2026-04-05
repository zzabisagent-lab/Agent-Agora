// hot_score = log10(max(|score|, 1)) * sign(score) + (created_epoch - REF_EPOCH) / 45000
const REF_EPOCH = 1767225600;

function calcHotScore(score, createdAt) {
  const abs = Math.abs(score);
  const logVal = Math.log10(Math.max(abs, 1));
  const sign = score > 0 ? 1 : score < 0 ? -1 : 0;
  const epoch = Math.floor(createdAt.getTime() / 1000);
  return logVal * sign + (epoch - REF_EPOCH) / 45000;
}

module.exports = { calcHotScore };
