# NEPA Football Broadcast Platform

A full-stack web application for broadcasting high school football games in the NEPA (Northeastern Pennsylvania) region. This platform provides live game streaming, real-time statistics, team rankings, and comprehensive coverage of local high school football.

## 🏈 Features

- **Live Game Broadcasting**: Stream and watch live high school football games
- **Real-time Statistics**: Track scores, player stats, and team performance
- **Interactive Leaderboards**: View team and player rankings with charts
- **Game Scheduling**: Manage and view upcoming games and schedules
- **User Authentication**: Secure login and registration system
- **Responsive Design**: Mobile-friendly interface for all devices

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript - Core UI framework
- **Vite** - Development server and build tool
- **Tailwind CSS** - Utility-first CSS framework for styling
- **React Query (TanStack)** - Server state management
- **Recharts** - Data visualization and leaderboards
- **React Router** - Client-side routing

### Backend
- **Spring Boot 3.2** - Java backend framework
- **Spring Security + JWT** - Authentication and authorization
- **PostgreSQL** - Relational database
- **JPA (Hibernate)** - Object-relational mapping
- **MapStruct** - DTO mapping
- **Swagger (SpringDoc)** - API documentation

## 📁 Project Structure

```
NEPA/
├── src/                          # React frontend
│   ├── components/               # Reusable UI components
│   ├── pages/                    # Page components
│   ├── main.tsx                  # React entry point
│   └── index.css                 # Global styles
├── backend/                      # Spring Boot backend
│   ├── src/main/java/
│   │   └── com/nepafootball/broadcast/
│   │       ├── entity/           # JPA entities
│   │       ├── repository/       # Data access layer
│   │       ├── service/          # Business logic
│   │       ├── controller/       # REST controllers
│   │       └── config/           # Configuration classes
│   └── src/main/resources/
│       └── application.yml       # Application configuration
├── package.json                  # Frontend dependencies
├── pom.xml                       # Backend dependencies
└── README.md                     # Project documentation
```

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v18 or higher)
- **Java 17** (JDK)
- **PostgreSQL** (v13 or higher)
- **Maven** (v3.6 or higher)

### Frontend Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

The frontend will be available at `http://localhost:3000`

### Backend Setup

1. **Create PostgreSQL database**:
   ```sql
   CREATE DATABASE nepa_football;
   CREATE DATABASE nepa_football_dev;
   ```

2. **Configure database connection** in `backend/src/main/resources/application.yml`:
   ```yaml
   spring:
     datasource:
       url: jdbc:postgresql://localhost:5432/nepa_football
       username: your_username
       password: your_password
   ```

3. **Build and run the backend**:
   ```bash
   cd backend
   mvn clean install
   mvn spring-boot:run
   ```

The backend API will be available at `http://localhost:8080/api`

### API Documentation

Once the backend is running, you can access:
- **Swagger UI**: `http://localhost:8080/api/swagger-ui.html`
- **OpenAPI JSON**: `http://localhost:8080/api/api-docs`

## 🏗 Development

### Frontend Development

- **Hot reload**: Changes are automatically reflected in the browser
- **TypeScript**: Full type safety and IntelliSense support
- **Tailwind CSS**: Utility classes for rapid UI development
- **React Query**: Automatic caching and background updates

### Backend Development

- **Spring Boot DevTools**: Automatic restart on code changes
- **JPA/Hibernate**: Automatic database schema generation
- **Spring Security**: JWT-based authentication
- **MapStruct**: Automatic DTO mapping

### Database

The application uses PostgreSQL with the following main entities:
- **Users**: Authentication and user management
- **Teams**: Football team information
- **Games**: Game scheduling and results
- **Players**: Player statistics and information
- **Statistics**: Game and player statistics

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nepa_football
DB_USERNAME=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000

# Server
SERVER_PORT=8080
```

### Application Profiles

The backend supports different profiles:
- **dev**: Development configuration with detailed logging
- **prod**: Production configuration with optimized settings

Run with specific profile:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## 📊 Features Roadmap

### Phase 1 (Current)
- [x] Basic project structure
- [x] User authentication
- [x] Team management
- [x] Game scheduling
- [ ] Live game streaming

### Phase 2
- [ ] Real-time statistics
- [ ] Player profiles
- [ ] Interactive leaderboards
- [ ] Mobile app

### Phase 3
- [ ] Advanced analytics
- [ ] Social features
- [ ] Notifications
- [ ] Admin dashboard

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Email: info@nepafootball.com
- Issues: [GitHub Issues](https://github.com/your-repo/issues)

## 🙏 Acknowledgments

- NEPA High School Football Teams
- Spring Boot Community
- React Community
- All contributors and supporters

---

**Built with ❤️ for NEPA Football** 