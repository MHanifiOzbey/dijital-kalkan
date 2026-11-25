export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY tanımlı değil." });
  }

  try {
    const { messageText, selectedLink, question } = req.body;

    const prompt = `Sen "Dijital Kalkan" adlı mobil güvenlik asistanısın. Kullanıcının mesajını ve varsa bağlantısını siber güvenlik ve oltalama (phishing) açısından kısa, net ve anlaşılır Türkçe ile analiz et.

Mesaj Metni: ${messageText || "Belirtilmedi"}
İncelenen Bağlantı: ${selectedLink || "Yok"}
Kullanıcı Sorusu: ${question || "Bu mesaj ve bağlantı güvenli mi, neden şüpheli olabilir ve ne yapmalıyım?"}

Yanıtını şu başlıklarda özetle:
1. Risk Durumu (Güvenli / Şüpheli / Yüksek Risk)
2. Gerekçe (Mesaj dili veya bağlantı yapısı)
3. Öneri (Kullanıcının atması gereken adım)`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({
        error: data?.error?.message || "Gemini isteği başarısız oldu."
      });
    }

    const answer =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "Analiz yanıtı oluşturulamadı.";

    return res.status(200).json({ answer });
  } catch (err) {
    return res.status(500).json({ error: "Sunucu hatası: " + err.message });
  }
}
