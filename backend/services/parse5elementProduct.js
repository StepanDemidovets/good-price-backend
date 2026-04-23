const axios = require("axios");
const cheerio = require("cheerio");

async function parse5elementProduct(url) {

    try {

        console.log(
            "Parsing 5element:",
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
                .trim() ||

            $("meta[property='og:title']")
                .attr("content");

        console.log(
            "Title:",
            title
        );

        // ----------------
        // PRICE
        // ----------------

        let price =
            null;

        // основной источник (schema.org)

        const metaPrice =
            $("meta[itemprop='price']")
                .attr("content");

        if (metaPrice) {

            price =
                parseFloat(
                    metaPrice
                );

            console.log(
                "Price from meta:",
                price
            );

        }

        // fallback — HTML

        if (!price) {

            const priceText =
                $(
                    ".price, .product-price, [class*='price']"
                )
                    .first()
                    .text()
                    .replace(/\s/g, "")
                    .replace(",", ".")
                    .match(/[\d.]+/);

            if (priceText) {

                price =
                    parseFloat(
                        priceText[0]
                    );

                console.log(
                    "Price from HTML:",
                    price
                );

            }

        }

        // ----------------
        // IMAGE
        // ----------------

        let image =
            $("meta[property='og:image']")
                .attr("content");

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
                    "https://5element.by" +
                    image;

            }

        }

        console.log("Title:", title);
        console.log("Price:", price);
        console.log("Image:", image);

        // ----------------

        if (
            !title ||
            !price
        ) {

            throw new Error(
                "Failed to parse product"
            );

        }

        console.log(
            "Parsed price:",
            price
        );

        return {

            title,
            price,
            image,
            link: url,
            source: "5element",

        };

    }

    catch (err) {

        console.log(
            "5element parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "5element",

        };

    }

}

module.exports = {
    parse5elementProduct
};