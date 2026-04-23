const axios = require("axios");
const cheerio = require("cheerio");

const { wrapper } =
    require("axios-cookiejar-support");

const tough =
    require("tough-cookie");

const jar =
    new tough.CookieJar();

const client =
    wrapper(
        axios.create({
            jar
        })
    );

async function parse7745Product(url) {

    try {

        console.log(
            "Parsing 7745.by:",
            url
        );

        const response =
            await client.get(
                url,
                {
                    headers: {

                        "User-Agent":
                            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120 Safari/537.36",

                        "Accept":
                            "text/html,application/xhtml+xml,application/xml;q=0.9",

                        "Accept-Language":
                            "ru-RU,ru;q=0.9",

                        "Referer":
                            "https://7745.by/",

                        "Connection":
                            "keep-alive"

                    },

                    timeout: 15000,

                    maxRedirects: 5,

                    validateStatus: () => true
                }
            );

        console.log(
            "STATUS:",
            response.status
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
            metaPrice
        ) {

            price =
                parseFloat(
                    metaPrice
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
            image
        ) {

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
                    "https://7745.by" +
                    image;

            }

        }

        console.log("Title:", title);
        console.log("Price:", price);
        console.log("Image:", image);

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
            source: "7745",

        };

    }

    catch (err) {

        console.log(
            "7745 parse error:",
            err.message
        );

        return {

            title: null,
            price: null,
            image: null,
            link: url,
            source: "7745",

        };

    }

}

module.exports = {
    parse7745Product
};