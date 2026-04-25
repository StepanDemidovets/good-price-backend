const express = require("express");
const cors = require("cors");

const {
    parse21vekProduct
} = require("./services/parse21vekProduct");

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
    parse5elementProduct
} = require("./services/parse5elementProduct");

const admin = require("firebase-admin");

const serviceAccount = JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.settings({
    ignoreUndefinedProperties: true
});

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Backend is running");
});

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
                    await parse5elementProduct(
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

            if (!product.title || !product.price) {
                console.log("Product invalid, not saving");
                return res.send(product);
            }



            await db.collection("products").add({
                title: product.title || null,
                price: product.price || null,
                image: product.image || null,
                link: product.link,
                source: product.source,

                status: product.title ? "ok" : "error",

                createdAt: new Date(),
                lastUpdated: new Date()
            });

            res.send(product);

        }

        catch (error) {

            console.error(error);

            res
                .status(500)
                .send(error.message);

        }

    }

);

app.get("/products", async (req, res) => {

    try {

        const snapshot =
            await db
                .collection("products")
                .orderBy("createdAt", "desc")
                .get();

        const products =
            snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

        res.send(products);

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.delete("/products/:id", async (req, res) => {

    try {

        const id =
            req.params.id;

        await db
            .collection("products")
            .doc(id)
            .delete();

        res.send("Deleted");

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.put("/products/:id", async (req, res) => {

    try {

        const id =
            req.params.id;

        const newPrice =
            req.body.price;

        await db
            .collection("products")
            .doc(id)
            .update({

                price:
                newPrice,

                lastUpdated:
                    new Date()

            });

        res.send("Updated");

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

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