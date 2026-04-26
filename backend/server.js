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

const serviceAccount =
    JSON.parse(process.env.FIREBASE_KEY);

admin.initializeApp({
    credential:
        admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

db.settings({
    ignoreUndefinedProperties: true
});

const app = express();

app.use(cors());
app.use(express.json());

/* ========================================= */
/* Универсальный парсер по URL */
/* ========================================= */

async function parseProductByUrl(url) {

    if (url.includes("onliner.by")) {
        return await parseOnlinerProduct(url);
    }

    else if (url.includes("deal.by")) {
        return await parseDealProduct(url);
    }

    else if (url.includes("7745.by")) {
        return await parse7745Product(url);
    }

    else if (url.includes("21vek.by")) {
        return await parse21vekProduct(url);
    }

    else if (url.includes("sila.by")) {
        return await parseElectrosilaProduct(url);
    }

    else if (url.includes("shop.by")) {
        return await parseShopProduct(url);
    }

    else if (url.includes("emall.by")) {
        return await parseEmallProduct(url);
    }

    else if (url.includes("kufar.by")) {
        return await parseKufarProduct(url);
    }

    else if (url.includes("5element.by")) {
        return await parse5elementProduct(url);
    }

    return null;

}

/* ========================================= */
/* Health check */
/* ========================================= */

app.get("/", (req, res) => {
    res.send("Backend is running");
});

/* ========================================= */
/* Добавить товар */
/* ========================================= */

app.get("/manualScraper", async (req, res) => {

    try {

        const url =
            req.query.url;

        console.log(
            "URL:",
            url
        );

        const product =
            await parseProductByUrl(url);

        if (!product) {

            return res
                .status(400)
                .send("Unsupported site");

        }

        if (
            !product.title ||
            !product.price
        ) {

            console.log(
                "Product invalid, not saving"
            );

            return res.send(product);

        }

        await db
            .collection("products")
            .add({

                title:
                    product.title || null,

                price:
                    product.price || null,

                image:
                    product.image || null,

                link:
                product.link,

                source:
                product.source,

                status:
                    "ok",

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
            .send(error.message);

    }

});

/* ========================================= */
/* Получить все товары */
/* ========================================= */

app.get("/products", async (req, res) => {

    try {

        const snapshot =
            await db
                .collection("products")
                .orderBy(
                    "createdAt",
                    "desc"
                )
                .get();

        const products =
            snapshot.docs.map(doc => ({

                id:
                doc.id,

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

/* ========================================= */
/* Удалить товар */
/* ========================================= */

app.get("/deleteProduct", async (req, res) => {

    try {

        const id =
            req.query.id;

        if (!id) {
            return res.send(
                "No id provided"
            );
        }

        await db
            .collection("products")
            .doc(id)
            .delete();

        res.send(
            "Product deleted"
        );

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

/* ========================================= */
/* Обновить один товар */
/* ========================================= */

app.get("/updateProduct", async (req, res) => {

    try {

        const id =
            req.query.id;

        if (!id) {
            return res.send(
                "No id provided"
            );
        }

        const docRef =
            db
                .collection("products")
                .doc(id);

        const snapshot =
            await docRef.get();

        if (!snapshot.exists) {
            return res.send(
                "Product not found"
            );
        }

        const product =
            snapshot.data();

        const url =
            product.link;

        console.log(
            "Updating product:",
            url
        );

        const updatedProduct =
            await parseProductByUrl(url);

        if (
            !updatedProduct ||
            !updatedProduct.price
        ) {

            console.log(
                "Update failed"
            );

            return res.send(
                "Failed to update product"
            );

        }

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

        console.log(
            "Updated successfully"
        );

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

/* ========================================= */
/* Обновить ВСЕ товары */
/* ========================================= */

app.get("/updateAllProducts", async (req, res) => {

    try {

        const snapshot =
            await db
                .collection("products")
                .get();

        let updatedCount = 0;

        for (const doc of snapshot.docs) {

            const product =
                doc.data();

            const url =
                product.link;

            console.log(
                "Updating:",
                url
            );

            const updatedProduct =
                await parseProductByUrl(url);

            if (
                updatedProduct &&
                updatedProduct.price
            ) {

                await db
                    .collection("products")
                    .doc(doc.id)
                    .update({

                        title:
                        updatedProduct.title,

                        price:
                        updatedProduct.price,

                        image:
                        updatedProduct.image,

                        lastUpdated:
                            new Date()

                    });

                updatedCount++;

                console.log(
                    "Updated successfully"
                );

            }

            else {

                console.log(
                    "Update failed"
                );

            }

        }

        res.send(
            `Updated ${updatedCount} products`
        );

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

/* ========================================= */
/* Обновить товары по списку айдишников */
/* ========================================= */

app.get("/updateProductsByIds", async (req, res) => {

    try {

        const idsParam =
            req.query.ids;

        if (!idsParam) {

            return res.send(
                "No ids provided"
            );

        }

        const ids =
            idsParam
                .split(",")
                .map(id => id.trim());

        console.log(
            "Updating IDs:",
            ids
        );

        let updatedCount =
            0;

        for (const id of ids) {

            try {

                const docRef =
                    db
                        .collection("products")
                        .doc(id);

                const snapshot =
                    await docRef.get();

                if (!snapshot.exists) {

                    console.log(
                        "Not found:",
                        id
                    );

                    continue;

                }

                const product =
                    snapshot.data();

                const url =
                    product.link;

                console.log(
                    "Updating:",
                    url
                );

                const updatedProduct =
                    await parseProductByUrl(url);

                if (
                    updatedProduct &&
                    updatedProduct.price
                ) {

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

                    updatedCount++;

                    console.log(
                        "Updated:",
                        id
                    );

                }

                else {

                    console.log(
                        "Failed:",
                        id
                    );

                }

            }

            catch (err) {

                console.log(
                    "Error updating:",
                    id,
                    err.message
                );

            }

        }

        res.send(
            `Updated ${updatedCount} products`
        );

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

/* ========================================= */

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