
const apiKey = "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";

async function testFlux() {
  console.log("Testing NVIDIA FLUX.1-dev with key:", apiKey.substring(0, 10) + "...");
  try {
    const response = await fetch("https://ai.api.nvidia.com/v1/genai/blackforestlabs/flux-1-dev", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        text_prompts: [
          {
            text: "A cyberpunk city at night with neon lights",
            weight: 1
          }
        ],
        seed: 0,
        cfg_scale: 5,
        sampler: "DPM++ 2M",
        steps: 20
      }),
    });

    console.log("Status:", response.status);
    const text = await response.text();
    console.log("Response:", text.substring(0, 200));

  } catch (err) {
    console.error("Error:", err);
  }
}

testFlux();
