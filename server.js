import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import SibApiV3Sdk from "sib-api-v3-sdk";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Configuración del cliente Brevo API
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();
brevo.apiKey = process.env.BREVO_API_KEY;   // 👈 asignación directa

// Endpoint para recibir datos del formulario
app.post("/send", async (req, res) => {
  const { name, email, phone, message } = req.body;
  console.log("📩 Datos recibidos del formulario:", req.body);

  if (!name || !email || !message) {
    return res.status(400).json({ success: false, msg: "Faltan campos obligatorios" });
  }

  try {
    await brevo.sendTransacEmail({
      sender: { name: "Agro Cuyana - La Besana", email: "tu-gmail-verificado@gmail.com" }, // 👈 remitente verificado
      to: [{ email: "labesana@agrocuyana.com" }], // 👈 destinatario empresa
      replyTo: { email },
      subject: `Nuevo mensaje de ${name}`,
      htmlContent: `
        <h2>Nuevo mensaje desde el formulario de contacto</h2>
        <p><strong>Nombre:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${phone || "No especificado"}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${message}</p>
      `
    });

    console.log("✅ Correo enviado correctamente con Brevo API");
    res.status(200).json({ success: true, msg: "Mensaje enviado correctamente" });
  } catch (error) {
    console.error("❌ Error al enviar con Brevo API:", error);
    res.status(500).json({ success: false, msg: "Error al enviar el mensaje" });
  }
});

// Endpoint de prueba
app.get("/test", async (req, res) => {
  try {
    await brevo.sendTransacEmail({
      sender: { name: "Agro Cuyana - La Besana", email: "tu-gmail-verificado@gmail.com" }, // 👈 remitente verificado
      to: [{ email: "labesana@agrocuyana.com" }],
      subject: "Prueba de conexión con Brevo API",
      textContent: "Este es un correo de prueba enviado desde el backend con Brevo API."
    });

    res.status(200).json({ success: true, msg: "Correo de prueba enviado correctamente con Brevo API" });
  } catch (error) {
    console.error("❌ Error en prueba Brevo API:", error);
    res.status(500).json({ success: false, msg: "Error al enviar el correo de prueba" });
  }
});

// ✅ Puerto dinámico para Railway
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend corriendo en http://localhost:${PORT}`);
});
