package com.example.goodpricestracker.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

sealed class BottomNavItem(
    val route: String,
    val title: String,
    val icon: ImageVector
) {

    object Home : BottomNavItem(
        "home",
        "Главная",
        Icons.Default.Home
    )

    object Tracked : BottomNavItem(
        "tracked",
        "Отслеживаемые",
        Icons.Default.List
    )

    object Search : BottomNavItem(
        "search",
        "Поиск",
        Icons.Default.Search
    )

    object Profile : BottomNavItem(
        "profile",
        "Профиль",
        Icons.Default.Person
    )
}