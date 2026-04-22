const axios = require("axios");
const cheerio = require("cheerio");

async function parseKufarProduct(url) {

    try {

        console.log(
            "Parsing Kufar:",
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
                    timeout: 15000,
                }
            );

        const data =
            response.data;

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
        // PRICE (schema.org)
        // ----------------

        let price =
            null;

        let priceType =
            "number";

        const metaPrice =
            $("meta[itemprop='price']")
                .attr(
                    "content"
                );

        console.log(
            "Meta price:",
            metaPrice
        );

        if (
            metaPrice !== undefined
        ) {

            price =
                parseFloat(
                    metaPrice
                );

        }

        // ----------------
        // DETECT TYPE
        // ----------------

        const priceText =
            $("span[class*='styles_main']")
                .first()
                .text()
                .trim()
                .toLowerCase();

        console.log(
            "Price text:",
            priceText
        );

        if (
            price === 0
        ) {

            if (
                priceText.includes(
                    "договор"
                )
            ) {

                priceType =
                    "negotiable";

                price =
                    null;

            }

            else if (
                priceText.includes(
                    "бесплат"
                )
            ) {

                priceType =
                    "free";

                price =
                    0;

            }

        }

        console.log(
            "Parsed price:",
            price
        );

        console.log(
            "Price type:",
            priceType
        );

        // ----------------
        // IMAGE
        // ----------------

        let image =
            $("meta[property='og:image']")
                .attr(
                    "content"
                );

        if (
            image &&
            image.startsWith("//")
        ) {

            image =
                "https:" +
                image;

        }

        console.log(
            "Image:",
            image
        );

        if (
            !title
        ) {

            throw new Error(
                "Failed to parse product"
            );

        }

        return {

            title,
            price,
            priceType,
            image,
            link: url,
            source: "kufar",

        };

    }

    catch (err) {

        console.log(
            "Kufar parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            priceType: null,
            image: null,
            link: url,
            source: "kufar",

        };

    }

}

module.exports = {
    parseKufarProduct
};