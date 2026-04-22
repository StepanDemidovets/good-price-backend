package com.example.goodpricestracker.data.repository

import com.example.goodpricestracker.data.model.ProductDto
import com.example.goodpricestracker.data.model.toDomain
import com.example.goodpricestracker.data.model.toDto
import com.example.goodpricestracker.data.remote.FirestoreDataSource
import com.example.goodpricestracker.domain.model.Product
import com.example.goodpricestracker.domain.repository.ProductRepository

class ProductRepositoryImpl(
    private val dataSource: FirestoreDataSource
) : ProductRepository {

    override suspend fun getProduct(productId: String): Product? {
        return dataSource.getProduct(productId)?.toDomain()
    }

    override suspend fun addProduct(product: Product) {
        dataSource.addProduct(product.toDto())
    }

    override suspend fun getPopularProducts(): List<Product> {
        return dataSource.getPopularProducts().map { it.toDomain() }
    }
}