const axios = require("axios");
const cheerio = require("cheerio");

async function parseEmallProduct(url) {

    try {

        console.log(
            "Parsing Emall:",
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

        // основной источник

        const priceText =
            $("span[class*='price_main']")
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
                "Price from main:",
                price
            );

        }

        // fallback — meta

        if (!price) {

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

        }

        // fallback — JSON

        if (!price) {

            const scripts =
                $("script")
                    .toArray();

            for (const script of scripts) {

                const content =
                    $(script).html();

                if (
                    content &&
                    content.includes(
                        "price"
                    )
                ) {

                    const match =
                        content.match(
                            /"price"\s*:\s*"?([\d.]+)"?/
                        );

                    if (match) {

                        price =
                            parseFloat(
                                match[1]
                            );

                        console.log(
                            "Price from JSON:",
                            price
                        );

                        break;

                    }

                }

            }

        }

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
                    "https://emall.by" +
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
            source: "emall",

        };

    }

    catch (err) {

        console.log(
            "Emall parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "emall",

        };

    }

}

module.exports = {
    parseEmallProduct
};