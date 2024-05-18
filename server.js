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

app.post('/translate', async (req, res) => {
    try {
        const { text } = req.body;
        // Убедитесь, что текст представлен в правильном формате
        if (!text || typeof text !== 'string') {
            return res.status(400).json({ error: 'Invalid text format' });
        }

        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "system",
                    content: "You are a helpful assistant that translates text. " +
                        "Тебе нужно перевести текст на английский, если пользователь отправил русский текст, " +
                        "и наоборот, если пользователь отправил английский текст. " +
                        "Помомо перевода всегда отправь 1 предложение с примером использования отправленного им слова/фразы. " +
                        "Пример использования должен быть обязательно на языке перевода и ни в коем случае не на исходном языке. " +
                        "Перевод в тексте твоего ответа должен быть ОБЯЗАТЕЛЬНО запакован через теги {{{translate}}} и {{{/translate}}}. " +
                        "А Пример использования слова/фразы через теги {{{example}}} и {{{/example}}}." +
                        "Например: на сообщение пользователя 'Привет' ты ответишь {{{translate}}}Hello{{{/translate}}} " +
                        "{{{example}}}Hello, how are you??{{{/example}}}"
                },
                {
                    role: "user",
                    content: text
                }
            ],
            temperature: 0.5,
            max_tokens: 60,
            top_p: 1,
        });

        // Разбор ответа от сервера
        const content = response.choices[0].message.content;
        const translationMatch = content.match(/{{{translate}}}(.*?){{{\/translate}}}/);
        const exampleMatch = content.match(/{{{example}}}(.*?){{{\/example}}}/);
        const translation = translationMatch ? translationMatch[1] : '';
        const example = exampleMatch ? exampleMatch[1] : '';

        res.json({ translation: translation, example: example });
    } catch (error) {
        console.error('Failed to communicate with OpenAI:', error);
        res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
    }
});

app.post('/generate-image', async (req, res) => {
    try {
        const { prompt } = req.body;
        if (!prompt || typeof prompt !== 'string') {
            return res.status(400).json({ error: 'Invalid prompt format' });
        }

        const response = await openai.images.generate({
            prompt: prompt,
            model: "dall-e-2",
            n: 1,
            size: "512x512",
        });

        res.json({ imageUrl: response.data[0].url });
    } catch (error) {
        console.error('Failed to communicate with OpenAI:', error);
        res.status(500).json({ error: 'Failed to communicate with OpenAI', details: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
