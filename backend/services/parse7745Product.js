const axios = require("axios");
const cheerio = require("cheerio");

async function parse7745Product(url) {

    try {

        console.log(
            "Parsing 7745.by:",
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