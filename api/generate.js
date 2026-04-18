// api/generate.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
    }

    const { prompt } = req.body;
    // Vercel 환경 변수에서 토큰을 안전하게 불러옵니다.
    const HF_TOKEN = process.env.HF_TOKEN; 
    const API_URL = "https://api-inference.huggingface.co/models/black-forest-labs/FLUX.1-schnell";

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${HF_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ inputs: prompt }),
        });

        if (!response.ok) {
            throw new Error(`Hugging Face API 에러 (${response.status})`);
        }

        // 받아온 이미지 데이터를 그대로 클라이언트에게 전달합니다.
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'image/jpeg');
        res.status(200).send(buffer);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
