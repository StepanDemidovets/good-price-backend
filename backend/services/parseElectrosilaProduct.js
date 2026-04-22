const axios = require("axios");
const cheerio = require("cheerio");
const iconv = require("iconv-lite");

async function parseElectrosilaProduct(url) {

    try {

        console.log(
            "Parsing Electrosila:",
            url
        );

        const response =
            await axios.get(
                url,
                {
                    headers: {
                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
                        "Accept":
                            "text/html",
                    },

                    responseType:
                        "arraybuffer",

                    timeout: 15000,
                }
            );

        // ----------------
        // FIX ENCODING
        // ----------------

        const data =
            iconv.decode(
                response.data,
                "win1251"
            );

        console.log(
            "HTML length:",
            data.length
        );

        const $ =
            cheerio.load(data);

        // ----------------
        // TITLE
        // ----------------

        const title =
            $("h1")
                .first()
                .text()
                .trim();

        console.log(
            "Title:",
            title
        );

        // ----------------
        // PRICE
        // ----------------

        let price =
            null;

        let priceText =
            $(".price b")
                .first()
                .text()
                .trim();

        console.log(
            "Raw price:",
            priceText
        );

        if (
            priceText
        ) {

            priceText =
                priceText
                    .replace(
                        /[^0-9.,]/g,
                        ""
                    )
                    .replace(
                        ",",
                        "."
                    );

            price =
                parseFloat(
                    priceText
                );

        }

        console.log(
            "Parsed price:",
            price
        );

        // ----------------
        // IMAGE
        // ----------------

        let image =
            $("meta[property='og:image']")
                .attr(
                    "content"
                );

        if (image) {

            if (
                image.startsWith("//")
            ) {

                image =
                    "https:" +
                    image;

            }

            else if (
                image.startsWith("/")
            ) {

                image =
                    "https://sila.by" +
                    image;

            }

        }

        console.log(
            "Image:",
            image
        );

        if (!title) {

            throw new Error(
                "Failed to parse product"
            );

        }

        return {

            title,
            price,
            image,
            link: url,
            source: "electrosila",

        };

    }

    catch (err) {

        console.log(
            "Electrosila parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "electrosila",

        };

    }

}

module.exports = {
    parseElectrosilaProduct
};