package com.example.goodpricestracker.domain.model

data class Product(
    val productId: String,
    val title: String,
    val marketplace: String,
    val originalUrl: String,

    val category: String,
    val country: String,
    val currency: String,

    val images: List<String>,

    val price: Double,
    val originalPrice: Double,
    val discountPercent: Int,

    val minPriceEver: Double,

    val watchersCount: Int,
    val likesCount: Int,
    val viewsCount: Int,

    val createdAt: Long,
    val lastUpdated: Long
)