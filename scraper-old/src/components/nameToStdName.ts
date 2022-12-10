import * as dotenv from "dotenv";
import { Configuration, OpenAIApi } from "openai";
import path from "path";
import unidecode from "unidecode";

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
Generate using title and description, a standardized name that uses only lowercase letters, dashes ("-"), and digits. If it is a duplicate, generate another name.

Examples:
===
Title: MutliMasks Unlimited Different Mask Types | Create Custom Masks! | Levels | Recoded
Description: You can create your own mask. There are various effects!, Minecraft, highly detailed, digital painting

Standardized name: multimasks
===
Title: StarItems Crafting Any Items! 100% optimization!
Description: Crafting Any Items!

Standardized name: staritems
===
Title: /freeze command
Description: Adds /freeze command to the game!

Standardized name: freeze-command
===
Title: ChatProtection+
Description: Prevents chat, and command spammers, along with caps limiting.

Standardized name:  chatprotectionplus
===
Title: KB9999
Description: Enchant an item with Knockback 9 Thousand.

Standardized name:  kb9999
===
Title: DDD
Description: Different Dimension Difficulty

Standardized name:  ddd
Is a duplicate!
Standardized name:  different-dimension-difficulty
===
Title: ThisSystem v 0.1
Description: System

Standardized name:  thissystem
===
Title: Scoreboard
Description: Minecraft Scoreboard Plugin 1.8.8

Standardized name:  scoreboard
Is a duplicate!
Standardized name:   scoreboard-1-8-8
===
`;
  const alreadyUsedNames = previousNames.map(
    (name) => `Standardized name: ${name}
  Is a duplicate!
`
  );
  const prompt = `${explainPrompt}
Title: ${name}
Description: ${description}

${alreadyUsedNames.join("")}
Standardized name:`;
  const response = await openai.createCompletion({
    model: "text-davinci-003",
    prompt,
    temperature: 0,
    max_tokens: 1000,
    stop: ["===", "Is a duplicate!"],
  });
  const stdName = response.data.choices[0].text?.trim() || "";
  return stdName;
}

if (require.main === module) {
  nameToStdName("ThisSystem v 0.1", "System", [
    "thissystem",
    "scoreboard",
    "scoreboard-1-8-8",
  ]).then(console.log);
}
