const express = require("express");
const cors = require("cors");

const {
    parseOnlinerProduct
} = require("./services/onlinerParser");

const {
    parseDealProduct
} = require("./services/parseDealProduct");

const {
    parse7745Product
} = require("./services/parse7745Product");

const {
    parseElectrosilaProduct
} = require("./services/parseElectrosilaProduct");

const {
    parseShopProduct
} = require("./services/parseShopProduct");

const {
    parseEmallProduct
} = require("./services/parseEmallProduct");

const {
    parseKufarProduct
} = require("./services/parseKufarProduct");

const {
    parse5ElementProduct
} = require("./services/parse5elementProduct");

const admin = require("firebase-admin");

const serviceAccount =
    require("./serviceAccountKey.json");

admin.initializeApp({

    credential:
        admin.credential.cert(
            serviceAccount
        )

});

const db = admin.firestore();

const app = express();

app.use(cors());

app.get(
    "/manualScraper",
    async (req, res) => {

        try {

            const url =
                req.query.url;

            console.log(
                "URL:",
                url
            );

            let product = null;

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
                    "deal.by"
                )
            ) {

                product =
                    await parseDealProduct(
                        url
                    );

            }

            else if (
                url.includes(
                    "7745.by"
                )
            ) {

                product =
                    await parse7745Product(
                        url
                    );

            }

            else if (
                url.includes(
                    "sila.by"
                )
            ) {

                product =
                    await parseElectrosilaProduct(
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
                    "5element.by"
                )
            ) {

                product =
                    await parse5ElementProduct(
                        url
                    );

            }

            if (!product) {

                return res
                    .status(400)
                    .send(
                        "Unsupported site"
                    );

            }

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

            res.send(product);

        }

        catch (error) {

            console.error(error);

            res
                .status(500)
                .send("Error");

        }

    }

);

const PORT =
    process.env.PORT || 3000;

app.listen(
    PORT,
    () => {

        console.log(
            "Server started"
        );

    }
);