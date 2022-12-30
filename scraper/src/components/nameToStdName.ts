import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import path from "path";
import unidecode from "unidecode";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

export function classicNameToStdName(name: string): string {
  return unidecode(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-");
}

export default async function nameToStdName(
  name: string,
  description: string,
  previousNames: string[]
): Promise<string> {
  const explainPrompt = `
Std. name, only ASCII. If duplicate, then another name. Title - T; Desc. - D; Std. name - S; Duplicate - E
===
T: /freeze command
D: Adds /freeze!

S: freeze-command
===
T: ChatProtection+
D:

S: chatprotectionplus
===
T: DDD
D: Different Dimension Difficulty

E: ddd

S: different-dimension-difficulty
===
T: Scoreboard
D: Plugin 1.8.8

E: scoreboard

S: scoreboard-1-8-8
===
`;
  const alreadyUsedNames = previousNames.map(
    (name) => `"${name}"` // wrap in quotes
  );

  let prompt = ""
  if (alreadyUsedNames.length > 0) {
    prompt = `${explainPrompt}
T: ${name}
D: ${description}

E: ${alreadyUsedNames.join(", ")}
S: `;
  } else {
    prompt = `${explainPrompt}
T: ${name}
D: ${description}

S: `;
  }
  while (true) {
    try {
      let model = "ada:ft-mble:adrianna-nametostdname-v0-2-3-2022-12-28-19-19-02";
      const response = await openai.createCompletion({
        model,
        prompt,
        temperature: 0,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0.7,
        presence_penalty: 0,
        stop: ["===", "\n"],
      });
      const stdName = response.data.choices[0].text || "";
      const sanitizedStdName = classicNameToStdName(stdName);
      return sanitizedStdName;
    } catch (error: any) {
      console.error(error.response.status);
    }
  }
}
