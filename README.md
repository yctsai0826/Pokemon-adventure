# 🎮 **Pokemon-Adventure Project**

## 📖 **Project Overview**
The **Pokemon-Adventure Project** is an interactive web-based adventure game where players can explore maps, battle bosses, collect rewards, and manage their inventory. The project integrates a backend database for user authentication, game progress tracking, and dynamic game state management.

## 🛠️ **Features**
1. **User Authentication:**
   - Secure login and registration system.
   - Session management to maintain user state.

2. **Interactive Gameplay:**
   - Explore maps and interact with in-game elements.
   - Engage in boss battles with dynamic health bars.

3. **Inventory Management:**
   - Collect and manage resources such as Poké Balls and coins.
   - Spend resources strategically for in-game advantages.

4. **Dynamic Difficulty Adjustment:**
   - Adaptive gameplay difficulty based on player progress.

5. **Responsive UI:**
   - Clean and intuitive interface for seamless gameplay.

## 💻 **Setup Guide (Using XAMPP on macOS)**
Follow these steps to set up the project using XAMPP on macOS:

### 1️⃣ **Install XAMPP**
- Download and install XAMPP from [Apache Friends](https://www.apachefriends.org/index.html).
- Open XAMPP and start **Apache** and **MySQL** services.

### 2️⃣ **Set Up the Database**
1. Open **phpMyAdmin** from XAMPP.
2. Create a new database, e.g., `pokemon_adventure`.
3. Import the SQL schema (if available) to set up necessary tables.

### 3️⃣ **Place Project Files**
- Copy all project files into the `htdocs` folder located in `/Applications/XAMPP/htdocs`.
- Ensure the directory looks like:
```
/htdocs/Pokemon-Adventure/
```

### 4️⃣ **Configure Database Connection**
- Open `login.php` and ensure the database connection details are correctly set:
```php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "pokemon_adventure";
```

### 5️⃣ **Run the Project**
- Open your browser and go to:
```
http://localhost/Pokemon-Adventure/login/login.php
```

## 🚀 **Usage Instructions**
1. **Login/Register:** Access `/login/login.php` to authenticate.
2. **Explore the Map:** Navigate through `/game.html`.
3. **Boss Battles:** Challenge bosses via `/boss.html`.
4. **Inventory Management:** Collect and manage resources.
5. **Logout:** Securely log out from the game.
