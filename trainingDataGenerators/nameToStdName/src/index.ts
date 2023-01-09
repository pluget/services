import fs from "fs-extra";
import path from "path";
import { parse as csvParse } from "csv-parse/sync";
import { parse as yamlParse } from "yaml";
import _ from "lodash";

const releaseType = [
  "pre-alpha",
  "alpha",
  "beta",
  "release candidate",
  "rc",
  "release",
  "stable"
]

const tierType = [
  "lite",
  "community",
  "demo",
  "free",
  "pro",
  "professional",
  "premium",
  "paid"
]

const separators = [
  "|",
  ",",
  ";",
  ":",
  ">",
  "<",
  "\\",
  "/",
  "-",
  "_",
  "+",
  "=",
  "*",
  "&",
  "#",
  "@",
  "!",
  "$"
]

const englishWords = fs.readFileSync(path.resolve(__dirname, "./wordlists/words_alpha.txt"), "utf-8").split("\n").map(word => word.trim());

const englishAdjectives = fs.readFileSync(path.resolve(__dirname, "./wordlists/english-adjectives.txt"), "utf-8").split("\n").map(word => word.trim())
const englishNouns = fs.readFileSync(path.resolve(__dirname, "./wordlists/english-nouns.txt"), "utf-8").split("\n").map(word => word.trim())

const nouncsv = fs.readFileSync(path.resolve(__dirname, "./wordlists/noun.csv"), "utf-8")
const englishNounsSingularPlural = csvParse(nouncsv, { relax_column_count: true })

const emojiscsv = fs.readFileSync(path.resolve(__dirname, "./wordlists/emojis.csv"), "utf-8")
const emoji = csvParse(emojiscsv, { columns: true, relax_column_count: true }).map((row: { Representation: string }) => {
  return row.Representation
})

const javayaml = fs.readFileSync(path.resolve(__dirname, "./wordlists/java.yaml"), "utf-8")
const minecraftVersions = yamlParse(javayaml).filter((version: string[]) => version[2] === "Release").map((version: string[]) => version[0])

function promptsAndCompletionsToObjectArray(prompts: string[], completions: string[]) {
  const results = [];
  for (let i = 0; i < prompts.length; i++) {
    results.push({
      prompt: prompts[i],
      completion: completions[i]
    });
  }
  return results;
}

function stringsWithEmojiVersion(emoji: string, version: string) {
  const prompt = [
    `${emoji} [${version}] Light GUI Teleport to Player\nUse GUI for teleport to someone\n`,
    `${emoji} [${version}] Light GUI Teleport to Player\nUse GUI for teleport to someone\nDuplicates: "gui-teleport"\n`,
    `${emoji} [${version}] Light GUI Teleport to Player\nUse GUI for teleport to someone\nDuplicates: "gui-teleport", "light-gui-teleport"\n`
  ]
  const completions = [
    `gui-teleport`,
    `light-gui-teleport`,
    `light-gui-teleport-to-player`
  ]
  return promptsAndCompletionsToObjectArray(prompt, completions);
}

