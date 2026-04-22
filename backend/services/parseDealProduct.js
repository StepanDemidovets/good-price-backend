const axios = require("axios");
const cheerio = require("cheerio");

async function parseDealProduct(url) {

    try {

        console.log(
            "Parsing Deal.by:",
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
        // PRICE
        // ----------------

        let price =
            null;

        const priceAttr =
            $(
                "[data-qaid='product_price']"
            )
                .attr(
                    "data-qaprice"
                );

        console.log(
            "Raw price:",
            priceAttr
        );

        if (
            priceAttr
        ) {

            price =
                parseFloat(
                    priceAttr
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
            image,
            link: url,
            source: "deal",

        };

    }

    catch (err) {

        console.log(
            "Deal parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "deal",

        };

    }

}

module.exports = {
    parseDealProduct
};