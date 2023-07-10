const crypto = require("crypto");
const mongoDB = require("../mongoDB");
const {
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ActionRowBuilder,
    ApplicationCommandOptionType
} = require("discord.js");

const isUserInteraction = interaction => interaction.user.id === interaction.user.id;

const generateButtonCustomID = () => crypto.randomBytes(8).toString("hex");

const removeOldDocuments = async () => {
    try {
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        await mongoDB.snipe.deleteMany({ createdAt: { $lt: twentyFourHoursAgo } });
        console.log("Old documents removed successfully.");
    } catch (error) {
        console.error("Error removing old documents:", error);
    }
};

const now = new Date();
const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0);
const timeUntilMidnight = nextMidnight - now;

setTimeout(() => {
    removeOldDocuments();
    setInterval(removeOldDocuments, 24 * 60 * 60 * 1000); // Repeat every 24 hours
}, timeUntilMidnight);

module.exports = {
    name: "snipe",
    description: "Retrieve the most recently deleted message in the channel.",
    permissions: "",
    options: [
        {
            name: "channel",
            description: "The channel to search for recently deleted messages.",
            type: ApplicationCommandOptionType.Channel
        }
    ],
    run: async (_client, interaction) => {
        const channel = interaction.options.getChannel("channel");
        const filter = channel ? { channelId: channel.id } : {};
        console.log(filter);
        const snipeData = await mongoDB.snipe.find(filter);
        console.log(snipeData);
        const filteredSnipeData = snipeData.filter(entry => entry.content).reverse();

        let currentPage = 1;
        const previousButtonCustomID = generateButtonCustomID();
        const nextButtonCustomID = generateButtonCustomID();

        const createEmbedAndButtons = () => {
            const embed = new EmbedBuilder();
            const buttons = [];
            const actionRow = new ActionRowBuilder();

            if (filteredSnipeData.length === 0) {
                embed.setDescription("No messages logged.");
            } else {
                const currentSnipe = filteredSnipeData[currentPage - 1];
                const messageContent = currentSnipe?.content || "";
                const authorIconURL = currentSnipe?.userAvatarURL || "";
                const authorDisplayName = currentSnipe?.userDisplayName || "";

                embed.setDescription(messageContent).setAuthor({iconURL: authorIconURL, name: authorDisplayName });

                if (currentPage > 1) {
                    buttons.push(
                        new ButtonBuilder()
                            .setCustomId(previousButtonCustomID)
                            .setEmoji("◀")
                            .setStyle(ButtonStyle.Primary)
                    );
                }

                if (currentPage !== filteredSnipeData.length) {
                    buttons.push(
                        new ButtonBuilder().setCustomId(nextButtonCustomID).setEmoji("▶").setStyle(ButtonStyle.Primary)
                    );
                }

                actionRow.addComponents(...buttons);
            }

            return { ...(buttons.length ? { components: [actionRow] } : {}), embeds: [embed] };
        };

        const embedAndButtons = createEmbedAndButtons();

        interaction.reply(embedAndButtons).then(async reply => {
            const messageCollector = reply.createMessageComponentCollector({
                filter: isUserInteraction,
                time: 6e4
            });

            messageCollector.on("collect", async collectedInteraction => {
                if (collectedInteraction.customId === previousButtonCustomID) {
                    currentPage--;
                } else if (collectedInteraction.customId === nextButtonCustomID) {
                    currentPage++;
                }

                const newEmbedAndButtons = createEmbedAndButtons();
                await interaction.editReply(newEmbedAndButtons);
                await collectedInteraction.deferUpdate();
            });
        });
    }
};
