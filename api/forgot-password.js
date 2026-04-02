import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // CORS Handling (Just in case Vercel is strict)
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Méthode non autorisée' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email requis' });
  }

  // Sécurité : Seulement cet email est autorisé
  if (email.toLowerCase() !== 'othmanearroub2@gmail.com') {
    return res.status(403).json({ error: 'Cet email n\'est pas autorisé pour la réinitialisation.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Idyas Control Tower" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Idyas Shipping 🚢',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #1f2937;">
          <h2 style="color: #0d9488;">Réinitialisation de mot de passe</h2>
          <p>Bonjour Othmane,</p>
          <p>Vous avez demandé une réinitialisation de votre mot de passe pour la plateforme <strong>Idyas Control Tower</strong>.</p>
          <p>Pour des raisons de sécurité, veuillez contacter le support technique ou utiliser le lien temporaire ci-dessous :</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="#" style="background-color: #0d9488; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">Réinitialiser mon mot de passe</a>
          </div>
          <p style="font-size: 12px; color: #6b7280;">Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email en toute sécurité.</p>
          <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
          <p style="font-size: 12px; color: #9ca3af; text-align: center;">© 2026 Idyas Shipping · Control Tower</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ message: 'Email de récupération envoyé via Vercel avec succès' });
  } catch (error) {
    console.error('Erreur Vercel envoi email:', error);
    return res.status(500).json({ error: "Échec de l'envoi de l'email. Vérifiez vos identifiants d'application Gmail." });
  }
}
