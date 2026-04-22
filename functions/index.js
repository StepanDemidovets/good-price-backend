const functions = require("firebase-functions");
const admin = require("firebase-admin");

// PARSERS

const {
    parseOnlinerProduct
} = require(
    "./services/onlinerParser"
);

const {
    parseWildberriesProduct
} = require(
    "./services/wildberriesParser"
);

const { parse21vekProduct } =
    require("./services/parse21vekProduct");

const { parseShopProduct } =
    require("./services/parseShopProduct");

const { parseEmallProduct } =
    require("./services/parseEmallProduct");

const { parse5elementProduct } =
    require("./services/parse5elementProduct");

const { parseKufarProduct } =
    require("./services/parseKufarProduct");

const { parseDealProduct } =
    require("./services/parseDealProduct");

const { parse7745Product } =
    require("./services/parse7745Product");

const { parseElectrosilaProduct } =
    require("./services/parseElectrosilaProduct");

// INIT

admin.initializeApp();

const db =
    admin.firestore();

// MAIN FUNCTION

exports.manualScraper =
    functions.https.onRequest(
        async (req, res) => {

            try {

                console.log(
                    "Starting universal scraper"
                );

                const url =
                    req.query.url;

                // -----------------
                // VALIDATION
                // -----------------

                if (!url) {

                    res
                        .status(400)
                        .send(
                            "URL required"
                        );

                    return;

                }

                console.log(
                    "URL:",
                    url
                );

                let product =
                    null;

                // -----------------
                // ROUTER
                // -----------------

                if (
                    url.includes(
                        "onliner.by"
                    )
                ) {

                    product =
                        await parseOnlinerProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "wildberries"
                    )
                ) {

                    product =
                        await parseWildberriesProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "21vek.by"
                    )
                ) {

                    product =
                        await parse21vekProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "shop.by"
                    )
                ) {

                    product =
                        await parseShopProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "emall.by"
                    )
                ) {

                    product =
                        await parseEmallProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "5element.by"
                    )
                ) {

                    product =
                        await parse5elementProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "kufar.by"
                    )
                ) {

                    product =
                        await parseKufarProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "deal.by"
                    )
                )
                {

                    product =
                        await parseDealProduct(
                            url
                        );

                }

                else if (
                    url.includes(
                        "7745.by"
                    )
                )
                {

                    product =
                        await parse7745Product(
                            url
                        );

                }

                else if (
                    url.includes(
                        "sila.by"
                    )
                )
                {

                    product =
                        await parseElectrosilaProduct(
                            url
                        );

                }

                else {

                    console.log(
                        "Unsupported store"
                    );

                    res.send(
                        "Unsupported store"
                    );

                    return;

                }

                console.log(
                    "Parsed product:",
                    product
                );


                // -----------------
                // VALIDATE RESULT
                // -----------------

                if (
                    !product ||
                    !product.title ||
                    product.price === undefined
                ) {

                    console.log(
                        "Product not parsed"
                    );

                    res
                        .status(500)
                        .send(
                            "Product not parsed"
                        );

                    return;

                }

                // -----------------
                // SAVE TO FIRESTORE
                // -----------------

                await db
                    .collection(
                        "products"
                    )
                    .add({

                        ...product,

                        createdAt:
                            new Date(),

                        lastUpdated:
                            new Date()

                    });

                console.log(
                    "Product saved to Firestore"
                );

                // -----------------
                // RESPONSE
                // -----------------

                res.send({

                    status:
                        "ok",

                    title:
                    product.title,

                    price:
                    product.price,

                    source:
                    product.source

                });

            }
            catch (error) {

                console.error(
                    "Error:",
                    error
                );

                res
                    .status(500)
                    .send(
                        error.toString()
                    );

            }

        }
    );