class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentFilter = 'all';
        this.recentLocations = [];
        this.editingTaskId = null;
        this.notifiedTasks = new Set();
        this.notificationCheckInterval = null;

        this.cacheDOMElements();
        this.attachEventListeners();
        this.loadFromStorage();
        this.loadTheme();
        this.initWeather();
        this.initNotifications();
        this.updateUI();
        this.handleRouting();
    }

    cacheDOMElements() {
        this.taskInput = document.getElementById('taskInput');
        this.dueDateInput = document.getElementById('dueDateInput');
        this.dueTimeInput = document.getElementById('dueTimeInput');
        this.locationInput = document.getElementById('locationInput');
        this.locationSuggestions = document.getElementById('locationSuggestions');
        this.addBtn = document.getElementById('addBtn');
        this.taskList = document.getElementById('taskList');
        this.taskCount = document.getElementById('taskCount');
        this.toggleAll = document.getElementById('toggleAll');
        this.clearCompleted = document.getElementById('clearCompleted');
        this.filters = document.querySelectorAll('.filter');
        this.themeToggle = document.getElementById('themeToggle');
        this.weatherWidget = document.getElementById('weatherWidget');
    }

    attachEventListeners() {
        // Add task
        this.addBtn.addEventListener('click', () => this.addTask());
        this.taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Toggle all
        this.toggleAll.addEventListener('change', () => this.toggleAllTasks());

        // Clear completed
        this.clearCompleted.addEventListener('click', () => this.clearCompletedTasks());

        // Filter routing
        window.addEventListener('hashchange', () => this.handleRouting());

        // Location autocomplete
        this.locationInput.addEventListener('input', (e) => {
            this.showLocationSuggestions(e.target.value);
        });

        this.locationInput.addEventListener('focus', () => {
            this.showLocationSuggestions(this.locationInput.value);
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.location-autocomplete-wrapper')) {
                this.hideLocationSuggestions();
            }
        });

        // Theme toggle
        this.themeToggle.addEventListener('click', () => this.toggleTheme());
    }

    addTask() {
        const text = this.taskInput.value.trim();

        if (!text) {
            this.taskInput.focus();
            return;
        }

        const task = {
            id: Date.now().toString(),
            text: text,
            completed: false,
            createdAt: Date.now(),
            dueDate: this.dueDateInput.value || null,
            dueTime: this.dueTimeInput.value || null,
            location: this.locationInput.value.trim() || null
        };

        this.tasks.unshift(task);

        // Add location to recent locations
        if (task.location) {
            this.addRecentLocation(task.location);
        }

        this.taskInput.value = '';
        this.dueDateInput.value = '';
        this.dueTimeInput.value = '';
        this.locationInput.value = '';
        this.hideLocationSuggestions();

        this.saveToStorage();
        this.updateUI();
        this.taskInput.focus();
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.notifiedTasks.delete(id);
        this.saveToStorage();
        this.updateUI();
    }

    toggleTask(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            // Reset notification status when uncompleting a task
            if (!task.completed) {
                this.notifiedTasks.delete(id);
            }
            this.saveToStorage();
            this.updateUI();
        }
    }

    toggleAllTasks() {
        const allCompleted = this.tasks.every(task => task.completed);
        this.tasks.forEach(task => {
            task.completed = !allCompleted;
        });
        this.saveToStorage();
        this.updateUI();
    }

    clearCompletedTasks() {
        this.tasks = this.tasks.filter(task => !task.completed);
        this.saveToStorage();
        this.updateUI();
    }

    startEdit(id) {
        this.editingTaskId = id;
        this.updateUI();

        const editInput = document.querySelector(`[data-id="${id}"] .edit-input`);
        if (editInput) {
            editInput.focus();
            editInput.setSelectionRange(editInput.value.length, editInput.value.length);
        }
    }

    saveEdit(id, newText, newDueDate, newDueTime, newLocation) {
        const trimmedText = newText.trim();

        if (!trimmedText) {
            this.deleteTask(id);
            return;
        }

        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.text = trimmedText;
            task.dueDate = newDueDate || null;
            task.dueTime = newDueTime || null;
            task.location = newLocation.trim() || null;

            if (task.location) {
                this.addRecentLocation(task.location);
            }
        }

        this.editingTaskId = null;
        this.saveToStorage();
        this.updateUI();
    }

    cancelEdit() {
        this.editingTaskId = null;
        this.updateUI();
    }

    addRecentLocation(location) {
        const trimmed = location.trim();
        if (!trimmed) return;

        // Remove if already exists (to move to top)
        this.recentLocations = this.recentLocations.filter(loc => loc !== trimmed);

        // Add to beginning
        this.recentLocations.unshift(trimmed);

        // Keep only last 10 locations
        this.recentLocations = this.recentLocations.slice(0, 10);

        // Save to localStorage
        localStorage.setItem('recentLocations', JSON.stringify(this.recentLocations));
    }

    showLocationSuggestions(query) {
        const trimmedQuery = query.trim().toLowerCase();

        if (!trimmedQuery) {
            if (this.recentLocations.length > 0) {
                this.renderLocationSuggestions(this.recentLocations);
            } else {
                this.hideLocationSuggestions();
            }
            return;
        }

        // Filter locations that match the query
        const matches = this.recentLocations.filter(location =>
            location.toLowerCase().includes(trimmedQuery)
        );

        if (matches.length > 0) {
            this.renderLocationSuggestions(matches);
        } else {
            this.hideLocationSuggestions();
        }
    }

    renderLocationSuggestions(locations) {
        this.locationSuggestions.innerHTML = locations.map(location => `
            <li class="location-suggestion">${this.escapeHtml(location)}</li>
        `).join('');

        this.locationSuggestions.style.display = 'block';

        // Add click handlers
        this.locationSuggestions.querySelectorAll('.location-suggestion').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.locationInput.value = locations[index];
                this.hideLocationSuggestions();
            });
        });
    }

    hideLocationSuggestions() {
        this.locationSuggestions.style.display = 'none';
        this.locationSuggestions.innerHTML = '';
    }

    handleRouting() {
        const hash = window.location.hash;

        if (hash === '#/active') {
            this.currentFilter = 'active';
        } else if (hash === '#/completed') {
            this.currentFilter = 'completed';
        } else {
            this.currentFilter = 'all';
        }

        this.updateFilterButtons();
        this.updateUI();
    }

    updateFilterButtons() {
        this.filters.forEach(filter => {
            const href = filter.getAttribute('href');
            if (
                (href === '#/' && this.currentFilter === 'all') ||
                (href === '#/active' && this.currentFilter === 'active') ||
                (href === '#/completed' && this.currentFilter === 'completed')
            ) {
                filter.classList.add('active');
            } else {
                filter.classList.remove('active');
            }
        });
    }

    getFilteredTasks() {
        if (this.currentFilter === 'active') {
            return this.tasks.filter(task => !task.completed);
        } else if (this.currentFilter === 'completed') {
            return this.tasks.filter(task => task.completed);
        }
        return this.tasks;
    }

    updateUI() {
        const filteredTasks = this.getFilteredTasks();

        // Render tasks
        this.taskList.innerHTML = filteredTasks.map(task =>
            this.renderTask(task)
        ).join('');

        // Update task counter
        const activeCount = this.tasks.filter(task => !task.completed).length;
        this.taskCount.textContent = activeCount;

        // Update toggle all checkbox
        const allCompleted = this.tasks.length > 0 && this.tasks.every(task => task.completed);
        this.toggleAll.checked = allCompleted;

        // Show/hide clear completed button
        const hasCompleted = this.tasks.some(task => task.completed);
        this.clearCompleted.style.display = hasCompleted ? 'block' : 'none';

        // Attach event listeners to task items
        this.attachTaskEventListeners();
    }

    renderTask(task) {
        const isEditing = this.editingTaskId === task.id;

        if (isEditing) {
            return `
                <li class="task-item editing" data-id="${task.id}">
                    <div class="edit-form">
                        <input
                            type="text"
                            class="edit-input"
                            value="${this.escapeHtml(task.text)}"
                        >
                        <input
                            type="date"
                            class="edit-date"
                            value="${task.dueDate || ''}"
                        >
                        <input
                            type="time"
                            class="edit-time"
                            value="${task.dueTime || ''}"
                        >
                        <input
                            type="text"
                            class="edit-location"
                            placeholder="Location"
                            value="${this.escapeHtml(task.location || '')}"
                        >
                    </div>
                </li>
            `;
        }

        const dueDateDisplay = this.formatDueDateTime(task.dueDate, task.dueTime);
        const locationDisplay = task.location ? `<div class="task-location">📍 ${this.escapeHtml(task.location)}</div>` : '';

        return `
            <li class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
                <div class="task-content">
                    <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
                    <div class="task-details">
                        ${dueDateDisplay ? `<span class="task-due-date">${dueDateDisplay}</span>` : ''}
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        ${locationDisplay}
                    </div>
                    <button class="delete-btn">×</button>
                </div>
            </li>
        `;
    }

    attachTaskEventListeners() {
        // Checkbox toggle
        this.taskList.querySelectorAll('.task-checkbox').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = taskItem.dataset.id;
                this.toggleTask(id);
            });
        });

        // Delete button
        this.taskList.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = taskItem.dataset.id;
                this.deleteTask(id);
            });
        });

        // Double-click to edit
        this.taskList.querySelectorAll('.task-text').forEach(text => {
            text.addEventListener('dblclick', (e) => {
                const taskItem = e.target.closest('.task-item');
                const id = taskItem.dataset.id;
                this.startEdit(id);
            });
        });

        // Edit input handlers
        this.taskList.querySelectorAll('.edit-input').forEach(input => {
            const taskItem = input.closest('.task-item');
            const id = taskItem.dataset.id;
            const dateInput = taskItem.querySelector('.edit-date');
            const timeInput = taskItem.querySelector('.edit-time');
            const locationInput = taskItem.querySelector('.edit-location');

            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveEdit(id, input.value, dateInput.value, timeInput.value, locationInput.value);
                }
            });

            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (this.editingTaskId === id) {
                        this.saveEdit(id, input.value, dateInput.value, timeInput.value, locationInput.value);
                    }
                }, 100);
            });

            input.addEventListener('keydown', (e) => {
                if (e.key === 'Escape') {
                    this.cancelEdit();
                }
            });
        });
    }

    formatDueDate(dateString) {
        if (!dateString) return '';

        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (date.getTime() === today.getTime()) return 'Today';
        if (date.getTime() === tomorrow.getTime()) return 'Tomorrow';

        const options = { month: 'short', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    formatDueDateTime(dateString, timeString) {
        if (!dateString) return '';

        const date = new Date(dateString + 'T00:00:00');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        let dateDisplay = '';
        if (date.getTime() === today.getTime()) {
            dateDisplay = 'Today';
        } else if (date.getTime() === tomorrow.getTime()) {
            dateDisplay = 'Tomorrow';
        } else {
            const options = { month: 'short', day: 'numeric' };
            dateDisplay = date.toLocaleDateString('en-US', options);
        }

        if (timeString) {
            // Convert 24h to 12h format
            const [hours, minutes] = timeString.split(':');
            const hour = parseInt(hours, 10);
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            dateDisplay += ` ${displayHour}:${minutes} ${ampm}`;
        }

        return dateDisplay;
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    toggleTheme() {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
    }

    loadTheme() {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.documentElement.setAttribute('data-theme', savedTheme);
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
                document.documentElement.setAttribute('data-theme', 'dark');
            }
        }
    }

    async initWeather() {
        try {
            // Check if geolocation is supported
            if (!navigator.geolocation) {
                this.displayWeatherError('Location not supported');
                return;
            }

            // Request user's location
            navigator.geolocation.getCurrentPosition(
                (position) => this.fetchWeather(position.coords.latitude, position.coords.longitude),
                (error) => {
                    console.error('Geolocation error:', error);
                    if (error.code === error.PERMISSION_DENIED) {
                        this.displayWeatherError('Location access denied');
                    } else {
                        this.displayWeatherError('Location unavailable');
                    }
                }
            );
        } catch (error) {
            console.error('Weather init error:', error);
            this.displayWeatherError('Weather unavailable');
        }
    }

    async fetchWeather(latitude, longitude) {
        try {
            console.log('Fetching weather for:', latitude, longitude);

            // Fetch weather data from Open-Meteo API (free, no API key required)
            const weatherResponse = await fetch(
                `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=fahrenheit&timezone=auto`
            );

            if (!weatherResponse.ok) {
                console.error('Weather API response not OK:', weatherResponse.status);
                throw new Error('Weather fetch failed');
            }

            const weatherData = await weatherResponse.json();
            console.log('Weather data received:', weatherData);

            // Display weather immediately with default location
            const temperature = Math.round(weatherData.current.temperature_2m);
            const weatherCode = weatherData.current.weather_code;
            this.displayWeather(temperature, 'Current Location', this.getWeatherDescription(weatherCode));

            // Fetch location name asynchronously (non-blocking)
            this.fetchLocationName(latitude, longitude, temperature, weatherCode);

        } catch (error) {
            console.error('Weather fetch error:', error);
            this.displayWeatherError('Weather unavailable');
        }
    }

    async fetchLocationName(latitude, longitude, temperature, weatherCode) {
        try {
            // Use OpenStreetMap Nominatim for reverse geocoding (more reliable)
            const locationResponse = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                {
                    headers: {
                        'User-Agent': 'TodoApp/1.0'
                    }
                }
            );

            if (locationResponse.ok) {
                const locationData = await locationResponse.json();
                const locationName = locationData.address?.city ||
                                    locationData.address?.town ||
                                    locationData.address?.village ||
                                    locationData.address?.county ||
                                    'Current Location';

                // Update weather display with actual location name
                this.displayWeather(temperature, locationName, this.getWeatherDescription(weatherCode));
            }
        } catch (error) {
            console.log('Location name fetch failed, using default:', error);
            // Keep showing "Current Location" - already displayed
        }
    }

    getWeatherDescription(code) {
        // WMO Weather interpretation codes
        const weatherCodes = {
            0: 'Clear',
            1: 'Mainly clear',
            2: 'Partly cloudy',
            3: 'Overcast',
            45: 'Foggy',
            48: 'Foggy',
            51: 'Light drizzle',
            53: 'Drizzle',
            55: 'Heavy drizzle',
            61: 'Light rain',
            63: 'Rain',
            65: 'Heavy rain',
            71: 'Light snow',
            73: 'Snow',
            75: 'Heavy snow',
            77: 'Snow grains',
            80: 'Light showers',
            81: 'Showers',
            82: 'Heavy showers',
            85: 'Light snow showers',
            86: 'Snow showers',
            95: 'Thunderstorm',
            96: 'Thunderstorm',
            99: 'Thunderstorm'
        };
        return weatherCodes[code] || 'Clear';
    }

    displayWeather(temperature, location, description) {
        this.weatherWidget.innerHTML = `
            <div class="weather-content">
                <div class="weather-temp">${temperature}°</div>
                <div class="weather-location">${this.escapeHtml(location)}</div>
                <div class="weather-description">${description}</div>
            </div>
        `;
    }

    displayWeatherError(message) {
        this.weatherWidget.innerHTML = `
            <div class="weather-error">${message}</div>
        `;
    }

    async initNotifications() {
        // Request notification permission
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                await Notification.requestPermission();
            }

            // Start checking for due tasks every 30 seconds
            this.startNotificationChecker();
        }
    }

    startNotificationChecker() {
        // Clear existing interval if any
        if (this.notificationCheckInterval) {
            clearInterval(this.notificationCheckInterval);
        }

        // Check immediately
        this.checkDueTasks();

        // Then check every 30 seconds
        this.notificationCheckInterval = setInterval(() => {
            this.checkDueTasks();
        }, 30000); // 30 seconds
    }

    checkDueTasks() {
        if (Notification.permission !== 'granted') return;

        const now = new Date();
        const nowTime = now.getTime();

        this.tasks.forEach(task => {
            // Skip completed tasks
            if (task.completed) return;

            // Skip if no due date or time
            if (!task.dueDate || !task.dueTime) return;

            // Skip if already notified
            if (this.notifiedTasks.has(task.id)) return;

            // Create a Date object for the task due time
            const dueDateTime = new Date(`${task.dueDate}T${task.dueTime}`);
            const dueTime = dueDateTime.getTime();

            // Check if task is due (within 1 minute window)
            const timeDiff = dueTime - nowTime;
            if (timeDiff <= 60000 && timeDiff >= -60000) {
                this.sendNotification(task);
                this.notifiedTasks.add(task.id);
            }
        });
    }

    sendNotification(task) {
        const title = 'Task Due';
        const options = {
            body: task.text,
            icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230071e3"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>',
            badge: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%230071e3"><circle cx="12" cy="12" r="10"/></svg>',
            tag: task.id,
            requireInteraction: true,
            silent: false
        };

        if (task.location) {
            options.body += `\n📍 ${task.location}`;
        }

        const notification = new Notification(title, options);

        // Focus on the app when notification is clicked
        notification.onclick = () => {
            window.focus();
            notification.close();

            // Scroll to the task if possible
            const taskElement = document.querySelector(`[data-id="${task.id}"]`);
            if (taskElement) {
                taskElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                taskElement.style.animation = 'none';
                setTimeout(() => {
                    taskElement.style.animation = '';
                }, 10);
            }
        };
    }

    saveToStorage() {
        localStorage.setItem('tasks', JSON.stringify(this.tasks));
    }

    loadFromStorage() {
        const savedTasks = localStorage.getItem('tasks');
        const savedLocations = localStorage.getItem('recentLocations');

        if (savedTasks) {
            try {
                this.tasks = JSON.parse(savedTasks);
            } catch (e) {
                console.error('Failed to load tasks:', e);
                this.tasks = [];
            }
        }

        if (savedLocations) {
            try {
                this.recentLocations = JSON.parse(savedLocations);
            } catch (e) {
                console.error('Failed to load recent locations:', e);
                this.recentLocations = [];
            }
        }
    }
}

// Initialize the app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new TodoApp();
});
