import { useState } from "react";
import Head from "next/head";
import Image from "next/image";
import styles from "../styles/Home.module.css";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const Prediction = ({ prediction }) => {
  const { status, output, logs, percentage } = prediction;
  let image = null;
  let cnImage = null;
  if (output) {
    image = output[output.length - 1];
    cnImage = output[output.length - 2];
  }

  if (logs) console.log(logs);

  return (
    <div className={styles.prediction}>
      <h2>
        Status: {status} ({Math.floor(percentage)}%)
      </h2>
      {image && <img src={image} />}
      {cnImage && <img src={cnImage} />}
      {/* {logs && <pre>{logs}</pre>} */}
    </div>
  );
};

const testImages = [
  "https://s3.amazonaws.com/www.pathwright.com/logo-test-wallpaper-1365-768.jpg",
  "https://s3.amazonaws.com/www.pathwright.com/logo-test-wallpaper-768x1365.jpg",
  "https://s3.amazonaws.com/www.pathwright.com/logo-test-wallpaper-1088-640.jpg",
  "https://s3.amazonaws.com/www.pathwright.com/logo-test-wallpaper-512-768.jpg",
];

const samplePrompts = [
  "Illustration of a hyperrealistic , otherworldly, ultrasky scene featuring a giant crystal tree full body,very detailed and magical lighting, intricate forest details, vegetation and river around, solarpunk ,landscape, giant tree, beatifull leafy with beautiful lighting and realistic proportions, as if it were a cinematic background, 8k, highest quality, masterpiece, clouds and stars in the sky.",
  "first spring with melting snow after the impact winter post cretaceous – paleogene extinction event, life is starting to adapt to a changed world, in the style of hudson river school of art, oil on canvas",
  "An urban cityscape at night, with towering skyscrapers and neon lights casting a colorful glow over the streets below.",
  "a rooftop in a cyberpunk city, blade runner, nighttime, rain, intricate artwork by tooth wu and wlop and beeple, octane render, hyper realism, 8 k",
  "victorian city, heavy rain, a beautiful painting, digital art, overdetailed art, concept art, detailed illustration, hd, 4k, digital art, highly saturated colors, Dan Mumford,  Greg rutkowski, Victo Ngai",
  "metal logotype, epic cinematic 3d space wallpaper 4k, space particle explosion, luminous stars and lens flares, highly detailed, intricate, 5k cinema still",
];

const demoData = {
  prompt: samplePrompts[0],
  image: testImages[1],
  n_prompt:
    "blurry, blur, lowres, worst quality, low quality, low res, low resolution",
  model_type: "canny",
  steps: 50,
};

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

  const [prompt, setPrompt] = useState(demoData.prompt);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("/api/predictions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: e.target.prompt.value,
        image: e.target.image.value,
        n_prompt: e.target.n_prompt.value,
        model_type: e.target.model_type.value,
      }),
    });
    let prediction = await response.json();
    if (response.status !== 201) {
      setError(prediction.detail);
      return;
    }
    setPrediction(prediction);

    while (
      prediction.status !== "succeeded" &&
      prediction.status !== "failed"
    ) {
      await sleep(1000);
      const response = await fetch("/api/predictions/" + prediction.id);
      prediction = await response.json();
      if (response.status !== 200) {
        setError(prediction.detail);
        return;
      }
      setPrediction(prediction);
    }
  };

  const isProcessing = prediction !== null && prediction.status !== "succeeded";

  return (
    <div className={styles.container}>
      <Head>
        <title>Replicate + Next.js Controlnet Demo</title>
      </Head>

      <p>Controlnet demo.</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="image">Control Image URL</label>
        <input
          type="text"
          name="image"
          defaultValue={demoData.image}
          placeholder="Enter controlnet image reference URL"
        />
        <label htmlFor="prompt">
          Prompt
          <button
            onClick={(e) => {
              e.preventDefault();
              // set a random prompt
              setPrompt(
                samplePrompts[Math.floor(Math.random() * samplePrompts.length)]
              );
            }}
          >
            🔀
          </button>
        </label>
        <textarea
          name="prompt"
          placeholder="Enter a prompt"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <label htmlFor="n_prompt">Negative prompt</label>
        <textarea
          name="n_prompt"
          placeholder="Enter a negative prompt"
          defaultValue={demoData.n_prompt}
        />
        <label htmlFor="steps">Steps</label>
        <input type="number" name="steps" defaultValue={demoData.steps} />
        <label htmlFor="model_type">Model type</label>
        <select name="model_type" defaultValue={demoData.model_type}>
          <option value="depth">depth</option>
          <option value="canny">canny</option>
          <option value="hed">hed</option>
        </select>
        <button type="submit" disabled={isProcessing}>
          Go!
        </button>
      </form>

      {error && <div>{error}</div>}

      {prediction && <Prediction prediction={prediction} />}
    </div>
  );
}
