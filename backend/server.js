const express = require("express");
const cors = require("cors");
const admin = require("firebase-admin");
const messaging = admin.messaging();

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

        const { url, userId } = req.query;

        if (!url || !userId) {
            return res.status(400).json({ error: "Missing params" });
        }

        const userRef = db.collection("users").doc(userId);

        // ищем продукт
        const snapshot = await db
            .collection("products")
            .where("link", "==", url)
            .get();

        let productId;

        if (!snapshot.empty) {

            const doc = snapshot.docs[0];
            productId = doc.id;

            // увеличиваем счётчик
            await doc.ref.update({
                userCount: admin.firestore.FieldValue.increment(1)
            });

        } else {

            const parsed = await parseProductByUrl(url);

            if (!parsed || !parsed.price) {
                return res.status(400).json({ error: "Parse failed" });
            }

            const newDoc = await db.collection("products").add({
                title: parsed.title,
                price: parsed.price,
                image: parsed.image || null,
                link: parsed.link,
                source: parsed.source,
                createdAt: new Date(),
                lastUpdated: new Date(),
                userCount: 1
            });

            productId = newDoc.id;
        }

        // добавляем пользователю
        await userRef.update({
            trackedProducts: admin.firestore.FieldValue.arrayUnion(productId)
        });

        res.json({ success: true, productId });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
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
/* Save FCM token */
/* ========================================= */

app.post("/saveFcmToken", async (req, res) => {

    try {

        const {
            userId,
            token
        } = req.body;

        if (!userId || !token) {

            return res.status(400).json({
                success: false,
                message: "Missing userId or token"
            });

        }

        const userRef =
            db.collection("users").doc(userId);

        await userRef.set({

            fcmTokens:
                admin.firestore.FieldValue.arrayUnion(token),

            updatedAt:
                new Date()

        }, {
            merge: true
        });

        res.json({
            success: true
        });

    }

    catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: error.message
        });

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
            res.status(400).json({
                success: false,
                message: "No id provided"
            });
        }

        await db
            .collection("products")
            .doc(id)
            .delete();

        res.json({ success: true, message: "Product deleted" });

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

        res.json({ success: true, message: "Product updated" });

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

        res.json({
            success: true,
            updated: updatedCount
        });

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

/* ========================================= */
/* Обновить/удалить/просмотреть товары по списку айдишников */
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

app.get("/getProductsByIds", async (req, res) => {

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

        const products =
            [];

        for (const id of ids) {

            const doc =
                await db
                    .collection("products")
                    .doc(id)
                    .get();

            if (doc.exists) {

                products.push({

                    id:
                    doc.id,

                    ...doc.data()

                });

            }

        }

        res.send(products);

    }

    catch (error) {

        console.error(error);

        res
            .status(500)
            .send(error.message);

    }

});

app.get("/deleteProductsByIds", async (req, res) => {

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

        let deletedCount =
            0;

        for (const id of ids) {

            try {

                await db
                    .collection("products")
                    .doc(id)
                    .delete();

                deletedCount++;

                console.log(
                    "Deleted:",
                    id
                );

            }

            catch (err) {

                console.log(
                    "Delete failed:",
                    id
                );

            }

        }

        res.send(
            `Deleted ${deletedCount} products`
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
/* Товары по ссылкам */
/* ========================================= */


app.get("/getProductsByLinks", async (req, res) => {

    try {

        const linksParam =
            req.query.links;

        if (!linksParam) {

            return res.send(
                "No links provided"
            );

        }

        const links =
            linksParam
                .split(",")
                .map(link => link.trim());

        const products =
            [];

        for (const link of links) {

            const snapshot =
                await db
                    .collection("products")
                    .where(
                        "link",
                        "==",
                        link
                    )
                    .get();

            snapshot.forEach(doc => {

                products.push({

                    id:
                    doc.id,

                    ...doc.data()

                });

            });

        }

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
/* Удаление/добавление товаров пользователю */
/* ========================================= */

app.get("/deleteUserProduct", async (req, res) => {
    try {

        const { userId, productId } = req.query;

        if (!userId || !productId) {
            return res.status(400).json({ error: "Missing params" });
        }

        const userRef = db.collection("users").doc(userId);
        const productRef = db.collection("products").doc(productId);

        // удаляем у пользователя
        await userRef.update({
            trackedProducts: admin.firestore.FieldValue.arrayRemove(productId)
        });

        const productDoc = await productRef.get();

        if (productDoc.exists) {

            const currentCount = productDoc.data().userCount || 1;

            if (currentCount <= 1) {

                // никто не отслеживает → удаляем продукт
                await productRef.delete();

            } else {

                await productRef.update({
                    userCount: admin.firestore.FieldValue.increment(-1)
                });

            }
        }

        res.json({ success: true });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
    }
});


app.get("/userProducts", async (req, res) => {

    try {

        const { userId } = req.query;

        const userDoc = await db.collection("users").doc(userId).get();

        if (!userDoc.exists) return res.json([]);

        const ids = userDoc.data().trackedProducts || [];

        const products = [];

        for (const id of ids) {
            const doc = await db.collection("products").doc(id).get();

            if (doc.exists) {
                products.push({
                    id: doc.id,
                    ...doc.data()
                });
            }
        }

        res.json(products);

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: e.message });
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