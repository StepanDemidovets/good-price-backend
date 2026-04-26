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

app.get("/deleteProduct", async (req, res) => {

    try {

        const id =
            req.query.id;

        if (!id) {
            return res.send("No id provided");
        }

        await db
            .collection("products")
            .doc(id)
            .delete();

        res.send("Product deleted");

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.get("/updateProduct", async (req, res) => {

    try {

        const id =
            req.query.id;

        if (!id) {
            return res.send("No id provided");
        }

        // получить товар из базы

        const docRef =
            db
                .collection("products")
                .doc(id);

        const snapshot =
            await docRef.get();

        if (!snapshot.exists) {
            return res.send("Product not found");
        }

        const product =
            snapshot.data();

        const url =
            product.link;

        console.log(
            "Updating product:",
            url
        );

        let updatedProduct =
            null;

        // определить сайт

        if (url.includes("onliner.by")) {

            updatedProduct =
                await parseOnlinerProduct(url);

        }

        else if (url.includes("deal.by")) {

            updatedProduct =
                await parseDealProduct(url);

        }

        else if (url.includes("7745.by")) {

            updatedProduct =
                await parse7745Product(url);

        }

        else if (url.includes("21vek.by")) {

            updatedProduct =
                await parse21vekProduct(url);

        }

        else if (url.includes("sila.by")) {

            updatedProduct =
                await parseElectrosilaProduct(url);

        }

        else if (url.includes("shop.by")) {

            updatedProduct =
                await parseShopProduct(url);

        }

        else if (url.includes("emall.by")) {

            updatedProduct =
                await parseEmallProduct(url);

        }

        else if (url.includes("kufar.by")) {

            updatedProduct =
                await parseKufarProduct(url);

        }

        else if (url.includes("5element.by")) {

            updatedProduct =
                await parse5elementProduct(url);

        }

        if (
            !updatedProduct ||
            !updatedProduct.price
        ) {

            return res.send(
                "Failed to update product"
            );

        }

        // обновить документ

        await docRef.update({

            title:
            updatedProduct.title,

            price:
            updatedProduct.price,

            image:
            updatedProduct.image,

            lastUpdated:
                new Date()

        });

        res.send(
            "Product updated"
        );

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.get("/updateAllProducts", async (req, res) => {

    try {

        const snapshot =
            await db
                .collection("products")
                .get();

        for (const doc of snapshot.docs) {

            const product =
                doc.data();

            console.log(
                "Updating:",
                product.link
            );

            let updatedProduct =
                null;

            const url =
                product.link;

            if (url.includes("onliner.by")) {
                updatedProduct =
                    await parseOnlinerProduct(url);
            }

            else if (url.includes("5element.by")) {
                updatedProduct =
                    await parse5elementProduct(url);
            }

            else if (url.includes("21vek.by")) {
                updatedProduct =
                    await parse21vekProduct(url);
            }

            if (
                updatedProduct &&
                updatedProduct.price
            ) {

                await db
                    .collection("products")
                    .doc(doc.id)
                    .update({

                        price:
                        updatedProduct.price,

                        lastUpdated:
                            new Date()

                    });

            }

        }

        res.send("All products updated");

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.listen(
    PORT,
    () => {

        console.log(
            "Server started"
        );

    }
);