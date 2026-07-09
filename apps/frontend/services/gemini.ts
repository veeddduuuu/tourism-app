const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY!;

type WelcomeInput = {
  city: string;
  country: string;
  weather: string;
  temperature: number;
  festival: string;
  language: string;
  time: string;
};

export async function getWelcomeContent(info: WelcomeInput) {
  const prompt = `
You are India's smartest AI travel guide.

User Details

City: ${info.city}
Country: ${info.country}

Weather: ${info.weather}

Temperature: ${info.temperature}

Time: ${info.time}

Festival: ${info.festival}

Language: ${info.language}

Generate ONLY valid JSON.

{
"title":"",
"subtitle":"",
"imagePrompt":"",
"recommendedDestination":"",
"food":""
}
`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt,
              },
            ],
          },
        ],
      }),
    }
  );

  const data = await response.json();

console.log("Status:", response.status);
console.log("Gemini response:", JSON.stringify(data, null, 2));

if (!response.ok) {
  throw new Error(JSON.stringify(data, null, 2));
}

if (!data.candidates?.length) {
  throw new Error("No candidates returned:\n" + JSON.stringify(data, null, 2));
}

const text = data.candidates[0].content.parts[0].text
  .replace(/```json/g, "")
  .replace(/```/g, "")
  .trim();

return JSON.parse(text);
}
