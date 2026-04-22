package com.example.goodpricestracker.domain.repository

import com.example.goodpricestracker.domain.model.Product

interface ProductRepository {

    suspend fun getProduct(productId: String): Product?

    suspend fun addProduct(product: Product)

    suspend fun getPopularProducts(): List<Product>
}