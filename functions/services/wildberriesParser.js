const axios = require("axios");
const cheerio = require("cheerio");

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function extractPrice(text) {

    if (!text) return null;

    const cleaned =
        text
            .replace(/\s/g, "")
            .replace(",", ".");

    const match =
        cleaned.match(/\d+(\.\d+)?/);

    return match
        ? parseFloat(match[0])
        : null;

}

async function parseWildberriesProduct(
    url
) {

    console.log(
        "Parsing Wildberries:",
        url
    );

    try {

        await sleep(1500);

        const response =
            await axios.get(
                url,
                {
                    timeout: 15000,

                    headers: {

                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",

                        "Accept":
                            "text/html",

                        "Accept-Language":
                            "ru-RU,ru;q=0.9",

                        "Referer":
                            "https://www.wildberries.by/"

                    }

                }
            );

        const html =
            response.data;

        const $ =
            cheerio.load(html);

        // =====================
        // TITLE
        // =====================

        const title =
            $("h1")
                .first()
                .text()
                .trim();

        // =====================
        // PRICE
        // =====================

        let priceText =
            $(".price-block__final-price")
                .first()
                .text()
                .trim();

        if (!priceText) {

            priceText =
                $(
                    "[data-link='text{: product.price}']"
                )
                    .first()
                    .text()
                    .trim();

        }

        if (!priceText) {

            priceText =
                $("meta[itemprop='price']")
                    .attr("content");

        }

        const price =
            extractPrice(priceText);

        // =====================
        // IMAGE
        // =====================

        const image =
            $("meta[property='og:image']")
                .attr("content");

        console.log(
            "Parsed price:",
            price
        );

        if (!title || !price) {

            throw new Error(
                "Failed to parse product"
            );

        }

        return {

            title,
            price,
            image,
            link: url,
            source:
                "wildberries"

        };

    }
    catch (error) {

        console.error(
            "Wildberries parse error:",
            error.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source:
                "wildberries"

        };

    }

}

module.exports = {
    parseWildberriesProduct
};