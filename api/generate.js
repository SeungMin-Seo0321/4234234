export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
    }

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN; 

    // 🚨 [핵심 방어 코드] Vercel 환경변수에 토큰이 제대로 안 들어있으면 여기서 멈추고 알려줍니다!
    if (!HF_TOKEN || HF_TOKEN === "undefined") {
        return res.status(500).json({ 
            error: "Vercel 환경변수(HF_TOKEN)가 설정되지 않았습니다! Vercel 세팅을 다시 확인해주세요." 
        });
    }
    
    // 다시 가장 퀄리티가 좋은 무료 Flux 모델로 복구
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
            const errorText = await response.text();
            throw new Error(`HF 에러(${response.status}): ${errorText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        res.setHeader('Content-Type', 'image/jpeg');
        res.status(200).send(buffer);
        
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
