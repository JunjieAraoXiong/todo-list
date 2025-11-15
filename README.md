# Task Manager Pro

A feature-rich, modern task management application built as part of Berkeley's CS61B - Lecture 34 (Software Engineering III). This app combines essential task management with productivity features like Pomodoro timers, weather integration, and comprehensive keyboard shortcuts.

## Features

### Task Management
- **Create, Edit, and Delete Tasks** - Full CRUD operations for managing your tasks
- **Task Completion Tracking** - Mark tasks as complete with visual feedback
- **Due Dates & Times** - Set deadlines with date and time pickers
- **Priority Levels** - Organize tasks by High, Medium, or Low priority
- **Categories** - Tag tasks with Work, Personal, or Shopping categories
- **Location Tags** - Add location information to tasks
- **Smart Filtering** - View All, Active, or Completed tasks
- **Search Functionality** - Quickly find tasks by text search
- **Persistent Storage** - All tasks saved in browser's localStorage

### Focus Mode & Pomodoro Timer
- **Customizable Timer** - Set focus sessions from 1 to 60+ minutes
- **Live Clock Display** - Always see the current time and date
- **Countdown Timer** - Visual countdown with color-coded warnings
- **Timer Controls** - Pause, resume, and stop functionality
- **Progress Bar** - Visual representation of session progress
- **Completion Notifications** - Browser notifications when timer completes
- **Audio Alert** - Subtle sound notification on completion

### Keyboard Shortcuts
Navigate and manage tasks efficiently with keyboard shortcuts:

| Shortcut | Action |
|----------|--------|
| `N` | Create new task |
| `↑` / `↓` | Navigate between tasks |
| `Space` | Toggle task completion |
| `Enter` | Edit selected task |
| `Delete` / `Backspace` | Delete selected task |
| `F` | Start focus mode for selected task |
| `?` | Show keyboard shortcuts help |
| `Esc` | Exit focus mode / Close modals |

### Additional Features
- **Dark Mode** - Toggle between light and dark themes
- **Weather Integration** - Real-time weather display using geolocation
- **Task Statistics** - View total, active, and completed task counts
- **Smart Notifications** - Browser notifications for tasks due within 1 hour
- **Responsive Design** - Fully responsive layout for desktop, tablet, and mobile
- **Modern UI** - Clean, intuitive interface with smooth animations

## Demo

🔗 **[Live Demo](https://junjiearaoxiong.github.io/todo-list/)** *(Update this URL if deployed)*

## Installation

### Local Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/JunjieAraoXiong/todo-list.git
   cd todo-list
   ```

2. **Open in browser:**
   ```bash
   # Simply open index.html in your browser
   open index.html  # macOS
   # or
   start index.html # Windows
   # or
   xdg-open index.html # Linux
   ```

3. **Or use a local server** (recommended):
   ```bash
   # Using Python 3
   python -m http.server 8000

   # Using Node.js http-server
   npx http-server
   ```
   Then navigate to `http://localhost:8000`

## Usage

### Getting Started

1. **Add Your First Task**
   - Click the input field at the top or press `N`
   - Enter your task description
   - (Optional) Set due date, priority, category, and location
   - Click "Add Task" or press Enter

2. **Manage Tasks**
   - Click the checkbox to mark tasks complete
   - Double-click task text to edit
   - Use the delete button (×) to remove tasks
   - Filter tasks using All / Active / Completed buttons

3. **Focus Mode**
   - Click the "Focus" button on any task (or press `F` when selected)
   - Enter desired focus duration in minutes
   - Use pause/resume/stop controls as needed
   - Get notified when your session completes

4. **Keyboard Navigation**
   - Press `?` to see all available shortcuts
   - Use arrow keys to navigate tasks
   - Press `Space` to quickly toggle completion
   - Press `Enter` to edit tasks

### Weather Feature

The app requests location permission to display local weather. If denied, the weather widget will be hidden. The weather updates automatically and shows:
- Current temperature
- Weather conditions
- Location name

### Notifications

Grant notification permissions to receive alerts for:
- Tasks due within 1 hour
- Pomodoro timer completion

## Technologies Used

- **HTML5** - Semantic markup structure
- **CSS3** - Modern styling with custom properties (CSS variables)
- **Vanilla JavaScript** - ES6+ features, no frameworks
- **LocalStorage API** - Client-side data persistence
- **Geolocation API** - Location-based weather
- **Notifications API** - Browser notifications
- **OpenWeatherMap API** - Weather data

## Browser Compatibility

- ✅ Chrome/Edge 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Opera 76+

*Note: Some features like notifications and geolocation require HTTPS in production*

## Project Structure

```
todo-list/
├── index.html      # Main HTML structure
├── styles.css      # All styling and themes
├── main.js         # Application logic
├── LICENSE         # MIT License
└── README.md       # This file
```

## Contributing

This project was created for educational purposes as part of CS61B. Contributions, issues, and feature requests are welcome!

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Created for Berkeley's CS61B - Lecture 34 (Software Engineering III)
- Weather data provided by [OpenWeatherMap](https://openweathermap.org/)
- Icons and design inspired by modern task management apps

## Author

**Junjie Arao Xiong**
- GitHub: [@JunjieAraoXiong](https://github.com/JunjieAraoXiong)

---

⭐ Star this repo if you find it helpful!
