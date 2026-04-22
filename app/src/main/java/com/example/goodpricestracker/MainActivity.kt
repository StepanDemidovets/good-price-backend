package com.example.goodpricestracker

import android.util.Log
import androidx.core.view.WindowCompat
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.ui.Modifier
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.example.goodpricestracker.data.remote.FirebaseService
import com.example.goodpricestracker.data.remote.FirestoreDataSource
import com.example.goodpricestracker.data.repository.ProductRepositoryImpl
import com.example.goodpricestracker.navigation.BottomNavBar
import com.example.goodpricestracker.navigation.BottomNavItem
import com.example.goodpricestracker.ui.screens.HomeScreen
import com.example.goodpricestracker.ui.screens.ProfileScreen
import com.example.goodpricestracker.ui.screens.SearchScreen
import com.example.goodpricestracker.ui.screens.TrackedScreen
import com.google.firebase.auth.FirebaseAuth
import androidx.lifecycle.lifecycleScope
import kotlinx.coroutines.launch

class MainActivity : ComponentActivity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        FirebaseAuth.getInstance().signInAnonymously()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        val firestore = FirebaseService.firestore
        val dataSource = FirestoreDataSource(firestore)
        val repository = ProductRepositoryImpl(dataSource)
        lifecycleScope.launch {
            val products = repository.getPopularProducts()
            Log.d("TEST_FIREBASE", "Products: $products")
        }
        setContent {

            val navController = rememberNavController()

            Scaffold(

                bottomBar = {
                    BottomNavBar(navController)
                }

            ) { padding -> ///здесь ошибка Content padding parameter padding is not used

                NavHost(
                    navController = navController,
                    startDestination = BottomNavItem.Home.route,
                    modifier = Modifier.padding(padding)
                ) {

                    composable(BottomNavItem.Home.route) {
                        HomeScreen()
                    }

                    composable(BottomNavItem.Tracked.route) {
                        TrackedScreen()
                    }

                    composable(BottomNavItem.Search.route) {
                        SearchScreen()
                    }

                    composable(BottomNavItem.Profile.route) {
                        ProfileScreen()
                    }
                }
            }
        }
    }
}