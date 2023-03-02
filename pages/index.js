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

const demoData = {
  prompt:
    "cinematic film still high angle photo of highway highway overpass in city, highly detailed, intricate, cinematic lighting, golden hour, natural light, shallow focus, bokeh effect, 50mm lens, realistic, epic, 5k cinema still ",
  image:
    "https://s3.amazonaws.com/testing.pathwrightcdn.com/logo-test-wallpaper-512-768.jpg",
  n_prompt:
    "blurry, blur, lowres, worst quality, low quality, low res, low resolution",
  model_type: "canny",
  steps: 50,
};

export default function Home() {
  const [prediction, setPrediction] = useState(null);
  const [error, setError] = useState(null);

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
        <label htmlFor="image">Image URL</label>
        <input
          type="text"
          name="image"
          defaultValue={demoData.image}
          placeholder="Enter controlnet image reference URL"
        />
        <label htmlFor="prompt">Prompt</label>
        <textarea
          name="prompt"
          placeholder="Enter a prompt"
          defaultValue={demoData.prompt}
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
