import fs from "fs-extra";
import path from "path";
import _ from "lodash";
import { parse as csvParser } from "csv-parse/sync";
import { parse as yamlParser } from "yaml";

function main(limit: number, adjectives: string[], nouns: string[], emojis: string[], devStages: string[], gameVersions: string[]) {
  const prompts = [
    "KB9999\\nEnchant an item with Knockback 9 Thousand.\\n",
    "MutliMasks Unlimited Different Mask Types | Create Custom Masks! | Levels | Recoded\\nYou can create your own mask. There are various effects!, Minecraft, highly detailed, digital painting\\n",
    "StarItems Crafting Any Items! 100% optimization!\\nCrafting Any Items!\\n",
    "/freeze command\\nAdds /freeze command to the game!\\n",
    "ChatProtection+\\nPrevents chat, and command spammers, along with caps limiting.\\n",
    "DDD\\nDifferent Dimension Difficulty\\n",
    "DDD\\nDifferent Dimension Difficulty\\nDuplicates: \"ddd\"\\n",
    "ThisSystem v 0.1\\nSystem\\n",
    "Scoreboard\\nMinecraft Scoreboard Plugin 1.8.8\\n",
    "Scoreboard\\nMinecraft Scoreboard Plugin 1.8.8\\nDuplicates: \"scoreboard\"\\n",
    "[CHRISTMAS SALE]⚡️PlatinumKits⚡️ ✦ CUSTOM KIT TIERS + UPGRADES ✦ In-Game Editor, NBT Support\\nCreate your own kits with tiers, upgrades, async animations, categories and much more!\\n",
    "⚔️ ExecutableItems ⭐ Custom Tools | Weapons | Armor Set | Potions, MMO Items, Vouchers, Cosmetics ⭐\\n✨ Best rated resource ✅ The best tool to customize your items very easily ⭐ Active support !\\n",
    "JukeboxMusicPlayer | Play music disc's without a jukebox\\nPlay music disc's with commands or gui's\\n",
    "☃️ DailyRewards+ ☃️ | The #1 Daily Rewards Plugin!\\nBoost your player retention with fully customisable Daily Rewards!\\n",
    "Force Resourcepacks\\n[1.8-1.19] Send resourcepacks globally/per server/world. Execute actions! Spigot, Bungee & Velocity\\n",
    "❎ [1.8-1.19] Disable Recipe ❎ - Disable the crafting or smelting recipe of any item\\nAllows you to disable specific crafting and smelting recipes on your server!\\n",
    "⭐Ultimate Factions v2 ► Unique Faction Plugin ◄ ✅ [1.8 - 1.19] ✅\\nBest GUI based factions plugin. Fresh and unique faction experience. FactionsTop + Dynmap included!\\n",
    "[30% OFF] | Deluxe Announce - Player avatar & More!\\nIncredible announcer for your players, buy it and enjoy its unique features.\\n",
    "1.8 - 1.19.3 ⭐ BattlePass ⭐ Unlimited Practical & Customizable Quests ⚔️ 30% SALE\\nThe most advanced quests plugin ⚡️ Seasons ⚡️ Free/Premium Passes ⚡️ Daily/Weeky Quests\\n",
    "[1.19] Home Gui For EssentialsX\\nUse GUI for your all EssentialsX homes !\\n",
    "[1.19] Home Gui For EssentialsX\\nUse GUI for your all EssentialsX homes !\\nDuplicates: \"home-gui\"\\n",
    "⭐ [1.19] Light GUI Teleport to Player\\nUse GUI for teleport to someone\\n",
    "⭐ [1.19] Light GUI Teleport to Player\\nUse GUI for teleport to someone\\nDuplicates: \"light-gui\"\\n",
    "GrieferGames SpawnPlot/SpawnGS Plugin | 100% Einstellbar + API\\nGrieferGames, GG, Spawn, SpawnPlot, SpawnGS, GrieferGames Plugin\\n",
    "[50% Christmas sale] | ✨Lucky Box Premium ✨ [1.8.x - 1.19.x]\\nWonder Bags, Loot Box, Random items, Random generator with percentage probabilit, Shop, customizable\\n",
    "[SKRIPT] [High Quality] Custom PVP Items (For RandomKits/Kits Servers)\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\n",
    "[SKRIPT] [High Quality] Custom PVP Items (For RandomKits/Kits Servers)\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\nDuplicates: \"custom-pvp-items\"\\n",
    "Kudos | 1.19.X | Open Source | MySQL\\nThe plugin allows to give someone a kudo (recognition/praise)\\n",
    "[SKRIPT] [LITE] Pearl Cooldown\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\n",
    "[SKRIPT] [LITE] Pearl Cooldown\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\nDuplicates: \"pearl-cooldown\"\\n",
    "InvSee++\\nView and edit inventories of your players! Works for offline players too! Now with give commands!\\n",
    "SBA: Screaming Bedwars Addon | [1.9.4 - 1.19.3]\\nYour preferred Screaming Bedwars add-on with a new developper\\n",
    "SBA: Screaming Bedwars Addon | [1.9.4 - 1.19.3]\\nYour preferred Screaming Bedwars add-on with a new developper\\nDuplicates: \"sba\"\\n",
    "µŋEmojis - Add emojis to the Minecraft chat\\nEmojis plugin uses resource-packs and a web-editor to create emojis and add them to the chat\\n",
    "µŋEmojis - Add emojis to the Minecraft chat\\nEmojis plugin uses resource-packs and a web-editor to create emojis and add them to the chat\\nDuplicates: \"emojis\"",
    "[Skript] || KOMPLETTES SWARP SYSTEM | GUI | MULTIPAGE\\nEin cooles SWarp System mit Chat und GUI Setup.\\n",
    "Back on death plugin for 1.19\\nAdds /back command\\n",
    "Back on death plugin for 1.19\\nAdds /back command\\nDuplicates: \"back\"\\n",
    "Back on death plugin for 1.19\\nAdds /back command\\nDuplicates: \"back\", \"back-on-death\"\\n",
    "✨ HubPvP » Allow Players to PvP in the Hub! ✨\\nLightweight and flexible Lobby PvP Sword\\n",
    "BETA | Advanced Rules in GUI | Everything in Config | [1.16 - 1.19.x]\\nRules, Advanced Rules, Important server plugin\\n",
    "BETA | Advanced Rules in GUI | Everything in Config | [1.16 - 1.19.x]\\nRules, Advanced Rules, Important server plugin\\nDuplicates: \"rules\"\\n",
    "BETA | Advanced Rules in GUI | Everything in Config | [1.16 - 1.19.x]\\nRules, Advanced Rules, Important server plugin\\nDuplicates: \"rules\", \"advanced-rules\"\\n",
    "[hbAdvancedBroadcaster] Ad plugin with discord bot integration\\nbroadcast, announce, discord, bot, open-source, alerta, anuncio, say\\n",
    "WartungSystem × German | Rezunex\\nWartungSystem für Spigot. Wenn du etwas verändert haben möchtest, dann schreibe mir ein Kommentar\\n",
    "【AdvancedKits】✦CATEGORIES⚡️PREVIEW GUI✨KIT UPGRADES✨KIT VOUCHERS✨ANIMATIONS✨EQUIP ARMOR⚡️HEX COLORS✦\\n❂ An advanced kits plugin that can't be beaten! [1.12-1.19]\\n",
    "Zufällige Herzen Challenge\\nEine Challenge mit zufälligen Herzen!\\n"
  ];
  const completions = [
    "kb9999",
    "multimasks",
    "staritems",
    "freeze-command",
    "chatprotectionplus",
    "ddd",
    "different-dimension-difficulty",
    "thissystem",
    "scoreboard",
    "scoreboard-plugin",
    "platinumkits",
    "executableitems",
    "jukeboxmusicplayer",
    "dailyrewardsplus",
    "force-resourcepacks",
    "disable-recipe",
    "ultimate-fractions",
    "deluxe-announce",
    "battlepass",
    "home-gui",
    "home-gui-essentialx",
    "gui-teleport",
    "light-gui-teleport",
    "griefergames",
    "lucky-box-premium",
    "custom-pvp-items",
    "custom-pvp-items-plugin",
    "kudos",
    "pearl-cooldown",
    "pearl-cooldown-skript",
    "invseeplusplus",
    "sba",
    "screaming-bedwars-addon",
    "emojis",
    "ungemojis",
    "komplettes-swarp-system",
    "back",
    "back-on-death",
    "back-command",
    "hubpvp",
    "rules",
    "advanced-rules",
    "advanced-rules-gui",
    "hbadvancedbroadcaster",
    "wartungsystem",
    "advancedkits",
    "zufallige-herzen"
  ]
  for (const noun of nouns) {
    if (limit < prompts.length) break;
    prompts.push(`/${_.capitalize(noun)} command\\nAdds /${_.capitalize(noun)} command to the game!\\n`,
      `This${_.capitalize(noun)} v 0.1\\n${_.capitalize(noun)}\\n`.replace("0", Math.floor(Math.random() * 10).toString()).replace("1", Math.floor(Math.random() * 19 + 1).toString()),
      `[1.19] ${_.capitalize(noun)} Gui For EssentialsX\\nUse GUI for your all EssentialsX ${noun} !\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `[1.19] ${_.capitalize(noun)} Gui For EssentialsX\\nUse GUI for your all EssentialsX homes !\\nDuplicates: \"${noun}-gui\"\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `⭐ [1.19] Light GUI ${_.capitalize(noun)}\\nUse GUI for ${noun}\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `⭐ [1.19] Light GUI ${_.capitalize(noun)}\\nUse GUI for ${noun}\\nDuplicates: \"gui-${noun}\"\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `${_.capitalize(noun)}\\nMinecraft ${_.capitalize(noun)} Plugin 1.8.8\\n`.replace("1.8.8", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `${_.capitalize(noun)}\\nMinecraft ${_.capitalize(noun)} Plugin 1.8.8\\nDuplicates: \"${noun}\"\\n`.replace("1.8.8", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `BETA | Advanced ${_.capitalize(noun)} in GUI | Everything in Config | [1.16 - 1.19.x]\\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\\n`.replace("BETA", devStages[Math.floor(Math.random() * devStages.length)].toUpperCase()),
      `BETA | Advanced ${_.capitalize(noun)} in GUI | Everything in Config | [1.16 - 1.19.x]\\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\\nDuplicates: \"${noun}\"\\n`.replace("BETA", devStages[Math.floor(Math.random() * devStages.length)]),
      `BETA | Advanced ${_.capitalize(noun)} in GUI | Everything in Config | [1.16 - 1.19.x]\\n${_.capitalize(noun)}, Advanced ${_.capitalize(noun)}, Important server plugin\\nDuplicates: \"${noun}\", \"advanced-${noun}\"\\n`.replace("BETA", devStages[Math.floor(Math.random() * devStages.length)]),
      `${_.capitalize(noun)} | 1.19.X | Open Source | MySQL\\nThe plugin allows to give someone a ${noun} (recognition/praise)\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `Back on ${noun} plugin for 1.19\\nAdds /back command\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `Back on ${noun} plugin for 1.19\\nAdds /back command\\nDuplicates: \"back\"\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `Back on ${noun} plugin for 1.19\\nAdds /back command\\nDuplicates: \"back\", \"back-on-${noun}\"\\n`.replace("1.19", gameVersions[Math.floor(Math.random() * gameVersions.length)]),
      `µŋ${_.capitalize(noun)} - Add ${noun} to the Minecraft chat\\n${noun} plugin uses resource-packs and a web-editor to create ${noun} and add them to the chat\\n`,
      `µŋ${_.capitalize(noun)} - Add ${noun} to the Minecraft chat\\n${noun} plugin uses resource-packs and a web-editor to create ${noun} and add them to the chat\\nDuplicates: \"${noun}\"`,
    )
    completions.push(`${noun}-command`,
      `this${noun}`,
      `${noun}-gui`,
      `${noun}-gui-essentialx`,
      `gui-${noun}`,
      `light-gui-${noun}`,
      `${noun}`,
      `${noun}-plugin`,
      `${noun}`,
      `advanced-${noun}`,
      `advanced-${noun}-gui`,
      `${noun}`,
      "back",
      `back-on-${noun}`,
      "back-command",
      `${noun}`,
      `ung${noun}`
    )
    for (const adjective of adjectives) {
      if (limit < prompts.length) break;
      const possibleLetters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      let twoRandomLetters = ""
      for (var i = 0; i < 2; i++) {
        twoRandomLetters += possibleLetters.charAt(Math.floor(Math.random() * possibleLetters.length));
      }

      prompts.push(
        `${_.capitalize(adjective)}${_.capitalize(noun)} Unlimited Different ${_.capitalize(noun)} Types | Create Custom ${_.capitalize(noun)}! | Levels | Recoded\\nYou can create your own ${noun}. There are various effects!, Minecraft, highly detailed, digital painting\\n`,
        `${_.capitalize(adjective)}${_.capitalize(noun)} Crafting Any Items! 100% optimization!\\nCrafting Any Items!\\n`,
        `${_.capitalize(adjective)}${_.capitalize(noun)}+\\nPrevents chat, and command spammers, along with caps limiting.\\n`,
        `[CHRISTMAS SALE]⚡️${_.capitalize(adjective)}${_.capitalize(noun)}⚡️ ✦ CUSTOM ${noun.toUpperCase()} TIERS + UPGRADES ✦ In-Game Editor, NBT Support\\nCreate your own ${noun} with tiers, upgrades, async animations, categories and much more!\\n`,
        `⚔️ ${_.capitalize(adjective)}${_.capitalize(noun)} ⭐ Custom Tools | Weapons | Armor Set | Potions, MMO ${_.capitalize(noun)}, Vouchers, Cosmetics ⭐\\n✨ Best rated resource ✅ The best tool to customize your ${_.capitalize(noun)} very easily ⭐ Active support !\\n`.replace("⭐", emojis[Math.floor(Math.random() * emojis.length)]).replace("⚔️", emojis[Math.floor(Math.random() * emojis.length)]).replace("✨", emojis[Math.floor(Math.random() * emojis.length)]).replace("✅", emojis[Math.floor(Math.random() * emojis.length)]),
        `${_.capitalize(adjective)}${_.capitalize(noun)}Player | Play ${noun} disc's without a ${adjective}\\nPlay ${noun} disc's with commands or gui's\\n`,
        `☃️ ${_.capitalize(adjective)}${_.capitalize(noun)}+ ☃️ | The #1 ${_.capitalize(adjective)} ${_.capitalize(noun)} Plugin!\\nBoost your player retention with fully customisable ${_.capitalize(adjective)} ${_.capitalize(noun)}!\\n`.replace("☃️", emojis[Math.floor(Math.random() * emojis.length)]),
        `${_.capitalize(adjective)} ${_.capitalize(noun)}\\n[1.8-1.19] Send ${noun} globally/per server/world. Execute actions! Spigot, Bungee & Velocity\\n`,
        `❎ [1.8-1.19] ${_.capitalize(adjective)} ${_.capitalize(noun)} ❎ - ${_.capitalize(adjective)} the crafting or smelting ${noun} of any item\\nAllows you to ${adjective} specific crafting and smelting recipes on your server!\\n`.replace("❎", emojis[Math.floor(Math.random() * emojis.length)]),
        `${_.capitalize(adjective)} ${_.capitalize(noun)} v2 ► Unique ${_.capitalize(noun)} Plugin ◄ ✅ [1.8 - 1.19] ✅\\nBest GUI based ${noun} plugin. Fresh and unique ${noun} experience. ${_.capitalize(noun)}Top + Dynmap included!\\n`.replace("✅", emojis[Math.floor(Math.random() * emojis.length)]),
        `[30% OFF] | ${_.capitalize(adjective)} ${_.capitalize(noun)} - Player avatar & More!\\nIncredible ${noun} for your players, buy it and enjoy its unique features.\\n`,
        `1.8 - 1.19.3 ⭐ ${_.capitalize(adjective)}${_.capitalize(noun)} ⭐ Unlimited Practical & Customizable Quests ⚔️ 30% SALE\\nThe most advanced quests plugin ⚡️ Seasons ⚡️ Free/Premium ${_.capitalize(noun)} ⚡️ Daily/Weeky Quests\\n`.replace("⭐", emojis[Math.floor(Math.random() * emojis.length)]).replace("⚔️", emojis[Math.floor(Math.random() * emojis.length)]),
        `${_.capitalize(adjective)}${_.capitalize(noun)} SpawnPlot/SpawnGS Plugin | 100% Einstellbar + API\\n${_.capitalize(adjective)}${_.capitalize(noun)}, ${(adjective[0] + noun[0]).toUpperCase()}, Spawn, SpawnPlot, SpawnGS, ${_.capitalize(adjective)}${_.capitalize(noun)} Plugin\\n`,
        `[SKRIPT] [LITE] ${_.capitalize(adjective)} ${_.capitalize(noun)}\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\n`,
        `[SKRIPT] [LITE] ${_.capitalize(adjective)} ${_.capitalize(noun)}\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\nDuplicates: \"${adjective}-${noun}\"\\n`,
        `${_.capitalize(adjective).slice(0, 3)}${_.capitalize(noun).slice(0, 3)}++\\nView and edit ${adjective} of your players! Works for offline players too! Now with give commands!\\n`,
        `✨ ${_.capitalize(adjective).slice(0, 3)}${_.capitalize(noun)} » Allow Players to ${_.capitalize(noun)} in the ${_.capitalize(adjective)}! ✨\\nLightweight and flexible Lobby ${_.capitalize(noun)} Sword\\n`.replace("✨", emojis[Math.floor(Math.random() * emojis.length)]),
        `[${twoRandomLetters}${_.capitalize(adjective)}${_.capitalize(noun)}] Ad plugin with discord bot integration\\n${noun}, announce, discord, bot, open-source\\n`,
        `${_.capitalize(adjective)}${_.capitalize(noun)} × German | Rezunex\\n${_.capitalize(adjective)}${_.capitalize(noun)} für Spigot. Wenn du etwas verändert haben möchtest, dann schreibe mir ein Kommentar\\n`,
        `【${_.capitalize(adjective)}${_.capitalize(noun)}】✦CATEGORIES⚡️PREVIEW GUI✨${noun} UPGRADES✨${noun} VOUCHERS✨ANIMATIONS✨EQUIP ARMOR⚡️HEX COLORS✦\\n❂ An ${adjective} ${noun} plugin that can't be beaten! [1.12-1.19]\\n`.replace("❂", emojis[Math.floor(Math.random() * emojis.length)]).replace("✦", emojis[Math.floor(Math.random() * emojis.length)]).replace("⚡️", emojis[Math.floor(Math.random() * emojis.length)]).replace("✨", emojis[Math.floor(Math.random() * emojis.length)]),
      )
      completions.push(
        `${adjective}${noun}`,
        `${adjective}${noun}`,
        `${adjective}${noun}plus`,
        `${adjective}${noun}`,
        `${adjective}${noun}`,
        `${adjective}${noun}player`,
          `${adjective}${noun}plus`,
        `${adjective}-${noun}`,
        `${adjective}-${noun}`,
        `${adjective}-${noun}`,
        `${adjective}${noun}`,
        `${adjective}${noun}`,
        `${adjective}${noun}`,
        `${adjective}-${noun}`,
        `${adjective}-${noun}-skript`,
        `${adjective.slice(0, 3)}${noun.slice(0, 3)}plusplus`,
        `${adjective.slice(0, 3)}${noun}`,
        `${twoRandomLetters}${adjective.slice(0, 3)}${noun}`,
        `${adjective}${noun}`,
        `${adjective}${noun}`,
      )
      for (const secondNoun of nouns) {
        if (noun === secondNoun) continue;
        if (limit < prompts.length) break;
        prompts.push(
          `${(adjective[0] + noun[0] + secondNoun[0]).toUpperCase()}\\n${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)}\\n`,
          `${(adjective[0] + noun[0] + secondNoun[0]).toUpperCase()}\\n${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)}\\nDuplicates: \"${(adjective[0] + noun[0] + secondNoun[0])}\"\\n`,
          `[SKRIPT] [High Quality] ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} (For RandomKits/Kits Servers)\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\n`,
          `[SKRIPT] [High Quality] ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} (For RandomKits/Kits Servers)\\nEasily Configurable, Lightweight Skript, No Addons Required Just Skript.\\nDuplicates: \"${adjective}-${noun}-${secondNoun}\"\\n`,
          `[50% Christmas sale] | ✨${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} ✨ [1.8.x - 1.19.x]\\nWonder Bags, Loot ${_.capitalize(noun)}, Random items, Random generator with percentage probabilit, Shop, customizable\\n`.replace("✨", emojis[Math.floor(Math.random() * emojis.length)]),
          `${(adjective[0] + noun[0] + secondNoun[0]).toUpperCase()}: ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} | [1.9.4 - 1.19.3]\\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} with a new developper\\n`,
          `${(adjective[0] + noun[0] + secondNoun[0]).toUpperCase()}: ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} | [1.9.4 - 1.19.3]\\nYour preferred ${_.capitalize(adjective)} ${_.capitalize(noun)} ${_.capitalize(secondNoun)} with a new developper\\nDuplicates: \"${(adjective[0] + noun[0] + secondNoun[0])}\"\\n`,
        )
        completions.push(
          `${(adjective[0] + noun[0] + secondNoun[0])}`,
          `${adjective}-${noun}-${secondNoun}`,
          `${adjective}-${noun}-${secondNoun}`,
          `${adjective}-${noun}-${secondNoun}-plugin`,
          `${adjective}-${noun}-${secondNoun}`,
          `${(adjective[0] + noun[0] + secondNoun[0])}`,
          `${adjective}-${noun}-${secondNoun}`,
        )
      }
    }
  }
  return { prompts, completions };
}

if (require.main === module) {
  const adjectives = fs.readFileSync(path.resolve(__dirname, './wordlists/english-adjectives.txt'), 'utf8').split('\n')
  const nouns = fs.readFileSync(path.resolve(__dirname, './wordlists/english-nouns.txt'), 'utf8').split('\n')
  const emojisFile = fs.readFileSync(path.resolve(__dirname, './wordlists/emojis.csv'), 'utf8')
  const emojis = csvParser(emojisFile, { columns: true }).map((row: { Representation: string }) => row.Representation)
  const gameVersionsFile = fs.readFileSync(path.resolve(__dirname, './wordlists/java.yaml'), 'utf8')
  const gameVersions = yamlParser(gameVersionsFile).map((row: string[]) => row[0])
  const devStages = ['pre-alpha', 'alpha', 'beta', 'release candidate', 'release']
  const { prompts, completions } = main(500000, adjectives, nouns, emojis, devStages, gameVersions);
  let data = ""
  for (let i = 0; i < prompts.length; i++) {
    data += `{"prompt": "${prompts[i]}", "completion": "${completions[i]}"}\n`
  }
  fs.writeFileSync(path.resolve(__dirname, '../data.jsonl'), data)
}
