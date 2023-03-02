const getPercentageFromLog = (log) => {
  // hacky af
  const lines = log.trim().split("\n");
  let lastLine = lines.pop();
  lastLine = lastLine.replace("DDIM Sampler:  ", "");
  let [perc, _] = lastLine.split("%");
  perc = perc.trim();

  // test if it's a number
  if (isNaN(perc)) {
    return 0;
  }

  return parseInt(perc);
};

export default async function handler(req, res) {
  const response = await fetch(
    "https://api.replicate.com/v1/predictions/" + req.query.id,
    {
      headers: {
        Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
    }
  );
  if (response.status !== 200) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  let prediction = await response.json();
  if (prediction.logs) {
    prediction.percentage = getPercentageFromLog(prediction.logs);
  } else {
    prediction.percentage = 0;
  }
  res.end(JSON.stringify(prediction));
}
