const axios = require("axios");
const cheerio = require("cheerio");

function sleep(ms) {
    return new Promise(resolve =>
        setTimeout(resolve, ms)
    );
}

function extractPrice(value) {

    if (!value) return null;

    const cleaned =
        String(value)
            .replace(/\s/g, "")
            .replace(",", ".");

    const match =
        cleaned.match(/\d+(\.\d+)?/);

    return match
        ? parseFloat(match[0])
        : null;

}

async function parse21vekProduct(url) {

    console.log(
        "Parsing 21vek:",
        url
    );

    try {

        await sleep(1000);

        const response =
            await axios.get(
                url,
                {
                    timeout: 15000,

                    headers: {

                        "User-Agent":
                            "Mozilla/5.0",

                        "Accept":
                            "text/html",

                        "Accept-Language":
                            "ru-RU,ru;q=0.9"

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

        let title =
            $("h1")
                .first()
                .text()
                .trim();

        if (!title) {

            title =
                $("meta[property='og:title']")
                    .attr("content");

        }

        // =====================
        // IMAGE
        // =====================

        let image =
            $("meta[property='og:image']")
                .attr("content");

        // =====================
        // PRICE (JSON-LD)
        // =====================

        let price = null;

        const scripts =
            $("script[type='application/ld+json']");

        scripts.each((i, el) => {

            try {

                const json =
                    JSON.parse(
                        $(el).html()
                    );

                if (
                    json.offers &&
                    json.offers.price
                ) {

                    price =
                        extractPrice(
                            json.offers.price
                        );

                }

            }
            catch {}

        });

        // =====================
        // FALLBACK: search raw JSON
        // =====================

        if (!price) {

            const match =
                html.match(
                    /"price"\s*:\s*"?([\d.,]+)"?/
                );

            if (match) {

                price =
                    extractPrice(
                        match[1]
                    );

            }

        }

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
            source: "21vek"

        };

    }
    catch (error) {

        console.error(
            "21vek parse error:",
            error.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "21vek"

        };

    }

}

module.exports = {
    parse21vekProduct
};