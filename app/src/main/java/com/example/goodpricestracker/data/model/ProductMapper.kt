package com.example.goodpricestracker.data.model

import com.example.goodpricestracker.domain.model.Product

fun ProductDto.toDomain(): Product {
    return Product(
        productId = productId,
        title = title,
        marketplace = marketplace,
        originalUrl = originalUrl,
        category = category,
        country = country,
        currency = currency,
        images = images,
        price = price,
        originalPrice = originalPrice,
        discountPercent = discountPercent,
        minPriceEver = minPriceEver,
        watchersCount = watchersCount,
        likesCount = likesCount,
        viewsCount = viewsCount,
        createdAt = createdAt,
        lastUpdated = lastUpdated
    )
}

fun Product.toDto(): ProductDto {
    return ProductDto(
        productId = productId,
        title = title,
        marketplace = marketplace,
        originalUrl = originalUrl,
        category = category,
        country = country,
        currency = currency,
        images = images,
        price = price,
        originalPrice = originalPrice,
        discountPercent = discountPercent,
        minPriceEver = minPriceEver,
        watchersCount = watchersCount,
        likesCount = likesCount,
        viewsCount = viewsCount,
        createdAt = createdAt,
        lastUpdated = lastUpdated
    )
}