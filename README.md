# Cosmoscope 🚀

![NASA Space Apps Challenge](https://img.shields.io/badge/NASA-Space%20Apps%20Challenge-blue)
![Version](https://img.shields.io/badge/version-1.0.0-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**Created by Revo BD** | **[Live Preview](https://cosmoscope-lake.vercel.app)**

## 🌌 Overview

Cosmoscope is an interactive web application developed for the NASA Space Apps Challenge that allows users to explore Earth and Mars imagery from NASA's vast collection of satellite and rover data. The application combines powerful visualization tools with AI-assisted exploration to make space data more accessible and engaging for everyone.

## ✨ Features

- **Earth Exploration**: Browse and search satellite imagery of Earth with interactive maps
- **Mars Exploration**: Discover the Martian landscape through NASA's rover imagery
- **AI-Powered Chat**: Ask questions about space imagery with our Gemini-powered assistant
- **Interactive Image Gallery**: View high-resolution NASA images with detailed metadata
- **Dark/Light Mode**: Comfortable viewing experience in any lighting condition
- **Responsive Design**: Seamless experience across desktop and mobile devices

## 🛠️ Technologies

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router v7
- **Maps**: Leaflet
- **AI Integration**: Google Gemini API
- **Data Source**: NASA APIs

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- NASA API key (obtain from [NASA API Portal](https://api.nasa.gov/))
- Google Gemini API key (obtain from [Google AI Studio](https://makersuite.google.com/app/apikey))

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/cosmoscope.git
   cd cosmoscope
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Add your API keys to the `.env` file in the root directory:
   ```
   NASA_API_KEY=your_nasa_api_key
   GEMINI_API_KEY=your_gemini_api_key
   ```
   
   **Important**: You must add your NASA API key to use the application's features. Get your free API key from [NASA API Portal](https://api.nasa.gov/).

4. Start the development server
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## 📱 Usage

- **Earth View**: Navigate the interactive map to explore satellite imagery
- **Mars View**: Browse through the latest Mars rover photos
- **Image Gallery**: Click on images to view full-size with detailed information
- **AI Chat**: Ask questions about what you're seeing or request specific imagery
- **Theme Toggle**: Switch between dark and light mode using the toggle in the header

## 🏆 NASA Space Apps Challenge

This project was developed for the [NASA Space Apps Challenge](https://www.spaceappschallenge.org/), an international hackathon where teams engage with NASA's open data to address real-world problems on Earth and in space.

### Challenge Statement

Our project addresses the "Create Your Own Challenge" category for the NASA Space Apps Challenge. We identified a problem: space data is often inaccessible and difficult to understand for the general public. Our solution is Cosmoscope - an interactive platform that makes space exploration accessible and engaging for everyone, from space enthusiasts to educators and students.

### AI Capabilities

The Gemini-powered AI assistant in Cosmoscope offers several innovative features:

1. **Interactive Map Exploration**: The AI can analyze map data in real-time, helping users identify and learn about geographical features on Earth and geological formations on Mars.

2. **Image Analysis**: When viewing NASA imagery, the AI can identify objects, explain scientific phenomena, and provide educational context about what users are seeing.

3. **Personalized Space Tours**: Users can ask the AI to create custom "tours" of specific regions on Mars or Earth based on their interests (geology, history of exploration, potential for future missions, etc.).

4. **Scientific Q&A**: The AI serves as a knowledgeable companion, answering questions about space science, astronomy, and NASA missions in an accessible way.

## 📱 How to Use the App

### Navigation
- Use the navigation menu at the top to switch between Earth, Mars, and About pages
- Toggle between dark and light mode using the theme switch in the header

### Earth Exploration
1. Navigate to the Earth page
2. Use the interactive map to explore Earth's geography
3. Click on any location to get information about that area
4. Use the search bar to find specific locations
5. Interact with the AI assistant by clicking the chat icon to ask questions about what you're seeing

### Mars Exploration
1. Navigate to the Mars page
2. Browse through NASA's rover imagery of the Martian landscape
3. Click on images to view them in full size
4. Use the filters to find specific types of Mars imagery
5. Ask the AI assistant questions about Martian geology, rover missions, or any features you observe

### AI Chat Assistant
1. Click on the chat icon in the bottom right corner of any page
2. Type your question in the input field
3. The Gemini-powered AI will respond with information about space, NASA missions, or what you're currently viewing
4. You can ask follow-up questions to dive deeper into topics
5. Example questions:
   - "What are those dark spots on Mars?"
   - "Tell me about NASA's Curiosity rover"
   - "What geological features am I looking at in this region?"
   - "Create a tour of interesting craters on Mars"

### Image Gallery
1. Navigate to either Earth or Mars pages
2. Browse through the image collections
3. Click on any image to open it in full-screen mode
4. Use the navigation arrows to move between images
5. Click outside the image or the X button to close the full-screen view

### Tips for Best Experience
- For optimal performance, use a modern browser (Chrome, Firefox, Edge, Safari)
- Enable location services if you want to see your current position on Earth maps
- Try different search terms when exploring maps to discover interesting locations
- Combine the AI chat with map exploration for a more educational experience

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- NASA for providing open access to their incredible imagery and data
- The Space Apps Challenge for inspiring this project
- All contributors and team members who made this possible

---

Developed with ❤️ for the NASA Space Apps Challenge