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
  let embededInfo = new Discord.MessageEmbed;
  embededInfo.setDescription("\u2800");
  embededInfo.setFooter("\u2800".repeat(1000/*any big number works too*/)+"|");
  let embededInfo2 = new Discord.MessageEmbed;
  embededInfo2.setDescription("\u2800");
  embededInfo2.setFooter("\u2800".repeat(1000/*any big number works too*/)+"|");
  if (message.content.startsWith("# userid")) {
    try {
      const test = message.content.split("\n");
      let lineNumber = 0;
      test.forEach((line) => {
        const rivi = line.split('"');
        if (rivi[2]) {
          const riviParse = rivi[2].split(" ");
          if (riviParse[1] && riviParse[1].startsWith("STEAM_")) {
            const authHeader = {
              headers: { Authorization: `Bearer ${API_KEY}` },
            };

            const sid = new SteamID(riviParse[1]);

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
                    if ( lineNumber < 5 ) {
                      embededInfo.addFields(
                        {
                          "name": `${rivi[1]}`,
                          value: `ELO: ${playerData.games.csgo.faceit_elo} (Level ${playerData.games.csgo.skill_level})`,
                          inline: true
                        },
                        // {
                        //   name: "ELO",
                        //   value: `${playerData.games.csgo.faceit_elo} (Level ${playerData.games.csgo.skill_level})`,
                        //   inline: true
                        // },
                        {
                          name: "Matches",
                          value: `${playerStats.lifetime.Matches} (Winrate: ${playerStats.lifetime["Win Rate %"]}%)`,
                          inline: true
                        },
                        {
                          name: "K/D",
                          value: `${playerStats.lifetime["Average K/D Ratio"]} (HS: ${playerStats.lifetime["Average Headshots %"]}%)`,
                          inline: true
                        }                  
                      )
                    } else {
                      embededInfo2.addFields(
                        {
                          "name": `${rivi[1]}`,
                          value: `ELO: ${playerData.games.csgo.faceit_elo} (Level ${playerData.games.csgo.skill_level})`,
                          inline: true
                        },
                        // {
                        //   name: "ELO",
                        //   value: `${playerData.games.csgo.faceit_elo} (Level ${playerData.games.csgo.skill_level})`,
                        //   inline: true
                        // },
                        {
                          name: "Matches",
                          value: `${playerStats.lifetime.Matches} (Winrate: ${playerStats.lifetime["Win Rate %"]}%)`,
                          inline: true
                        },
                        {
                          name: "K/D",
                          value: `${playerStats.lifetime["Average K/D Ratio"]} (HS: ${playerStats.lifetime["Average Headshots %"]}%)\n`,
                          inline: true
                        }                    
                      )
                    }
                    lineNumber++;;
                  } else {
                    lineNumber++;;
                    if ( lineNumber < 5 ) {
                      embededInfo.addField(`${rivi[1]}`, "Could not be found on faceit", false);
                    } else {
                      embededInfo2.addField(`${rivi[1]}`, "Could not be found on faceit", false);
                    }
                  }
                })
                .catch((err) => {
                  lineNumber++;;
                  console.log(err.status);
                  if ( lineNumber < 5 ) {
                    embededInfo.addField(`${rivi[1]}`, "Could not be found on faceit", false);
                  } else {
                    embededInfo2.addField(`${rivi[1]}`, "Could not be found on faceit", false);
                  }
                });
            } catch (err) {
              lineNumber++;;
              console.log("Something went wrong");
            }
          }
        }
      });
      setTimeout(() => {
        message.channel.send({embeds: [embededInfo,embededInfo2]});
      }, 3000);
    } catch (err) {
      console.log(err);
    }
  }
});

client.login(process.env.TOKEN);
