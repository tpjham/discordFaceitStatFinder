const Discord = require("discord.js");
const dotenv = require("dotenv");
const axios = require("axios");
const steamid = require("steamid");
const SteamID = require("steamid");
const client = new Discord.Client({
    intents: [
        Discord.GatewayIntentBits.GuildMessages,
        Discord.GatewayIntentBits.Guilds,
        Discord.GatewayIntentBits.MessageContent,
    ],
});
dotenv.config();

const API_KEY = process.env.API_KEY;

client.once("ready", () => {
    console.log("Ready!");
});

client.on("messageCreate", async (message) => {
    let embed = {
        color: 0x0099ff,
        title: "Faceit stats",
        timestamp: new Date().toISOString(),
        footer: {
            text: "Made with spaghetti by Tombaa, inspired by Samua <3",
        },
        thumbnail: {
            url: message.guild.iconURL(),
        },
    };
    let promises = [];
    try {
        const test = message.content.split("\n");
        let embedFields = [];
        let usersNotFound = [];
        for (let index = 0; index < test.length; index++) {
            const line = test[index];
            const steamParsed = RegExp(`((STEAM_1).*?)(?=\\s)`).exec(line);
            if (steamParsed) {
                const name = RegExp(`((").*?)(")`).exec(line)
                    ? RegExp(`((").*?)(")`).exec(line)[0].replaceAll('"', "")
                    : "N/A";
                const sid = new SteamID(steamParsed[0]);
                const authHeader = {
                    headers: { Authorization: `Bearer ${API_KEY}` },
                };

                try {
                    promises.push(
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
                                        .catch((err) =>
                                            console.log(
                                                "Something went wrong getting player stats from faceit"
                                            )
                                        );
                                    const playerStats = result2.data;
                                    embedFields.push(
                                        {
                                            name: `${name}`,
                                            value: `ELO: ${playerData.games.csgo.faceit_elo} (Level ${playerData.games.csgo.skill_level})`,
                                            inline: true,
                                        },
                                        {
                                            name: "Matches",
                                            value: `${playerStats.lifetime.Matches} (Winrate: ${playerStats.lifetime["Win Rate %"]}%)`,
                                            inline: true,
                                        },
                                        {
                                            name: "K/D",
                                            value: `${playerStats.lifetime["Average K/D Ratio"]} (HS: ${playerStats.lifetime["Average Headshots %"]}%)`,
                                            inline: true,
                                        }
                                    );
                                    // }
                                } else {
                                    usersNotFound.push({
                                        name: `${name}`,
                                        value: "Could not be found on faceit",
                                        inline: false,
                                    });
                                }
                            })
                            .catch((err) => {
                                console.log(err.status);
                                usersNotFound.push({
                                    name: `${name}`,
                                    value: "Could not be found on faceit",
                                    inline: false,
                                });
                            })
                    );
                } catch (err) {
                    console.log("Something went wrong in callout");
                    console.log(err);
                }
            }
        }
        Promise.all(promises)
            .then(() => {
                let allFields = [...embedFields, ...usersNotFound];
                if (allFields.length > 0) {
                    let chunkSize = 15;
                    let embedArr = [];
                    for (let i = 0; i < allFields.length; i += chunkSize) {
                        const chunk = allFields.slice(i, i + chunkSize);
                        embedArr.push({ ...embed, fields: chunk });
                    }
                    message.channel.send({ embeds: embedArr });
                }
            })
            .catch((e) => {
                console.log(e);
            });
    } catch (err) {
        console.log(err);
    }
});

client.login(process.env.TOKEN);
