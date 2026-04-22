package com.example.goodpricestracker.data.model

data class ProductDto(

    val productId: String = "",
    val title: String = "",
    val marketplace: String = "",
    val originalUrl: String = "",

    val category: String = "",
    val country: String = "",
    val currency: String = "",

    val images: List<String> = emptyList(),

    val price: Double = 0.0,
    val originalPrice: Double = 0.0,
    val discountPercent: Int = 0,

    val minPriceEver: Double = 0.0,

    val priceHistory: List<PriceHistoryDto> = emptyList(),

    val watchersCount: Int = 0,
    val likesCount: Int = 0,
    val viewsCount: Int = 0,

    val createdAt: Long = 0,
    val lastUpdated: Long = 0,

    val privacyHidden: Boolean = false
)