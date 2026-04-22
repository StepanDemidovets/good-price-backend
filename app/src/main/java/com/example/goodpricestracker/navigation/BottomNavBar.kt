package com.example.goodpricestracker.navigation

import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.navigation.NavController
import androidx.navigation.compose.currentBackStackEntryAsState

@Composable
fun BottomNavBar(navController: NavController) {

    val items = listOf(
        BottomNavItem.Home,
        BottomNavItem.Tracked,
        BottomNavItem.Search,
        BottomNavItem.Profile
    )

    NavigationBar {

        val navBackStackEntry =
            navController.currentBackStackEntryAsState()

        val currentRoute =
            navBackStackEntry.value?.destination?.route

        items.forEach { item ->

            NavigationBarItem(
                icon = { Icon(item.icon, contentDescription = item.title) },

                label = { Text(item.title) },

                selected = currentRoute == item.route,

                onClick = {
                    navController.navigate(item.route) {
                        popUpTo("home")
                        launchSingleTop = true
                    }
                }
            )
        }
    }
}