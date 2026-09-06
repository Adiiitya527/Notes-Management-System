const express = require("express");
const path = require("path");
const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");
const session = require("express-session");

const app = express();

const PORT = 3000;
const MONGODB_URI = "mongodb://127.0.0.1:27017";
const client = new MongoClient(MONGODB_URI);

const dbName = "notes_management";
let db;

app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

app.use(session({
    secret: "notes-management-secret",
    resave: false,
    saveUninitialized: false
}));


async function connectToDatabase() {
    try {
        await client.connect();

        db = client.db(dbName);

        console.log("Connected to MongoDB");

    } catch (error) {
        console.error("MongoDB connection failed:", error);
    }
}

connectToDatabase();


// -----------------------------
// REGISTER
// -----------------------------

app.post("/api/register", async (req, res) => {

    try {

        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }

        const users = db.collection("users");

        const existingUser = await users.findOne({
            email: email
        });

        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await users.insertOne({
            name: name,
            email: email,
            password: hashedPassword
        });

        res.status(201).json({
            message: "Registration successful"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// -----------------------------
// LOGIN
// -----------------------------

app.post("/api/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }

        const users = db.collection("users");

        const user = await users.findOne({
            email: email
        });

        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }

        req.session.userId = user._id.toString();
        req.session.userName = user.name;

        res.json({
            message: "Login successful",
            user: {
                name: user.name,
                email: user.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// -----------------------------
// CREATE NOTE
// -----------------------------

app.post("/api/notes", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const { title, content } = req.body;

        if (!title || !content) {
            return res.status(400).json({
                message: "Title and content are required"
            });
        }

        const notes = db.collection("notes");

        await notes.insertOne({
            userId: req.session.userId,
            title: title,
            content: content,
            createdAt: new Date()
        });

        res.status(201).json({
            message: "Note created successfully"
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// -----------------------------
// VIEW NOTES
// -----------------------------

app.get("/api/notes", async (req, res) => {

    try {

        if (!req.session.userId) {
            return res.status(401).json({
                message: "Please login first"
            });
        }

        const notes = db.collection("notes");

        const userNotes = await notes
            .find({
                userId: req.session.userId
            })
            .sort({
                createdAt: -1
            })
            .toArray();

        res.json(userNotes);

    } catch (error) {

        console.error(error);

        res.status(500).json({
            message: "Server error"
        });
    }
});


// -----------------------------
// LOGOUT
// -----------------------------

app.post("/api/logout", (req, res) => {

    req.session.destroy((error) => {

        if (error) {
            return res.status(500).json({
                message: "Logout failed"
            });
        }

        res.json({
            message: "Logout successful"
        });
    });
});


app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});