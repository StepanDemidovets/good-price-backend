package com.example.goodpricestracker.data.remote

import com.example.goodpricestracker.data.model.ProductDto
import com.google.firebase.firestore.FirebaseFirestore
import kotlinx.coroutines.tasks.await

class FirestoreDataSource(
    private val firestore: FirebaseFirestore
) {

    private val productsCollection = firestore.collection("products")

    suspend fun getProduct(productId: String): ProductDto? {
        val snapshot = productsCollection.document(productId).get().await()
        return snapshot.toObject(ProductDto::class.java)
    }

    suspend fun addProduct(product: ProductDto) {
        productsCollection
            .document(product.productId)
            .set(product)
            .await()
    }

    suspend fun updateWatchers(productId: String, newCount: Int) {
        productsCollection
            .document(productId)
            .update("watchersCount", newCount)
            .await()
    }

    suspend fun getPopularProducts(): List<ProductDto> {
        val snapshot = productsCollection
            .whereEqualTo("privacyHidden", false)
            .orderBy("likesCount")
            .limit(20)
            .get()
            .await()

        return snapshot.toObjects(ProductDto::class.java)
    }
}