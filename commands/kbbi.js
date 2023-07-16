const axios = require("axios").default;
const { scrapeHTML } = require("scrape-it");
const { ApplicationCommandOptionType } = require("discord.js");
const { EmbedBuilder } = require("discord.js");

async function searchKbbi(str) {
    const specialChar = /[`!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/g;
    if (specialChar.test(str)) return null;

    try {
        const res = await axios.get(`https://kbbi.kemdikbud.go.id/entri/${str}`, {
            headers: {
                Cookie: `.AspNet.ApplicationCookie=${process.env.KBBI_ASP_NET_COOKIE}; __RequestVerificationToken=${process.env.KBBI_VERIFY_TOKEN}`
            }
        });

        const data = scrapeHTML(res.data, {
            title: {
                selector: "h2",
                texteq: 0,
                convert: x => x.replace(/\./g, "")
            },
            titleInduk: {
                selector: "span.rootword a",
                texteq: 0
            },
            rawTitle: {
                selector: "h2",
                texteq: 0
            },
            pelafalan: {
                selector: "h2 > span",
                texteq: 0
            },
            makna: {
                listItem: "ol > li",
                convert: x => x.replace(/\s+/g, " ").trim()
            },
            judulEntri: {
                listItem: 'h4[style="padding-top:6px;"]',
                convert: x => x.replace(/\s+/g, " ").trim()
            },
            contohEntri: {
                listItem: "ul.adjusted-par",
                convert: x => x.replace(/\s+/g, " ").trim()
            },
            ditemukan: {
                selector: "h4:nth-child(8)",
                texteq: 0
            },
            versi: {
                selector: "footer > p:nth-child(2) > span",
                texteq: 0
            }
        });

        return data;
    } catch (error) {
        console.error("Error occurred during KBBI search:", error);
        return null;
    }
}

module.exports = {
    name: "kbbi",
    description: "Search a word using KBBI",
    options: [
        {
            name: "kata",
            description: "The word to search in KBBI",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    permissions: "0x0000000000000800",
    run: async (_client, interaction) => {
        // Get string from options
        const word = interaction.options.getString("kata");

        try {
            const result = await searchKbbi(word);

            await interaction.reply({
                embeds: [
                    {
                        title: "KBBI",
                        fields: [
                            {
                                name: "Kata",
                                value: String(result.title)
                            },
                            {
                                name: "Makna",
                                value: String(result.makna)
                            }
                        ]
                    }
                ]
            });
            // if data is found
            // await interaction.reply(`Kata: ${result.title}\nMakna: ${result.makna}`);
        } catch (error) {
            const errorEmbed = new EmbedBuilder()
                .setTitle("KBBI")
                .setDescription("An error occurred while running the KBBi. Please try again later.");

            interaction.reply({ embeds: [errorEmbed] });
            // if data is not found or there is an error
            // await interaction.reply("Kata tidak ditemukan.");
            console.log(error);
        }
    }
};
