import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import translateRoutes from './routes/translate.js';
import historyRoutes from './routes/history.js';
import paymentRoutes from './routes/payment.js';
import adminRoutes from './routes/admin.js';
import userRoutes from './routes/users.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { initializeSocket } from './socket/chat.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
    origin: [
        "http://localhost:5173",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:3000",
        process.env.CLIENT_URL
    ].filter(Boolean),
    credentials: true
}));
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    next();
});
app.use(express.json());

// Routes
import chatRoutes from './routes/chat.js';

// ... (existing imports)

// Routes
app.use('/auth', authRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/user', userRoutes);
app.use('/api/chat', chatRoutes); // New chat routes
app.use('/', translateRoutes);

// Serve static files from the React app
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Assuming client/dist is one level up and then in client/dist
// Adjust path if you move the server folder
const clientDistPath = path.join(__dirname, '../../client/dist');

app.use(express.static(clientDistPath));

app.get(/.*/, (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: [
            "http://localhost:5173",
            "http://localhost:3000",
            "http://127.0.0.1:5173",
            "http://127.0.0.1:3000",
            process.env.CLIENT_URL // Add deployed frontend URL
        ].filter(Boolean), // Remove undefined if env var is missing
        methods: ["GET", "POST"]
    }
});

initializeSocket(io);

// Database Connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log('Connected to MongoDB Atlas');
        // Start Server only after DB connection
        httpServer.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((err) => console.error('MongoDB connection error:', err));