function stringsWithFourDigits(digits: string[]) {
  const prompts = [
    `KB${digits[0]}${digits[1]}${digits[2]}${digits[3]}\nEnchant an item with Knockback ${digits[0]} Thousand.\n`
  ];
  const completions = [
    `kb${digits[0]}${digits[1]}${digits[2]}${digits[3]}`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithWord(word: string) {
  const prompts = [
    `${_.capitalize(word)}Items Crafting Any Items! 100% optimization!\nCrafting Any Items!\n`,
    `/${word.toLowerCase()} command\nAdds /${word.toLowerCase()} command to the game!\n`
  ];
  const completions = [
    `${word}items`,
    `${word}-command`
  ]
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithWordVersion(word: string, version: string) {
  const prompts = [
    `${_.capitalize(word)} on death plugin for ${version}\nAdds /${_.capitalize(word)} command\n`,
    `${_.capitalize(word)} on death plugin for ${version}\nAdds /${_.capitalize(word)} command\nDuplicates: "${word}"\n`,
    `${_.capitalize(word)} on death plugin for ${version}\nAdds /${_.capitalize(word)} command\nDuplicates: "${word}", "${word}-on-death\n`,
  ];
  const completions = [
    `${word}`,
    `${word}-on-death`,
    `${word}-command`
  ]
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithWordNoun(word: string, noun: string) {
  const prompts = [
    `${_.capitalize(word)}${_.capitalize(noun)}+\nPrevents chat, and command spammers, along with caps limiting.\n`,
    `${_.capitalize(word)}${_.capitalize(noun)} SpawnPlot/SpawnGS Plugin | 100% Einstellbar + API\n${_.capitalize(word)}${_.capitalize(noun)}, ${(word[0] + noun[0]).toUpperCase()}, Spawn, SpawnPlot, SpawnGS, ${_.capitalize(word)}${_.capitalize(noun)} Plugin\n`,
    `${_.capitalize(word)}${_.capitalize(noun)} SpawnPlot/SpawnGS Plugin | 100% Einstellbar + API\n${_.capitalize(word)}${_.capitalize(noun)}, ${(word[0] + noun[0]).toUpperCase()}, Spawn, SpawnPlot, SpawnGS, ${_.capitalize(word)}${_.capitalize(noun)} Plugin\nDuplicates: "${_.capitalize(word)}${_.capitalize(noun)}"\n`,
    `${_.capitalize(word)}${_.capitalize(noun)} SpawnPlot/SpawnGS Plugin | 100% Einstellbar + API\n${_.capitalize(word)}${_.capitalize(noun)}, ${(word[0] + noun[0]).toUpperCase()}, Spawn, SpawnPlot, SpawnGS, ${_.capitalize(word)}${_.capitalize(noun)} Plugin\nDuplicates: "${_.capitalize(word)}${_.capitalize(noun)}", "SpawnPlot"\n`,
  ];
  const completions = [
    `${_.capitalize(word)}${_.capitalize(noun)}plus`,
    `${_.capitalize(word)}${_.capitalize(noun)}`,
    `SpawnPlot`,
    `SpawnGS`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithNounTwoNumbers(noun: string, numbers: string[]) {
  const prompts = [
    `This${_.capitalize(noun)} v ${numbers[0]}.${numbers[1]}\n${_.capitalize(noun)}\n`
  ];
  const completions = [
    `this${noun}`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithNounVersion(noun: string, version: string) {
  const prompts = [
    `${noun}\nMinecraft ${noun} Plugin ${version}\n`,
    `${noun}\nMinecraft ${noun} Plugin ${version}\nDuplicates: "${noun}"\n`,
    `${noun}\nMinecraft ${noun} Plugin ${version}\nDuplicates: "${noun}", "${noun}-plugin"\n`,
    `${noun}\nMinecraft ${noun} Plugin ${version}\nDuplicates: "${noun}", "${noun}-plugin", "minecraft-${noun}"\n`
  ];
  const completions = [
    `${noun}`,
    `${noun}-plugin`,
    `minecraft-${noun}`,
    `minecraft-${noun}-plugin`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithAdjectiveTwoNouns(adjective: string, nouns: string[]) {
  const prompts = [
    `${adjective[0] + nouns[0][0] + nouns[1][0].toUpperCase()}\n${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])}\n`,
    `${adjective[0] + nouns[0][0] + nouns[1][0].toUpperCase()}\n${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])}\nDuplicates: "${adjective[0] + nouns[0][0] + nouns[1][0].toUpperCase()}"\n`
  ];
  const completions = [
    `${adjective[0] + nouns[0][0] + nouns[1][0].toUpperCase()}`,
    `${adjective}-${nouns[0]}-${nouns[1]}`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithSeparatorAdjectiveNounVersions(separator: string, adjective: string, noun: string, versions: string[]) {
  const prompts = [
    `${(adjective[0] + noun[0]).toUpperCase()}A: ${_.capitalize(adjective)} ${_.capitalize(noun)} Addon ${separator} [${versions[0]} - ${versions[1]}]\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(noun)} add-on with a new developper\n`,
    `${(adjective[0] + noun[0]).toUpperCase()}A: ${_.capitalize(adjective)} ${_.capitalize(noun)} Addon ${separator} [${versions[0]} - ${versions[1]}]\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(noun)} add-on with a new developper\nDuplicates: "${adjective}-${noun}-addon"\n`,
    `${(adjective[0] + noun[0]).toUpperCase()}A: ${_.capitalize(adjective)} ${_.capitalize(noun)} Addon ${separator} [${versions[0]} - ${versions[1]}]\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(noun)} add-on with a new developper\nDuplicates: "${adjective}-${noun}-addon", "${adjective}-${noun}"\n`
  ]
  const completions = [
    `${adjective}-${noun}-addon`,
    `${adjective}-${noun}`,
    `${(adjective[0] + noun[0]).toUpperCase()}A`
  ]
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithSeparatorAdjectiveTwoNounsVersions(separator: string, adjective: string, nouns: string[], versions: string[]) {
  const prompts = [
    `${(adjective[0] + nouns[0][0] + nouns[1][0]).toUpperCase()}: ${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])} ${separator} [${versions[0]} - ${versions[1]}]\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])} with a new developper\n`,
    `${(adjective[0] + nouns[0][0] + nouns[1][0]).toUpperCase()}: ${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])} ${separator} [${versions[0]} - ${versions[1]}]\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(nouns[0])} ${_.capitalize(nouns[1])} with a new developper\nDuplicates: "${adjective} ${nouns[0]} ${nouns[1]}"\n`
  ]
  const completions = [
    `${adjective}-${nouns[0]}-${nouns[1]}`,
    `${(adjective[0] + nouns[0][0] + nouns[1][0]).toUpperCase()}`
  ]
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithAdjectiveSingularPluralNouns(adjective: string, nouns: string[]) {
  const prompts = [
    `${_.capitalize(adjective)}${_.capitalize(nouns[1])} Unlimited Different ${_.capitalize(nouns[0])} Types | Create Custom ${_.capitalize(nouns[1])}! | Levels | Recoded\nYou can create your own ${nouns[0]}. There are various effects!, Minecraft, highly detailed, digital painting\n`
  ];
  const completions = [
    `${adjective}${nouns[1]}`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithTwoEmojisAdjectiveSingularPluralNouns(emojis: string[], adjective: string, nouns: string[]) {
  const prompts = [
    `[CHRISTMAS SALE]${emojis[0]}${_.capitalize(adjective)}${_.capitalize(nouns[1])}${emojis[0]} ${emojis[1]} CUSTOM ${nouns[0].toUpperCase()} TIERS + UPGRADES ${emojis[1]} In-Game Editor, NBT Support\nCreate your own ${nouns[1]} with tiers, upgrades, async animations, categories and much more!\n`
  ]
  const completions = [
    `${adjective}${nouns[1]}`
  ]
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithFourEmojisSeparatorAdjectiveNoun(emojis: string[], separator: string, adjective: string, noun: string) {
  const prompts = [
    `${emojis[0]} ${_.capitalize(adjective)}${_.capitalize(noun)} ${emojis[1]} Custom Tools ${separator} Weapons ${separator} Armor Set ${separator} Potions, MMO Items, Vouchers, Cosmetics ${emojis[1]}\n${emojis[2]} Best rated resource ${emojis[3]} The best tool to customize your ${noun} very easily ${emojis[1]} Active support !\n`
  ];
  const completions = [
    `${adjective}${noun}`
  ];
  return promptsAndCompletionsToObjectArray(prompts, completions);
}

function stringsWithReleaseSeparatorNounVersions(release: string, separator: string, noun: string, versions: string[]) {
  const prompt = [
    `${release.toUpperCase()} ${separator} Advanced ${_.capitalize(noun)} in GUI ${separator} Everything in Config ${separator} [${versions[0]} - ${versions[1]}]\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\n`,
    `${release.toUpperCase()} ${separator} Advanced ${_.capitalize(noun)} in GUI ${separator} Everything in Config ${separator} [${versions[0]} - ${versions[1]}]\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\nDuplicates: "${noun}"\n`,
    `${release.toUpperCase()} ${separator} Advanced ${_.capitalize(noun)} in GUI ${separator} Everything in Config ${separator} [${versions[0]} - ${versions[1]}]\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\nDuplicates: "${noun}", "advanced-${noun}"\n`
  ]
  const completions = [
    `${noun}`,
    `advanced-${noun}`,
    `advanced-${noun}-gui`
  ]
  return promptsAndCompletionsToObjectArray(prompt, completions);
}

function main() {
  const results: { "prompt": string, "completion": string }[] = [];
  for (let i = 0; i < englishWords.length; i += Math.floor(Math.random() * 2000 + 1)) {
    results.push(...stringsWithWord(englishWords[i]));
    for (let j = 0; j < minecraftVersions.length; j += Math.floor(Math.random() * 200 + 1)) {
      results.push(...stringsWithWordVersion(englishWords[i], minecraftVersions[j]));
    }
    for (let j = 0; j < englishNouns.length; j += Math.floor(Math.random() * 2000 + 1)) {
      results.push(...stringsWithWordNoun(englishWords[i], englishNouns[j]));
    }
  }
  for (let i = 0; i < emoji.length; i += Math.floor(Math.random() * 200 + 1)) {
    for (let j = 0; j < minecraftVersions.length; j += Math.floor(Math.random() * 200 + 1)) {
      results.push(...stringsWithEmojiVersion(emoji[i], minecraftVersions[j]));
    }
  }
  for (let i = 0; i < 10; i += Math.floor(Math.random() * 20 + 1)) {
    for (let j = 0; j < 10; j += Math.floor(Math.random() * 20 + 1)) {
      for (let k = 0; k < 10; k += Math.floor(Math.random() * 20 + 1)) {
        for (let l = 1; l < 10; l += Math.floor(Math.random() * 20 + 1)) {
          results.push(...stringsWithFourDigits([l.toString(), k.toString(), j.toString(), i.toString()]));
        }
      }
      for (let k = 0; k < englishNouns.length; k += Math.floor(Math.random() * 2000 + 1)) {
        results.push(...stringsWithNounTwoNumbers(englishNouns[k], [j.toString(), i.toString()]));
      }
    }
  }
  for (let i = 0; i < englishNouns.length; i += Math.floor(Math.random() * 2000 + 1)) {
    for (let j = 0; j < minecraftVersions.length; j += Math.floor(Math.random() * 200 + 1)) {
      results.push(...stringsWithNounVersion(englishNouns[i], minecraftVersions[j]));
    }
    for (let j = 0; j < separators.length; j += Math.floor(Math.random() * 20 + 1)) {
      for (let k = 0; k < englishAdjectives.length; k += Math.floor(Math.random() * 2000 + 1)) {
        for (let l = 0; l < emoji.length; l += Math.floor(Math.random() * 200 + 1)) {
          for (let m = 0; m < emoji.length; m += Math.floor(Math.random() * 200 + 1)) {
            for (let n = 0; n < emoji.length; n += Math.floor(Math.random() * 200 + 1)) {
              for (let o = 0; o < emoji.length; o += Math.floor(Math.random() * 200 + 1)) {
                results.push(...stringsWithFourEmojisSeparatorAdjectiveNoun([emoji[l], emoji[m], emoji[n], emoji[o]], separators[j], englishAdjectives[k], englishNouns[i]));
              }
            }
          }
        }
        for (let l = 0 + 1; l < minecraftVersions.length; l += Math.floor(Math.random() * 200 + 1)) {
          for (let m = l + 1; m < minecraftVersions.length; m += Math.floor(Math.random() * 200 + 1)) {
            results.push(...stringsWithSeparatorAdjectiveNounVersions(separators[j], englishAdjectives[k], englishNouns[i], [minecraftVersions[m], minecraftVersions[l]]));
            for (let n = 0; n < releaseType.length; n += Math.floor(Math.random() * 10 + 1)) {
              results.push(...stringsWithReleaseSeparatorNounVersions(releaseType[n], separators[j], englishNouns[i], [minecraftVersions[m], minecraftVersions[l]]));
            }
            for (let n = 0; n < englishNouns.length; n += Math.floor(Math.random() * 2000 + 1)) {
              if (englishNouns[n] === englishNouns[i]) continue
              results.push(...stringsWithSeparatorAdjectiveTwoNounsVersions(separators[j], englishAdjectives[k], [englishNouns[i], englishNouns[n]], [minecraftVersions[m], minecraftVersions[l]]));
            }
          }
        }
      }
      for (let k = 0; k < englishNouns.length; k += Math.floor(Math.random() * 2000 + 1)) {
        results.push(...stringsWithAdjectiveTwoNouns(englishAdjectives[j], [englishNouns[i], englishNouns[k]]));
      }
    }
  }
  for (let i = 0; i < englishAdjectives.length; i += Math.floor(Math.random() * 2000 + 1)) {
    for (let j = 0; j < englishNounsSingularPlural.length; j += Math.floor(Math.random() * 2000 + 1)) {
      results.push(...stringsWithAdjectiveSingularPluralNouns(englishAdjectives[i], [englishNounsSingularPlural[j][0], englishNounsSingularPlural[j][1]]));
      for (let k = 0; k < emoji.length; k += Math.floor(Math.random() * 200 + 1)) {
        for (let l = 0; l < emoji.length; l += Math.floor(Math.random() * 200 + 1)) {
          results.push(...stringsWithTwoEmojisAdjectiveSingularPluralNouns([emoji[k], emoji[l]], englishAdjectives[i], [englishNounsSingularPlural[j][0], englishNounsSingularPlural[j][1]]));
        }
      }
    }
  }
  console.log(results)
}

if (require.main === module) {
  main();
}
