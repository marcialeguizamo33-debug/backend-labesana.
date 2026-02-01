import express from "express";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();
const app = express();

// Middlewares
app.use(cors());            // ✅ habilita comunicación con frontend
app.use(express.json());    // ✅ parsea JSON

// Configuración del transporte SMTP con Brevo
const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  secure: false, // STARTTLS
  auth: {
    user: "apikey", // literal, siempre "apikey"
    pass: process.env.BREVO_API_KEY // tu API Key guardada en Railway
  }
});

// Verificación inicial de conexión SMTP
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ Error al conectar con Brevo SMTP:", error);
  } else {
    console.log("✅ Conexión SMTP exitosa con Brevo, listo para enviar correos");
  }
});

// Endpoint para recibir datos del formulario
app.post("/send", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📩 Datos recibidos del formulario:", req.body);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: "Faltan campos obligatorios" });
  }

  try {
    await transporter.sendMail({
      from: `"Agro Cuyana - La Besana" <labesana@agrocuyana.com>`,
      replyTo: email,
      to: "labesana@agrocuyana.com",
      subject: `Nuevo mensaje de ${name}`,
      html: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || "No especificado"}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `
    });

    console.log("✅ Correo enviado correctamente con Brevo");
    res.status(200).json({ success: true, msg: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar el mensaje con Brevo:", error);
    res.status(500).json({ success: false, msg: "Error al enviar el mensaje" });
  }
});

// Endpoint de prueba
app.get("/test", async (req, res) => {
  try {
    await transporter.sendMail({
      from: `"Agro Cuyana - La Besana" <labesana@agrocuyana.com>`,
      to: "labesana@agrocuyana.com",
      subject: "Prueba de conexión SMTP con Brevo",
      text: "Este es un correo de prueba enviado desde el backend con Nodemailer y Brevo."
    });

    res.status(200).json({ success: true, msg: "Correo de prueba enviado correctamente" });
  } catch (error) {
    console.error("❌ Error en prueba SMTP con Brevo:", error);
    res.status(500).json({ success: false, msg: "Error al enviar el correo de prueba" });
  }
});

// ✅ Puerto dinámico para Railway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
