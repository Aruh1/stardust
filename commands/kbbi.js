const axios = require("axios").default;
const { scrapeHTML } = require("scrape-it");
const { ApplicationCommandOptionType } = require("discord.js");

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
            name: "word",
            description: "The word to search in KBBI",
            type: ApplicationCommandOptionType.String,
            required: true
        }
    ],
    permissions: "0x0000000000000800",
    run: async (_client, interaction) => {
        const word = interaction.options.getString("word");
        const result = await searchKbbi(word);
        // anda bisa atur respon dari data 'result'
        if (result) {
            // kalo data ketemu
            await interaction.reply(`Word: ${result.title}\nMeaning: ${result.makna}`);
        } else {
            // kalo data gak ketemu atau ada error
            await interaction.reply("Word not found.");
        }
    }
};
