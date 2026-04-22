package com.example.goodpricestracker.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun ProfileScreen() {

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),

        horizontalAlignment = Alignment.CenterHorizontally
    ) {

        Icon(
            imageVector = Icons.Default.Person,
            contentDescription = "avatar",
            modifier = Modifier.size(100.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Text(
            text = "Имя пользователя",
            style = MaterialTheme.typography.headlineSmall
        )

        Text(
            text = "email@example.com",
            style = MaterialTheme.typography.bodyMedium
        )

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = { }
        ) {
            Text("Редактировать профиль")
        }

        Spacer(modifier = Modifier.height(16.dp))

        Button(
            onClick = { }
        ) {
            Text("Настройки уведомлений")
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedButton(
            onClick = { }
        ) {
            Text("Выйти")
        }
    }
}