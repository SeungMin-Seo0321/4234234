export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'POST 요청만 지원합니다.' });
    }

    const { prompt } = req.body;
    const HF_TOKEN = process.env.HF_TOKEN; 
    
    // 완전 공개된(약관 동의 필요 없는) 기본 모델로 변경!
    const API_URL = "https://api-inference.huggingface.co/models/runwayml/stable-diffusion-v1-5";

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
            // 이번에는 에러의 진짜 이유(텍스트)를 무조건 반환하게 수정했습니다.
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
