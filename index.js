import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Home route
app.get("/", (req, res) => {
    res.send("Hello from server");
});

// Send email route
app.post("/sendEmail", async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;

        // Validation
        if (!name || name.trim().length < 3) {
            return res.status(400).json({
                success: false,
                message: "Name must be at least 3 characters",
            });
        }

        const emailRegex =
            /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!email || !emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: "Invalid email address",
            });
        }

        if (!subject || subject.trim().length < 5) {
            return res.status(400).json({
                success: false,
                message: "Subject must be at least 5 characters",
            });
        }

        if (!message || message.trim().length < 10) {
            return res.status(400).json({
                success: false,
                message: "Message must be at least 10 characters",
            });
        }

        // Debug logs (safe)
        console.log("Email User:", process.env.EMAIL_USER);
        console.log(
            "Email Pass:",
            process.env.EMAIL_PASS ? "Exists" : "Missing"
        );

        // Nodemailer transporter
       const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    family: 4, // force IPv4
});

        // Verify SMTP connection
        await transporter.verify();

        console.log("SMTP Connected Successfully");

        // Mail options
        const mailOptions = {
    from: `"Portfolio Contact" <${process.env.EMAIL_USER}>`,
    replyTo: email,
    to: process.env.EMAIL_USER,
    subject: `Portfolio Contact: ${subject}`,
    html: `
        <h2>New Portfolio Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
    `,
};

        // Send mail
        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (error) {
        console.error("EMAIL ERROR:", error);

        res.status(500).json({
            success: false,
            message: error.message || "Failed to send email",
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});