import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

const app = express();
app.use(cors());
app.use(bodyParser.json());
const port = process.env.PORT || 3001;

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,  // Используйте переменную окружения для API ключа
});

app.post('/chat', async (req, res) => {
    try {
        const { messages } = req.body;
        // Убедитесь, что все сообщения имеют нужные поля
        if (!messages || messages.some(msg => typeof msg.role !== 'string' || typeof msg.content !== 'string')) {
            return res.status(400).json({ error: 'Invalid message format' });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: messages,
            temperature: 0.5,
            max_tokens: 512,
            top_p: 1,
        });

        res.json({ message: response.choices[0].message.content });
    } catch (error) {
        console.error('Failed to communicate with OpenAI:', error);
        res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
