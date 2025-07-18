<div align="center">
  <h1>🔍 img Identify</h1>
  <p>AI-powered Intelligent Image Recognition System</p>

<img src="https://img.shields.io/badge/Vue.js-3.x-4FC08D?style=for-the-badge&logo=vue.js&logoColor=white" alt="Vue.js">
  <img src="https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TailwindCSS-3.x-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS">
  <img src="https://img.shields.io/badge/Element_Plus-2.x-409EFF?style=for-the-badge&logo=element&logoColor=white" alt="Element Plus">
</div>

## ✨ Project Overview

**img Identify** is a modern web application that leverages advanced machine learning models to provide real-time image object detection services. Through a clean and intuitive interface, users can easily upload images and get accurate object recognition results.

### 🎯 Core Features

- **🚀 Real-time Detection** - Asynchronous processing based on Web Workers ensures smooth user experience
- **🎨 Modern Interface** - Responsive design built with TailwindCSS and Element Plus
- **🌐 Multi-language Support** - Intelligent Chinese-English label mapping with localized result display
- **📱 Responsive Design** - Perfect adaptation for desktop and mobile devices
- **⚡ High Performance** - Built with Vite, supporting hot reload and rapid development
- **🔧 TypeScript** - Complete type safety guarantee

### 🛠️ Tech Stack

| Technology   | Version | Purpose           |
| ------------ | ------- | ----------------- |
| Vue.js       | 3.x     | Frontend Framework|
| TypeScript   | 5.x     | Type Safety       |
| Vite         | 5.x     | Build Tool        |
| TailwindCSS  | 3.x     | CSS Framework     |
| Element Plus | 2.x     | UI Component Library|
| UnoCSS       | -       | Atomic CSS        |
| Animate.css  | -       | Animation Effects |

## 🚀 Quick Start

### Prerequisites

- Node.js >= 16.0.0
- npm >= 7.0.0 or yarn >= 1.22.0

### Install Dependencies

```bash
# Using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
img-identify/
├── src/
│   ├── components/          # Vue Components
│   │   ├── HeaderBar.vue    # Top Navigation Bar
│   │   ├── UploadArea.vue   # File Upload Area
│   │   └── ImagePreview.vue # Image Preview and Results Display
│   ├── composables/         # Composable Functions
│   │   ├── useBlackHoleAnimation.ts  # Background Animation Logic
│   │   └── useImageDetection.ts      # Image Detection Logic
│   ├── types/               # TypeScript Type Definitions
│   │   └── index.ts
│   ├── utils/               # Utility Functions
│   │   └── labelMap.ts      # Label Mapping
│   ├── lib/                 # Third-party Library Tools
│   │   └── utils.ts         # Common Utility Functions
│   ├── App.vue              # Root Component
│   ├── main.js              # Application Entry
│   └── index.css            # Global Styles
├── public/                  # Static Assets
├── index.html               # HTML Template
├── vite.config.js           # Vite Configuration
├── package.json             # Project Configuration
└── README.md                # Project Documentation
```

## 🎮 Usage Guide

### 1. Upload Image

- Click the upload area or drag and drop image files
- Supports common formats like JPG, PNG, GIF
- File size limit: 5MB

### 2. View Results

- System automatically analyzes uploaded images
- Real-time detection progress display
- Objects are annotated on the image

### 3. Result Interpretation

- Colored borders identify different objects
- Labels show object names and confidence scores
- Supports localized display in multiple languages

## 🔧 Configuration

### Custom Configuration

- **Detection Model**: Configure model parameters in `useImageDetection.ts`
- **Style Theme**: Modify CSS variables in `index.css`
- **Animation Effects**: Adjust animation parameters in `useBlackHoleAnimation.ts`

## 🤝 Contributing

We welcome all forms of contributions! Please follow these steps:

1. Fork this repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type-safe development
- Follow Vue 3 Composition API best practices
- Use arrow functions and modern ES6+ syntax
- Keep code clean and maintainable

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

<div align="center">
  <p>If this project helps you, please give it a ⭐️</p>
  <p>Made with ❤️ by the img Identify Team</p>
</div>
