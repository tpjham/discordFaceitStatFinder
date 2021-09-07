const Discord = require("discord.js");
const dotenv = require("dotenv");
const axios = require("axios");
const steamid = require("steamid");
const SteamID = require("steamid");
const client = new Discord.Client({
  intents: [Discord.Intents.FLAGS.GUILD_MESSAGES, Discord.Intents.FLAGS.GUILDS],
});
dotenv.config();

const API_KEY = process.env.API_KEY;

client.once("ready", () => {
  console.log("Ready!");
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("# userid")) {
    try {
      const test = message.content.split("\n");
      test.forEach((line) => {
        const rivi = line.split(" ");
        if (rivi[4] && rivi[4].startsWith("STEAM_")) {
          const authHeader = {
            headers: { Authorization: `Bearer ${API_KEY}` },
          };

          const sid = new SteamID(rivi[4]);

          try {
            axios
              .get(
                `https://open.faceit.com/data/v4/players?game=csgo&game_player_id=${sid}`,
                authHeader
              )
                .then(async (response) => {
                  if (response.status === 200) {
                    const playerData = response.data;

                    const result2 = await axios
                      .get(
                        `https://open.faceit.com/data/v4/players/${playerData.player_id}/stats/csgo`,
                        authHeader
                      )
                        .catch((err) => console.log("Something went wrong 1"));
                    const playerStats = result2.data;
                    message.channel.send(
                      `\`\`\`\t\t\t\t  Steam nick: ${rivi[3]} (Faceit: ${playerData.nickname})
                  ELO: ${playerData.games.csgo.faceit_elo}\t\t    (Level: ${playerData.games.csgo.skill_level})
                  Matches: ${playerStats.lifetime.Matches}\t\t   (Winrate: ${playerStats.lifetime["Win Rate %"]}%)
                  K/D: ${playerStats.lifetime["Average K/D Ratio"]}\t\t    (HS: ${playerStats.lifetime["Average Headshots %"]}%)\`\`\``
                    );
                  } else {
                    message.channel.send(`Couldn't find user ${rivi[3]} on faceit!`);
                  }
                })
                .catch(err => {
                  message.channel.send(`Couldn't find user ${rivi[3]} on faceit!`)
                });
          } catch (err) {
            console.log("Something went wrong");
          }
        }
      });
    } catch (err) {
      console.log(err);
    }
  }
});

client.login(process.env.TOKEN);
