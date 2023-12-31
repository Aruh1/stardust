const db = require("../../mongoDB");

module.exports = async (client, queue, song, interaction) => {
    let lang = await db?.musicbot?.findOne({
        guildID: queue?.textChannel?.guild?.id
    });

    lang = lang?.language || client.language;
    lang = require(`../../languages/${lang}.js`);

    if (!queue && !client.config.opt.loopMessage && queue?.repeatMode !== 0 && !queue?.textChannel) return;

    await interaction
        ?.editReply({
            content: null,
            embeds: [
                {
                    description: lang.msg13
                        .replace("{track?.title}", song?.name)
                        .replace(
                            "{queue?.connection.channel.name}",
                            `<#${queue.voice.connection.joinConfig.channelId}>`
                        ),
                    thumbnail: { url: song.thumbnail }
                }
            ]
        })
        .catch(console.error);
};
