import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from server");
})
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

        // const emailRegex =
        //     /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
        const emailRegex = /^[a-z0-9._%+-]+@[a-z.-]+\.[a-z]{2,}$/;

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

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        const mailOptions = {
            from: email,
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

        await transporter.sendMail(mailOptions);

        res.status(200).json({
            success: true,
            message: "Email sent successfully",
        });

    } catch (error) {

        console.log(error);

        res.status(500).json({
            success: false,
            message: "Failed to send email",
        });
    }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});