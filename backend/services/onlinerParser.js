const axios = require("axios");
const cheerio = require("cheerio");

async function parseOnlinerProduct(
    url
) {

    console.log(
        "Parsing Onliner:",
        url
    );

    const response =
        await axios.get(
            url,
            {
                headers: {
                    "User-Agent":
                        "Mozilla/5.0"
                }
            }
        );

    const $ =
        cheerio.load(
            response.data
        );

    const title =
        $("h1")
            .first()
            .text()
            .trim();

    let price = null;
    let image = null;

    $(
        "script[type='application/ld+json']"
    ).each(
        (index, element) => {

            try {

                const jsonText =
                    $(element).html();

                if (!jsonText)
                    return;

                let data =
                    JSON.parse(
                        jsonText
                    );

                if (
                    Array.isArray(
                        data
                    )
                ) {

                    data.forEach(
                        (item) => {

                            if (
                                item["@type"] ===
                                "Product"
                            ) {

                                if (
                                    item.offers &&
                                    item
                                        .offers
                                        .lowPrice
                                ) {

                                    price =
                                        parseFloat(
                                            item
                                                .offers
                                                .lowPrice
                                        );

                                }

                                if (
                                    item.image
                                ) {

                                    if (
                                        Array.isArray(
                                            item.image
                                        )
                                    ) {

                                        const img =
                                            item.image[0];

                                        if (
                                            typeof img ===
                                            "object"
                                        ) {

                                            image =
                                                img.url;

                                        }
                                        else {

                                            image =
                                                img;

                                        }

                                    }

                                }

                            }

                        }
                    );

                }

            }
            catch (e) {
            }

        }
    );

    return {

        title,
        price,
        image,
        link: url,
        source:
            "onliner"

    };

}

module.exports = {
    parseOnlinerProduct
};