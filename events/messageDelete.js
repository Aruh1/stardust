const db = require("../mongoDB");
const { EmbedBuilder } = require("discord.js");
const { deletedChannelId } = require("../config.js");

module.exports = async (client, message) => {
    const author = message.author;
    const attach = message.attachments;
    await db.snipe.create({
        content: message.content,
        channelId: message.channelId,
        userAvatarURL: author.displayAvatarURL(),
        userDisplayName: attach.attachment
    });
    const deletedMessageEmbed = new EmbedBuilder()
        .setColor(0xff0000)
        .setTitle("Message Delete")
        .setAuthor({
            name: `${message.author.username}`,
            iconURL: message.author.displayAvatarURL()
        })
        .addFields({ name: "Content", value: `> ${message.content}` })
        .addFields({ name: "Channel", value: `<#${message.channel.id}>` })
        .addFields(
            {
                name: "Username",
                value: `<@${message.author.id}>`,
                inline: true
            },
            { name: "User ID", value: message.author.id, inline: true },
            { name: "Message ID", value: message.id, inline: true }
            // message.author.username
        );

    message.attachments.forEach(attachment => {
        deletedMessageEmbed.addFields({ name: "Attachment", value: attachment.url });
    });

    deletedMessageEmbed.setTimestamp().setFooter({ text: client.user.username });

    const channel = await client.channels.fetch(deletedChannelId);
    channel.send({
        content: `DELETE: \`${message.author.username}\` (${message.author.id})`,
        embeds: [deletedMessageEmbed]
    });
};
