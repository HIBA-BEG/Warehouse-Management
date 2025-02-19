# Stock Management Application

## 📋 Project Overview
A retail store aims to modernize and simplify its inventory management by providing warehouse staff with an intuitive application. This solution utilizes barcode scanning technology and manual input options to streamline stock management operations.

## 🎯 Project Context
The application is designed to:
- Enable rapid stock management through barcode scanning and manual entry
- Provide real-time product tracking with stock adjustment capabilities
- Facilitate easy addition of new products through an interactive form
- Optimize inventory management while reducing human error

## ✨ Key Features

### 1. Authentication
- Secure access through personal secret key for each user

### 2. Product Management
#### Product Identification
- Integrated barcode scanner using expo-barcode-scanner
- Manual barcode entry option as backup

#### Database Verification
For Existing Products:
- Add or remove quantities in warehouse
- Display product information (name, type, price, available quantity per warehouse)

For New Products:
- Creation form with fields:
  - Name
  - Type
  - Price
  - Supplier
  - Initial quantity
  - Product image 
  - Warehouse location

### 3. Product Listing
#### Detailed Display
- Product information (name, type, price, quantity, stock status)
- Editor information
- Visual indicators:
  - Red for out-of-stock items
  - Yellow for low stock items (<10 units)
  - Green for available stock (>10 units)

#### Available Actions
- "Restock" button to increase quantity
- "Unload" button to decrease units

### 4. Advanced Features
#### Search and Filter
- Search by name, type, price, or supplier
- Dynamic sorting (ascending/descending):
  - Price
  - Alphabetical name
  - Quantity

### 5. Statistics Dashboard
- Total product count
- Total cities count
- Out-of-stock products
- Total stock value

### 6. Data Management
- PDF report export functionality using expo-print

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm 
- Expo CLI
- A mobile device or emulator

### Installation

1. Clone the repository
```bash
git clone https://github.com/HIBA-BEG/Warehouse-Management.git
cd Warehouse-Management
```

2. Install dependencies
```bash
npm install
```

3. Install Expo CLI globally (if not already installed)
```bash
npm install -g expo-cli
```

4. Set up the backend
```bash
# Install json-server globally
npm install -g json-server

# Start the json-server 
npx json-server db.json
```

5. Start the Expo development server
```bash
npx expo start
```

### Mobile Setup
1. Install the Expo Go app on your mobile device:
   - [Android Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)
   - [iOS App Store](https://apps.apple.com/app/expo-go/id982107779)

2. Scan the QR code from your terminal using:
   - Android: Expo Go app
   - iOS: Camera app

### Environment Setup
1. Create a `.env` file in the root directory
```bash
cp .env.example .env
```

2. Update the `.env` file with your configuration:
```
EXPO_PUBLIC_API_URL=http://localhost:3000
```
