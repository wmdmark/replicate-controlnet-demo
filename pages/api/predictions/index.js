//
const MODEL_VERSION =
  "8ebda4c70b3ea2a2bf86e44595afb562a2cdf85525c620f1671a78113c9f325b";

// depth model
const DEPTH_MODEL_VERSION =
  "922c7bb67b87ec32cbc2fd11b1d5f94f0ba4f5519c4dbd02856376444127cc60";

export default async function handler(req, res) {
  // See  https://replicate.com/jagilley/controlnet/api for all input args
  const input = {
    image: req.body.image,
    // canny, hed, and depth are probably best for logos
    model_type: req.body.model_type || "canny",
    n_prompt:
      req.body.n_prompt ||
      "blurry, blur, lowres, worst quality, low quality, low res, low resolution",
    prompt: req.body.prompt,
    scale: 7.5,
    ddim_steps: req.body.ddim_steps || 50,
    detect_resolution: 512,
  };
  const response = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: {
      Authorization: `Token ${process.env.REPLICATE_API_TOKEN}`,
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      version: MODEL_VERSION,
      input,
    }),
  });

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();
  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
