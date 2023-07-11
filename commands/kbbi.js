const { scrapeHTML } = require("scrape-it");
const axios = require("axios").default;

module.exports = {
  name: "kbbi",
  description: "Search a word using KBBI",
  options: [],
  permissions: "0x0000000000000800",
  run: async (_client, interaction) => {
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
            convert: (x) => x.replace(/\./g, "")
          },
          title_induk: {
            selector: "span.rootword a",
            texteq: 0
          },
          raw_title: {
            selector: "h2",
            texteq: 0
          },
          pelafalan: {
            selector: "h2 > span",
            texteq: 0
          },
          makna: {
            listItem: "ol > li",
            convert: (x) => x.replace(/\s+/g, " ").trim()
          },
          judul_entri: {
            listItem: 'h4[style="padding-top:6px;"]',
            convert: (x) => x.replace(/\s+/g, " ").trim()
          },
          contoh_entri: {
            listItem: "ul.adjusted-par",
            convert: (x) => x.replace(/\s+/g, " ").trim()
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
  }
};