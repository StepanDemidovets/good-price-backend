const axios = require("axios");
const cheerio = require("cheerio");

async function parseShopProduct(url) {

    try {

        console.log(
            "Parsing Shop.by:",
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
        // PRICE FROM HTML
        // ----------------

        // PRICE (schema.org)

        let price = null;

// основной источник

        const lowPrice =
            $("meta[itemprop='lowPrice']")
                .attr("content");

        if (lowPrice) {

            price =
                Math.round(
                    parseFloat(lowPrice) * 100
                ) / 100;

            console.log(
                "Price from lowPrice:",
                price
            );

        }

// fallback (если вдруг нет)

        if (!price) {

            const priceText =
                $(
                    ".price__value, .offers-list__item-price"
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
        // JSON FALLBACK
        // ----------------

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

        // ----------------
// IMAGE
// ----------------

        let image =
            $(
                "meta[property='og:image']"
            ).attr(
                "content"
            );

// делаем абсолютный URL

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
                    "https://shop.by" +
                    image;

            }

        }

        console.log(
            "Image:",
            image
        );

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
            source: "shop",

        };

    }

    catch (err) {

        console.log(
            "Shop.by parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "shop",

        };

    }

}

module.exports = {
    parseShopProduct
};